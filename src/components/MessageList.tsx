import { useEffect, useMemo, useRef } from "react";
import { useMessages } from "../queries";
import { useChat } from "../store";

export function MessageList({ channelId }: { channelId: string }) {
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useMessages(channelId);
  const myId = useChat((s) => s.myId);
  const endRef = useRef<HTMLDivElement>(null);

  // pages are DESC (newest first) across all pages → flatten then reverse for chronological display
  const messages = useMemo(() => (data?.pages.flat() ?? []).slice().reverse(), [data]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) return <div className="messages pad muted">loading messages…</div>;
  if (isError) return <div className="messages pad form-error">failed to load messages</div>;

  // ponytail: renders every loaded message. Virtualize (react-window) when a channel gets huge.
  return (
    <div className="messages" role="log" aria-live="polite">
      {hasNextPage && (
        <button className="load-older" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "loading…" : "Load older messages"}
        </button>
      )}
      {messages.map((m) => (
        <div key={m.id} className={"msg" + (m.pending ? " pending" : "") + (m.userId === myId ? " mine" : "")}>
          <div className="msg-head">
            <span className="msg-name">{m.name}</span>
            <span className="msg-time">{new Date(m.ts).toLocaleTimeString()}</span>
            {m.pending && <span className="msg-pending">sending…</span>}
          </div>
          <div className="msg-text">{m.text}</div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
