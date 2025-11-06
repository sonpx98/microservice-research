# Module Federation Micro-Frontend Portfolio

This is a Vite-based Module Federation monorepo using Lerna for workspace management. The architecture consists of independent micro-frontends that can be consumed by external hosts or run standalone.

## Architecture Overview

- **Portfolio Home (`packages/portfolio-home`)**: Main portfolio landing page running on port 5004, showcases all projects with interactive previews
- **Design Tokens (`packages/design-tokens`)**: Shared design system tokens (colors, spacing, typography) for consistency across micro-frontends
- **Independent Micro-Frontends**: Standalone applications that can be consumed as remote modules:
  - `cv-generator`: Resume/CV builder (port 5002)  
  - `tarot`: Digital tarot reading (port 5003)
  - `video-editor`: Video editing application (port 5005)
- **Build System**: Lerna + Vite with `@originjs/vite-plugin-federation` for Module Federation

## Key Development Patterns

### Module Federation Configuration
Each remote app exposes components via `vite.config.ts`:
```typescript
federation({
  name: 'cv-generator',
  filename: 'remoteEntry.js',
  exposes: {
    './app': './src/App.tsx',
  },
  shared: ['react', 'react-dom', 'react-router-dom', 'tailwindcss']
})
```

Shell consumes remotes with specific port mappings:
```typescript
// In packages/portfolio-home/vite.config.ts
remotes: {
  'cv-generator': "http://localhost:5002/assets/remoteEntry.js",
  'tarot': "http://localhost:5003/assets/remoteEntry.js",
  'video-editor': "http://localhost:5005/assets/remoteEntry.js",
}
```

### Essential Development Workflows

**Start all micro-frontends for development:**
```bash
pnpm start:dev
```

**Build only remote apps:**
```bash
pnpm build:remotes
```

**Port allocation:**
- portfolio-home: 5004 (main portfolio with interactive previews)
- cv-generator: 5002 (dev/preview)  
- tarot: 5003 (dev/preview)
- video-editor: 5005 (dev/preview)

### Component Loading Pattern

The portfolio-home uses React.lazy() with Suspense for dynamic imports:
```tsx
const Tarot = React.lazy(() => import('tarot/app'));

<React.Suspense fallback={<Loader2Icon className='animate-spin' />}>
  <Tarot />
</React.Suspense>
```

### TypeScript Integration

Remote module types are declared in `packages/portfolio-home/types/remote.d.ts`:
```typescript
declare module 'cv-generator/*' {
  const component: any;
  export default component;
}
```

## Project Conventions

- **Shared Vite Config**: `vite.config.base.ts` provides common React + TailwindCSS setup
- **Design System**: `@microservice-research/design-tokens` package for shared design tokens
  - **Build-time sharing**: Tokens consumed at build time, not runtime
  - **CSS Variables**: Generated with prefixes for each micro-frontend
  - **Zero coupling**: No runtime dependencies between micro-frontends
- **Package Structure**: Each package follows identical structure with `src/App.tsx` as the main export
- **Styling**: TailwindCSS v4 with `@tailwindcss/vite` plugin across all packages
  - **No Config File**: Tailwind v4 doesn't use `tailwind.config.js` - all configuration is in CSS
  - **CSS Import**: Use `@import "tailwindcss" prefix(yourprefix);` in `src/index.css`
  - **CSS Loading**: Always import `index.css` in `App.tsx` to ensure TailwindCSS is bundled when exposed via Module Federation
  - **Dark Mode**: Add `@custom-variant dark (&:is(.dark *));` in `src/index.css` for dark mode support
- **Path Aliases**: `@/` resolves to `./src` in each package
- **Component Libraries**: Uses Radix UI primitives with shadcn/ui patterns

## Critical Dependencies

- `@originjs/vite-plugin-federation`: Module Federation implementation for Vite
- `lerna`: Monorepo management with pnpm workspace support
- `tailwindcss@4.x`: Latest TailwindCSS with Vite plugin
- Shared React ecosystem: All packages use React 19.x

## When Adding New Micro-Frontends

1. Create new package in `packages/` following existing structure
2. Configure unique port in `vite.config.ts` (increment from 5005)
3. **Setup TailwindCSS v4 with Prefix** (for CSS isolation):
   - Configure Babel plugin in `vite.config.ts` with prefix
   - Setup `src/index.css` with prefix and dark mode variant
   - Import `index.css` in `App.tsx` to ensure CSS is bundled with Module Federation
   - Install Babel dependencies: `pnpm add -D @babel/core @babel/helper-plugin-utils @babel/types @babel/traverse`
4. Add remote entry to portfolio-home's `vite.config.ts` remotes config
5. Declare module types in `packages/portfolio-home/types/remote.d.ts`
6. Import and integrate in portfolio-home's `App.tsx` with lazy loading

### Tailwind CSS v4 Setup for New Projects

**Note**: Tailwind CSS v4 no longer uses `tailwind.config.js`. All configuration is done in CSS.

```typescript
/* vite.config.ts - WITH Prefix Plugin for CSS Isolation */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import prefixTailwind from "../shared/babel-plugins/prefix-tailwind";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [[prefixTailwind, { prefix: 'yourprefix' }]] // Choose unique prefix!
      }
    }),
    tailwindcss(), // Tailwind CSS v4 Vite plugin
  ],
});
```

```css
/* src/index.css - Tailwind v4 with prefix and dark mode */
@import "tailwindcss" prefix(yourprefix);

@custom-variant dark (&:is(.dark *));

/* Optional: Add custom theme values if needed */
@theme {
  --color-primary: #3b82f6;
  --radius: 0.5rem;
}
```

```tsx
/* src/App.tsx */
import './index.css' // Required for Module Federation to bundle TailwindCSS
import './App.css'

function App() {
  // Write clean Tailwind - Babel auto-adds prefix at build time
  return <div className="bg-gray-900 text-white">...</div>
}
```

### Dark Mode Guidelines

**IMPORTANT**: Dark mode utilities MUST follow the format `prefix:dark:utility` (NOT `dark:prefix:utility`)

**Correct Format**:
```tsx
// ✅ CORRECT - Prefix comes first
<div className="interfacegen:bg-white interfacegen:dark:bg-gray-900">
<button className="interfacegen:dark:hover:bg-gray-700">
```

**Incorrect Format**:
```tsx
// ❌ WRONG - Don't put dark before prefix
<div className="dark:interfacegen:bg-gray-900">
<button className="dark:hover:interfacegen:bg-gray-700">
```

**How it works**:
- Shell controls dark mode by adding/removing `dark` class on `document.documentElement`
- Each micro-frontend responds to dark mode using its own prefixed utilities
- The `@custom-variant dark (&:is(.dark *));` in `index.css` enables this behavior

**Prefix Recommendations**:
- video-editor: `ve`
- tarot: `tarot`
- cv-generator: `cv`
- interface-generator: `interfacegen`
- portfolio-home: `pf`

**Why Prefix?**: Prevents CSS conflicts when multiple micro-frontends load together in Module Federation. Developers write clean code like `className="flex"`, Babel transforms to `className="ve:flex"` at build time.

**Documentation**: See `packages/shared/babel-plugins/README.md` for full guide.