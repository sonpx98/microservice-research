// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ChannelList } from "./ChannelList";
import { server } from "../mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ChannelList", () => {
  it("renders channels from the API and marks the active route", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/c/c1"]}>
          <ChannelList />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(await screen.findByText(/# general/)).toBeInTheDocument();
    expect(await screen.findByText(/# random/)).toBeInTheDocument();
    expect(screen.getByText(/# general/).closest("a")).toHaveClass("active");
    expect(screen.getByText(/# random/).closest("a")).not.toHaveClass("active");
  });
});
