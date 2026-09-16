import { Navigate } from "react-router-dom";
import { useChannels } from "../queries";

// "/" → first channel once the list loads.
export function ChannelRedirect() {
  const { data: channels, isLoading } = useChannels();
  if (isLoading) return <div className="pad muted">loading channels…</div>;
  if (!channels?.length) return <div className="pad muted">no channels</div>;
  return <Navigate to={`/c/${channels[0].id}`} replace />;
}
