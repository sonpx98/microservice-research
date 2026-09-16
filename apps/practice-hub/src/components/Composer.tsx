import { useEffect, useRef, useState } from "react";
import { useChat } from "../store";
import { uploadImage } from "../api";

export function Composer() {
  const send = useChat((s) => s.send);
  const setTyping = useChat((s) => s.setTyping);
  const replyingTo = useChat((s) => s.replyingTo);
  const setReplyTo = useChat((s) => s.setReplyTo);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<{ url: string; preview: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => setTyping(false), [setTyping]);

  function clearAttachment() {
    setAttachment((a) => { if (a) URL.revokeObjectURL(a.preview); return null; });
  }

  async function handleFile(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("only images"); return; }
    clearAttachment();
    const preview = URL.createObjectURL(file); // instant local preview while uploading
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setAttachment({ url, preview });
    } catch (e) {
      URL.revokeObjectURL(preview);
      setError(e instanceof Error ? e.message : "upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    setTyping(true);
    clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => setTyping(false), 1500);
  }

  function submit() {
    const t = text.trim();
    if (!t && !attachment) return;
    send(t, attachment?.url ?? null);
    setText("");
    clearAttachment();
    setTyping(false);
    clearTimeout(stopTimer.current);
  }

  return (
    <div
      className={"composer-wrap" + (dragOver ? " drag" : "")}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
    >
      {replyingTo && (
        <div className="reply-banner">
          <span>Replying to <b>{replyingTo.name}</b>: {replyingTo.text.slice(0, 80)}</span>
          <button className="linkbtn" onClick={() => setReplyTo(null)} title="Cancel reply">✕</button>
        </div>
      )}

      {(attachment || uploading || error) && (
        <div className="attach-banner">
          {uploading && <span className="muted">uploading…</span>}
          {attachment && <img className="attach-thumb" src={attachment.preview} alt="attachment preview" />}
          {error && <span className="form-error">{error}</span>}
          {attachment && <button className="linkbtn" onClick={clearAttachment} title="Remove image">✕</button>}
        </div>
      )}

      <div className="composer">
        <button className="attach-btn" title="Attach image" onClick={() => fileRef.current?.click()}>📎</button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
        />
        <textarea
          value={text}
          onChange={onChange}
          onPaste={(e) => {
            const item = [...e.clipboardData.items].find((i) => i.type.startsWith("image/"));
            if (item) { e.preventDefault(); handleFile(item.getAsFile()); }
          }}
          onKeyDown={(e) => {
            // isComposing guard: an IME (Vietnamese/CJK) fires an Enter keydown to commit a composition —
            // without this, that Enter sends AND the commit's second Enter sends again → duplicate message.
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Message…  (Enter to send, Shift+Enter for newline, paste/drop an image)"
          rows={1}
        />
        <button onClick={submit} disabled={(!text.trim() && !attachment) || uploading}>Send</button>
      </div>
    </div>
  );
}
