import { describe, expect, it } from "vitest";
import { nextBeforeCursor, PAGE_SIZE } from "./pagination";
import type { ChatMessage } from "./types";

const page = (n: number): ChatMessage[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `m${i}`, channelId: "c", userId: "u", name: "n", text: "t", ts: 1000 - i,
  }));

describe("nextBeforeCursor", () => {
  it("returns the oldest ts of a full page", () => {
    const p = page(PAGE_SIZE);
    expect(nextBeforeCursor(p)).toBe(p[p.length - 1].ts);
  });

  it("returns undefined for a partial page (end of history)", () => {
    expect(nextBeforeCursor(page(5))).toBeUndefined();
  });

  it("returns undefined for an empty page", () => {
    expect(nextBeforeCursor([])).toBeUndefined();
  });
});
