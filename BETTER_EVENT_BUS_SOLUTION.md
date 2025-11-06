# Better Solution: Event Bus via Module Federation

## Current Approach (Window Object) ⚠️

**Risks:**
- ❌ SSR/SSG incompatible
- ❌ Security concerns (global scope)
- ❌ Type safety issues
- ❌ Testing complexity
- ❌ Namespace pollution
- ❌ Not idiomatic Module Federation

## Recommended Approach: Remote Import ✅

### Solution 1: Import from Portfolio-Home (Shell)

Thay vì mỗi remote tự import event-bus, hãy **consume từ shell**:

#### Step 1: Portfolio-Home exposes event-bus
```typescript
// packages/portfolio-home/vite.config.ts
federation({
  name: 'portfolio-home',
  exposes: {
    './app': './src/App.tsx',
    './event-bus': '../shared/lib/event-bus', // ✅ Already exposed
  }
})
```

#### Step 2: Remotes consume from portfolio-home
```typescript
// packages/interface-generator/vite.config.ts
federation({
  name: "interface-generator",
  remotes: {
    'portfolio-home': 'http://localhost:5004/assets/remoteEntry.js' // ← Add this
  },
  exposes: {
    "./app": "./src/App.tsx",
  },
  shared: ["react", "react-dom", "react-router-dom"],
})
```

#### Step 3: Update imports in remotes
```typescript
// packages/interface-generator/src/hooks/useEventBus.ts
// OLD:
import { eventBus } from '../../../shared/lib/event-bus';

// NEW:
import { eventBus } from 'portfolio-home/event-bus';
```

### Solution 2: External Package (Most Robust) 🏆

Create `@microservice-research/event-bus` package:

```
packages/
├── event-bus/                    # ← New package
│   ├── package.json
│   ├── src/
│   │   ├── index.ts
│   │   └── event-bus.ts
│   └── tsconfig.json
├── interface-generator/
├── tarot/
└── portfolio-home/
```

**Benefits:**
- ✅ Proper dependency management via pnpm workspace
- ✅ Versioning support
- ✅ Type-safe imports
- ✅ No Module Federation complexity
- ✅ Works in all environments (SSR, testing, etc.)
- ✅ Can be published to npm if needed

### Solution 3: Keep Window but Add Safety ⚡

If you want to keep current approach, add safety layers:

```typescript
// packages/shared/lib/event-bus.ts

// 1. Namespace to avoid collisions
const NAMESPACE = '__MF_EVENT_BUS__';

// 2. Type-safe window interface
declare global {
  interface Window {
    [NAMESPACE]?: {
      instance: EventBus;
      version: string;
      initialized: number;
    };
  }
}

// 3. Initialize with metadata
if (typeof window !== 'undefined') {
  if (!window[NAMESPACE]) {
    window[NAMESPACE] = {
      instance: new EventBus(),
      version: '1.0.0',
      initialized: Date.now()
    };
  }
}

// 4. Freeze to prevent tampering
if (typeof window !== 'undefined' && window[NAMESPACE]) {
  Object.freeze(window[NAMESPACE]);
}

// 5. Export with fallback
export const eventBus = typeof window !== 'undefined' 
  ? window[NAMESPACE]!.instance
  : new EventBus();

// 6. Add development warnings
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    console.info('[Event Bus] Singleton initialized on window', {
      namespace: NAMESPACE,
      version: window[NAMESPACE]?.version,
      timestamp: new Date(window[NAMESPACE]?.initialized || 0)
    });
  }
}
```

## Comparison

| Approach | Pros | Cons | Recommended |
|----------|------|------|-------------|
| **Window Object** | ✅ Simple<br>✅ Works immediately | ❌ Global pollution<br>❌ Security risk<br>❌ SSR issues | 🟡 OK for prototypes |
| **Remote Import** | ✅ Module Federation native<br>✅ No globals | ❌ Circular dependency<br>❌ Complex setup | 🟢 Good for MF apps |
| **External Package** | ✅ Clean architecture<br>✅ Versioning<br>✅ Type-safe | ❌ Extra package<br>❌ Build step | 🟢🟢 Best for production |
| **Enhanced Window** | ✅ Simple + safer<br>✅ Quick fix | ❌ Still global<br>❌ SSR issues | 🟡 OK for MVP |

## My Recommendation 🎯

For your current setup, I recommend:

### Option A: Enhanced Window (Quick Fix - 5 mins)
Keep current approach but add safety layers I showed above. Good enough for development/demo.

### Option B: External Package (Production Ready - 30 mins)
Create `@microservice-research/event-bus` package. This is the cleanest and most maintainable solution.

### Implementation Guide for Option B

Would you like me to implement Option B? It would involve:
1. Creating `packages/event-bus/` package
2. Moving event-bus code there
3. Updating all imports
4. Removing window hack

This is the **professional way** and what I'd do in a real production app.

## What to do now?

Choose based on your needs:

1. **Just learning/prototyping?** → Keep current window approach, it works fine ✅
2. **Preparing for production?** → Let me implement Option B (external package)
3. **Want quick improvement?** → Apply Enhanced Window safety layers

Bạn muốn giữ nguyên (it works!), hay upgrade lên solution tốt hơn? 🤔
