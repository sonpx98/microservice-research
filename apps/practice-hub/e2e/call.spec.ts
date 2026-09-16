import { expect, test, type Page } from "@playwright/test";
import { registerUser, uniq } from "./helpers";

// macOS Chromium's synthetic AUDIO device hangs getUserMedia (a platform bug); the synthetic VIDEO
// device works. This test proves the WebRTC handshake (offer/answer/ICE/ontrack) via a real video
// track flowing peer-to-peer, so we drop audio in the test environment only — the app itself is
// unchanged and still requests audio+video in real browsers.
async function dropAudio(page: Page) {
  await page.addInitScript(() => {
    const orig = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = (c: MediaStreamConstraints = {}) => orig({ ...c, audio: false });
  });
}

test("A calls B, both connect with a live remote stream, then hang up", async ({ browser }) => {
  const ctxA = await browser.newContext({ permissions: ["camera", "microphone"] });
  const ctxB = await browser.newContext({ permissions: ["camera", "microphone"] });
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();
  await dropAudio(a);
  await dropAudio(b);
  const nameA = uniq();
  const nameB = uniq();

  await registerUser(a, nameA);
  await registerUser(b, nameB);
  await expect(a.getByText(nameB)).toBeVisible(); // B is online for A to call

  // A clicks the call button on B's presence row (button title="Call <name>")
  await a.locator(`button[title="Call ${nameB}"]`).click();

  // B gets the incoming prompt and accepts
  await expect(b.getByText(/incoming call/i)).toBeVisible();
  await b.getByRole("button", { name: /accept/i }).click();

  // both reach in-call: the remote <video> receives a MediaStream (handshake succeeded)
  await expect(a.locator("video.video-remote")).toBeVisible({ timeout: 15_000 });
  await expect(b.locator("video.video-remote")).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() => a.locator("video.video-remote").evaluate((v: HTMLVideoElement) => Boolean(v.srcObject)), { timeout: 15_000 })
    .toBe(true);
  await expect
    .poll(() => b.locator("video.video-remote").evaluate((v: HTMLVideoElement) => Boolean(v.srcObject)), { timeout: 15_000 })
    .toBe(true);

  // A hangs up → the call UI closes on A's side
  await a.getByRole("button", { name: /hang up/i }).click();
  await expect(a.locator("video.video-remote")).toHaveCount(0);

  await ctxA.close();
  await ctxB.close();
});
