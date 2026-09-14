import { expect, test } from "@playwright/test";
import { registerUser, uniq } from "./helpers";

// Two independent browser contexts = two real users on the same server.
test("two users exchange messages, see presence and typing in realtime", async ({ browser }) => {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();
  const nameA = uniq();
  const nameB = uniq();

  await registerUser(a, nameA);
  await registerUser(b, nameB); // both default to the first channel (#general)

  // presence: A sees B online
  await expect(a.getByText(nameB)).toBeVisible();

  // A sends → B receives without reload (WebSocket push)
  const msg = "hello-" + uniq();
  await a.getByPlaceholder(/message/i).fill(msg);
  await a.getByPlaceholder(/message/i).press("Enter");
  await expect(b.getByText(msg)).toBeVisible();

  // typing indicator: A types → B sees it
  await a.getByPlaceholder(/message/i).fill("still typing");
  await expect(b.getByText(new RegExp(`${nameA}.*typing`, "i"))).toBeVisible();

  await ctxA.close();
  await ctxB.close();
});
