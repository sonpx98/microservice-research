import { describe, expect, it } from "vitest";
import { hashPassword, signToken, verifyPassword, verifyToken } from "./auth.mjs";

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");

describe("password hashing", () => {
  it("round-trips the correct password", () => {
    const stored = hashPassword("secret1");
    expect(verifyPassword("secret1", stored)).toBe(true);
  });

  it("rejects a wrong password", () => {
    const stored = hashPassword("secret1");
    expect(verifyPassword("wrong", stored)).toBe(false);
  });

  it("uses a random salt (two hashes differ but both verify)", () => {
    const a = hashPassword("secret1");
    const b = hashPassword("secret1");
    expect(a).not.toBe(b);
    expect(verifyPassword("secret1", a)).toBe(true);
    expect(verifyPassword("secret1", b)).toBe(true);
  });
});

describe("JWT", () => {
  it("round-trips the payload", () => {
    const token = signToken({ sub: "u1", name: "alice" });
    const payload = verifyToken(token);
    expect(payload?.sub).toBe("u1");
    expect(payload?.name).toBe("alice");
  });

  it("rejects an alg:none token", () => {
    const forged = `${b64url({ alg: "none", typ: "JWT" })}.${b64url({ sub: "admin" })}.`;
    expect(verifyToken(forged)).toBeNull();
  });

  it("rejects a token signed with a different secret / tampered payload", () => {
    const token = signToken({ sub: "u1", name: "alice" });
    const [h, , sig] = token.split(".");
    const tampered = `${h}.${b64url({ sub: "admin", name: "alice" })}.${sig}`;
    expect(verifyToken(tampered)).toBeNull();
  });

  it("rejects an expired token", () => {
    const token = signToken({ sub: "u1" }, -1); // already expired
    expect(verifyToken(token)).toBeNull();
  });

  it("rejects malformed input", () => {
    expect(verifyToken("")).toBeNull();
    expect(verifyToken("a.b")).toBeNull();
    expect(verifyToken("a.b.c.d")).toBeNull();
    expect(verifyToken(null)).toBeNull();
  });
});
