// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// mock the socket so we can assert what the store sends without a live connection
const sendSocket = vi.fn();
vi.mock("../socket", () => ({
  sendSocket: (...a: unknown[]) => sendSocket(...a),
  onMessage: () => () => {},
  onStatus: () => () => {},
  onOpen: () => () => {},
  getStatus: () => "open",
  connectSocket: () => {},
  disconnectSocket: () => {},
}));

import { Composer } from "./Composer";
import { useChat } from "../store";

beforeEach(() => {
  useChat.getState().setChannel("c1"); // send() needs a current channel
  sendSocket.mockClear();
});

describe("Composer", () => {
  it("sends on Enter and clears the box", async () => {
    const user = userEvent.setup();
    render(<Composer />);
    const box = screen.getByPlaceholderText(/message/i);
    await user.type(box, "hello");
    await user.keyboard("{Enter}");
    expect(sendSocket).toHaveBeenCalledWith(
      expect.objectContaining({ type: "msg", text: "hello", channelId: "c1" }),
    );
    expect(box).toHaveValue("");
  });

  it("does not send on Enter while an IME composition is active (no duplicate)", async () => {
    const user = userEvent.setup();
    render(<Composer />);
    const box = screen.getByPlaceholderText(/message/i);
    await user.type(box, "xin chao");
    fireEvent.keyDown(box, { key: "Enter", isComposing: true }); // IME commit Enter
    const msgSends = sendSocket.mock.calls.filter((c) => (c[0] as { type?: string })?.type === "msg");
    expect(msgSends).toHaveLength(0);
  });

  it("Shift+Enter inserts a newline and does not send", async () => {
    const user = userEvent.setup();
    render(<Composer />);
    const box = screen.getByPlaceholderText(/message/i) as HTMLTextAreaElement;
    await user.type(box, "line1");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(box, "line2");
    const msgSends = sendSocket.mock.calls.filter((c) => (c[0] as { type?: string })?.type === "msg");
    expect(msgSends).toHaveLength(0);
    expect(box.value).toContain("\n");
  });
});
