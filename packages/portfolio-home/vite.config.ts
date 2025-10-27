import federation from '@originjs/vite-plugin-federation'
import path from "path"
import baseConfig from '../../vite.config.base'
import { mergeConfig } from 'vite';
import { generateCSP, DEV_REMOTE_HOSTS, PROD_REMOTE_HOSTS } from '../shared/csp-config';

const isDev = process.env.NODE_ENV !== 'production';

const cspDirectives = generateCSP({
  remoteHosts: isDev ? DEV_REMOTE_HOSTS : PROD_REMOTE_HOSTS,
  scriptEndpoints: ['https://cdn.jsdelivr.net'],
  styleEndpoints: ['https://cdn.jsdelivr.net'],
  apiEndpoints: ['https://api.groq.com','https://cdn.jsdelivr.net'],
  isDev,
});
console.log('isDev',isDev, ['https://cdn.jsdelivr.net/npm/monaco-editor'])
// https://vite.dev/config/
export default mergeConfig(baseConfig, {
  server: {
    port: 5004,
    cors: true,
    headers: {
      'Content-Security-Policy': cspDirectives,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    }
  },
  preview: {
    port: 5004,
    headers: {
      'Content-Security-Policy': cspDirectives,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    }
  },
  plugins: [
    federation({
        name: 'portfolio-home',
        filename: 'remoteEntry.js',
        exposes: {
          './app': './src/App.tsx',
        },
        remotes: {
          'tarot': "http://localhost:5003/assets/remoteEntry.js",
          'snake-game': "http://localhost:5006/assets/remoteEntry.js",
          'video-editor': "http://localhost:5005/assets/remoteEntry.js",
          'interface-generator': "http://localhost:5007/assets/remoteEntry.js",
        },
        shared: ['react', 'react-dom', 'react-router-dom']
    })],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
})