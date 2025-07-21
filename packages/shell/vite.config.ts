import federation from '@originjs/vite-plugin-federation'
import path from "path"
import baseConfig from '../../vite.config.base'
import { mergeConfig } from 'vite';

// https://vite.dev/config/
export default mergeConfig(baseConfig, {
  server: {
    port: 5000,
  },
  plugins: [
    federation({
        name: 'shell',
        remotes: {
          'flash-card-fav': "http://localhost:5001/assets/remoteEntry.js",
          'cv-generator': "http://localhost:5002/assets/remoteEntry.js",
          'tarot': "http://localhost:5003/assets/remoteEntry.js",
        },
        shared: ['react', 'react-dom', 'react-router-dom', 'tailwindcss']
    })],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
})
