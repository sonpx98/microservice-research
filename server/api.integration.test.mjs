import { afterAll, beforeAll, describe, expect, it } from "vitest";

process.env.HUB_DB = ":memory:"; // isolate before db.mjs is imported (transitively via index.mjs)
let server, base;

beforeAll(async () => {
  const { createHubServer } = await import("./index.mjs");
  server = createHubServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
afterAll(() => new Promise((r) => server.close(r)));

const post = (path, body, headers = {}) =>
  fetch(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
const get = (path, headers = {}) => fetch(`${base}${path}`, { headers });

async function registered(username = "alice") {
  const r = await post("/api/register", { username, password: "secret1" });
  return (await r.json()).token;
}

describe("REST auth", () => {
  it("registers a user → 201 + token", async () => {
    const r = await post("/api/register", { username: "reg1", password: "secret1" });
    expect(r.status).toBe(201);
    expect((await r.json()).token).toBeTruthy();
  });

  it("rejects a duplicate username → 409", async () => {
    await post("/api/register", { username: "dupe", password: "secret1" });
    const r = await post("/api/register", { username: "dupe", password: "secret1" });
    expect(r.status).toBe(409);
  });

  it("rejects a bad username / short password → 400", async () => {
    expect((await post("/api/register", { username: "x", password: "secret1" })).status).toBe(400);
    expect((await post("/api/register", { username: "okname", password: "123" })).status).toBe(400);
  });

  it("logs in with correct creds, rejects wrong ones", async () => {
    await post("/api/register", { username: "loginu", password: "secret1" });
    expect((await post("/api/login", { username: "loginu", password: "secret1" })).status).toBe(200);
    expect((await post("/api/login", { username: "loginu", password: "nope" })).status).toBe(401);
    expect((await post("/api/login", { username: "ghost", password: "secret1" })).status).toBe(401);
  });
});

describe("REST protected routes", () => {
  it("channels: 401 without token, 200 + seeded list with token", async () => {
    expect((await get("/api/channels")).status).toBe(401);
    const token = await registered("chanuser");
    const r = await get("/api/channels", { authorization: `Bearer ${token}` });
    expect(r.status).toBe(200);
    const names = (await r.json()).channels.map((c) => c.name).sort();
    expect(names).toEqual(["general", "random"]);
  });

  it("rejects a tampered token → 401 (middleware honours verifyToken)", async () => {
    const token = await registered("tampuser");
    const [h, p] = token.split(".");
    const forged = `${h}.${p}.deadbeef`;
    expect((await get("/api/me", { authorization: `Bearer ${forged}` })).status).toBe(401);
  });

  it("message history paginates and 404s an unknown channel", async () => {
    const token = await registered("histuser");
    const auth = { authorization: `Bearer ${token}` };
    expect((await get("/api/channels/nope/messages", auth)).status).toBe(404);
    const ch = (await (await get("/api/channels", auth)).json()).channels[0];
    const r = await get(`/api/channels/${ch.id}/messages?limit=5`, auth);
    expect(r.status).toBe(200);
    expect(Array.isArray((await r.json()).messages)).toBe(true);
  });
});
