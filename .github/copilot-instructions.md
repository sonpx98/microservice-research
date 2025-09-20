# Module Federation Micro-Frontend Portfolio

This is a Vite-based Module Federation monorepo using Lerna for workspace management. The architecture consists of independent micro-frontends that can be consumed by external hosts or run standalone.

## Architecture Overview

- **Portfolio Home (`packages/portfolio-home`)**: Main portfolio landing page running on port 5004, showcases all projects with interactive previews
- **Independent Micro-Frontends**: Standalone applications that can be consumed as remote modules:
  - `flash-card-fav`: Interactive flashcard app (port 5001)
  - `cv-generator`: Resume/CV builder (port 5002)  
  - `tarot`: Digital tarot reading (port 5003)
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
  'flash-card-fav': "http://localhost:5001/assets/remoteEntry.js",
  'cv-generator': "http://localhost:5002/assets/remoteEntry.js",
  'tarot': "http://localhost:5003/assets/remoteEntry.js",
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
- flash-card-fav: 5001 (dev/preview)
- cv-generator: 5002 (dev/preview)  
- tarot: 5003 (dev/preview)

### Component Loading Pattern

The portfolio-home uses React.lazy() with Suspense for dynamic imports:
```tsx
const FlashCardFav = React.lazy(() => import('flash-card-fav/app'));

<React.Suspense fallback={<Loader2Icon className='animate-spin' />}>
  <FlashCardFav />
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
- **Package Structure**: Each package follows identical structure with `src/App.tsx` as the main export
- **Styling**: TailwindCSS v4 with `@tailwindcss/vite` plugin across all packages
- **Path Aliases**: `@/` resolves to `./src` in each package
- **Component Libraries**: Uses Radix UI primitives with shadcn/ui patterns

## Critical Dependencies

- `@originjs/vite-plugin-federation`: Module Federation implementation for Vite
- `lerna`: Monorepo management with pnpm workspace support
- `tailwindcss@4.x`: Latest TailwindCSS with Vite plugin
- Shared React ecosystem: All packages use React 19.x

## When Adding New Micro-Frontends

1. Create new package in `packages/` following existing structure
2. Configure unique port in `vite.config.ts` (increment from 5004)
3. Add remote entry to portfolio-home's `vite.config.ts` remotes config
4. Declare module types in `packages/portfolio-home/types/remote.d.ts`
5. Import and integrate in portfolio-home's `App.tsx` with lazy loading