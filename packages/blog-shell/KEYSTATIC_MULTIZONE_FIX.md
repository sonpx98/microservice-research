# Keystatic Multi-Zone Issue - Analysis & Solutions

## 🐛 Problem Description

**Symptom:**
When editing a post at `http://localhost:5006/keystatic` and clicking "Save", Keystatic redirects back to `/keystatic` but shows **404 Not Found**.

**Root Cause:**
1. Blog-shell (port 5006) has Keystatic UI routes (`/keystatic`, `/keystatic/[...params]`)
2. Keystatic-admin (port 5007) also has the same routes
3. After saving, Keystatic tries to navigate within the same origin
4. Multi-zone rewrites in `next.config.mjs` don't trigger for client-side navigation
5. Result: Blog-shell tries to render `/keystatic` but state is inconsistent → 404

## 🔍 Current Architecture (Problematic)

```
┌─────────────────────────────────────────────────────┐
│  Blog Shell (localhost:5006)                        │
│  ├─ /en/blog                ✅ Blog pages           │
│  ├─ /vi/blog                ✅ Blog pages           │
│  ├─ /keystatic              ⚠️ Has Keystatic UI     │
│  └─ /keystatic/[...params]  ⚠️ Has Keystatic UI     │
│                                                     │
│  next.config.mjs:                                   │
│  rewrites: /keystatic → http://localhost:5007       │
└─────────────────────────────────────────────────────┘
                       ↓ (Rewrites only work for initial requests)
┌─────────────────────────────────────────────────────┐
│  Keystatic Admin (localhost:5007)                   │
│  basePath: '/keystatic'                             │
│  ├─ /keystatic              ✅ Keystatic UI         │
│  └─ /keystatic/[...params]  ✅ Keystatic UI         │
└─────────────────────────────────────────────────────┘
```

**Why it fails:**
- Initial load: `localhost:5006/keystatic` → Rewrite works → Shows keystatic-admin UI ✅
- After save: Keystatic does client-side navigation → Stays on 5006 → Uses blog-shell's Keystatic routes → 404 ❌

## ✅ Solution 1: Remove Keystatic from Blog-Shell (RECOMMENDED)

Clean separation of concerns - blog-shell only for blog, keystatic-admin only for CMS.

### Changes Required:

#### 1. Remove Keystatic routes from blog-shell

**Delete these folders:**
```bash
rm -rf packages/blog-shell/src/app/keystatic
rm -rf packages/blog-shell/src/app/api/keystatic
```

#### 2. Remove Keystatic config from blog-shell

**Keep only for Contentlayer** - Move `keystatic.config.tsx` to keystatic-admin or make it read-only:

```tsx
// packages/blog-shell/keystatic.config.tsx
// This file is only used by Contentlayer to know the schema
// DO NOT use this for Keystatic UI - edit at http://localhost:5007
import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: { kind: 'local' }, // Blog-shell only reads, never writes
  collections: {
    // Schema definitions (for TypeScript types)
    // ...
  }
});
```

#### 3. Update next.config.mjs

Remove rewrites (not needed if no Keystatic in blog-shell):

```javascript
// packages/blog-shell/next.config.mjs
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@microservice-research/design-tokens'],
  // No rewrites needed!
};
```

#### 4. Direct users to keystatic-admin

Add banner in blog-shell:

```tsx
// packages/blog-shell/src/app/[locale]/layout.tsx
{process.env.NODE_ENV === 'development' && (
  <div className="bg-blue-500 text-white p-2 text-center">
    Edit posts at: <a href="http://localhost:5007/keystatic" className="underline">
      http://localhost:5007/keystatic
    </a>
  </div>
)}
```

### Result:
```
Blog Shell (5006)          Keystatic Admin (5007)
├─ /en/blog       ✅      ├─ /keystatic          ✅
├─ /vi/blog       ✅      └─ /keystatic/[...]    ✅
└─ No Keystatic   ✅      
```

---

## ✅ Solution 2: Fix Redirect in blog-shell

Keep Keystatic in blog-shell but prevent redirect issues.

### Changes Required:

#### 1. Disable navigation after save

```tsx
// packages/blog-shell/keystatic.config.tsx
export default config({
  storage: { kind: 'local' },
  ui: {
    brand: {
      name: 'Blog CMS (Edit at :5007)',
    },
    // Warn users to use keystatic-admin
  },
  collections: {
    // ...
  }
});
```

#### 2. Add middleware to force reload

```tsx
// packages/blog-shell/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If accessing Keystatic from blog-shell, redirect to keystatic-admin
  if (request.nextUrl.pathname.startsWith('/keystatic')) {
    const adminUrl = `http://localhost:5007${request.nextUrl.pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(adminUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/keystatic/:path*',
};
```

#### 3. Remove Keystatic UI pages (keep API only)

Keep `/api/keystatic` for file operations but remove UI pages:

```bash
rm -rf packages/blog-shell/src/app/keystatic
```

---

## 📊 Comparison

| Aspect | Solution 1 (Remove) | Solution 2 (Redirect) |
|--------|-------------------|---------------------|
| **Complexity** | Low ✅ | Medium |
| **Performance** | Best ✅ | Extra redirect |
| **User confusion** | None ✅ | Potential |
| **Maintenance** | Easy ✅ | More code |
| **Production ready** | Yes ✅ | Requires testing |

## 🎯 Recommendation

**Use Solution 1** - Complete separation:
- ✅ Clear architecture (blog = read, admin = write)
- ✅ No redirect hacks
- ✅ Better for production (separate deployments)
- ✅ Easier to understand

## 🚀 Quick Fix (Right Now)

Just remove the Keystatic routes from blog-shell:

```bash
cd /Users/aeronpham/personal/microservice-research/packages/blog-shell

# Remove Keystatic UI
rm -rf src/app/keystatic

# Keep API routes if needed for reading
# rm -rf src/app/api/keystatic  # Optional
```

Then always use: **http://localhost:5007/keystatic** to edit posts.

## 📝 Testing After Fix

1. Start both servers:
   ```bash
   pnpm start:blog  # Port 5006
   ```
   ```bash
   cd packages/keystatic-admin && pnpm dev  # Port 5007
   ```

2. Edit post at `http://localhost:5007/keystatic`
3. Click "Update" → Should stay on 5007 ✅
4. View blog at `http://localhost:5006/en/blog` ✅

No more 404! 🎉
