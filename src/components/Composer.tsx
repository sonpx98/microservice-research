import { useEffect, useRef, useState } from "react";
import { useChat } from "../store";

export function Composer() {
  const send = useChat((s) => s.send);
  const setTyping = useChat((s) => s.setTyping);
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
    <div className="composer">
      <textarea
        value={text}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Message…  (Enter to send, Shift+Enter for newline)"
        rows={1}
      />
      <button onClick={submit} disabled={!text.trim()}>Send</button>
    </div>
  );
}
