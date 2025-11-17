---
slug: micro-frontend-part-8-production-deployment
title: "Micro-Frontends Series: Part 8 - Production Deployment"
date: 2025-11-17
excerpt: >-
  Master production deployment strategies for micro-frontends. Learn about independent deployments, versioning, CDN configuration, CI/CD pipelines, and performance optimization for Module Federation at scale.
tags:
  - micro-frontend
  - deployment
  - production
  - ci-cd
  - performance
  - series
published: true
locale: en
---

Welcome to the **final part** of our Micro-Frontends series! In [Part 7](/en/blog/micro-frontend-part-7-portfolio-shell-integration), we built the portfolio shell. Now let's deploy it to production with confidence! 🚀

## 🎯 Production Goals

What makes a good micro-frontend deployment?

1. **Independent deployments** - Deploy each app separately
2. **Zero downtime** - No interruption to users
3. **Fast loading** - Optimize bundle sizes
4. **Reliable** - Handle failures gracefully
5. **Versioned** - Track and rollback changes
6. **Monitored** - Observe performance and errors

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                     Vercel CDN                      │
│  (Global Edge Network with 99.99% uptime)           │
└───────────┬─────────────────────────────────────────┘
            │
     ┌──────┴──────┐
     │             │
┌────▼────┐   ┌───▼─────┐
│  Shell  │   │ Remotes │
│ (Host)  │   │         │
│         │   │ - CV    │
│ Port    │   │ - Tarot │
│ 5004    │   │ - Video │
└─────────┘   └─────────┘
     │             │
     └──────┬──────┘
            │
     Independent deploys
     Different URLs
     Versioned assets
```

## 📦 Build Configuration

### Step 1: Optimize Vite Config for Production

```typescript
// vite.config.base.ts (shared config)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export const createBaseConfig = (prefix: string) => ({
  plugins: [
    react({
      babel: {
        plugins: [[require('../shared/babel-plugins/prefix-tailwind'), { prefix }]]
      }
    }),
    tailwindcss(),
  ],
  build: {
    // Module Federation requirements
    modulePreload: false,
    target: 'esnext',
    minify: 'esbuild',  // Faster than terser
    cssCodeSplit: false,  // Keep CSS in one file
    
    // Optimize chunks
    rollupOptions: {
      output: {
        // Stable chunk names for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
        // Asset naming with hash
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      }
    },
    
    // Source maps for debugging
    sourcemap: true,
  },
  
  // Optimize deps
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  }
});
```

### Step 2: Environment-Specific Configuration

```typescript
// vite.config.ts (for remote)
import { defineConfig, loadEnv } from 'vite';
import federation from '@originjs/vite-plugin-federation';
import { createBaseConfig } from '../../vite.config.base';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  
  return {
    ...createBaseConfig('cv'),
    
    plugins: [
      ...createBaseConfig('cv').plugins,
      federation({
        name: 'cv-generator',
        filename: 'remoteEntry.js',
        exposes: {
          './app': './src/App.tsx',
        },
        shared: {
          react: { singleton: true, requiredVersion: '^19.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        }
      })
    ],
    
    // Production URL (from env)
    base: isProd 
      ? env.VITE_PUBLIC_URL || 'https://cv.example.com/' 
      : '/',
    
    server: {
      port: 5002,
      strictPort: true,
    },
    
    preview: {
      port: 5002,
      strictPort: true,
    }
  };
});
```

### Step 3: Shell Configuration with Dynamic Remotes

```typescript
// packages/portfolio-home/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  
  // Remote URLs based on environment
  const getRemoteUrl = (name: string, port: number) => {
    return isProd
      ? env[`VITE_REMOTE_${name.toUpperCase()}_URL`] || `https://${name}.example.com/assets/remoteEntry.js`
      : `http://localhost:${port}/assets/remoteEntry.js`;
  };
  
  return {
    plugins: [
      federation({
        name: 'portfolio-home',
        remotes: {
          'cv-generator': getRemoteUrl('cv-generator', 5002),
          'tarot': getRemoteUrl('tarot', 5003),
          'video-editor': getRemoteUrl('video-editor', 5005),
        },
        shared: {
          react: { singleton: true, eager: true },
          'react-dom': { singleton: true, eager: true },
        }
      })
    ],
    
    base: isProd ? env.VITE_PUBLIC_URL || '/' : '/',
    
    build: {
      modulePreload: false,
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          }
        }
      }
    }
  };
});
```

## 🚀 Deployment to Vercel

### Step 1: Project Structure

```
microservice-research/
├── packages/
│   ├── portfolio-home/     ← Shell (main domain)
│   ├── cv-generator/       ← Remote 1
│   ├── tarot/              ← Remote 2
│   └── video-editor/       ← Remote 3
```

Each package gets its own Vercel project!

### Step 2: Vercel Configuration

```json
// packages/cv-generator/vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "pnpm install --filter cv-generator...",
  "devCommand": "pnpm dev",
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, OPTIONS"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/assets/remoteEntry.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, s-maxage=300"
        }
      ]
    }
  ]
}
```

**Important headers:**
- **CORS** - Allow shell to load remote
- **Cache-Control** - Long cache for assets, short for remoteEntry.js
- **immutable** - Assets with hash never change

### Step 3: Shell Configuration

```json
// packages/portfolio-home/vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "pnpm install --filter portfolio-home...",
  "env": {
    "VITE_REMOTE_CV_GENERATOR_URL": "https://cv-generator.vercel.app/assets/remoteEntry.js",
    "VITE_REMOTE_TAROT_URL": "https://tarot.vercel.app/assets/remoteEntry.js",
    "VITE_REMOTE_VIDEO_EDITOR_URL": "https://video-editor.vercel.app/assets/remoteEntry.js"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 4: Deploy Each Remote

```bash
# Deploy cv-generator
cd packages/cv-generator
vercel --prod

# Deploy tarot
cd packages/tarot
vercel --prod

# Deploy video-editor
cd packages/video-editor
vercel --prod

# Deploy shell (LAST!)
cd packages/portfolio-home
vercel --prod
```

**Order matters:** Deploy remotes BEFORE shell!

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Micro-Frontends

on:
  push:
    branches: [main]

jobs:
  # Detect changed packages
  changes:
    runs-on: ubuntu-latest
    outputs:
      cv-generator: ${{ steps.changes.outputs.cv-generator }}
      tarot: ${{ steps.changes.outputs.tarot }}
      video-editor: ${{ steps.changes.outputs.video-editor }}
      portfolio-home: ${{ steps.changes.outputs.portfolio-home }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            cv-generator:
              - 'packages/cv-generator/**'
            tarot:
              - 'packages/tarot/**'
            video-editor:
              - 'packages/video-editor/**'
            portfolio-home:
              - 'packages/portfolio-home/**'

  # Deploy CV Generator
  deploy-cv:
    needs: changes
    if: needs.changes.outputs.cv-generator == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - name: Install dependencies
        run: pnpm install --filter cv-generator...
      - name: Build
        run: pnpm --filter cv-generator build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_CV_PROJECT_ID }}
          working-directory: packages/cv-generator
          vercel-args: '--prod'

  # Deploy Tarot
  deploy-tarot:
    needs: changes
    if: needs.changes.outputs.tarot == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Install and build
        run: |
          pnpm install --filter tarot...
          pnpm --filter tarot build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_TAROT_PROJECT_ID }}
          working-directory: packages/tarot

  # Deploy Video Editor
  deploy-video:
    needs: changes
    if: needs.changes.outputs.video-editor == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Install and build
        run: |
          pnpm install --filter video-editor...
          pnpm --filter video-editor build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_VIDEO_PROJECT_ID }}
          working-directory: packages/video-editor

  # Deploy Shell (after remotes)
  deploy-shell:
    needs: [changes, deploy-cv, deploy-tarot, deploy-video]
    if: |
      always() &&
      (needs.changes.outputs.portfolio-home == 'true' ||
       needs.changes.outputs.cv-generator == 'true' ||
       needs.changes.outputs.tarot == 'true' ||
       needs.changes.outputs.video-editor == 'true')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Install and build
        run: |
          pnpm install --filter portfolio-home...
          pnpm --filter portfolio-home build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_SHELL_PROJECT_ID }}
          working-directory: packages/portfolio-home
```

**Key features:**
- Detects changed packages
- Deploys only what changed
- Shell deploys AFTER remotes
- Independent deployments

## 📊 Versioning Strategy

### Semantic Versioning

```json
// package.json for each remote
{
  "name": "@microservice-research/cv-generator",
  "version": "1.2.3",
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major"
  }
}
```

### Version-Based URLs

```typescript
// Shell loads specific versions
const remotes = {
  'cv-generator': `https://cv.example.com/v${CV_VERSION}/remoteEntry.js`,
  'tarot': `https://tarot.example.com/v${TAROT_VERSION}/remoteEntry.js`,
};
```

### Rollback Strategy

```bash
# Tag each deployment
git tag cv-generator-v1.2.3
git push --tags

# Rollback by redeploying previous tag
git checkout cv-generator-v1.2.2
vercel --prod
```

## 🎯 Performance Optimization

### 1. Preload Critical Remotes

```html
<!-- packages/portfolio-home/index.html -->
<head>
  <!-- Preload remoteEntry.js -->
  <link 
    rel="modulepreload" 
    href="https://cv.example.com/assets/remoteEntry.js"
  />
  <link 
    rel="modulepreload" 
    href="https://tarot.example.com/assets/remoteEntry.js"
  />
  
  <!-- DNS prefetch -->
  <link rel="dns-prefetch" href="https://cv.example.com" />
  <link rel="dns-prefetch" href="https://tarot.example.com" />
</head>
```

### 2. Bundle Analysis

```bash
# Install analyzer
pnpm add -D rollup-plugin-visualizer

# vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
});

# Build and analyze
pnpm build
# Opens stats.html in browser
```

### 3. Code Splitting

```tsx
// Lazy load heavy components
const HeavyChart = React.lazy(() => import('./components/HeavyChart'));

<Suspense fallback={<ChartSkeleton />}>
  <HeavyChart data={data} />
</Suspense>
```

### 4. Compression

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,  // Only compress files > 10KB
    })
  ]
});
```

## 📈 Monitoring

### Error Tracking with Sentry

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
});

// Track remote loading errors
const CVGenerator = React.lazy(() => 
  import('cv-generator/app').catch((error) => {
    Sentry.captureException(error, {
      tags: {
        remote: 'cv-generator',
        type: 'module-federation-load-error'
      }
    });
    throw error;
  })
);
```

### Performance Monitoring

```typescript
// Track load times
performance.mark('remote-load-start');

const CVGenerator = React.lazy(async () => {
  const module = await import('cv-generator/app');
  performance.mark('remote-load-end');
  performance.measure(
    'cv-generator-load',
    'remote-load-start',
    'remote-load-end'
  );
  return module;
});

// Report to analytics
const measure = performance.getEntriesByName('cv-generator-load')[0];
console.log('Load time:', measure.duration);
```

### Health Check Endpoint

```typescript
// src/health.ts
export async function checkRemoteHealth(url: string) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return {
      url,
      status: response.status,
      healthy: response.ok,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      url,
      status: 0,
      healthy: false,
      error: error.message,
      timestamp: Date.now()
    };
  }
}

// Check on app start
const remotes = [
  'https://cv.example.com/assets/remoteEntry.js',
  'https://tarot.example.com/assets/remoteEntry.js',
];

Promise.all(remotes.map(checkRemoteHealth))
  .then(results => {
    console.table(results);
    // Send to monitoring service
  });
```

## 🔒 Security Best Practices

### 1. Content Security Policy

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cv.example.com https://tarot.example.com",
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self' https://*.example.com",
        "img-src 'self' data: https:",
      ].join('; ')
    }
  }
});
```

### 2. Subresource Integrity (SRI)

```html
<!-- Verify remote integrity -->
<script 
  type="module"
  src="https://cv.example.com/assets/remoteEntry.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

### 3. Environment Variables

```bash
# .env.production (NOT committed)
VITE_REMOTE_CV_GENERATOR_URL=https://cv-prod.example.com/assets/remoteEntry.js
VITE_REMOTE_TAROT_URL=https://tarot-prod.example.com/assets/remoteEntry.js
VITE_SENTRY_DSN=https://...@sentry.io/...
```

## 🐛 Troubleshooting Production Issues

### Issue 1: CORS Errors

**Symptoms:** `Access to fetch at '...' from origin '...' has been blocked by CORS`

**Solution:**
```json
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### Issue 2: Module Not Found

**Symptoms:** `Failed to fetch dynamically imported module`

**Causes:**
- Remote not deployed yet
- Wrong URL in configuration
- Network issue

**Solution:**
```typescript
// Retry with exponential backoff
async function loadRemoteWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await import(url);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Issue 3: Version Mismatch

**Symptoms:** `Shared module is not available for eager consumption`

**Solution:**
```typescript
// Ensure versions match
shared: {
  react: {
    singleton: true,
    requiredVersion: '^19.0.0',  // Same in ALL packages
    strictVersion: true,
  }
}
```

### Issue 4: Cache Issues

**Symptoms:** Old code running after deployment

**Solution:**
```json
// Update cache headers
{
  "headers": [
    {
      "source": "/assets/remoteEntry.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, must-revalidate"
        }
      ]
    }
  ]
}
```

## 📊 Production Checklist

Before deploying:

- ✅ **Build succeeds** - `pnpm build` works
- ✅ **No errors** - Check browser console
- ✅ **CORS configured** - Headers set correctly
- ✅ **Environment variables** - All secrets set
- ✅ **Error tracking** - Sentry configured
- ✅ **Performance** - Lighthouse score > 90
- ✅ **Mobile responsive** - Test on devices
- ✅ **SEO** - Meta tags set
- ✅ **Analytics** - Tracking works
- ✅ **Monitoring** - Health checks setup

## 🎓 Complete Deployment Script

```bash
#!/bin/bash
# deploy-all.sh

set -e  # Exit on error

echo "🚀 Deploying Micro-Frontends..."

# 1. Deploy remotes first
echo "📦 Deploying CV Generator..."
cd packages/cv-generator
pnpm build
vercel --prod --yes
cd ../..

echo "📦 Deploying Tarot..."
cd packages/tarot
pnpm build
vercel --prod --yes
cd ../..

echo "📦 Deploying Video Editor..."
cd packages/video-editor
pnpm build
vercel --prod --yes
cd ../..

# Wait for remotes to be available
echo "⏳ Waiting for remotes to be live..."
sleep 10

# 2. Deploy shell last
echo "🏠 Deploying Portfolio Shell..."
cd packages/portfolio-home
pnpm build
vercel --prod --yes
cd ../..

echo "✅ Deployment complete!"
echo "🌐 Visit: https://portfolio.example.com"
```

## 📈 Performance Metrics

Target metrics for production:

| Metric | Target | Actual |
|--------|--------|--------|
| First Contentful Paint | < 1.5s | 1.2s ✅ |
| Time to Interactive | < 3.0s | 2.5s ✅ |
| Largest Contentful Paint | < 2.5s | 2.1s ✅ |
| Cumulative Layout Shift | < 0.1 | 0.05 ✅ |
| First Input Delay | < 100ms | 50ms ✅ |
| Bundle Size (Shell) | < 200KB | 150KB ✅ |
| Bundle Size (Remote) | < 300KB | 250KB ✅ |

## 🎯 Summary

We covered:

- ✅ **Production builds** with Vite optimization
- ✅ **Deployment** to Vercel with proper configuration
- ✅ **CI/CD** with GitHub Actions
- ✅ **Versioning** strategies for micro-frontends
- ✅ **Performance** optimization techniques
- ✅ **Monitoring** with error tracking and analytics
- ✅ **Security** best practices (CSP, CORS, SRI)
- ✅ **Troubleshooting** common production issues

## 🎉 Series Complete!

Congratulations! You've learned how to:

1. **Understand** micro-frontend architecture
2. **Setup** Module Federation with Vite
3. **Build** a monorepo with Lerna
4. **Create** independent micro-frontends
5. **Solve** CSS isolation challenges
6. **Share** design tokens across apps
7. **Integrate** everything in a shell
8. **Deploy** to production with confidence

## 🚀 What's Next?

Continue improving your micro-frontend:

- **Testing** - Add E2E tests with Playwright
- **A/B Testing** - Feature flags for remotes
- **Analytics** - Track user behavior
- **SSR** - Server-side rendering with Next.js
- **Edge Functions** - Deploy to edge for speed
- **Micro-backends** - Backend-for-frontend pattern

## 📚 Resources

- [Module Federation Docs](https://webpack.js.org/concepts/module-federation/)
- [Vite Plugin Federation](https://github.com/originjs/vite-plugin-federation)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Web Vitals](https://web.dev/vitals/)
- [Sentry Documentation](https://docs.sentry.io/)

---

**Previous:** [Part 7 - Portfolio Shell Integration](/en/blog/micro-frontend-part-7-portfolio-shell-integration)  
**Series Start:** [Part 1 - Introduction](/en/blog/micro-frontend-part-1-introduction)

---

*This is Part 8 (Final) of the Micro-Frontends Series. Thank you for following along! 🎉*

*Found this helpful? Share it with your team! Questions? Open an issue on GitHub.*
