import { useChat } from "../store";
import { useCall } from "../call";

export function Presence() {
  const users = useChat((s) => s.users);
  const myId = useChat((s) => s.myId);
  const startCall = useCall((s) => s.startCall);
  const callBusy = useCall((s) => s.callStatus !== "idle");

  return (
    <div className="presence">
      <div className="section-head">Online — {users.length}</div>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <span className="dot" />
            <span className="pname">{u.name}{u.id === myId ? " (you)" : ""}</span>
            {u.id !== myId && (
              <button className="call-btn" disabled={callBusy} title={`Call ${u.name}`} onClick={() => startCall(u.id, u.name)}>
                📞
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
