import { expect, type Page } from "@playwright/test";

export const uniq = () => "u" + Math.random().toString(36).slice(2, 8);

// register a brand-new user and wait until we're inside a channel
export async function registerUser(page: Page, name: string) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Need an account? Register" }).click();
  await page.getByPlaceholder(/username/i).fill(name);
  await page.getByPlaceholder(/password/i).fill("secret1");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByPlaceholder(/message/i)).toBeVisible();
  await expect(page).toHaveURL(/\/c\//);
}
