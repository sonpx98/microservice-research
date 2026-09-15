import { useState } from "react";
import { useChat } from "../store";
import type { ChatMessage } from "../types";

const PRESET_EMOJIS = ["👍", "❤️", "😂", "🎉", "😮"];

export function MessageItem({ m, myId }: { m: ChatMessage; myId: string | null }) {
  const toggleReaction = useChat((s) => s.toggleReaction);
  const editMessage = useChat((s) => s.editMessage);
  const deleteMessage = useChat((s) => s.deleteMessage);
  const setReplyTo = useChat((s) => s.setReplyTo);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(m.text);
  const [picker, setPicker] = useState(false);

  if (m.deleting) return null; // optimistic delete: hide until the server confirms (or rolls back)

  const mine = m.userId === myId;
  const reactions = Object.entries(m.reactions ?? {}).filter(([, users]) => users.length > 0);

  function saveEdit() {
    const t = draft.trim();
    if (t && t !== m.text) editMessage(m.id, t);
    setEditing(false);
  }

  return (
    <div className={"msg" + (m.pending ? " pending" : "") + (mine ? " mine" : "")}>
      <div className="msg-head">
        <span className="msg-name">{m.name}</span>
        <span className="msg-time">{new Date(m.ts).toLocaleTimeString()}</span>
        {m.editedAt && <span className="msg-edited">(edited)</span>}
        {m.pending && <span className="msg-pending">sending…</span>}

        <span className="msg-actions">
          <button title="React" onClick={() => setPicker((p) => !p)}>☺</button>
          <button title="Reply" onClick={() => setReplyTo({ id: m.id, name: m.name, text: m.text })}>↩</button>
          {mine && !m.pending && (
            <>
              <button title="Edit" onClick={() => { setDraft(m.text); setEditing(true); }}>✎</button>
              <button title="Delete" onClick={() => deleteMessage(m.id)}>🗑</button>
            </>
          )}
        </span>
      </div>

      {picker && (
        <div className="emoji-picker">
          {PRESET_EMOJIS.map((e) => (
            <button key={e} onClick={() => { toggleReaction(m.id, e); setPicker(false); }}>{e}</button>
          ))}
        </div>
      )}

      {m.replyTo && (
        <div className="reply-quote">
          <span className="reply-quote-name">{m.replyToName ?? "unknown"}</span>
          <span className="reply-quote-text">{m.replyToPreview ?? "(message unavailable)"}</span>
        </div>
      )}

      {editing ? (
        <div className="msg-edit">
          <textarea
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); saveEdit(); }
              if (e.key === "Escape") setEditing(false);
            }}
            rows={1}
          />
          <div className="msg-edit-actions">
            <button onClick={saveEdit}>Save</button>
            <button className="linkbtn" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="msg-text">{m.text}</div>
      )}

      {reactions.length > 0 && (
        <div className="reactions">
          {reactions.map(([emoji, users]) => (
            <button
              key={emoji}
              className={"reaction" + (myId && users.includes(myId) ? " mine" : "")}
              onClick={() => toggleReaction(m.id, emoji)}
              title={`${users.length}`}
            >
              {emoji} {users.length}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
