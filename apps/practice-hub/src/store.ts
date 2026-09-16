import { create } from "zustand";
import type { ChatMessage, PresenceUser } from "./types";
import { getStatus, onMessage, onOpen, onStatus, sendSocket, type Status } from "./socket";
import { queryClient } from "./query-client";
import { applyReaction, mergeMessage, type MsgPages, removeMessage, updateMessage } from "./message-cache";

interface ChatState {
  status: Status;
  myId: string | null;
  name: string | null;
  channelId: string | null;
  users: PresenceUser[];
  typing: { channelId: string | null; users: string[] };
  replyingTo: { id: string; name: string; text: string } | null;
  pendingUndo: { messageId: string; channelId: string } | null;
  setChannel: (id: string) => void;
  send: (text: string, imageUrl?: string | null) => void;
  setReplyTo: (target: { id: string; name: string; text: string } | null) => void;
  setTyping: (isTyping: boolean) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  editMessage: (messageId: string, text: string) => void;
  deleteMessage: (messageId: string) => void;
  undoDelete: () => void;
  dismissUndo: () => void;
  restoreById: (messageId: string) => void;
}

const key = (channelId: string) => ["messages", channelId];
const setCache = (channelId: string, fn: (old: MsgPages | undefined) => MsgPages | undefined) =>
  queryClient.setQueryData<MsgPages>(key(channelId), fn);

function messageInCache(channelId: string, messageId: string): ChatMessage | undefined {
  const data = queryClient.getQueryData<MsgPages>(key(channelId));
  return data?.pages.flat().find((m) => m.id === messageId);
}

// snapshots for optimistic rollback if the server rejects an edit/delete (not the author)
const editSnapshots = new Map<string, { channelId: string; text: string; editedAt?: number | null }>();
const deleteSnapshots = new Map<string, { channelId: string }>();

function upsertMessage(msg: ChatMessage) {
  setCache(msg.channelId, (old) => mergeMessage(old, msg));
}

export const useChat = create<ChatState>((set, get) => ({
  status: getStatus(),
  myId: null,
  name: null,
  channelId: null,
  users: [],
  typing: { channelId: null, users: [] },
  replyingTo: null,
  pendingUndo: null,

  setChannel: (id) => {
    set({ channelId: id, replyingTo: null }); // dropping into another channel cancels a pending reply
    sendSocket({ type: "sub", channelId: id });
  },

  send: (text, imageUrl = null) => {
    const { myId, name, channelId, replyingTo } = get();
    if (!channelId || (!text.trim() && !imageUrl)) return;
    const clientMsgId = crypto.randomUUID();
    const reply = replyingTo
      ? { replyTo: replyingTo.id, replyToName: replyingTo.name, replyToPreview: replyingTo.text.slice(0, 120) }
      : {};
    upsertMessage({
      id: clientMsgId, clientMsgId, channelId, userId: myId ?? "me", name: name!, text, ts: Date.now(), pending: true, imageUrl, ...reply,
    });
    sendSocket({ type: "msg", channelId, text, clientMsgId, replyTo: replyingTo?.id, imageUrl });
    set({ replyingTo: null });
    // ponytail: no offline resend queue — msg stays pending if socket is down. Add when you build offline mode.
  },

  setReplyTo: (target) => set({ replyingTo: target }),

  setTyping: (isTyping) => sendSocket({ type: "typing", isTyping }),

  toggleReaction: (messageId, emoji) => {
    const { myId, channelId } = get();
    if (!channelId || !myId) return;
    const reacted = messageInCache(channelId, messageId)?.reactions?.[emoji]?.includes(myId) ?? false;
    const op = reacted ? "remove" : "add";
    setCache(channelId, (old) => applyReaction(old, { messageId, emoji, userId: myId, op })); // optimistic
    sendSocket({ type: "react", messageId, emoji });
  },

  editMessage: (messageId, text) => {
    const { channelId } = get();
    if (!channelId) return;
    const prev = messageInCache(channelId, messageId);
    if (prev) editSnapshots.set(messageId, { channelId, text: prev.text, editedAt: prev.editedAt });
    setCache(channelId, (old) => updateMessage(old, messageId, (m) => ({ ...m, text, editedAt: Date.now() })));
    sendSocket({ type: "edit", messageId, text });
  },

  deleteMessage: (messageId) => {
    const { channelId } = get();
    if (!channelId) return;
    deleteSnapshots.set(messageId, { channelId });
    setCache(channelId, (old) => updateMessage(old, messageId, (m) => ({ ...m, deleting: true }))); // optimistic hide
    sendSocket({ type: "delete", messageId });
    set({ pendingUndo: { messageId, channelId } }); // surface an Undo toast
  },

  undoDelete: () => {
    const p = get().pendingUndo;
    if (!p) return;
    sendSocket({ type: "restore", messageId: p.messageId });
    set({ pendingUndo: null });
  },

  dismissUndo: () => set({ pendingUndo: null }),

  restoreById: (messageId) => sendSocket({ type: "restore", messageId }), // used by the Trash view
}));

// --- wire the socket into the store + RQ cache (runs once, at import) ---
onStatus((s) => useChat.setState({ status: s }));
onOpen(() => {
  const { channelId } = useChat.getState();
  if (channelId) sendSocket({ type: "sub", channelId }); // re-subscribe after a reconnect
});
onMessage((m) => {
  switch (m.type) {
    case "welcome":
      useChat.setState({ myId: m.id, name: m.name });
      break;
    case "presence":
      useChat.setState({ users: m.users as PresenceUser[] });
      break;
    case "typing":
      useChat.setState({ typing: { channelId: m.channelId, users: m.users } });
      break;
    case "msg":
      upsertMessage(m.message as ChatMessage);
      break;
    case "reaction":
      setCache(m.channelId, (old) => applyReaction(old, m)); // authoritative + idempotent
      break;
    case "edit":
      setCache(m.channelId, (old) => updateMessage(old, m.messageId, (msg) => ({ ...msg, text: m.text, editedAt: m.editedAt })));
      editSnapshots.delete(m.messageId);
      break;
    case "delete":
      setCache(m.channelId, (old) => removeMessage(old, m.messageId));
      queryClient.invalidateQueries({ queryKey: ["trash", m.channelId] }); // it just entered the trash
      deleteSnapshots.delete(m.messageId);
      break;
    case "restore":
      // message un-deleted → refetch the timeline (lands back at its ts) and the trash list
      queryClient.invalidateQueries({ queryKey: ["messages", m.channelId] });
      queryClient.invalidateQueries({ queryKey: ["trash", m.channelId] });
      break;
    case "error":
      // server rejected an edit/delete (not the author) → roll the optimistic change back
      if (m.op === "edit") {
        const snap = editSnapshots.get(m.messageId);
        if (snap) {
          setCache(snap.channelId, (old) => updateMessage(old, m.messageId, (msg) => ({ ...msg, text: snap.text, editedAt: snap.editedAt })));
          editSnapshots.delete(m.messageId);
        }
      } else if (m.op === "delete") {
        const snap = deleteSnapshots.get(m.messageId);
        if (snap) {
          setCache(snap.channelId, (old) => updateMessage(old, m.messageId, (msg) => ({ ...msg, deleting: false })));
          deleteSnapshots.delete(m.messageId);
        }
        if (useChat.getState().pendingUndo?.messageId === m.messageId) useChat.setState({ pendingUndo: null });
      }
      break;
  }
});
