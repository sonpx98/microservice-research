---
slug: micro-frontend-part-2-module-federation
title: "Micro-Frontends Series: Part 2 - Module Federation Deep Dive"
date: 2025-11-17
excerpt: >-
  Learn how Module Federation enables runtime code sharing between applications. Understand remote entry points, shared dependencies, and dynamic imports with practical examples.
tags:
  - micro-frontend
  - module-federation
  - vite
  - webpack
  - series
published: true
locale: en
---

In [Part 1](/en/blog/micro-frontend-part-1-introduction), we learned what micro-frontends are and when to use them. Now let's dive deep into **Module Federation** - the technology that makes runtime code sharing possible!

## 🎯 What is Module Federation?

Module Federation is a JavaScript architecture that allows:
- **Multiple independent builds** to form a single application
- **Dynamic code loading** at runtime (not build time)
- **Dependency sharing** to avoid duplication
- **Bidirectional imports** between applications

Think of it as "webpack for distributed applications" or "microservices for frontend."

### Traditional vs Module Federation

**Traditional Build (Without Module Federation):**
```
Build Time:
App A: bundle.js (1.5MB) ← Contains React, all code
App B: bundle.js (1.8MB) ← Contains React, all code
App C: bundle.js (1.2MB) ← Contains React, all code

Total: ~4.5MB (lots of duplication!)
```

**With Module Federation:**
```
Runtime:
App A: Loads → React (shared, 200KB)
App B: Uses shared React ✓
App C: Uses shared React ✓

Total: React loaded once + unique code per app
```

## 🏗️ Core Concepts

### 1. **Host (Shell) Application**

The container that consumes remote modules:

```typescript
// vite.config.ts in portfolio-home (HOST)
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'portfolio-home',
      remotes: {
        'cv-generator': 'http://localhost:5002/assets/remoteEntry.js',
        'tarot': 'http://localhost:5003/assets/remoteEntry.js',
        'video-editor': 'http://localhost:5005/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ]
});
```

**What this does:**
- Declares remote applications and their URLs
- Shares React ecosystem to avoid duplication
- Creates a manifest of available remotes

### 2. **Remote Application**

An independent app that exposes modules:

```typescript
// vite.config.ts in cv-generator (REMOTE)
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'cv-generator',
      filename: 'remoteEntry.js',
      exposes: {
        './app': './src/App.tsx',
        './components': './src/components/index.ts'
      },
      shared: ['react', 'react-dom']
    })
  ]
});
```

**What this does:**
- Creates `remoteEntry.js` - the entry point
- Exposes specific modules (App, components)
- Declares what it can share

### 3. **Remote Entry File**

The magic file that makes everything work:

```javascript
// Generated remoteEntry.js (simplified)
const moduleMap = {
  './app': () => import('./App.tsx'),
  './components': () => import('./components/index.ts')
};

export function get(module) {
  return moduleMap[module]();
}

export function init(shared) {
  // Initialize shared dependencies
}
```

## 🔄 How Module Federation Works

### Step-by-Step Flow

```
1. Host App Starts
   ↓
2. Loads remoteEntry.js from each remote
   ┌─────────────────────────────────┐
   │ cv-generator/remoteEntry.js     │
   │ tarot/remoteEntry.js            │
   │ video-editor/remoteEntry.js     │
   └─────────────────────────────────┘
   ↓
3. Creates module map
   {
     'cv-generator/app': <loader>,
     'tarot/app': <loader>,
     'video-editor/app': <loader>
   }
   ↓
4. User navigates to a micro-frontend
   ↓
5. Dynamic import triggers
   import('cv-generator/app')
   ↓
6. Module Federation:
   - Checks if React is already loaded ✓
   - Loads only unique code for cv-generator
   - Returns the component
   ↓
7. Component renders in host shell
```

### Visual Diagram

```
┌────────────────────────────────────────────┐
│         Portfolio Home (Host)              │
│                                            │
│  User clicks "CV Generator"                │
│         ↓                                  │
│  React.lazy(() => import('cv/app'))       │
└────────────────┬───────────────────────────┘
                 │
                 ↓ Dynamic Import
┌────────────────▼───────────────────────────┐
│    Module Federation Runtime               │
│                                            │
│  1. Check shared deps                     │
│     React? ✓ (use existing)               │
│  2. Load cv-generator/app chunk           │
│  3. Execute and return component          │
└────────────────┬───────────────────────────┘
                 │
                 ↓
┌────────────────▼───────────────────────────┐
│      CV Generator Component                │
│                                            │
│  <CVGenerator />                           │
│  Renders inside host shell                │
└────────────────────────────────────────────┘
```

## 📦 Shared Dependencies

### Why Share Dependencies?

Without sharing:
```
Host loads React (200KB)
Remote 1 loads React (200KB) ← Duplicate!
Remote 2 loads React (200KB) ← Duplicate!
Remote 3 loads React (200KB) ← Duplicate!

Total: 800KB of React
```

With sharing:
```
Host loads React (200KB)
Remote 1 uses host's React ✓
Remote 2 uses host's React ✓
Remote 3 uses host's React ✓

Total: 200KB of React
```

### Shared Configuration

```typescript
// Basic sharing
shared: ['react', 'react-dom']

// Advanced sharing with version control
shared: {
  react: {
    singleton: true,        // Only one instance
    requiredVersion: '^19.0.0',
    eager: false           // Load on-demand
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '^19.0.0'
  },
  'react-router-dom': {
    singleton: false,      // Multiple versions OK
    requiredVersion: '^6.0.0'
  }
}
```

### Version Resolution

What happens with version mismatches?

```
Host: React 19.0.0
Remote: React 18.2.0

Module Federation Resolution:
1. Check if versions are compatible
2. If compatible → Use host version
3. If not → Load remote's version (fallback)
4. If singleton: true → Throw error
```

Example:
```typescript
// Host (portfolio-home)
shared: {
  react: {
    singleton: true,           // Enforce single version
    requiredVersion: '^19.0.0'
  }
}

// Remote (cv-generator)
shared: {
  react: {
    requiredVersion: '^19.0.0'  // Compatible!
  }
}
// ✅ Works - versions match
```

## 💻 Practical Implementation

### 1. Setting Up a Remote

```typescript
// packages/cv-generator/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'cv-generator',
      filename: 'remoteEntry.js',
      exposes: {
        './app': './src/App.tsx'
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
```

### 2. Exposing Components

```typescript
// packages/cv-generator/src/App.tsx
import './index.css'; // Important: Include styles!

export default function App() {
  return (
    <div className="cv:min-h-screen cv:bg-gray-900">
      <h1>CV Generator</h1>
      {/* Your app content */}
    </div>
  );
}
```

**Key points:**
- Always import CSS in exposed components
- Use CSS prefixes to avoid conflicts (more in Part 5)
- Export default for easier consumption

### 3. Consuming in Host

```typescript
// packages/portfolio-home/src/App.tsx
import React from 'react';

// Dynamic import with React.lazy
const CVGenerator = React.lazy(() => import('cv-generator/app'));
const Tarot = React.lazy(() => import('tarot/app'));
const VideoEditor = React.lazy(() => import('video-editor/app'));

function App() {
  return (
    <div className="app">
      <nav>{/* Navigation */}</nav>
      
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/cv" element={<CVGenerator />} />
          <Route path="/tarot" element={<Tarot />} />
          <Route path="/video" element={<VideoEditor />} />
        </Routes>
      </React.Suspense>
    </div>
  );
}
```

### 4. TypeScript Support

Declare remote module types:

```typescript
// packages/portfolio-home/types/remote.d.ts
declare module 'cv-generator/app' {
  const component: React.ComponentType;
  export default component;
}

declare module 'tarot/app' {
  const component: React.ComponentType;
  export default component;
}

declare module 'video-editor/app' {
  const component: React.ComponentType;
  export default component;
}
```

## 🚀 Development Workflow

### Running Remotes

Each remote runs on its own port:

```bash
# Terminal 1: CV Generator
cd packages/cv-generator
pnpm dev  # Port 5002

# Terminal 2: Tarot
cd packages/tarot
pnpm dev  # Port 5003

# Terminal 3: Video Editor
cd packages/video-editor
pnpm dev  # Port 5005

# Terminal 4: Portfolio Home (Shell)
cd packages/portfolio-home
pnpm dev  # Port 5004
```

### Testing Remotes

**Standalone mode:**
```bash
cd packages/cv-generator
pnpm dev
# Open http://localhost:5002
# Test as independent app
```

**Integrated mode:**
```bash
# Start all remotes + host
pnpm start:dev  # From root

# Open http://localhost:5004
# Test cv-generator inside host shell
```

## ⚡ Performance Considerations

### 1. **Code Splitting**

Module Federation automatically splits code:

```
cv-generator/
├── remoteEntry.js (5KB)    ← Loaded immediately
├── app.chunk.js (50KB)     ← Loaded on-demand
└── vendor.chunk.js (200KB) ← Shared, cached
```

### 2. **Lazy Loading**

Always use React.lazy() for remotes:

```typescript
// ✅ Good - Lazy loaded
const CVGenerator = React.lazy(() => import('cv-generator/app'));

// ❌ Bad - Eager loaded (blocks initial load)
import CVGenerator from 'cv-generator/app';
```

### 3. **Caching Strategy**

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      // Cache remoteEntry separately
      manualChunks: {
        'remote-entry': ['./remoteEntry.js']
      }
    }
  }
}
```

## 🔍 Debugging Module Federation

### Chrome DevTools

1. **Network Tab**: Check remoteEntry.js loads
2. **Sources**: See lazy-loaded chunks
3. **Console**: Module Federation logs

### Common Issues

**Issue 1: Shared dependency version mismatch**
```
Error: Shared module is not available for eager consumption
```
**Solution**: Check version compatibility in all configs

**Issue 2: Remote not loading**
```
Error: Loading script failed
```
**Solution**: 
- Check remote URL is correct
- Verify remote dev server is running
- Check CORS settings

**Issue 3: CSS conflicts**
```
Styles from remote overriding host styles
```
**Solution**: Use CSS prefixes (covered in Part 5!)

## 🎯 Best Practices

### 1. **Keep Exposes Minimal**

```typescript
// ✅ Good - Only expose what's needed
exposes: {
  './app': './src/App.tsx'
}

// ❌ Bad - Exposing too much
exposes: {
  './app': './src/App.tsx',
  './utils': './src/utils',
  './hooks': './src/hooks',
  './components': './src/components'
  // Too granular, hard to maintain
}
```

### 2. **Version Shared Dependencies**

```typescript
shared: {
  react: {
    singleton: true,
    requiredVersion: '^19.0.0',  // ✅ Explicit version
    eager: false
  }
}
```

### 3. **Error Boundaries**

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <React.Suspense fallback={<Loading />}>
    <CVGenerator />
  </React.Suspense>
</ErrorBoundary>
```

### 4. **Monitor Bundle Sizes**

```bash
pnpm build
# Check .vite/manifest.json
# Look for unexpected large chunks
```

## 📊 Real-World Performance

Our portfolio project results:

```
Without Module Federation:
- Total JS: ~2.5MB
- Duplicate React: 600KB
- Initial load: ~3s

With Module Federation:
- Initial load: ~500KB
- React loaded once: 200KB
- CV Generator lazy: +50KB
- Initial load: ~1s

Performance improvement: 66% faster! 🚀
```

## 📝 Summary

Module Federation enables:
- ✅ **Runtime code sharing** between independent apps
- ✅ **Dynamic imports** with React.lazy()
- ✅ **Shared dependencies** to reduce bundle size
- ✅ **Independent development** and deployment

Key concepts:
- **Host**: Consumes remotes
- **Remote**: Exposes modules via remoteEntry.js
- **Shared**: Dependencies shared at runtime
- **Lazy loading**: Load remotes on-demand

## 🎓 Coming Up Next

In **Part 3: Monorepo Setup with Lerna**, we'll cover:
- Why use a monorepo for micro-frontends?
- Setting up Lerna + PNPM workspaces
- Package linking and dependency management
- Development workflow scripts
- Building and deploying

## 💡 Try It Yourself

Create a simple Module Federation setup:

```bash
# Clone the starter
git clone https://github.com/yourusername/mf-starter

# Install
pnpm install

# Run
pnpm dev

# Open browser
http://localhost:5004
```

Experiment with:
1. Adding a new remote
2. Exposing different components
3. Sharing different dependencies
4. Testing version mismatches

---

**Previous:** [Part 1 - Introduction to Micro-Frontends](/en/blog/micro-frontend-part-1-introduction)  
**Next:** [Part 3 - Monorepo Setup with Lerna](#) (Coming soon)

---

*This is Part 2 of the Micro-Frontends Series. Check out the [complete series outline](#) for all topics.*
