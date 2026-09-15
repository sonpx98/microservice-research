import { describe, expect, it } from "vitest";
import { applyReaction, mergeMessage, type MsgPages, removeMessage, updateMessage } from "./message-cache";
import type { ChatMessage } from "./types";

function msg(over: Partial<ChatMessage>): ChatMessage {
  return { id: "x", channelId: "c", userId: "u", name: "n", text: "t", ts: 1, ...over };
}
function cache(page0: ChatMessage[]): MsgPages {
  return { pages: [page0], pageParams: [undefined] };
}

describe("mergeMessage", () => {
  it("adds an optimistic message to the front of page 0", () => {
    const out = mergeMessage(cache([]), msg({ id: "c1", clientMsgId: "c1", pending: true }));
    expect(out!.pages[0]).toHaveLength(1);
    expect(out!.pages[0][0].id).toBe("c1");
  });

  it("reconciles the optimistic copy by clientMsgId (replace, not duplicate)", () => {
    const before = cache([msg({ id: "c1", clientMsgId: "c1", pending: true })]);
    const out = mergeMessage(before, msg({ id: "real", clientMsgId: "c1" }));
    expect(out!.pages[0]).toHaveLength(1);
    expect(out!.pages[0][0].id).toBe("real");
    expect(out!.pages[0][0].pending).toBeUndefined();
  });

  it("appends a message from another user", () => {
    const before = cache([msg({ id: "m1" })]);
    const out = mergeMessage(before, msg({ id: "m2", clientMsgId: null }));
    expect(out!.pages[0].map((m) => m.id)).toEqual(["m2", "m1"]);
  });

  it("dedupes a duplicate echo by id (no-op)", () => {
    const before = cache([msg({ id: "m2" })]);
    const out = mergeMessage(before, msg({ id: "m2" }));
    expect(out!.pages[0]).toHaveLength(1);
  });

  it("returns undefined when the channel has no cache yet", () => {
    expect(mergeMessage(undefined, msg({}))).toBeUndefined();
  });
});

describe("updateMessage / removeMessage", () => {
  it("patches a message wherever it sits across pages", () => {
    const before: MsgPages = { pages: [[msg({ id: "a" })], [msg({ id: "b", text: "old" })]], pageParams: [undefined, 1] };
    const out = updateMessage(before, "b", (m) => ({ ...m, text: "new", editedAt: 99 }));
    expect(out!.pages[1][0].text).toBe("new");
    expect(out!.pages[1][0].editedAt).toBe(99);
    expect(out!.pages[0][0].text).toBe("t"); // untouched
  });

  it("removes a message", () => {
    const before = cache([msg({ id: "a" }), msg({ id: "b" })]);
    const out = removeMessage(before, "a");
    expect(out!.pages[0].map((m) => m.id)).toEqual(["b"]);
  });

  it("no-ops without a cache", () => {
    expect(updateMessage(undefined, "a", (m) => m)).toBeUndefined();
    expect(removeMessage(undefined, "a")).toBeUndefined();
  });
});

describe("applyReaction", () => {
  it("adds a reaction", () => {
    const out = applyReaction(cache([msg({ id: "a" })]), { messageId: "a", emoji: "👍", userId: "u1", op: "add" });
    expect(out!.pages[0][0].reactions).toEqual({ "👍": ["u1"] });
  });

  it("is idempotent on add (optimistic + echo don't double-count)", () => {
    let c = applyReaction(cache([msg({ id: "a" })]), { messageId: "a", emoji: "👍", userId: "u1", op: "add" });
    c = applyReaction(c, { messageId: "a", emoji: "👍", userId: "u1", op: "add" });
    expect(c!.pages[0][0].reactions!["👍"]).toEqual(["u1"]);
  });

  it("removes a reaction and drops the empty emoji key", () => {
    const start = cache([msg({ id: "a", reactions: { "👍": ["u1"] } })]);
    const out = applyReaction(start, { messageId: "a", emoji: "👍", userId: "u1", op: "remove" });
    expect(out!.pages[0][0].reactions).toEqual({});
  });

  it("keeps other users when one removes", () => {
    const start = cache([msg({ id: "a", reactions: { "👍": ["u1", "u2"] } })]);
    const out = applyReaction(start, { messageId: "a", emoji: "👍", userId: "u1", op: "remove" });
    expect(out!.pages[0][0].reactions!["👍"]).toEqual(["u2"]);
  });
});
