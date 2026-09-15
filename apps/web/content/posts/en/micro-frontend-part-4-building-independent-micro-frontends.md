---
slug: micro-frontend-part-4-building-independent-micro-frontends
title: "Micro-Frontends Series: Part 4 - Building Independent Micro-Frontends"
date: 2025-11-17
excerpt: >-
  Step-by-step guide to creating your first micro-frontend remote application. Learn Vite configuration, component exposure, standalone development, and Module Federation setup with real examples.
tags:
  - micro-frontend
  - vite
  - react
  - module-federation
  - series
published: true
locale: en
---

In [Part 3](/en/blog/micro-frontend-part-3-monorepo-setup), we set up our monorepo with Lerna and PNPM. Now it's time to build our first **independent micro-frontend** that can run standalone OR be consumed by a host application!

## 🎯 What Makes a Good Micro-Frontend?

A well-designed micro-frontend should be:

### 1. **Truly Independent**
```bash
# Can run standalone
cd packages/cv-generator
pnpm dev
# Opens at http://localhost:5002 ✅

# Can be consumed by host
import CVGenerator from 'cv-generator/app' ✅
```

### 2. **Self-Contained**
```
cv-generator/
├── src/
│   ├── App.tsx           # Main component
│   ├── index.css         # Styles (important!)
│   ├── components/       # All UI components
│   └── utils/            # Business logic
├── package.json          # Dependencies
└── vite.config.ts        # Build config
```

### 3. **CSS Isolated**
```tsx
// Uses prefixed classes
<div className="cv:container cv:bg-gray-900">
  <h1 className="cv:text-2xl cv:dark:text-white">CV Generator</h1>
</div>
```

### 4. **Properly Exposed**
```typescript
// vite.config.ts
exposes: {
  './app': './src/App.tsx'  // Main entry point
}
```

## 🚀 Step-by-Step: Building CV Generator

Let's build our first remote micro-frontend from scratch!

### Step 1: Create Package Structure

```bash
cd packages
mkdir cv-generator
cd cv-generator

# Initialize package.json
pnpm init
```

### Step 2: Package Configuration

```json
{
  "name": "@microservice-research/cv-generator",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 5002",
    "build": "vite build",
    "preview": "vite preview --port 5002",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.453.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.1",
    "@vitejs/plugin-react": "^4.3.1",
    "@originjs/vite-plugin-federation": "^1.3.5",
    "typescript": "^5.6.3",
    "vite": "^6.0.1",
    "tailwindcss": "^4.1.11",
    "@tailwindcss/vite": "^4.0.0-beta.6"
  }
}
```

**Key dependencies:**
- `@originjs/vite-plugin-federation` - Module Federation for Vite
- `react`, `react-dom` - Will be shared with host
- `tailwindcss` - For styling

### Step 3: Vite Configuration with Module Federation

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'cv-generator',
      filename: 'remoteEntry.js',
      // What this remote exposes
      exposes: {
        './app': './src/App.tsx'
      },
      // What dependencies are shared
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.0.0'
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.0.0'
        },
        'react-router-dom': {
          singleton: false
        }
      }
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5002,
    strictPort: true,
    cors: true
  },
  preview: {
    port: 5002,
    strictPort: true
  }
});
```

**Configuration breakdown:**

**Federation Plugin:**
- `name`: Unique identifier for this remote
- `filename`: Entry file name (convention: `remoteEntry.js`)
- `exposes`: Components/modules to expose to host
- `shared`: Dependencies shared at runtime

**Build Settings:**
- `modulePreload: false`: Disable preloading (important for MF)
- `target: 'esnext'`: Modern JS features
- `cssCodeSplit: false`: Keep CSS together

**Server Settings:**
- `port: 5002`: Fixed port for development
- `strictPort: true`: Fail if port is busy
- `cors: true`: Allow cross-origin requests

### Step 4: TailwindCSS Configuration

```css
/* src/index.css */
@import "tailwindcss" prefix(cv);

@custom-variant dark (&:is(.dark *));

/* Your custom styles */
```

**Why prefix?** Prevents CSS conflicts when loaded in host!

### Step 5: Main App Component

```tsx
// src/App.tsx
import './index.css';  // CRITICAL: Import styles!
import { useState } from 'react';

export default function App() {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');

  return (
    <div className="cv:min-h-screen cv:bg-gray-900 cv:text-white cv:p-8">
      <div className="cv:max-w-4xl cv:mx-auto">
        <h1 className="cv:text-4xl cv:font-bold cv:mb-8">
          CV Generator
        </h1>

        <div className="cv:bg-gray-800 cv:p-6 cv:rounded-lg cv:space-y-4">
          <div>
            <label className="cv:block cv:mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="cv:w-full cv:px-4 cv:py-2 cv:rounded cv:bg-gray-700"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="cv:block cv:mb-2">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="cv:w-full cv:px-4 cv:py-2 cv:rounded cv:bg-gray-700"
              placeholder="Senior Developer"
            />
          </div>

          {/* Preview */}
          {name && (
            <div className="cv:mt-8 cv:p-6 cv:bg-white cv:text-gray-900 cv:rounded">
              <h2 className="cv:text-3xl cv:font-bold">{name}</h2>
              <p className="cv:text-xl cv:text-gray-600">{title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Important notes:**
1. ✅ **Import CSS** - Ensures styles are bundled
2. ✅ **Export default** - Required for Module Federation
3. ✅ **Use prefixed classes** - `cv:` prefix for isolation

### Step 6: Entry Point for Standalone Mode

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 7: HTML Template

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CV Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Step 8: TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 🎮 Running the Micro-Frontend

### Standalone Development

```bash
cd packages/cv-generator
pnpm dev

# Opens at http://localhost:5002
# Fully functional independent app! 🎉
```

### Building for Production

```bash
pnpm build

# Output:
dist/
├── assets/
│   ├── index-abc123.js
│   ├── index-abc123.css
│   └── remoteEntry.js    # ← Module Federation entry!
└── index.html
```

**The `remoteEntry.js` is the magic!**

```javascript
// Simplified remoteEntry.js
export const get = (module) => {
  return import('./assets/index-abc123.js')
    .then(m => m[module]);
};

export const init = (shared) => {
  // Initialize shared dependencies
};
```

## 🔗 Consuming in Host Application

Now let's consume this remote in the portfolio-home (host):

### Host Vite Configuration

```typescript
// portfolio-home/vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'portfolio-home',
      remotes: {
        'cv-generator': 'http://localhost:5002/assets/remoteEntry.js'
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ]
});
```

### TypeScript Declarations

```typescript
// portfolio-home/types/remote.d.ts
declare module 'cv-generator/app' {
  const component: React.ComponentType;
  export default component;
}
```

### Dynamic Import in Host

```tsx
// portfolio-home/src/App.tsx
import React from 'react';

const CVGenerator = React.lazy(() => import('cv-generator/app'));

function App() {
  return (
    <div>
      <h1>Portfolio Home</h1>
      
      <React.Suspense fallback={<div>Loading CV Generator...</div>}>
        <CVGenerator />
      </React.Suspense>
    </div>
  );
}
```

## 🎨 More Examples: Tarot App

Let's create another remote with different features:

```typescript
// packages/tarot/vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'tarot',
      filename: 'remoteEntry.js',
      exposes: {
        './app': './src/App.tsx'
      },
      shared: ['react', 'react-dom']
    })
  ],
  server: {
    port: 5003  // Different port!
  }
});
```

```tsx
// packages/tarot/src/App.tsx
import './index.css';
import { useState } from 'react';

const cards = ['The Fool', 'The Magician', 'The High Priestess'];

export default function App() {
  const [drawn, setDrawn] = useState<string | null>(null);

  const drawCard = () => {
    const card = cards[Math.floor(Math.random() * cards.length)];
    setDrawn(card);
  };

  return (
    <div className="tarot:min-h-screen tarot:bg-purple-900 tarot:text-white tarot:p-8">
      <h1 className="tarot:text-4xl tarot:font-bold tarot:mb-8">
        Tarot Reading
      </h1>
      
      <button
        onClick={drawCard}
        className="tarot:px-6 tarot:py-3 tarot:bg-purple-700 tarot:rounded tarot:hover:bg-purple-600"
      >
        Draw Card
      </button>

      {drawn && (
        <div className="tarot:mt-8 tarot:text-2xl">
          You drew: <strong>{drawn}</strong>
        </div>
      )}
    </div>
  );
}
```

**Note the different prefix:** `tarot:` instead of `cv:`

## 📋 Port Management Strategy

Organize ports logically:

```
Port 5001: interface-generator
Port 5002: cv-generator
Port 5003: tarot
Port 5004: portfolio-home (shell)
Port 5005: video-editor
Port 5006: blog-shell
Port 5007: keystatic-admin
```

**Benefits:**
- Easy to remember
- No conflicts
- Clear organization

## 🎯 Best Practices

### 1. **Always Import CSS in App.tsx**

```tsx
// ✅ Good
import './index.css';
export default function App() { ... }

// ❌ Bad - CSS won't be bundled with Module Federation
// CSS imported only in main.tsx
```

### 2. **Use Default Export**

```tsx
// ✅ Good
export default function App() { ... }

// ❌ Bad - Named exports don't work well with Module Federation
export function App() { ... }
```

### 3. **Fixed Ports in Development**

```typescript
// ✅ Good
server: {
  port: 5002,
  strictPort: true
}

// ❌ Bad - Random port breaks Module Federation
server: {
  port: 'auto'
}
```

### 4. **Minimal Exposed Surface**

```typescript
// ✅ Good - Only expose what's needed
exposes: {
  './app': './src/App.tsx'
}

// ❌ Bad - Exposing too much
exposes: {
  './app': './src/App.tsx',
  './components': './src/components/index.ts',
  './utils': './src/utils/index.ts',
  './hooks': './src/hooks/index.ts'
}
```

### 5. **Version Alignment**

Keep React versions identical:

```json
// All remotes
"react": "^19.0.0"
"react-dom": "^19.0.0"

// Host
"react": "^19.0.0"
"react-dom": "^19.0.0"
```

## 🐛 Common Issues & Solutions

### Issue 1: CSS Not Loading

**Problem:**
```tsx
// App.tsx doesn't import CSS
export default function App() {
  return <div className="cv:bg-gray-900">...</div>;
}
```

**Solution:**
```tsx
import './index.css';  // Add this!
export default function App() {
  return <div className="cv:bg-gray-900">...</div>;
}
```

### Issue 2: Shared Dependency Version Conflict

**Problem:**
```
Host: React 19.0.0
Remote: React 18.2.0
Error: Shared module version conflict
```

**Solution:**
```bash
# Align versions in all packages
pnpm add react@19 react-dom@19
```

### Issue 3: Remote Not Loading

**Problem:**
```
Failed to fetch dynamically imported module
```

**Solution:**
1. Check remote is running: `curl http://localhost:5002/assets/remoteEntry.js`
2. Check CORS enabled: `cors: true` in vite.config.ts
3. Check port matches: Host expects 5002, remote runs on 5002

### Issue 4: Hot Reload Not Working

**Problem:**
Changes in remote don't reflect in host during development

**Solution:**
This is expected! Module Federation loads at runtime.
- Refresh host page after changing remote
- Or run remote standalone for faster iteration

## 📊 Development Workflow

```
┌─────────────────────────────────────────┐
│  1. Develop Remote Standalone           │
│     cd packages/cv-generator            │
│     pnpm dev                            │
│     Test at http://localhost:5002       │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────▼───────────────────────┐
│  2. Build Remote                        │
│     pnpm build                          │
│     Generates remoteEntry.js            │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────▼───────────────────────┐
│  3. Test in Host                        │
│     cd ../portfolio-home                │
│     pnpm dev                            │
│     View remote embedded                │
└─────────────────────────────────────────┘
```

## 📝 Summary

Building independent micro-frontends requires:

- ✅ **Module Federation** configuration in Vite
- ✅ **Fixed ports** for predictable URLs
- ✅ **CSS prefixes** for style isolation
- ✅ **Proper exports** (default export)
- ✅ **Version alignment** for shared dependencies

**Key Files:**
1. `vite.config.ts` - Federation setup
2. `App.tsx` - Main component with CSS import
3. `index.css` - Prefixed TailwindCSS
4. `package.json` - Dependencies and scripts

## 🎓 Coming Up Next

In **Part 5: CSS Isolation with TailwindCSS v4**, we'll cover:
- The CSS collision problem in micro-frontends
- TailwindCSS v4 prefix configuration
- Building a Babel plugin for automatic prefixing
- Dark mode support across micro-frontends
- Before/after comparison

---

**Previous:** [Part 3 - Monorepo Setup with Lerna](/en/blog/micro-frontend-part-3-monorepo-setup)  
**Next:** [Part 5 - CSS Isolation with TailwindCSS v4](#) (Coming soon)

---

*This is Part 4 of the Micro-Frontends Series. Check out the [complete series outline](#) for all topics.*
