import { useEffect, useRef, useState } from "react";
import { useChat } from "../store";

export function Composer() {
  const send = useChat((s) => s.send);
  const setTyping = useChat((s) => s.setTyping);
  const replyingTo = useChat((s) => s.replyingTo);
  const setReplyTo = useChat((s) => s.setReplyTo);
  const [text, setText] = useState("");
  const stopTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => setTyping(false), [setTyping]);

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    setTyping(true);
    clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => setTyping(false), 1500); // auto-clear typing after 1.5s idle
  }

  function submit() {
    const t = text.trim();
    if (!t) return;
    send(t);
    setText("");
    setTyping(false);
    clearTimeout(stopTimer.current);
  }

  return (
    <div className="composer-wrap">
      {replyingTo && (
        <div className="reply-banner">
          <span>Replying to <b>{replyingTo.name}</b>: {replyingTo.text.slice(0, 80)}</span>
          <button className="linkbtn" onClick={() => setReplyTo(null)} title="Cancel reply">✕</button>
        </div>
      )}
      <div className="composer">
      <textarea
        value={text}
        onChange={onChange}
        onKeyDown={(e) => {
          // isComposing guard: an IME (Vietnamese/CJK) fires an Enter keydown to commit a composition —
          // without this, that Enter sends AND the commit's second Enter sends again → duplicate message.
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Message…  (Enter to send, Shift+Enter for newline)"
        rows={1}
      />
      <button onClick={submit} disabled={!text.trim()}>Send</button>
      </div>
    </div>
  );
}
