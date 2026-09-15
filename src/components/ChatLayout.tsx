import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../auth";
import { useChat } from "../store";
import { useCall } from "../call";
import { connectSocket, disconnectSocket } from "../socket";
import { ChannelList } from "./ChannelList";
import { Presence } from "./Presence";
import { CallPanel } from "./CallPanel";
import { UndoToast } from "./UndoToast";

export function ChatLayout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const status = useChat((s) => s.status);
  const callError = useCall((s) => s.error);
  const clearError = useCall((s) => s.clearError);

  // open the socket for the length of the session; tear it down on unmount (logout)
  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, []);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">fe-practice-hub</div>
        <ChannelList />
        <Presence />
        <div className="me">
          <span>{user?.username}</span>
          <button className="linkbtn" onClick={() => { disconnectSocket(); logout(); }}>Log out</button>
        </div>
      </aside>
      <main className="main">
        {status !== "open" && (
          <div className="banner" data-s={status}>
            {status === "connecting" ? "Connecting…" : "Disconnected — reconnecting…"}
          </div>
        )}
        {callError && (
          <div className="banner err" role="alert" onClick={clearError}>
            {callError} (click to dismiss)
          </div>
        )}
        <Outlet />
      </main>
      <CallPanel />
      <UndoToast />
    </div>
  );
}
