import type { ChatMessage } from "./types";

export const PAGE_SIZE = 30;

// Keyset cursor for the next (older) page: the oldest ts of the last page, or undefined at the end.
export function nextBeforeCursor(lastPage: ChatMessage[]): number | undefined {
  return lastPage.length < PAGE_SIZE ? undefined : lastPage[lastPage.length - 1].ts;
}
