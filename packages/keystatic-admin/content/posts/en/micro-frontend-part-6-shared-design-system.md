---
slug: micro-frontend-part-6-shared-design-system
title: "Micro-Frontends Series: Part 6 - Shared Design System with Design Tokens"
date: 2025-11-17
excerpt: >-
  Build a scalable design system using CSS variables and design tokens. Learn build-time sharing, zero-coupling architecture, and consistent theming across all micro-frontends.
tags:
  - micro-frontend
  - design-system
  - design-tokens
  - css-variables
  - series
published: true
locale: en
---

In [Part 5](/en/blog/micro-frontend-part-5-css-isolation), we solved CSS conflicts with prefixes. Now let's build a **shared design system** that keeps all micro-frontends visually consistent without tight coupling!

## 🎯 Why a Shared Design System?

### The Problem Without Design System

```tsx
// cv-generator/src/App.tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded">
  Generate
</button>

// tarot/src/App.tsx
<button className="bg-blue-500 text-white px-6 py-3 rounded-lg">
  Draw Card
</button>

// video-editor/src/App.tsx  
<button className="bg-indigo-600 text-white px-5 py-2.5 rounded-md">
  Export
</button>
```

**Problems:**
- ❌ Inconsistent colors (`blue-600` vs `blue-500` vs `indigo-600`)
- ❌ Different spacing (`px-4` vs `px-6` vs `px-5`)
- ❌ Different border radius
- ❌ No single source of truth
- ❌ Hard to update globally

### The Solution: Design Tokens

```typescript
// design-tokens package
export const tokens = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    danger: '#ef4444'
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem'
  },
  borderRadius: {
    default: '0.5rem',
    lg: '0.75rem'
  }
};
```

**Benefits:**
- ✅ Single source of truth
- ✅ Consistent across all apps
- ✅ Easy to update globally
- ✅ Type-safe with TypeScript

## 🏗️ Architecture: Build-Time vs Runtime Sharing

### Two Approaches

**❌ Runtime Sharing (Not Recommended)**
```tsx
// Each micro-frontend imports at runtime
import { tokens } from '@microservice-research/design-tokens';

// Problem: Tight coupling, bundle duplication
```

**✅ Build-Time Sharing (Recommended)**
```css
/* Generate CSS variables once */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}

/* Each micro-frontend uses CSS variables */
.button {
  background: var(--color-primary);
}
```

**Benefits of Build-Time:**
- No runtime dependency
- No Module Federation needed
- Smaller bundles
- Better performance
- Zero coupling

## 📦 Creating the Design Tokens Package

### Step 1: Package Structure

```
packages/design-tokens/
├── src/
│   ├── tokens.ts           # Token definitions
│   ├── generate-css.ts     # CSS generator
│   └── index.ts            # Exports
├── dist/
│   └── tokens.css          # Generated CSS
├── package.json
└── tsconfig.json
```

### Step 2: Define Tokens

```typescript
// src/tokens.ts
export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    gray: Record<number, string>;
  };
  spacing: Record<string, string>;
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
  };
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

export const tokens: DesignTokens = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712'
    }
  },
  spacing: {
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem',
    '16': '4rem'
  },
  typography: {
    fontFamily: {
      sans: 'ui-sans-serif, system-ui, sans-serif',
      mono: 'ui-monospace, Menlo, Monaco, monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    default: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
  }
};
```

### Step 3: Generate CSS Variables

```typescript
// src/generate-css.ts
import { tokens } from './tokens';
import fs from 'fs';
import path from 'path';

function generateCSSVariables(prefix: string = ''): string {
  const lines: string[] = [':root {'];

  // Colors
  Object.entries(tokens.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      lines.push(`  --${prefix}color-${key}: ${value};`);
    } else {
      // Handle color scales (e.g., gray-50, gray-100)
      Object.entries(value).forEach(([shade, color]) => {
        lines.push(`  --${prefix}color-${key}-${shade}: ${color};`);
      });
    }
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    lines.push(`  --${prefix}spacing-${key}: ${value};`);
  });

  // Typography
  Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
    lines.push(`  --${prefix}font-${key}: ${value};`);
  });

  Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
    lines.push(`  --${prefix}text-${key}: ${value};`);
  });

  Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
    lines.push(`  --${prefix}font-${key}: ${value};`);
  });

  // Border Radius
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    lines.push(`  --${prefix}radius-${key}: ${value};`);
  });

  // Shadows
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    lines.push(`  --${prefix}shadow-${key}: ${value};`);
  });

  lines.push('}\n');
  return lines.join('\n');
}

// Generate CSS file
const css = generateCSSVariables();
const outputPath = path.join(__dirname, '../dist/tokens.css');

// Ensure dist directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, css);

console.log('✅ Design tokens CSS generated at:', outputPath);
```

### Step 4: Build Script

```json
// package.json
{
  "name": "@microservice-research/design-tokens",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc && node dist/generate-css.js",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0"
  }
}
```

### Step 5: Generated Output

```css
/* dist/tokens.css */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #06b6d4;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  /* ... more colors ... */
  
  --spacing-0: 0;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  /* ... more spacing ... */
  
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, Menlo, Monaco, monospace;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  /* ... more sizes ... */
  
  --radius-default: 0.25rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-default: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  /* ... more shadows ... */
}
```

## 🎨 Using Design Tokens in Micro-Frontends

### Step 1: Import Tokens CSS

```tsx
// packages/cv-generator/src/App.tsx
import '@microservice-research/design-tokens/dist/tokens.css';
import './index.css';

export default function App() {
  return (
    <div style={{ 
      backgroundColor: 'var(--color-gray-900)',
      color: 'var(--color-gray-50)',
      padding: 'var(--spacing-8)'
    }}>
      <h1 style={{ fontSize: 'var(--text-4xl)' }}>
        CV Generator
      </h1>
    </div>
  );
}
```

### Step 2: With TailwindCSS Integration

```css
/* packages/cv-generator/src/index.css */
@import "tailwindcss" prefix(cv);
@import "@microservice-research/design-tokens/dist/tokens.css";

@custom-variant dark (&:is(.dark *));

/* Use tokens in custom utilities */
@layer utilities {
  .cv\:btn-primary {
    background-color: var(--color-primary);
    color: white;
    padding: var(--spacing-3) var(--spacing-6);
    border-radius: var(--radius-lg);
  }
  
  .cv\:btn-primary:hover {
    opacity: 0.9;
  }
}
```

```tsx
// Use custom utilities
<button className="cv:btn-primary">
  Generate CV
</button>
```

### Step 3: TypeScript Integration

```typescript
// packages/cv-generator/src/theme.ts
import { tokens } from '@microservice-research/design-tokens';

// Type-safe theme access
export function getColor(key: keyof typeof tokens.colors) {
  return `var(--color-${key})`;
}

export function getSpacing(key: keyof typeof tokens.spacing) {
  return `var(--spacing-${key})`;
}

// Usage
const primaryColor = getColor('primary');
const largePadding = getSpacing('8');
```

## 🎭 Prefix Support for Multi-Tenant

Generate prefixed tokens for each micro-frontend:

```typescript
// generate-css.ts
function generatePrefixedCSS(prefix: string) {
  return generateCSSVariables(prefix);
}

// Generate for each app
fs.writeFileSync('dist/tokens-cv.css', generatePrefixedCSS('cv-'));
fs.writeFileSync('dist/tokens-tarot.css', generatePrefixedCSS('tarot-'));
fs.writeFileSync('dist/tokens-ve.css', generatePrefixedCSS('ve-'));
```

```css
/* tokens-cv.css */
:root {
  --cv-color-primary: #3b82f6;
  --cv-spacing-4: 1rem;
}

/* tokens-tarot.css */
:root {
  --tarot-color-primary: #3b82f6;
  --tarot-spacing-4: 1rem;
}
```

## 🌓 Dark Mode Support

Add dark mode tokens:

```typescript
// src/tokens.ts
export const darkTokens = {
  colors: {
    primary: '#60a5fa',  // Lighter blue for dark mode
    gray: {
      50: '#030712',
      100: '#111827',
      // Inverted scale
      900: '#f9fafb'
    }
  }
};
```

Generate dark mode CSS:

```typescript
// generate-css.ts
function generateDarkMode(): string {
  const lines: string[] = ['.dark {'];
  
  // Override colors for dark mode
  Object.entries(darkTokens.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      lines.push(`  --color-${key}: ${value};`);
    } else {
      Object.entries(value).forEach(([shade, color]) => {
        lines.push(`  --color-${key}-${shade}: ${color};`);
      });
    }
  });
  
  lines.push('}\n');
  return lines.join('\n');
}
```

Output:

```css
:root {
  --color-primary: #3b82f6;
  --color-gray-900: #111827;
}

.dark {
  --color-primary: #60a5fa;  /* Lighter for dark bg */
  --color-gray-900: #f9fafb; /* Light text on dark bg */
}
```

## 📊 Real-World Example

Complete implementation in CV Generator:

```tsx
// packages/cv-generator/src/App.tsx
import '@microservice-research/design-tokens/dist/tokens.css';
import './index.css';

export default function App() {
  return (
    <div className="min-h-screen p-8" style={{
      backgroundColor: 'var(--color-gray-900)',
      color: 'var(--color-gray-50)'
    }}>
      <div className="max-w-4xl mx-auto">
        <h1 style={{
          fontSize: 'var(--text-4xl)',
          fontWeight: 'var(--font-bold)',
          marginBottom: 'var(--spacing-8)'
        }}>
          CV Generator
        </h1>

        <div style={{
          backgroundColor: 'var(--color-gray-800)',
          padding: 'var(--spacing-6)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <input
            type="text"
            placeholder="Full Name"
            style={{
              width: '100%',
              padding: 'var(--spacing-3)',
              borderRadius: 'var(--radius-default)',
              backgroundColor: 'var(--color-gray-700)',
              border: '1px solid var(--color-gray-600)',
              color: 'var(--color-gray-50)',
              fontSize: 'var(--text-base)'
            }}
          />
          
          <button style={{
            marginTop: 'var(--spacing-4)',
            padding: `var(--spacing-3) var(--spacing-6)`,
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            border: 'none',
            cursor: 'pointer'
          }}>
            Generate CV
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 🔄 Updating Tokens Globally

Change once, update everywhere!

```typescript
// tokens.ts
export const tokens = {
  colors: {
    primary: '#3b82f6',  // Change to: '#8b5cf6'
  }
};

// Rebuild design-tokens
pnpm --filter design-tokens build

// All micro-frontends automatically use new color! 🎉
```

## 🎯 Best Practices

### 1. **Semantic Naming**

```typescript
// ✅ Good
colors: {
  primary: '#3b82f6',
  danger: '#ef4444',
  success: '#10b981'
}

// ❌ Bad
colors: {
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#10b981'
}
```

### 2. **Consistent Scale**

```typescript
// ✅ Good - Consistent spacing scale
spacing: {
  '1': '0.25rem',  // 4px
  '2': '0.5rem',   // 8px
  '3': '0.75rem',  // 12px
  '4': '1rem'      // 16px
}

// ❌ Bad - Inconsistent
spacing: {
  small: '0.3rem',
  medium: '0.7rem',
  large: '1.2rem'
}
```

### 3. **Build-Time Generation**

```json
{
  "scripts": {
    "build": "tsc && node dist/generate-css.js",
    "prebuild": "rm -rf dist"
  }
}
```

### 4. **Type Safety**

```typescript
// Export types
export type ColorToken = keyof typeof tokens.colors;
export type SpacingToken = keyof typeof tokens.spacing;

// Usage with type safety
function useColor(color: ColorToken) {
  return `var(--color-${color})`;
}

useColor('primary');   // ✅ Valid
useColor('invalid');   // ❌ TypeScript error
```

### 5. **Documentation**

```typescript
/**
 * Design Tokens
 * 
 * Colors: Semantic color palette
 * Spacing: 0.25rem base scale (4px)
 * Typography: System font stack
 * Border Radius: Rounded corners
 * Shadows: Elevation system
 */
export const tokens: DesignTokens = { ... };
```

## 📝 Summary

Design tokens provide:

- ✅ **Single source of truth** for design decisions
- ✅ **Build-time sharing** (zero runtime coupling)
- ✅ **Type-safe** with TypeScript
- ✅ **Easy updates** - change once, update everywhere
- ✅ **Consistent theming** across all micro-frontends

**Architecture:**
1. Define tokens in TypeScript
2. Generate CSS variables at build time
3. Import CSS in micro-frontends
4. Use `var(--token-name)` in styles

**Zero Coupling:**
- No runtime dependencies
- No Module Federation needed
- Pure CSS variables
- Each app can build independently

## 🎓 Coming Up Next

In **Part 7: Portfolio Shell Integration**, we'll cover:
- Building the host/shell application
- Consuming multiple remotes
- React.lazy() and Suspense
- Error boundaries
- Interactive previews
- Complete integration flow

---

**Previous:** [Part 5 - CSS Isolation with TailwindCSS v4](/en/blog/micro-frontend-part-5-css-isolation)  
**Next:** [Part 7 - Portfolio Shell Integration](#) (Coming soon)

---

*This is Part 6 of the Micro-Frontends Series. Check out the [complete series outline](#) for all topics.*
