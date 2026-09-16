// Single WebSocket shared by every feature (chat store, call store). Connects only once
// authenticated (token in the query string) and auto-reconnects while a session is active.
import { getToken } from "./auth";

export type Status = "connecting" | "open" | "closed";

type MsgHandler = (msg: any) => void;
type StatusHandler = (s: Status) => void;
type OpenHandler = () => void;

let ws: WebSocket | null = null;
let backoff = 500;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let shouldConnect = false;
let status: Status = "closed";

const msgHandlers = new Set<MsgHandler>();
const statusHandlers = new Set<StatusHandler>();
const openHandlers = new Set<OpenHandler>();

function setStatus(s: Status) {
  status = s;
  statusHandlers.forEach((h) => h(s));
}

function open() {
  const token = getToken();
  if (!token) return;
  setStatus("connecting");
  const proto = location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(`${proto}://${location.host}/ws?token=${encodeURIComponent(token)}`);

  ws.onopen = () => {
    backoff = 500;
    setStatus("open");
    openHandlers.forEach((h) => h());
  };
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    msgHandlers.forEach((h) => h(m));
  };
  ws.onclose = () => {
    setStatus("closed");
    if (!shouldConnect) return;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(open, backoff);
    backoff = Math.min(backoff * 2, 8000); // exponential backoff, capped at 8s
  };
}

export function connectSocket() {
  shouldConnect = true;
  if (!ws || ws.readyState === WebSocket.CLOSED) open();
}
export function disconnectSocket() {
  shouldConnect = false;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  ws?.close();
  ws = null;
  setStatus("closed");
}

export const getStatus = () => status;
export function sendSocket(obj: unknown) {
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
}
export const onMessage = (h: MsgHandler) => (msgHandlers.add(h), () => msgHandlers.delete(h));
export const onStatus = (h: StatusHandler) => (statusHandlers.add(h), () => statusHandlers.delete(h));
export const onOpen = (h: OpenHandler) => (openHandlers.add(h), () => openHandlers.delete(h));
