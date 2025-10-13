import federation from '@originjs/vite-plugin-federation'
import path from "path"
import baseConfig from '../../vite.config.base'
import { mergeConfig } from 'vite';

// https://vite.dev/config/
export default mergeConfig(baseConfig, {
  server: {
    port: 5004,
    cors: true
  },
  preview: {
    port: 5004,
  },
  plugins: [
    federation({
        name: 'portfolio-home',
        filename: 'remoteEntry.js',
        exposes: {
          './app': './src/App.tsx',
        },
        remotes: {
          'flash-card-fav': "http://localhost:5001/assets/remoteEntry.js",
          'tarot': "http://localhost:5003/assets/remoteEntry.js",
          'snake-game': "http://localhost:5006/assets/remoteEntry.js",
          'video-editor': "http://localhost:5005/assets/remoteEntry.js",
        },
        shared: ['react', 'react-dom', 'react-router-dom']
    })],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
})