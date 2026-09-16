// Password hashing (scrypt) + JWT (HS256), zero-dependency via node:crypto.
// Same primitives as the security-lab jwt lab — here used the correct way.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// note: hardcoded dev secret. Real apps load this from env and never commit it.
const SECRET = process.env.HUB_JWT_SECRET || "dev-only-secret-change-me";
const b64url = (buf) => Buffer.from(buf).toString("base64url");
const b64urlJson = (obj) => b64url(JSON.stringify(obj));

// --- password ---
export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}
export function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(":");
  const hash = Buffer.from(hashHex, "hex");
  const test = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  return hash.length === test.length && timingSafeEqual(hash, test);
}

// --- JWT (HS256) ---
export function signToken(payload, ttlSeconds = 60 * 60 * 24 * 7) {
  const header = { alg: "HS256", typ: "JWT" };
  const body = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const data = `${b64urlJson(header)}.${b64urlJson(body)}`;
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, sig] = parts;
  // reject alg:none and any non-HS256 header (the jwt-alg-none lab attack)
  let header;
  try { header = JSON.parse(Buffer.from(h, "base64url").toString()); } catch { return null; }
  if (header.alg !== "HS256") return null;
  const expected = createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let payload;
  try { payload = JSON.parse(Buffer.from(p, "base64url").toString()); } catch { return null; }
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null; // expired
  return payload;
}
