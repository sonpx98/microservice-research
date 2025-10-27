import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// Re-enable TailwindCSS với scoped config
export default defineConfig({
  plugins: [
    react(),
    // Re-enable TailwindCSS với custom config
    tailwindcss(),
    federation({
        name: 'tarot',
        filename: 'remoteEntry.js',
        exposes: {
          './app': './src/TarotApp.tsx',
          './assets': './src/utils/cardImages.ts',
        },
        shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  
  server: {
    port: 5003,
    cors: true,
    proxy: {
      '/api/groq': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/groq/, ''),
        headers: {
          'Origin': 'https://api.groq.com'
        }
      }
    },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://api.groq.com; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
    }
  },
  
  preview: {
    port: 5003,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://api.groq.com; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
    }
  },
  
  build: {
    rollupOptions: {
      external: [],
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js'
      }
    },
    copyPublicDir: true,
    assetsDir: 'assets'
  },
  
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: 'tarot_[name]__[local]___[hash:base64:5]'
    }
  },
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})