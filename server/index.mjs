// fe-practice-hub server — REST (auth, channels, history) + WebSocket (live chat, presence,
// typing, WebRTC signaling). SQLite-backed. LOCALHOST dev only.
import { createServer } from "node:http";
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { WebSocketServer } from "ws";
import {
  addMessage, createUser, deleteMessage, editMessage, getChannel, getMessage, getMessages,
  getUserById, getUserByName, listChannels, toggleReaction,
} from "./db.mjs";
import { hashPassword, signToken, verifyPassword, verifyToken } from "./auth.mjs";

const HOST = "127.0.0.1";
const PORT = 8787;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

// image uploads live on disk next to the server; the DB only stores the /uploads/<name> path
const UPLOADS_DIR = process.env.HUB_UPLOADS || join(dirname(fileURLToPath(import.meta.url)), "uploads");
mkdirSync(UPLOADS_DIR, { recursive: true });
const MIME_EXT = { "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp" };
const EXT_MIME = { png: "image/png", jpg: "image/jpeg", gif: "image/gif", webp: "image/webp" };
const MAX_UPLOAD = 5 * 1024 * 1024; // 5 MB
const UPLOAD_NAME_RE = /^[a-f0-9-]+\.(png|jpg|gif|webp)$/; // uuid + known ext only (blocks path traversal)

// ---------- helpers (stateless) ----------
const readJson = (req) =>
  new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch { resolve({}); } });
  });

const sendJson = (res, code, obj) => {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(obj));
};

// read a raw request body as a Buffer, rejecting once it exceeds maxBytes
const readRawBody = (req, maxBytes) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > maxBytes) { reject(new Error("too large")); req.destroy(); }
      else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

// remove an uploaded file when its message is deleted (best-effort; validate the name first)
function deleteUpload(imageUrl) {
  const name = String(imageUrl || "").split("/").pop();
  if (!name || !UPLOAD_NAME_RE.test(name)) return;
  try { unlinkSync(join(UPLOADS_DIR, name)); } catch { /* already gone */ }
}

// serve an uploaded image by name; the regex + fixed dir block path traversal (../ etc)
function serveUpload(res, name) {
  if (!UPLOAD_NAME_RE.test(name)) { res.writeHead(400).end("bad name"); return; }
  try {
    const buf = readFileSync(join(UPLOADS_DIR, name));
    res.writeHead(200, { "content-type": EXT_MIME[name.split(".").pop()], "cache-control": "public, max-age=31536000, immutable" });
    res.end(buf);
  } catch { res.writeHead(404).end("not found"); }
}

// Pull + verify the bearer token; returns the user row or null.
function authUser(req) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  const payload = verifyToken(token);
  return payload ? getUserById(payload.sub) : null;
}

async function handleApi(req, res, url) {
  const path = url.pathname;

  if (req.method === "POST" && path === "/api/register") {
    const { username, password } = await readJson(req);
    if (!USERNAME_RE.test(username || "")) return sendJson(res, 400, { error: "username must be 3-32 chars [a-zA-Z0-9_]" });
    if (typeof password !== "string" || password.length < 6) return sendJson(res, 400, { error: "password must be >= 6 chars" });
    if (getUserByName(username)) return sendJson(res, 409, { error: "username taken" });
    const user = createUser(username, hashPassword(password));
    return sendJson(res, 201, { token: signToken({ sub: user.id, name: user.username }), user });
  }

  if (req.method === "POST" && path === "/api/login") {
    const { username, password } = await readJson(req);
    const row = getUserByName(username || "");
    if (!row || !verifyPassword(password || "", row.pass_hash)) return sendJson(res, 401, { error: "invalid credentials" });
    const user = { id: row.id, username: row.username };
    return sendJson(res, 200, { token: signToken({ sub: user.id, name: user.username }), user });
  }

  // everything below requires auth
  const user = authUser(req);
  if (!user) return sendJson(res, 401, { error: "unauthorized" });

  if (req.method === "GET" && path === "/api/me") return sendJson(res, 200, { user });
  if (req.method === "GET" && path === "/api/channels") return sendJson(res, 200, { channels: listChannels() });

  if (req.method === "POST" && path === "/api/upload") {
    const ext = MIME_EXT[String(req.headers["content-type"] || "")]; // type validated at the boundary
    if (!ext) return sendJson(res, 400, { error: "only PNG/JPEG/GIF/WebP images allowed" });
    let buf;
    try { buf = await readRawBody(req, MAX_UPLOAD); } catch { return sendJson(res, 413, { error: "image too large (max 5MB)" }); }
    if (!buf.length) return sendJson(res, 400, { error: "empty upload" });
    const name = `${randomUUID()}.${ext}`; // uuid name, never the client's filename
    writeFileSync(join(UPLOADS_DIR, name), buf);
    return sendJson(res, 201, { url: `/uploads/${name}` });
  }

  const msgMatch = path.match(/^\/api\/channels\/([^/]+)\/messages$/);
  if (req.method === "GET" && msgMatch) {
    const channelId = msgMatch[1];
    if (!getChannel(channelId)) return sendJson(res, 404, { error: "no such channel" });
    const before = Number(url.searchParams.get("before")) || undefined;
    const limit = Math.min(Number(url.searchParams.get("limit")) || 30, 100);
    return sendJson(res, 200, { messages: getMessages(channelId, before, limit) }); // desc order
  }

  return sendJson(res, 404, { error: "not found" });
}

// Build a fresh server instance (http + ws). Not listening — caller calls .listen(). This lets tests
// boot it on an ephemeral port with an in-memory DB.
export function createHubServer() {
  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://${HOST}`);
    if (url.pathname.startsWith("/api/")) return handleApi(req, res, url);
    if (req.method === "GET" && url.pathname.startsWith("/uploads/")) {
      return serveUpload(res, url.pathname.slice("/uploads/".length));
    }
    res.writeHead(404).end("not found");
  });

  const wss = new WebSocketServer({ noServer: true });
  const clients = new Map(); // ws -> { userId, username, channelId, typing }

  const RELAY = new Set([
    "call-request", "call-accept", "call-reject", "call-end",
    "rtc-offer", "rtc-answer", "rtc-ice",
  ]);

  function broadcast(obj) {
    const data = JSON.stringify(obj);
    for (const ws of wss.clients) if (ws.readyState === ws.OPEN) ws.send(data);
  }
  function findByUserId(id) {
    for (const [ws, c] of clients) if (c.userId === id) return ws;
    return null;
  }
  function presence() {
    const seen = new Map();
    for (const c of clients.values()) if (!seen.has(c.userId)) seen.set(c.userId, { id: c.userId, name: c.username });
    return [...seen.values()];
  }
  function typingIn(channelId) {
    const names = new Set();
    for (const c of clients.values()) if (c.typing && c.channelId === channelId) names.add(c.username);
    return [...names];
  }

  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url, `http://${HOST}`);
    if (url.pathname !== "/ws") return socket.destroy();
    const payload = verifyToken(url.searchParams.get("token"));
    if (!payload) { socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n"); return socket.destroy(); }
    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.user = { id: payload.sub, name: payload.name };
      wss.emit("connection", ws);
    });
  });

  wss.on("connection", (ws) => {
    const client = { userId: ws.user.id, username: ws.user.name, channelId: null, typing: false };
    clients.set(ws, client);
    ws.send(JSON.stringify({ type: "welcome", id: client.userId, name: client.username }));
    broadcast({ type: "presence", users: presence() });

    ws.on("message", (raw) => {
      let m;
      try { m = JSON.parse(raw); } catch { return; }

      if (RELAY.has(m.type)) {
        const target = findByUserId(m.to);
        if (target && target.readyState === target.OPEN) {
          const { to, ...rest } = m;
          target.send(JSON.stringify({ ...rest, from: client.userId, fromName: client.username }));
        }
        return;
      }

      if (m.type === "sub") { client.channelId = String(m.channelId || ""); return; }

      if (m.type === "msg") {
        const text = String(m.text || "").slice(0, 2000);
        const channelId = String(m.channelId || "");
        const imageUrl = typeof m.imageUrl === "string" && m.imageUrl.startsWith("/uploads/") ? m.imageUrl : null;
        if ((!text.trim() && !imageUrl) || !getChannel(channelId)) return; // need text or an image
        // reply: snapshot the parent's name + text (server-derived, not client-trusted)
        let reply = {};
        if (m.replyTo) {
          const parent = getMessage(String(m.replyTo));
          if (parent && parent.channelId === channelId) {
            reply = { replyTo: parent.id, replyToName: parent.name, replyToPreview: parent.text.slice(0, 120) };
          }
        }
        const saved = addMessage({ channelId, userId: client.userId, name: client.username, text, ...reply, imageUrl });
        const message = { ...saved, clientMsgId: m.clientMsgId ?? null };
        if (client.typing) { client.typing = false; broadcast({ type: "typing", channelId, users: typingIn(channelId) }); }
        broadcast({ type: "msg", message });
        return;
      }

      if (m.type === "typing") {
        const t = Boolean(m.isTyping);
        if (t !== client.typing) {
          client.typing = t;
          broadcast({ type: "typing", channelId: client.channelId, users: typingIn(client.channelId) });
        }
        return;
      }

      if (m.type === "react") {
        const r = toggleReaction(String(m.messageId || ""), client.userId, String(m.emoji || ""));
        if (r) broadcast({ type: "reaction", ...r });
        return;
      }

      if (m.type === "edit") {
        const text = String(m.text || "").slice(0, 2000);
        if (!text.trim()) return;
        const r = editMessage(String(m.messageId || ""), client.userId, text);
        if (r) broadcast({ type: "edit", ...r });
        else ws.send(JSON.stringify({ type: "error", op: "edit", messageId: m.messageId })); // not the author
        return;
      }

      if (m.type === "delete") {
        const r = deleteMessage(String(m.messageId || ""), client.userId);
        if (r) {
          if (r.imageUrl) deleteUpload(r.imageUrl); // remove the orphaned file from disk
          broadcast({ type: "delete", channelId: r.channelId, messageId: r.messageId });
        } else {
          ws.send(JSON.stringify({ type: "error", op: "delete", messageId: m.messageId }));
        }
      }
    });

    ws.on("close", () => {
      const ch = client.channelId;
      clients.delete(ws);
      broadcast({ type: "presence", users: presence() });
      if (ch) broadcast({ type: "typing", channelId: ch, users: typingIn(ch) });
    });
  });

  return server;
}

// run directly (pnpm dev:server) — but not when imported by a test
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createHubServer().listen(PORT, HOST, () => {
    console.log(`\n  fe-practice-hub server`);
    console.log(`  http://${HOST}:${PORT}  (REST /api/* + ws /ws)`);
    console.log(`  SQLite-backed. auth + channels + history + live + WebRTC. localhost only.\n`);
  });
}
