import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5000,
  },
  plugins: [
    react(),   
    tailwindcss(),
    federation({
        name: 'shell',
        remotes: {
          'flash-card-fav': "http://localhost:5001/assets/remoteEntry.js",
          'cv-generator': "http://localhost:5002/assets/remoteEntry.js",
        },
        shared: ['react', 'react-dom', 'react-router-dom', 'tailwindcss']
    })],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
})
