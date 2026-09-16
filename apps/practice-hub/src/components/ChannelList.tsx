import { NavLink } from "react-router-dom";
import { useChannels } from "../queries";

export function ChannelList() {
  const { data: channels, isLoading, isError } = useChannels();

  return (
    <div className="channels">
      <div className="section-head">Channels</div>
      {isLoading && <div className="muted sm">loading…</div>}
      {isError && <div className="form-error sm">failed to load</div>}
      <ul>
        {channels?.map((c) => (
          <li key={c.id}>
            <NavLink to={`/c/${c.id}`} className={({ isActive }) => (isActive ? "active" : "")}>
              # {c.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
