import type { InfiniteData } from "@tanstack/react-query";
import type { ChatMessage } from "./types";

export type MsgPages = InfiniteData<ChatMessage[], number | undefined>;

// Pure cache reducer for the messages infinite query. Pages are DESC (newest first), so a new
// message goes to the front of page 0. Reconciles an optimistic copy by clientMsgId and dedupes by
// id. Returns `old` unchanged when the channel has no cache loaded yet.
export function mergeMessage(old: MsgPages | undefined, msg: ChatMessage): MsgPages | undefined {
  if (!old) return old;
  const first = old.pages[0] ? old.pages[0].slice() : [];
  const deduped = first.filter(
    (x) => x.id !== msg.id && (!msg.clientMsgId || x.clientMsgId !== msg.clientMsgId),
  );
  const pages = old.pages.slice();
  pages[0] = [msg, ...deduped];
  return { ...old, pages };
}

// Apply a patch to one message wherever it sits across the pages. No-op if not found / no cache.
export function updateMessage(
  old: MsgPages | undefined,
  messageId: string,
  patch: (m: ChatMessage) => ChatMessage,
): MsgPages | undefined {
  if (!old) return old;
  const pages = old.pages.map((page) => page.map((m) => (m.id === messageId ? patch(m) : m)));
  return { ...old, pages };
}

// Remove one message from the cache.
export function removeMessage(old: MsgPages | undefined, messageId: string): MsgPages | undefined {
  if (!old) return old;
  const pages = old.pages.map((page) => page.filter((m) => m.id !== messageId));
  return { ...old, pages };
}

// Idempotent reaction toggle so optimistic apply + server echo can both run without double-counting.
export function applyReaction(
  old: MsgPages | undefined,
  { messageId, emoji, userId, op }: { messageId: string; emoji: string; userId: string; op: "add" | "remove" },
): MsgPages | undefined {
  return updateMessage(old, messageId, (m) => {
    const reactions = { ...(m.reactions ?? {}) };
    const users = new Set(reactions[emoji] ?? []);
    if (op === "add") users.add(userId);
    else users.delete(userId);
    if (users.size === 0) delete reactions[emoji];
    else reactions[emoji] = [...users];
    return { ...m, reactions };
  });
}
