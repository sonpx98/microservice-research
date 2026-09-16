// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { MessageList } from "./MessageList";
import { server } from "../mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderList() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MessageList channelId="c1" />
    </QueryClientProvider>,
  );
}

describe("MessageList", () => {
  it("renders the newest page then loads older on demand", async () => {
    const user = userEvent.setup();
    renderList();
    expect(await screen.findByText("msg 39")).toBeInTheDocument(); // newest, first page
    expect(screen.queryByText("msg 0")).toBeNull();               // oldest not loaded yet
    await user.click(screen.getByRole("button", { name: /load older/i }));
    expect(await screen.findByText("msg 0")).toBeInTheDocument();  // older page fetched + prepended
  });
});
