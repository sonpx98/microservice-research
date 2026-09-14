import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchChannels, fetchMessages } from "./api";
import { nextBeforeCursor } from "./pagination";

export { PAGE_SIZE } from "./pagination";

export function useChannels() {
  return useQuery({
    queryKey: ["channels"],
    queryFn: async () => (await fetchChannels()).channels,
  });
}

// Messages: infinite query, keyset-paginated by `before` timestamp. Each page is DESC (newest first);
// the last item's ts is the cursor for the next (older) page. Live WS messages are merged into this
// same cache (see store.ts) so history + realtime share one source of truth.
export function useMessages(channelId?: string) {
  return useInfiniteQuery({
    queryKey: ["messages", channelId],
    enabled: !!channelId,
    initialPageParam: undefined as number | undefined,
    queryFn: async ({ pageParam }) => (await fetchMessages(channelId!, pageParam)).messages,
    getNextPageParam: nextBeforeCursor,
  });
}
