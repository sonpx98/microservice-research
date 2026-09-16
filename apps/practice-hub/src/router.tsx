import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth";
import { Login } from "./components/Login";
import { ChatLayout } from "./components/ChatLayout";
import { ChannelView } from "./components/ChannelView";
import { ChannelRedirect } from "./components/ChannelRedirect";
import { TrashView } from "./components/TrashView";

function Protected() {
  const token = useAuth((s) => s.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <Protected />,
    children: [
      {
        element: <ChatLayout />,
        children: [
          { path: "/", element: <ChannelRedirect /> },
          { path: "/c/:channelId", element: <ChannelView /> },
          { path: "/c/:channelId/trash", element: <TrashView /> },
        ],
      },
    ],
  },
]);
