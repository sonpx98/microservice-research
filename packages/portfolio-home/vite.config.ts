import federation from '@originjs/vite-plugin-federation'
import path from "path"
import baseConfig from '../../vite.config.base'
import { mergeConfig } from 'vite';
import { generateCSP, DEV_REMOTE_HOSTS, PROD_REMOTE_HOSTS } from '../shared/csp-config';

const isDev = process.env.NODE_ENV !== 'production';

// Remote URLs cho development và production
const getRemoteUrl = (_app: string, port: number, prodDomain?: string) => {
  if (isDev) {
    return `http://localhost:${port}/assets/remoteEntry.js`;
  }
  // Sử dụng production domain nếu có, fallback to localhost cho standalone mode
  return prodDomain 
    ? `https://${prodDomain}/assets/remoteEntry.js`
    : `http://localhost:${port}/assets/remoteEntry.js`;
};

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
          'tarot': getRemoteUrl('tarot', 5003, process.env.VITE_TAROT_URL),
          'snake-game': getRemoteUrl('snake-game', 5006, process.env.VITE_SNAKE_GAME_URL),
          'video-editor': getRemoteUrl('video-editor', 5005, process.env.VITE_VIDEO_EDITOR_URL),
          'interface-generator': getRemoteUrl('interface-generator', 5007, process.env.VITE_INTERFACE_GENERATOR_URL),
        },
        shared: ['react', 'react-dom', 'react-router-dom']
    })],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
})