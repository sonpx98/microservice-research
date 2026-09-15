// SQLite persistence (node:sqlite, built-in). File-backed so data survives restarts.
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.HUB_DB || join(HERE, "hub.db"); // tests set HUB_DB=":memory:"
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    pass_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS channels (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    text TEXT NOT NULL,
    ts INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_messages_channel_ts ON messages (channel_id, ts);
  CREATE TABLE IF NOT EXISTS reactions (
    message_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    emoji TEXT NOT NULL,
    PRIMARY KEY (message_id, user_id, emoji)
  );
`);

// migrations: add columns to an existing messages table (each throws if already present → ignore)
for (const col of [
  "ALTER TABLE messages ADD COLUMN edited_at INTEGER",
  "ALTER TABLE messages ADD COLUMN reply_to TEXT",
  "ALTER TABLE messages ADD COLUMN reply_to_name TEXT",
  "ALTER TABLE messages ADD COLUMN reply_to_preview TEXT",
  "ALTER TABLE messages ADD COLUMN image_url TEXT",
]) {
  try { db.exec(col); } catch { /* already migrated */ }
}

// seed default channels once
const seedChannel = db.prepare("INSERT OR IGNORE INTO channels (id, name, created_at) VALUES (?, ?, ?)");
for (const name of ["general", "random"]) seedChannel.run(randomUUID(), name, Date.now());

// --- users ---
const _insUser = db.prepare("INSERT INTO users (id, username, pass_hash, created_at) VALUES (?, ?, ?, ?)");
const _userByName = db.prepare("SELECT * FROM users WHERE username = ?");
const _userById = db.prepare("SELECT id, username FROM users WHERE id = ?");

export function createUser(username, passHash) {
  const id = randomUUID();
  _insUser.run(id, username, passHash, Date.now());
  return { id, username };
}
export const getUserByName = (username) => _userByName.get(username);
export const getUserById = (id) => _userById.get(id);

// --- channels ---
const _channels = db.prepare("SELECT id, name FROM channels ORDER BY created_at");
const _channelById = db.prepare("SELECT id, name FROM channels WHERE id = ?");
export const listChannels = () => _channels.all();
export const getChannel = (id) => _channelById.get(id);

// --- messages ---
const _insMsg = db.prepare(
  "INSERT INTO messages (id, channel_id, user_id, name, text, ts, reply_to, reply_to_name, reply_to_preview, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
);
// keyset pagination: messages in a channel older than `before`, newest first
const _msgPage = db.prepare(
  "SELECT id, channel_id AS channelId, user_id AS userId, name, text, ts, edited_at AS editedAt, reply_to AS replyTo, reply_to_name AS replyToName, reply_to_preview AS replyToPreview, image_url AS imageUrl FROM messages WHERE channel_id = ? AND ts < ? ORDER BY ts DESC LIMIT ?",
);
const _msgById = db.prepare("SELECT id, channel_id AS channelId, user_id AS userId, name, text, ts, edited_at AS editedAt, image_url AS imageUrl FROM messages WHERE id = ?");
const _editMsg = db.prepare("UPDATE messages SET text = ?, edited_at = ? WHERE id = ? AND user_id = ?");
const _delMsg = db.prepare("DELETE FROM messages WHERE id = ?");

// --- reactions ---
const _reactByMsg = db.prepare("SELECT emoji, user_id AS userId FROM reactions WHERE message_id = ?");
const _hasReact = db.prepare("SELECT 1 FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?");
const _addReact = db.prepare("INSERT OR IGNORE INTO reactions (message_id, user_id, emoji) VALUES (?, ?, ?)");
const _delReact = db.prepare("DELETE FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?");
const _delReactAll = db.prepare("DELETE FROM reactions WHERE message_id = ?");

// { emoji: [userId, ...] } for one message
function reactionsFor(messageId) {
  const map = {};
  for (const r of _reactByMsg.all(messageId)) (map[r.emoji] ??= []).push(r.userId);
  return map;
}

let lastTs = 0;
export function addMessage({ channelId, userId, name, text, replyTo = null, replyToName = null, replyToPreview = null, imageUrl = null }) {
  const ts = Math.max(Date.now(), lastTs + 1); // strictly increasing → no ts ties for keyset pagination
  lastTs = ts;
  const msg = { id: randomUUID(), channelId, userId, name, text, ts, replyTo, replyToName, replyToPreview, imageUrl };
  _insMsg.run(msg.id, msg.channelId, msg.userId, msg.name, msg.text, msg.ts, replyTo, replyToName, replyToPreview, imageUrl);
  return msg;
}

export function getMessages(channelId, before, limit) {
  const rows = _msgPage.all(channelId, before ?? Number.MAX_SAFE_INTEGER, limit); // desc; client reverses to asc
  return rows.map((r) => ({ ...r, reactions: reactionsFor(r.id) }));
}

export const getMessage = (id) => _msgById.get(id);

// ownership enforced by the user_id predicate; returns the broadcast payload or null if not the author
export function editMessage(id, userId, text) {
  const m = getMessage(id);
  if (!m || m.userId !== userId) return null;
  const editedAt = Date.now();
  _editMsg.run(text, editedAt, id, userId);
  return { messageId: id, channelId: m.channelId, text, editedAt };
}

export function deleteMessage(id, userId) {
  const m = getMessage(id);
  if (!m || m.userId !== userId) return null;
  _delMsg.run(id);
  _delReactAll.run(id); // drop orphaned reactions
  return { messageId: id, channelId: m.channelId, imageUrl: m.imageUrl }; // imageUrl → caller unlinks the file
}

// toggle: remove if the user already reacted with this emoji, else add. Returns the broadcast payload.
export function toggleReaction(messageId, userId, emoji) {
  const m = getMessage(messageId);
  if (!m) return null;
  if (_hasReact.get(messageId, userId, emoji)) {
    _delReact.run(messageId, userId, emoji);
    return { messageId, channelId: m.channelId, emoji, userId, op: "remove" };
  }
  _addReact.run(messageId, userId, emoji);
  return { messageId, channelId: m.channelId, emoji, userId, op: "add" };
}
