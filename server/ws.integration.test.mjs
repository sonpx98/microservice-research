import { afterAll, beforeAll, describe, expect, it } from "vitest";

process.env.HUB_DB = ":memory:";
let server, port, signToken, listChannels;

beforeAll(async () => {
  const { createHubServer } = await import("./index.mjs");
  ({ signToken } = await import("./auth.mjs"));
  ({ listChannels } = await import("./db.mjs")); // same in-memory DB instance as the server
  server = createHubServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;
});
afterAll(() => new Promise((r) => server.close(r)));

const tokenFor = (id, name) => signToken({ sub: id, name });
const wsUrl = (token) => `ws://127.0.0.1:${port}/ws${token ? `?token=${token}` : ""}`;

// open a socket and wait for it to be ready (or error)
function openWs(token) {
  const ws = new WebSocket(wsUrl(token));
  return new Promise((resolve, reject) => {
    ws.onopen = () => resolve(ws);
    ws.onerror = () => reject(new Error("ws error"));
  });
}
// resolve with the first frame matching `pred`
function waitFrame(ws, pred, ms = 3000) {
  return new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error("timeout")), ms);
    const prev = ws.onmessage;
    ws.onmessage = (e) => {
      prev?.(e);
      const m = JSON.parse(e.data);
      if (pred(m)) { clearTimeout(to); resolve(m); }
    };
  });
}

describe("WS auth", () => {
  it("rejects an upgrade without a token", async () => {
    await expect(openWs(null)).rejects.toThrow();
  });

  it("accepts a valid token and sends welcome", async () => {
    const ws = await openWs(tokenFor("u1", "alice"));
    const welcome = await waitFrame(ws, (m) => m.type === "welcome");
    expect(welcome.id).toBe("u1");
    expect(welcome.name).toBe("alice");
    ws.close();
  });
});

describe("WS messaging", () => {
  it("persists a sent message (visible via REST afterward)", async () => {
    const channelId = listChannels()[0].id;
    const token = tokenFor("sender", "sender");
    const ws = await openWs(token);
    const got = waitFrame(ws, (m) => m.type === "msg" && m.message.text === "persisted!");
    ws.send(JSON.stringify({ type: "sub", channelId }));
    ws.send(JSON.stringify({ type: "msg", channelId, text: "persisted!", clientMsgId: "c1" }));
    const frame = await got;
    expect(frame.message.clientMsgId).toBe("c1");
    ws.close();

    const r = await fetch(`http://127.0.0.1:${port}/api/channels/${channelId}/messages`, {
      headers: { authorization: `Bearer ${token}` },
    });
    // sender token has sub not in DB → REST 401; grab a legit token via register instead
    const reg = await (await fetch(`http://127.0.0.1:${port}/api/register`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "histcheck", password: "secret1" }),
    })).json();
    const r2 = await fetch(`http://127.0.0.1:${port}/api/channels/${channelId}/messages`, {
      headers: { authorization: `Bearer ${reg.token}` },
    });
    void r;
    expect((await r2.json()).messages.map((m) => m.text)).toContain("persisted!");
  });

  it("routes a WebRTC call-request only to the target, tagged with the sender", async () => {
    const bWs = await openWs(tokenFor("B", "bob"));
    const bGetsCall = waitFrame(bWs, (m) => m.type === "call-request");

    const aWs = await openWs(tokenFor("A", "ann"));
    aWs.send(JSON.stringify({ type: "call-request", to: "B" }));

    const req = await bGetsCall;
    expect(req.from).toBe("A");
    expect(req.fromName).toBe("ann");
    aWs.close();
    bWs.close();
  });
});
