import { describe, expect, it } from "vitest";
import { isMasked } from "./mask";

const state = (over: Partial<{ enabled: Set<string>; revealed: Set<string> }>) =>
  ({ enabled: new Set<string>(), revealed: new Set<string>(), toggle() {}, reveal() {}, ...over }) as never;

describe("isMasked (per channel)", () => {
  it("not masked when the channel's privacy is off", () => {
    expect(isMasked(state({}), "c1", "m1")).toBe(false);
  });
  it("masked when the channel is on and the message isn't revealed", () => {
    expect(isMasked(state({ enabled: new Set(["c1"]) }), "c1", "m1")).toBe(true);
  });
  it("only affects the enabled channel, not others", () => {
    const s = state({ enabled: new Set(["c1"]) });
    expect(isMasked(s, "c1", "m1")).toBe(true);
    expect(isMasked(s, "c2", "m2")).toBe(false);
  });
  it("not masked when the message was individually revealed", () => {
    expect(isMasked(state({ enabled: new Set(["c1"]), revealed: new Set(["m1"]) }), "c1", "m1")).toBe(false);
  });
});
