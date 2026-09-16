import { Link, useParams } from "react-router-dom";
import { useTrash } from "../queries";
import { useChat } from "../store";

export function TrashView() {
  const { channelId } = useParams();
  const { data: messages, isLoading, isError } = useTrash(channelId);
  const restoreById = useChat((s) => s.restoreById);

  return (
    <div className="trash pad">
      <div className="channel-head">
        <span>Trash</span>
        <Link to=".." relative="path" className="linkbtn">← back to channel</Link>
      </div>
      <p className="muted sm">Your deleted messages. They're removed permanently after the retention window.</p>

      {isLoading && <div className="muted">loading…</div>}
      {isError && <div className="form-error">failed to load</div>}
      {messages?.length === 0 && <div className="muted">Trash is empty.</div>}

      <ul className="trash-list">
        {messages?.map((m) => (
          <li key={m.id} className="trash-item">
            <div className="trash-body">
              {m.text && <div className="msg-text">{m.text}</div>}
              {m.imageUrl && <img className="msg-image" src={m.imageUrl} alt="attachment" />}
              <div className="muted sm">deleted {m.deletedAt ? new Date(m.deletedAt).toLocaleString() : ""}</div>
            </div>
            <button onClick={() => restoreById(m.id)}>Restore</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
