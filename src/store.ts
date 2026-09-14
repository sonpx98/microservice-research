import { create } from "zustand";
import type { ChatMessage, PresenceUser } from "./types";
import { getStatus, onMessage, onOpen, onStatus, sendSocket, type Status } from "./socket";
import { queryClient } from "./query-client";
import { mergeMessage } from "./message-cache";

interface ChatState {
  status: Status;
  myId: string | null;
  name: string | null;
  channelId: string | null;
  users: PresenceUser[];
  typing: { channelId: string | null; users: string[] };
  setChannel: (id: string) => void;
  send: (text: string) => void;
  setTyping: (isTyping: boolean) => void;
}

// Merge one message into the infinite-query cache for its channel (pure reducer in message-cache.ts).
function upsertMessage(msg: ChatMessage) {
  queryClient.setQueryData(["messages", msg.channelId], (old) => mergeMessage(old as never, msg));
}

export const useChat = create<ChatState>((set, get) => ({
  status: getStatus(),
  myId: null,
  name: null,
  channelId: null,
  users: [],
  typing: { channelId: null, users: [] },

  setChannel: (id) => {
    set({ channelId: id });
    sendSocket({ type: "sub", channelId: id });
  },

  send: (text) => {
    const { myId, name, channelId } = get();
    if (!channelId) return;
    const clientMsgId = crypto.randomUUID();
    // optimistic: drop it into the RQ cache immediately as pending; the echo replaces it
    upsertMessage({
      id: clientMsgId, clientMsgId, channelId, userId: myId ?? "me", name: name!, text, ts: Date.now(), pending: true,
    });
    sendSocket({ type: "msg", channelId, text, clientMsgId });
    // ponytail: no offline resend queue — msg stays pending if socket is down. Add when you build offline mode.
  },

  setTyping: (isTyping) => sendSocket({ type: "typing", isTyping }),
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
  }
});
