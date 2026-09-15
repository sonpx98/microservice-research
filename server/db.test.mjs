import { beforeAll, describe, expect, it } from "vitest";

// isolate the DB in memory BEFORE importing the module (it opens the DB at import)
process.env.HUB_DB = ":memory:";
let db;
beforeAll(async () => {
  db = await import("./db.mjs");
});

describe("channels seed", () => {
  it("seeds exactly general + random, no duplicates", () => {
    const names = db.listChannels().map((c) => c.name).sort();
    expect(names).toEqual(["general", "random"]);
  });
});

describe("users", () => {
  it("creates then reads a user", () => {
    const user = db.createUser("alice", "hash:abc");
    const row = db.getUserByName("alice");
    expect(row.id).toBe(user.id);
    expect(row.username).toBe("alice");
    expect(row.pass_hash).toBe("hash:abc");
  });

  it("rejects a duplicate username (UNIQUE)", () => {
    db.createUser("bob", "h");
    expect(() => db.createUser("bob", "h2")).toThrow();
  });
});

describe("messages + keyset pagination", () => {
  it("stores and reads back a message with camelCase fields", () => {
    const ch = db.listChannels()[0];
    const saved = db.addMessage({ channelId: ch.id, userId: "u1", name: "alice", text: "hi" });
    const page = db.getMessages(ch.id, undefined, 10);
    expect(page[0].id).toBe(saved.id);
    expect(page[0].channelId).toBe(ch.id);
    expect(page[0].userId).toBe("u1");
    expect(page[0].text).toBe("hi");
  });

  it("paginates newest-first with a `before` cursor and no overlap", () => {
    const ch = db.listChannels()[1]; // fresh channel (#random), unused above
    for (let i = 0; i < 50; i++) db.addMessage({ channelId: ch.id, userId: "u", name: "n", text: `m${i}` });

    const page1 = db.getMessages(ch.id, undefined, 30);
    expect(page1).toHaveLength(30);
    // DESC: newest first
    expect(page1[0].ts).toBeGreaterThan(page1[29].ts);

    const cursor = page1[page1.length - 1].ts;
    const page2 = db.getMessages(ch.id, cursor, 30);
    expect(page2).toHaveLength(20); // 50 total - 30

    const ids = new Set([...page1, ...page2].map((m) => m.id));
    expect(ids.size).toBe(50); // no overlap, nothing dropped
  });
});

describe("reactions", () => {
  it("toggles a reaction on/off and reports the op", () => {
    const ch = db.listChannels()[0];
    const m = db.addMessage({ channelId: ch.id, userId: "u1", name: "n", text: "react me" });
    expect(db.toggleReaction(m.id, "u2", "👍").op).toBe("add");
    expect(db.getMessages(ch.id, undefined, 50).find((x) => x.id === m.id).reactions).toEqual({ "👍": ["u2"] });
    expect(db.toggleReaction(m.id, "u2", "👍").op).toBe("remove");
    expect(db.getMessages(ch.id, undefined, 50).find((x) => x.id === m.id).reactions).toEqual({});
  });

  it("returns null for a missing message", () => {
    expect(db.toggleReaction("nope", "u1", "👍")).toBeNull();
  });
});

describe("edit / delete ownership", () => {
  it("author can edit; non-author cannot", () => {
    const ch = db.listChannels()[0];
    const m = db.addMessage({ channelId: ch.id, userId: "owner", name: "n", text: "v1" });
    expect(db.editMessage(m.id, "someone-else", "hacked")).toBeNull();
    const ok = db.editMessage(m.id, "owner", "v2");
    expect(ok.text).toBe("v2");
    const row = db.getMessages(ch.id, undefined, 50).find((x) => x.id === m.id);
    expect(row.text).toBe("v2");
    expect(row.editedAt).toBeTruthy();
  });

  it("author can delete; non-author cannot", () => {
    const ch = db.listChannels()[0];
    const m = db.addMessage({ channelId: ch.id, userId: "owner", name: "n", text: "bye" });
    expect(db.deleteMessage(m.id, "someone-else")).toBeNull();
    expect(db.deleteMessage(m.id, "owner").messageId).toBe(m.id);
    expect(db.getMessages(ch.id, undefined, 50).find((x) => x.id === m.id)).toBeUndefined();
  });
});

describe("reply snapshot", () => {
  it("stores and returns the denormalized reply fields", () => {
    const ch = db.listChannels()[0];
    const parent = db.addMessage({ channelId: ch.id, userId: "u1", name: "alice", text: "parent msg" });
    const child = db.addMessage({
      channelId: ch.id, userId: "u2", name: "bob", text: "a reply",
      replyTo: parent.id, replyToName: "alice", replyToPreview: "parent msg",
    });
    const row = db.getMessages(ch.id, undefined, 50).find((x) => x.id === child.id);
    expect(row.replyTo).toBe(parent.id);
    expect(row.replyToName).toBe("alice");
    expect(row.replyToPreview).toBe("parent msg");
  });
});
