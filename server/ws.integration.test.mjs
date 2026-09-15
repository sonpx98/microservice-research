import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.HUB_DB = ":memory:";
const UPLOADS = mkdtempSync(join(tmpdir(), "fph-ws-uploads-"));
process.env.HUB_UPLOADS = UPLOADS;
let server, port, signToken, listChannels;

beforeAll(async () => {
  const { createHubServer } = await import("./index.mjs");
  ({ signToken } = await import("./auth.mjs"));
  ({ listChannels } = await import("./db.mjs")); // same in-memory DB instance as the server
  server = createHubServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;
});
afterAll(() => { rmSync(UPLOADS, { recursive: true, force: true }); return new Promise((r) => server.close(r)); });

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

describe("WS reactions / edit / delete", () => {
  // helper: create a message and resolve its id
  async function makeMessage(ws, channelId, text) {
    const got = waitFrame(ws, (m) => m.type === "msg" && m.message.text === text);
    ws.send(JSON.stringify({ type: "sub", channelId }));
    ws.send(JSON.stringify({ type: "msg", channelId, text }));
    return (await got).message.id;
  }

  it("broadcasts a reaction toggle (add then remove)", async () => {
    const channelId = listChannels()[0].id;
    const ws = await openWs(tokenFor("reactor", "reactor"));
    const id = await makeMessage(ws, channelId, "react-target");

    const add = waitFrame(ws, (m) => m.type === "reaction");
    ws.send(JSON.stringify({ type: "react", messageId: id, emoji: "👍" }));
    expect((await add).op).toBe("add");

    const remove = waitFrame(ws, (m) => m.type === "reaction");
    ws.send(JSON.stringify({ type: "react", messageId: id, emoji: "👍" }));
    expect((await remove).op).toBe("remove");
    ws.close();
  });

  it("the author can edit; a non-author gets an error", async () => {
    const channelId = listChannels()[0].id;
    const author = await openWs(tokenFor("author", "author"));
    const id = await makeMessage(author, channelId, "editable");

    const edited = waitFrame(author, (m) => m.type === "edit");
    author.send(JSON.stringify({ type: "edit", messageId: id, text: "edited!" }));
    expect((await edited).text).toBe("edited!");

    const other = await openWs(tokenFor("intruder", "intruder"));
    const err = waitFrame(other, (m) => m.type === "error");
    other.send(JSON.stringify({ type: "edit", messageId: id, text: "hacked" }));
    expect((await err).op).toBe("edit");
    author.close();
    other.close();
  });

  it("the author can delete their message", async () => {
    const channelId = listChannels()[0].id;
    const ws = await openWs(tokenFor("deleter", "deleter"));
    const id = await makeMessage(ws, channelId, "delete-me");

    const del = waitFrame(ws, (m) => m.type === "delete");
    ws.send(JSON.stringify({ type: "delete", messageId: id }));
    expect((await del).messageId).toBe(id);
    ws.close();
  });
});

describe("WS reply", () => {
  it("attaches a server-derived reply snapshot from the parent", async () => {
    const channelId = listChannels()[0].id;
    const author = await openWs(tokenFor("pauthor", "pauthor"));
    const gotParent = waitFrame(author, (m) => m.type === "msg" && m.message.text === "the-parent");
    author.send(JSON.stringify({ type: "sub", channelId }));
    author.send(JSON.stringify({ type: "msg", channelId, text: "the-parent" }));
    const parentId = (await gotParent).message.id;

    const replier = await openWs(tokenFor("replier", "replier"));
    const got = waitFrame(replier, (m) => m.type === "msg" && m.message.text === "the-reply");
    replier.send(JSON.stringify({ type: "sub", channelId }));
    replier.send(JSON.stringify({ type: "msg", channelId, text: "the-reply", replyTo: parentId }));
    const msg = (await got).message;
    expect(msg.replyTo).toBe(parentId);
    expect(msg.replyToName).toBe("pauthor");
    expect(msg.replyToPreview).toBe("the-parent");
    author.close();
    replier.close();
  });
});

describe("WS delete removes the image file from disk", () => {
  const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

  it("unlinks the uploaded file when its message is deleted", async () => {
    const channelId = listChannels()[0].id;
    const base = `http://127.0.0.1:${port}`;
    // register a real user (upload route needs a DB-backed user for auth)
    const reg = await (await fetch(`${base}/api/register`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "imguser", password: "secret1" }),
    })).json();
    const up = await (await fetch(`${base}/api/upload`, {
      method: "POST", headers: { authorization: `Bearer ${reg.token}`, "content-type": "image/png" }, body: PNG,
    })).json();
    const fileName = up.url.split("/").pop();
    expect(existsSync(join(UPLOADS, fileName))).toBe(true);

    // send a message carrying that image, then delete it, over WS as the same user
    const ws = await openWs(signToken({ sub: reg.user.id, name: reg.user.username }));
    const got = waitFrame(ws, (m) => m.type === "msg" && m.message.imageUrl === up.url);
    ws.send(JSON.stringify({ type: "sub", channelId }));
    ws.send(JSON.stringify({ type: "msg", channelId, text: "pic", imageUrl: up.url }));
    const id = (await got).message.id;

    const del = waitFrame(ws, (m) => m.type === "delete");
    ws.send(JSON.stringify({ type: "delete", messageId: id }));
    await del;
    expect(existsSync(join(UPLOADS, fileName))).toBe(false); // file gone from disk
    ws.close();
  });
});
