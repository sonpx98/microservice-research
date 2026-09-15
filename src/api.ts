import { getToken, useAuth } from "./auth";
import type { Channel, ChatMessage } from "./types";

// Auth endpoints: plain POST, a 401 here means bad credentials (not a dead session).
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// Authed GET: attaches the bearer token; a 401 means the session is gone, so log out.
async function authGet<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 401) {
    useAuth.getState().logout();
    throw new Error("session expired");
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const register = (username: string, password: string) =>
  post<{ token: string; user: { id: string; username: string } }>("/register", { username, password });
export const login = (username: string, password: string) =>
  post<{ token: string; user: { id: string; username: string } }>("/login", { username, password });

export const fetchChannels = () => authGet<{ channels: Channel[] }>("/channels");
export const fetchMessages = (channelId: string, before?: number) =>
  authGet<{ messages: ChatMessage[] }>(`/channels/${channelId}/messages?limit=30${before ? `&before=${before}` : ""}`);
export const fetchTrash = (channelId: string) =>
  authGet<{ messages: ChatMessage[] }>(`/channels/${channelId}/trash`);

// upload raw image bytes (no base64, no multipart lib); server returns { url: "/uploads/<name>" }
export async function uploadImage(file: File): Promise<string> {
  const token = getToken();
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "content-type": file.type, ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: file,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data.url as string;
}
