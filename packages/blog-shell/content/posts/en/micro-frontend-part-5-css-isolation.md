---
slug: micro-frontend-part-5-css-isolation
title: "Micro-Frontends Series: Part 5 - CSS Isolation with TailwindCSS v4"
date: 2025-11-17
excerpt: >-
  Master CSS isolation in micro-frontends! Learn how to prevent style conflicts using TailwindCSS v4 prefixes and build a custom Babel plugin for automatic class transformation.
tags:
  - micro-frontend
  - tailwindcss
  - css
  - babel
  - series
published: true
locale: en
---

In [Part 4](/en/blog/micro-frontend-part-4-building-independent-micro-frontends), we built independent micro-frontends. But there's a critical problem: **CSS conflicts!** When multiple micro-frontends load together, their styles can collide. Let's solve this!

## 🚨 The CSS Collision Problem

### Without CSS Isolation

```tsx
// cv-generator/App.tsx
<div className="container bg-gray-900">
  <h1 className="text-2xl">CV Generator</h1>
</div>

// tarot/App.tsx
<div className="container bg-purple-900">
  <h1 className="text-2xl">Tarot Reading</h1>
</div>
```

**When both load in the shell:**

```css
/* From cv-generator */
.container { max-width: 1200px; }
.bg-gray-900 { background: #111827; }

/* From tarot - OVERWRITES cv-generator! */
.container { max-width: 900px; }  /* ❌ Conflict! */
.bg-purple-900 { background: #581c87; }
```

**Result:** 
- CV Generator's container gets tarot's width
- Last loaded CSS wins
- Unpredictable styling 😱

### Visual Comparison

**Before (No Isolation):**
```
┌─────────────────────────────────┐
│ Portfolio Shell                 │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ CV Generator                │ │
│ │ Container: 900px ❌         │ │ ← Wrong!
│ │ (Should be 1200px)          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Tarot                       │ │
│ │ Container: 900px ✅         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**After (With Prefixes):**
```
┌─────────────────────────────────┐
│ Portfolio Shell                 │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ CV Generator                │ │
│ │ cv:container: 1200px ✅     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Tarot                       │ │
│ │ tarot:container: 900px ✅   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## 🎯 Solution: CSS Prefixes

### TailwindCSS v4 Prefix Feature

TailwindCSS v4 supports prefixes to namespace all utility classes:

```css
/* src/index.css */
@import "tailwindcss" prefix(cv);
```

This transforms:
```css
/* Input */
.bg-gray-900 { ... }

/* Output */
.cv\:bg-gray-900 { ... }
```

Now use it:
```tsx
<div className="cv:bg-gray-900 cv:text-white">
  Hello
</div>
```

**Benefits:**
- ✅ Unique class names per micro-frontend
- ✅ No conflicts
- ✅ Clear ownership (cv:, tarot:, ve:)

## 🎨 The Correct Approach: Manual Prefixes

### Why Automation Doesn't Work

**Important:** TailwindCSS scans your source code BEFORE build time to detect which classes are used. This means:

```tsx
// ❌ This DOESN'T work - Tailwind can't detect dynamic classes
const prefix = 'cv';
<div className={`${prefix}:flex ${prefix}:bg-gray-900`} />

// ❌ This DOESN'T work - Babel runs AFTER Tailwind scans
// Babel plugin adds prefixes → Too late!
<div className="flex" /> // Tailwind already scanned without prefix

// ✅ This WORKS - Tailwind sees prefixed classes in source
<div className="cv:flex cv:bg-gray-900" />
```

**Why utilities/helpers fail:**
```tsx
// ❌ Won't work - Tailwind can't analyze function output
function cn(...classes) {
  return classes.map(c => `cv:${c}`).join(' ');
}
<div className={cn('flex', 'bg-gray-900')} />

// ❌ Won't work - Dynamic concatenation invisible to Tailwind
const getClass = (name) => `cv:${name}`;
<div className={getClass('flex')} />
```

### The Reality: Write Prefixes Directly

You must write prefixed classes in your source code:

```tsx
// src/App.tsx
import './index.css';

export default function App() {
  return (
    <div className="cv:min-h-screen cv:bg-gray-900 cv:text-white">
      <div className="cv:container cv:mx-auto cv:p-8">
        <h1 className="cv:text-4xl cv:font-bold cv:mb-8">
          CV Generator
        </h1>
        
        <button className="cv:px-6 cv:py-3 cv:bg-blue-600 cv:rounded cv:hover:bg-blue-700 cv:transition">
          Generate CV
        </button>
      </div>
    </div>
  );
}
```

## 🛠️ Complete Setup Guide

### Step 1: Configure TailwindCSS with Prefix

```css
/* packages/cv-generator/src/index.css */
@import "tailwindcss" prefix(cv);

/* Dark mode support */
@custom-variant dark (&:is(.dark *));

/* Optional: Custom theme */
@theme {
  --color-primary: #3b82f6;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

### Step 2: Import CSS in App

```tsx
// src/App.tsx
import './index.css'; // ← Critical for Module Federation!

export default function App() {
  // Your components
}
```

**Why this import matters:**
- Module Federation bundles CSS with the component
- Without it, styles won't load when consumed by shell
- CSS is scoped by prefix automatically

### Step 3: Write All Classes with Prefix

```tsx
<div className="cv:min-h-screen cv:bg-gray-900 cv:text-white">
  <div className="cv:container cv:mx-auto cv:p-8">
    <h1 className="cv:text-4xl cv:font-bold cv:mb-8">
      CV Generator
    </h1>
    
    <button className="cv:px-6 cv:py-3 cv:bg-blue-600 cv:rounded cv:hover:bg-blue-700">
      Generate CV
    </button>
  </div>
</div>
```

## 🎨 Different Prefixes Per Micro-Frontend

Each micro-frontend gets its own prefix:

```
cv-generator      → cv:
tarot             → tarot:
video-editor      → ve:
interface-gen     → interfacegen:
portfolio-home    → pf:
```

**Example: Tarot App**

```css
/* packages/tarot/src/index.css */
@import "tailwindcss" prefix(tarot);

@custom-variant dark (&:is(.dark *));
```

```tsx
// packages/tarot/src/App.tsx
import './index.css';

export default function App() {
  return (
    <div className="tarot:min-h-screen tarot:bg-purple-900 tarot:text-white">
      <h1 className="tarot:text-4xl tarot:font-bold">
        Tarot Reading
      </h1>
    </div>
  );
}
```

**Each prefix creates isolated styles - no conflicts!**

## 🌓 Dark Mode Support

Dark mode with prefixes requires special setup:

### CSS Configuration

```css
/* src/index.css */
@import "tailwindcss" prefix(cv);

@custom-variant dark (&:is(.dark *));
```

**Important:** The dark variant selector works with prefixed classes!

### Dark Mode Classes

**Correct format: `prefix:dark:utility`**

```tsx
// ✅ CORRECT
<div className="bg-white dark:bg-gray-900">
// Becomes: cv:bg-white cv:dark:bg-gray-900

// ❌ WRONG - Don't put dark before prefix
<div className="dark:cv:bg-gray-900">
```

### How Shell Controls Dark Mode

```tsx
// portfolio-home/src/App.tsx (Shell)
import { useState, useEffect } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div>
      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Dark Mode
      </button>
      
      {/* All micro-frontends respond to .dark class */}
      <CVGenerator />
      <Tarot />
    </div>
  );
}
```

```tsx
export default function App() {
  return (
    <div className="cv:bg-white cv:dark:bg-gray-900">
      <h1 className="cv:text-gray-900 cv:dark:text-white">
        CV Generator
      </h1>
      
      <button className="cv:bg-blue-600 cv:hover:bg-blue-700 cv:dark:bg-blue-500 cv:dark:hover:bg-blue-600">
        Generate CV
      </button>
      
      <div className="cv:border-gray-200 cv:dark:border-gray-700">
        Content
      </div>
    </div>
  );
}
```

**All prefixes written explicitly in source code!**

## 🧪 Testing CSS Isolation

### Test Case 1: Class Name Uniqueness

```bash
# Build all remotes
pnpm build:remotes

# Check generated CSS
cat packages/cv-generator/dist/assets/*.css | grep "\.cv:"
cat packages/tarot/dist/assets/*.css | grep "\.tarot:"

# Should see:
# .cv\:bg-gray-900 { ... }
# .tarot\:bg-purple-900 { ... }
```

### Test Case 2: No Conflicts in Shell

```tsx
// portfolio-home/src/App.tsx
import CV from 'cv-generator/app';
import Tarot from 'tarot/app';

// Both render without conflicts
<div>
  <CV />    {/* Uses cv:* classes */}
  <Tarot /> {/* Uses tarot:* classes */}
</div>
```

**Inspect DevTools:**
```html
<div class="cv:container cv:bg-gray-900">...</div>
<div class="tarot:container tarot:bg-purple-900">...</div>
```

Different classes = No conflicts! ✅

## 📊 Performance Impact

### Bundle Size Comparison

```
Without Prefixes:
- cv-generator.css: 45KB
- tarot.css: 42KB
- Shared utilities: ~30KB overlap
Total: ~87KB

With Prefixes:
- cv-generator.css: 47KB (+2KB for prefixes)
- tarot.css: 44KB (+2KB for prefixes)
- No shared utilities (isolated)
Total: ~91KB

Extra cost: +4KB (~4.6%) for complete isolation
```

**Trade-off:** Small size increase for guaranteed isolation!

### Runtime Performance

No performance impact:
- Same number of CSS rules
- Browser caching works the same
- No runtime JavaScript overhead
- Prefixes are static strings in source code

## 💡 Developer Experience Tips

### 1. **Use Editor Snippets**

Create VSCode snippets to speed up writing:

```json
// .vscode/cv-generator.code-snippets
{
  "CV Prefix Flex": {
    "prefix": "cvflex",
    "body": "cv:flex cv:items-center cv:gap-${1:4}",
    "description": "Flexbox with CV prefix"
  },
  "CV Prefix Button": {
    "prefix": "cvbtn",
    "body": "cv:px-${1:4} cv:py-${2:2} cv:bg-blue-600 cv:text-white cv:rounded cv:hover:bg-blue-700",
    "description": "Button classes with CV prefix"
  }
}
```

### 2. **Search & Replace Helper**

When converting existing code:

```bash
# Find unprefixed classes (regex)
className="([^"]*)"

# Replace with prefixed (manual review needed)
# Add cv: before each class
```

### 3. **Linter Rule (Optional)**

Create ESLint rule to enforce prefixes:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'custom/require-prefix': ['error', { prefix: 'cv' }]
  }
}
```

## 🎯 Best Practices

### 1. **Consistent Prefix Naming**

```bash
# ✅ Good - Short, descriptive
cv-generator → cv:
video-editor → ve:
tarot → tarot:

# ❌ Bad - Too long
cv-generator → cvgenerator:
video-editor → videoeditor:
```

### 2. **Document Prefixes**

```markdown
# README.md or .github/copilot-instructions.md

## CSS Prefix Convention

Each micro-frontend uses a unique TailwindCSS prefix:
- cv-generator: `cv:`
- tarot: `tarot:`
- video-editor: `ve:`
- interface-generator: `interfacegen:`
- portfolio-home: `pf:`

Always write prefixes directly in className strings.
```

### 3. **Test Isolation**

```tsx
// Create a test component in shell
import CVApp from 'cv-generator/app';
import TarotApp from 'tarot/app';

function TestIsolation() {
  return (
    <>
      <CVApp />
      <TarotApp />
    </>
  );
}

// Verify no visual conflicts!
// Each app maintains its own styling
```

### 4. **Avoid Global Styles**

```css
/* ❌ Bad - Global styles affect other micro-frontends */
body {
  font-family: 'Inter';
}

/* ✅ Good - Use root container with prefix */
.ve\:root {
  font-family: 'Inter';
}
```

```tsx
// Wrap your app with root container
<div className="ve:root">
  <App />
</div>
```

## 🐛 Common Issues

### Issue 1: Forgot to Write Prefixes

**Problem:** Classes not working, no styles applied

**Cause:** Forgot to write prefix in className

**Solution:**
```tsx
// ❌ Wrong - No prefix
<div className="flex bg-gray-900" />

// ✅ Correct - With prefix
<div className="cv:flex cv:bg-gray-900" />
```

### Issue 2: Dark Mode Not Working

**Problem:** Dark mode classes not responding

**Solution:**
```css
/* Must include dark variant in index.css */
@custom-variant dark (&:is(.dark *));
```

```tsx
// Use correct format: prefix:dark:utility
<div className="cv:bg-white cv:dark:bg-gray-900" />  // ✅
// NOT: <div className="dark:cv:bg-gray-900" />  // ❌
```

### Issue 3: CSS Not Loading in Shell

**Problem:** Styles missing when loaded as remote

**Solution:**
```tsx
// MUST import CSS in App.tsx
import './index.css';  // ← Critical for Module Federation!

export default function App() {
  // ...
}
```

### Issue 4: Prefix Typo

**Problem:** Inconsistent prefix usage

**Solution:** Use consistent naming:
```typescript
// Define prefix constant
const PREFIX = 'cv' as const;

// Document in project
// README.md: "This project uses prefix: cv:"
```

## 📝 Complete Example: Video Editor

```typescript
// packages/video-editor/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5005
  }
});
```

```css
/* packages/video-editor/src/index.css */
@import "tailwindcss" prefix(ve);

@custom-variant dark (&:is(.dark *));
```

```tsx
// packages/video-editor/src/App.tsx
import './index.css';

export default function App() {
  return (
    <div className="ve:min-h-screen ve:bg-gradient-to-br ve:from-purple-900 ve:to-blue-900 ve:text-white">
      <div className="ve:container ve:mx-auto ve:p-8">
        <h1 className="ve:text-4xl ve:font-bold ve:mb-8">
          Video Editor
        </h1>
        
        <div className="ve:bg-black/50 ve:p-6 ve:rounded-lg">
          <video className="ve:w-full ve:rounded" controls>
            <source src="/sample.mp4" type="video/mp4" />
          </video>
        </div>
        
        <button className="ve:mt-4 ve:px-6 ve:py-3 ve:bg-purple-600 ve:rounded ve:hover:bg-purple-700 ve:dark:bg-purple-500">
          Export Video
        </button>
      </div>
    </div>
  );
}
```

**All prefixes (`ve:`) are written directly in the source code!**
```tsx
<div className="ve:min-h-screen ve:bg-gradient-to-br ve:from-purple-900 ve:to-blue-900 ve:text-white">
  <div className="ve:container ve:mx-auto ve:p-8">
    <h1 className="ve:text-4xl ve:font-bold ve:mb-8">
      Video Editor
    </h1>
    {/* ... */}
  </div>
</div>
```

## 📊 Summary

CSS isolation with TailwindCSS v4:

- ✅ **Write prefixes directly** - Tailwind scans source code
- ✅ **No dynamic concatenation** - Must be static strings
- ✅ **Build-time detection** - Utilities generated before build
- ✅ **Zero runtime cost** - Pure CSS prefixes
- ✅ **Dark mode support** - Works with custom variants

**Critical Understanding:**
```tsx
// ❌ Won't work - Tailwind can't detect dynamic classes
const cls = `${prefix}:flex`;

// ✅ Works - Tailwind sees static string in source
className="cv:flex cv:items-center"
```

**Key Takeaway:** TailwindCSS requires static class names in your source code. Write all prefixes explicitly - there are no shortcuts or automation that will work with Tailwind's scanning mechanism.

## 🎓 Coming Up Next

In **Part 6: Shared Design System**, we'll cover:
- Creating a design tokens package
- CSS variables for theming
- Build-time vs runtime sharing
- Consistent styling across micro-frontends
- Zero-coupling architecture

---

**Previous:** [Part 4 - Building Independent Micro-Frontends](/en/blog/micro-frontend-part-4-building-independent-micro-frontends)  
**Next:** [Part 6 - Shared Design System](/en/blog/micro-frontend-part-6-shared-design-system)

---

*This is Part 5 of the Micro-Frontends Series. Check out the [complete series](#) for all topics.*

---

**Previous:** [Part 4 - Building Independent Micro-Frontends](/en/blog/micro-frontend-part-4-building-independent-micro-frontends)  
**Next:** [Part 6 - Shared Design System](#) (Coming soon)

---

*This is Part 5 of the Micro-Frontends Series. Check out the [complete series outline](#) for all topics.*
