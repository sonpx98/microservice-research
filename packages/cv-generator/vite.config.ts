import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5002,
    cors: true    
  },
  preview: {
    port: 5002,
  },
  plugins: [
    react(),    
    tailwindcss(),
    federation({
        name: 'cv-generator',
        filename: 'remoteEntry.js',
        exposes: {
          './app': './src/App.tsx',
        },
        shared: ['react', 'react-dom', 'react-router-dom', 'tailwindcss']
    })],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
})
