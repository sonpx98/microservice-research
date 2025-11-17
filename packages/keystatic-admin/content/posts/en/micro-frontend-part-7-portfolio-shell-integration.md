---
slug: micro-frontend-part-7-portfolio-shell-integration
title: "Micro-Frontends Series: Part 7 - Portfolio Shell Integration"
date: 2025-11-17
excerpt: >-
  Build the host application that orchestrates all micro-frontends. Master React.lazy(), Suspense, error boundaries, routing, and create interactive previews with live demos.
tags:
  - micro-frontend
  - react
  - module-federation
  - shell-application
  - series
published: true
locale: en
---

In [Part 6](/en/blog/micro-frontend-part-6-shared-design-system), we built a shared design system. Now let's create the **portfolio shell** - the host application that brings all micro-frontends together into a cohesive experience!

## 🎯 What is a Shell Application?

The shell (or host) is the container application that:
- Loads remote micro-frontends
- Handles global routing
- Manages shared layout (header, footer)
- Provides error boundaries
- Orchestrates the user experience

```
┌─────────────────────────────────────────┐
│        Portfolio Shell (Host)           │
│   ┌──────────────────────────────────┐  │
│   │  Header / Navigation             │  │
│   └──────────────────────────────────┘  │
│                                         │
│   ┌──────────────────────────────────┐  │
│   │  Remote: CV Generator            │  │  ← Lazy loaded
│   │  (Port 5002)                     │  │
│   └──────────────────────────────────┘  │
│                                         │
│   ┌──────────────────────────────────┐  │
│   │  Remote: Tarot                   │  │  ← Lazy loaded
│   │  (Port 5003)                     │  │
│   └──────────────────────────────────┘  │
│                                         │
│   ┌──────────────────────────────────┐  │
│   │  Footer                          │  │
│   └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 🏗️ Shell Architecture

### Key Components

1. **Module Federation Configuration**
   - Declares all remotes
   - Shares dependencies
   
2. **Lazy Loading with React.lazy()**
   - Load remotes on-demand
   - Better performance
   
3. **Suspense Boundaries**
   - Show loading states
   - Handle async loading
   
4. **Error Boundaries**
   - Catch remote failures
   - Graceful fallbacks
   
5. **Routing**
   - Navigate between micro-frontends
   - Deep linking support

## 📦 Setting Up the Shell

### Step 1: Vite Configuration

```typescript
// packages/portfolio-home/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import tailwindcss from '@tailwindcss/vite';
import prefixTailwind from '../shared/babel-plugins/prefix-tailwind';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [[prefixTailwind, { prefix: 'pf' }]]
      }
    }),
    tailwindcss(),
    federation({
      name: 'portfolio-home',
      // Remote applications
      remotes: {
        'cv-generator': 'http://localhost:5002/assets/remoteEntry.js',
        'tarot': 'http://localhost:5003/assets/remoteEntry.js',
        'video-editor': 'http://localhost:5005/assets/remoteEntry.js',
        'interface-generator': 'http://localhost:5001/assets/remoteEntry.js'
      },
      // Shared dependencies
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.0.0',
          eager: true  // Load immediately in shell
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.0.0',
          eager: true
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.20.0'
        }
      }
    })
  ],
  server: {
    port: 5004,
    strictPort: true
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
```

**Key points:**
- `eager: true` - Shell loads React immediately
- `remotes` - URLs to all micro-frontends
- Port 5004 - Shell runs on different port

### Step 2: TypeScript Declarations

```typescript
// types/remote.d.ts
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

declare module 'interface-generator/app' {
  const component: React.ComponentType;
  export default component;
}
```

## 🎨 Implementing Lazy Loading

### React.lazy() with Suspense

```tsx
// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Lazy load remotes
const CVGenerator = React.lazy(() => import('cv-generator/app'));
const Tarot = React.lazy(() => import('tarot/app'));
const VideoEditor = React.lazy(() => import('video-editor/app'));
const InterfaceGenerator = React.lazy(() => import('interface-generator/app'));

// Loading component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      <span className="ml-4 text-lg">Loading...</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex space-x-4">
              <Link to="/" className="text-blue-600 hover:text-blue-800">
                Home
              </Link>
              <Link to="/cv" className="text-gray-600 hover:text-gray-900">
                CV Generator
              </Link>
              <Link to="/tarot" className="text-gray-600 hover:text-gray-900">
                Tarot
              </Link>
              <Link to="/video" className="text-gray-600 hover:text-gray-900">
                Video Editor
              </Link>
              <Link to="/interface" className="text-gray-600 hover:text-gray-900">
                Interface Gen
              </Link>
            </div>
          </div>
        </nav>

        {/* Routes with Suspense */}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cv" element={<CVGenerator />} />
            <Route path="/tarot" element={<Tarot />} />
            <Route path="/video" element={<VideoEditor />} />
            <Route path="/interface" element={<InterfaceGenerator />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">My Portfolio</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Explore my micro-frontend projects
      </p>
    </div>
  );
}
```

## 🛡️ Error Boundaries

Handle remote loading failures gracefully:

```tsx
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'Failed to load micro-frontend'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Using Error Boundaries

```tsx
// Wrap each remote
<ErrorBoundary fallback={<RemoteErrorFallback name="CV Generator" />}>
  <Suspense fallback={<LoadingFallback />}>
    <CVGenerator />
  </Suspense>
</ErrorBoundary>
```

## 🎭 Interactive Preview Mode

Create a homepage with embedded micro-frontend previews:

```tsx
// src/pages/HomePage.tsx
import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const CVGenerator = React.lazy(() => import('cv-generator/app'));
const Tarot = React.lazy(() => import('tarot/app'));

interface PreviewCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function PreviewCard({ title, description, children }: PreviewCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      </div>
      
      {/* Interactive preview */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="relative" style={{ height: '400px', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
      
      <div className="p-6 bg-gray-50 dark:bg-gray-900">
        <a
          href={`/${title.toLowerCase()}`}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          View Full App →
        </a>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-bold mb-4">My Micro-Frontend Portfolio</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
        Explore interactive demos of my projects
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* CV Generator Preview */}
        <PreviewCard
          title="CV Generator"
          description="Create professional CVs in minutes"
        >
          <ErrorBoundary>
            <Suspense fallback={<div>Loading CV Generator...</div>}>
              <div className="scale-75 origin-top-left" style={{ width: '133%', height: '133%' }}>
                <CVGenerator />
              </div>
            </Suspense>
          </ErrorBoundary>
        </PreviewCard>

        {/* Tarot Preview */}
        <PreviewCard
          title="Tarot"
          description="Digital tarot card reading"
        >
          <ErrorBoundary>
            <Suspense fallback={<div>Loading Tarot...</div>}>
              <div className="scale-75 origin-top-left" style={{ width: '133%', height: '133%' }}>
                <Tarot />
              </div>
            </Suspense>
          </ErrorBoundary>
        </PreviewCard>
      </div>
    </div>
  );
}
```

**Scaling trick:** Use CSS `scale-75` to fit full app in preview!

## 🌓 Global Dark Mode

Shell controls dark mode for all micro-frontends:

```tsx
// src/App.tsx
import { useState, useEffect } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  return (
    <div>
      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded"
      >
        {darkMode ? '🌞' : '🌙'}
      </button>

      {/* Rest of app */}
      {/* All micro-frontends respond to .dark class! */}
    </div>
  );
}
```

## 🚦 Loading States

Different loading states for better UX:

```tsx
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      
      {/* Text */}
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        Loading micro-frontend...
      </p>
      
      {/* Progress hint */}
      <p className="mt-2 text-sm text-gray-500">
        Fetching remote module
      </p>
    </div>
  );
}
```

## 🔗 Deep Linking

Support direct URLs to micro-frontends:

```tsx
// User visits: https://portfolio.com/cv
// → Shell loads CV Generator automatically

<Routes>
  <Route path="/cv/*" element={
    <Suspense fallback={<LoadingFallback />}>
      <CVGenerator />
    </Suspense>
  } />
</Routes>

// CV Generator handles internal routes
// /cv/preview
// /cv/export
```

## 📊 Analytics Integration

Track micro-frontend usage:

```tsx
// src/utils/analytics.ts
export function trackPageView(page: string, microFrontend?: string) {
  console.log('Page view:', { page, microFrontend });
  
  // Send to analytics service
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_path: page,
      micro_frontend: microFrontend
    });
  }
}

// Usage
<Route 
  path="/cv" 
  element={<CVGenerator />}
  loader={() => {
    trackPageView('/cv', 'cv-generator');
    return null;
  }}
/>
```

## 🎯 Best Practices

### 1. **Preload Critical Remotes**

```tsx
// Preload on hover
<Link
  to="/cv"
  onMouseEnter={() => {
    import('cv-generator/app');  // Start loading
  }}
>
  CV Generator
</Link>
```

### 2. **Retry Failed Loads**

```tsx
function retryImport<T>(
  importFn: () => Promise<T>,
  retries = 3
): Promise<T> {
  return importFn().catch((error) => {
    if (retries === 0) throw error;
    return retryImport(importFn, retries - 1);
  });
}

const CVGenerator = React.lazy(() => 
  retryImport(() => import('cv-generator/app'))
);
```

### 3. **Health Checks**

```tsx
// Check if remotes are available
async function checkRemoteHealth(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Before loading
const isAvailable = await checkRemoteHealth(
  'http://localhost:5002/assets/remoteEntry.js'
);
```

### 4. **Skeleton Screens**

```tsx
function CVSkeletonLoader() {
  return (
    <div className="animate-pulse p-8">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

<Suspense fallback={<CVSkeletonLoader />}>
  <CVGenerator />
</Suspense>
```

### 5. **Context Sharing**

```tsx
// Share theme context
import { ThemeProvider } from './context/ThemeContext';

<ThemeProvider value={{ darkMode, setDarkMode }}>
  <Suspense fallback={<Loading />}>
    <CVGenerator />
  </Suspense>
</ThemeProvider>
```

## 🐛 Common Issues

### Issue 1: CORS Errors

**Problem:** Can't load remote from localhost

**Solution:**
```typescript
// vite.config.ts
server: {
  port: 5004,
  cors: true  // Enable CORS
}
```

### Issue 2: Chunk Load Errors

**Problem:** `ChunkLoadError: Loading chunk failed`

**Solution:**
```tsx
// Retry logic + error boundary
<ErrorBoundary>
  <Suspense fallback={<Loading />}>
    <CVGenerator />
  </Suspense>
</ErrorBoundary>
```

### Issue 3: Shared State Issues

**Problem:** State not syncing between shell and remote

**Solution:** Use URL state or event bus (covered in Part 8)

## 📝 Complete Example

Full shell implementation:

```tsx
// src/App.tsx
import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load remotes
const CVGenerator = React.lazy(() => import('cv-generator/app'));
const Tarot = React.lazy(() => import('tarot/app'));
const VideoEditor = React.lazy(() => import('video-editor/app'));

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="bg-gray-100 dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <nav className="flex space-x-4">
              <Link to="/" className="text-blue-600 font-semibold">
                Home
              </Link>
              <Link to="/cv" className="hover:text-blue-600">
                CV Generator
              </Link>
              <Link to="/tarot" className="hover:text-blue-600">
                Tarot
              </Link>
              <Link to="/video" className="hover:text-blue-600">
                Video Editor
              </Link>
            </nav>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </header>

        {/* Main content */}
        <main>
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cv" element={<CVGenerator />} />
                <Route path="/tarot" element={<Tarot />} />
                <Route path="/video" element={<VideoEditor />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-bold mb-4">
        Micro-Frontend Portfolio
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Built with Module Federation & Vite
      </p>
      
      <div className="grid md:grid-cols-3 gap-6">
        <ProjectCard 
          title="CV Generator"
          description="Create professional resumes"
          link="/cv"
        />
        <ProjectCard 
          title="Tarot Reading"
          description="Digital tarot cards"
          link="/tarot"
        />
        <ProjectCard 
          title="Video Editor"
          description="Edit videos online"
          link="/video"
        />
      </div>
    </div>
  );
}

function ProjectCard({ title, description, link }: {
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="block p-6 bg-gray-100 dark:bg-gray-800 rounded-lg hover:shadow-lg transition"
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}

export default App;
```

## 📊 Summary

The shell application:

- ✅ **Orchestrates** all micro-frontends
- ✅ **Lazy loads** for better performance
- ✅ **Handles errors** gracefully
- ✅ **Manages routing** between remotes
- ✅ **Controls global state** (theme, auth)

**Key Patterns:**
- React.lazy() for code splitting
- Suspense for loading states
- Error boundaries for failures
- CSS prefixes for isolation
- Shared context when needed

## 🎓 Coming Up Next (Final Part!)

In **Part 8: Production Deployment**, we'll cover:
- Building for production
- CDN deployment strategies
- Environment configuration
- Versioning and cache busting
- CI/CD pipelines
- Performance optimization
- Monitoring and debugging

---

**Previous:** [Part 6 - Shared Design System](/en/blog/micro-frontend-part-6-shared-design-system)  
**Next:** [Part 8 - Production Deployment](#) (Coming soon)

---

*This is Part 7 of the Micro-Frontends Series. Check out the [complete series outline](#) for all topics.*
