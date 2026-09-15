import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy REST + WebSocket to the local node server so the client is same-origin.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind 0.0.0.0 so a phone on the LAN can reach it
    allowedHosts: true, // dev-only: accept tunnel domains (cloudflared/ngrok)
    proxy: {
      "/api": "http://127.0.0.1:8787",
      "/uploads": "http://127.0.0.1:8787", // serve uploaded images through the API server
      "/ws": { target: "ws://127.0.0.1:8787", ws: true },
    },
  },
});
