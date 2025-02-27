import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import federation from "@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    federation({
    name: "react_app_vite",
    filename: "remoteEntry.js",
    exposes: {
      './App': './src/App',
      './Button': './src/components/RemoteButton'
    },

    shared: { 
      react: { singleton: true }, 'react-dom': { singleton: true },
      'kill-port': {singleton: true}
    },
    }),
    ],
    build: {
        modulePreload: false,
        target: 'esnext',
        minify: false,
        cssCodeSplit: false
    },
})
