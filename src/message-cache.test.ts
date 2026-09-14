import { describe, expect, it } from "vitest";
import { mergeMessage, type MsgPages } from "./message-cache";
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
