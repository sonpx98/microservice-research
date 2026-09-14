import { http, HttpResponse } from "msw";
import type { ChatMessage } from "../types";

export const CHANNELS = [
  { id: "c1", name: "general" },
  { id: "c2", name: "random" },
];

// 40 messages, ts 1..40, text "msg 0".."msg 39" (msg 39 is newest)
const ALL: ChatMessage[] = Array.from({ length: 40 }, (_, i) => ({
  id: `m${i}`, channelId: "c1", userId: "u1", name: "alice", text: `msg ${i}`, ts: i + 1,
}));

export const handlers = [
  http.post("/api/register", async ({ request }) => {
    const b = (await request.json()) as { username: string };
    return HttpResponse.json({ token: "test-token", user: { id: "u1", username: b.username } }, { status: 201 });
  }),
  http.post("/api/login", async ({ request }) => {
    const b = (await request.json()) as { username: string; password: string };
    if (b.password !== "secret1") return HttpResponse.json({ error: "invalid credentials" }, { status: 401 });
    return HttpResponse.json({ token: "test-token", user: { id: "u1", username: b.username } });
  }),
  http.get("/api/channels", () => HttpResponse.json({ channels: CHANNELS })),
  http.get("/api/channels/:id/messages", ({ request }) => {
    const url = new URL(request.url);
    const before = Number(url.searchParams.get("before")) || Infinity;
    const limit = Number(url.searchParams.get("limit")) || 30;
    const page = ALL.filter((m) => m.ts < before).sort((a, b) => b.ts - a.ts).slice(0, limit); // DESC
    return HttpResponse.json({ messages: page });
  }),
];
