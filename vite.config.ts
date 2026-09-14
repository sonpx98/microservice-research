import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy REST + WebSocket to the local node server so the client is same-origin.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8787",
      "/ws": { target: "ws://127.0.0.1:8787", ws: true },
    },
  },
});
