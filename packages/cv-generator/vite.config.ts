import federation from '@originjs/vite-plugin-federation'
import path from "path"
import baseConfig from '../../vite.config.base'
import { mergeConfig } from 'vite';

// https://vite.dev/config/
export default mergeConfig(baseConfig, {
  server: {
    port: 5002,
    cors: true    
  },
  preview: {
    port: 5002,
  },
  plugins: [
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
