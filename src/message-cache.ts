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
