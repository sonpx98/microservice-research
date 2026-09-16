import { expect, test } from "@playwright/test";
import { registerUser, uniq } from "./helpers";

test("register lands in a channel and the session survives a reload", async ({ page }) => {
  await registerUser(page, uniq());
  await page.reload();
  await expect(page.getByPlaceholder(/message/i)).toBeVisible(); // still authed after reload
});

test("a protected route redirects to /login when logged out", async ({ page }) => {
  await page.goto("/c/whatever");
  await expect(page).toHaveURL(/\/login/);
});
