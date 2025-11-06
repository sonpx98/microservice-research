import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "interface-generator",
      filename: "remoteEntry.js",
      exposes: {
        "./app": "./src/App.tsx",
      },
      shared: ["react", "react-dom", "react-router-dom", "tailwindcss", "@microservice-research/event-bus"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@microservice-research/design-tokens": path.resolve(
        __dirname,
        "../design-tokens/src"
      ),
    },
  },
  server: {
    port: 5007,
  },
  preview: {
    port: 5007,
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      external: [],
      output: {
        minifyInternalExports: false,
      },
    },
  },
});
