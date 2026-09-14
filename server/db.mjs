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
`);

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
const _insMsg = db.prepare("INSERT INTO messages (id, channel_id, user_id, name, text, ts) VALUES (?, ?, ?, ?, ?, ?)");
// keyset pagination: messages in a channel older than `before`, newest first
const _msgPage = db.prepare(
  "SELECT id, channel_id AS channelId, user_id AS userId, name, text, ts FROM messages WHERE channel_id = ? AND ts < ? ORDER BY ts DESC LIMIT ?",
);

let lastTs = 0;
export function addMessage({ channelId, userId, name, text }) {
  const ts = Math.max(Date.now(), lastTs + 1); // strictly increasing → no ts ties for keyset pagination
  lastTs = ts;
  const msg = { id: randomUUID(), channelId, userId, name, text, ts };
  _insMsg.run(msg.id, msg.channelId, msg.userId, msg.name, msg.text, msg.ts);
  return msg;
}
export function getMessages(channelId, before, limit) {
  return _msgPage.all(channelId, before ?? Number.MAX_SAFE_INTEGER, limit); // desc; client reverses to asc
}
