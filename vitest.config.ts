import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node", // default; component tests opt into jsdom via a `@vitest-environment jsdom` docblock
    setupFiles: ["src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "server/**/*.test.mjs"],
  },
});
