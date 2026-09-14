import { defineConfig, devices } from "@playwright/test";

// Dedicated E2E port (5273) so we never collide with another project's dev server on 5173.
const PORT = 5273;
const URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // tests share one server + DB; keep them serial
  workers: 1,
  timeout: 30_000,
  use: { baseURL: URL, trace: "on-first-retry" },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chromium", // full Chromium (headless-shell lacks the media stack for getUserMedia)
        // fake camera/mic so getUserMedia works headless with no prompt or hardware
        launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] },
      },
    },
  ],
  webServer: {
    // start our own server + a vite on the dedicated port; :memory: DB = clean state each run
    command: `concurrently -k -n server,client "node server/index.mjs" "vite --port ${PORT} --strictPort"`,
    url: URL,
    reuseExistingServer: false,
    env: { HUB_DB: ":memory:" },
    timeout: 60_000,
  },
});
