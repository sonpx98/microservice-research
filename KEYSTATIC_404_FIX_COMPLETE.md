# ✅ Keystatic Multi-Zone Issue - FIXED!

## 🐛 Original Problem

**Symptom:**
```
1. Edit post at http://localhost:5006/keystatic
2. Click "Save"
3. Page redirects to /keystatic
4. ❌ 404 Not Found
```

**Root Cause:**
- Blog-shell (5006) had Keystatic UI routes
- Keystatic-admin (5007) also had Keystatic UI routes
- After save, Keystatic client-side navigation stayed on 5006
- Next.js rewrites only work for initial requests, not client-side navigation
- Result: Inconsistent state → 404

---

## ✅ Solution Implemented

**Clean Separation Architecture:**
```
Blog Shell (5006)              Keystatic Admin (5007)
├─ /en/blog          ✅        ├─ /keystatic           ✅
├─ /vi/blog          ✅        └─ /keystatic/[...]     ✅
└─ NO Keystatic UI   ✅        
```

### Changes Made:

#### 1. Removed Keystatic from blog-shell
```bash
rm -rf packages/blog-shell/src/app/keystatic
rm -rf packages/blog-shell/src/app/api/keystatic
```

**Why:** Blog-shell only needs to READ posts via Contentlayer, not EDIT them.

#### 2. Updated next.config.mjs
```javascript
// packages/blog-shell/next.config.mjs
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@microservice-research/design-tokens'],
  // ✅ No rewrites needed - clean separation
};
```

**Before:**
```javascript
async rewrites() {
  return [
    { source: '/keystatic', destination: 'http://localhost:5007/keystatic' },
    { source: '/keystatic/:path*', destination: 'http://localhost:5007/keystatic/:path*' },
  ];
}
```

**Why:** Rewrites don't work for client-side navigation. Better to remove completely.

#### 3. Added Dev Banner
```tsx
// packages/blog-shell/src/app/[locale]/layout.tsx
{process.env.NODE_ENV === 'development' && (
  <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm">
    📝 <strong>Edit posts at:</strong>{' '}
    <a href="http://localhost:5007/keystatic" target="_blank">
      http://localhost:5007/keystatic
    </a>
    {' '}(Keystatic Admin)
  </div>
)}
```

**Why:** Visual reminder for developers to use the correct port.

#### 4. Updated keystatic.config.tsx comments
```tsx
// packages/blog-shell/keystatic.config.tsx
// ⚠️ NOTE: This config is used by Contentlayer for schema only
// To edit posts, use: http://localhost:5007/keystatic (keystatic-admin zone)
// This zone (blog-shell) only reads content, never edits
```

---

## 🧪 Testing Steps

### 1. Start Both Zones
```bash
# Terminal 1: Blog Shell
pnpm start:blog
# → http://localhost:5006

# Terminal 2: Keystatic Admin
cd packages/keystatic-admin && pnpm dev
# → http://localhost:5007
```

### 2. View Blog
```
http://localhost:5006/en/blog
```

**Expected:**
- ✅ Blue banner at top: "Edit posts at: http://localhost:5007/keystatic"
- ✅ Blog posts display correctly
- ✅ Comments lazy load (if implemented)

### 3. Edit Posts
```
http://localhost:5007/keystatic
```

**Steps:**
1. Click "Blog Posts (English)" or "Blog Posts (Tiếng Việt)"
2. Click a post to edit
3. Make changes
4. Click "Update Blog Post"

**Expected:**
- ✅ Stays on http://localhost:5007/keystatic
- ✅ No redirect
- ✅ No 404
- ✅ Success message appears
- ✅ File saved to `content/posts/en/*.md`

### 4. Verify Changes
```
http://localhost:5006/en/blog
```

**Expected:**
- ✅ Contentlayer auto-regenerates
- ✅ Changes appear immediately (dev mode)
- ✅ No errors in terminal

---

## 📊 Architecture Benefits

### Before (Problematic)
```
Blog Shell (5006)
├─ /keystatic          ⚠️ Has Keystatic UI (conflicts)
├─ /keystatic/[...]    ⚠️ Has Keystatic UI (conflicts)
└─ next.config.mjs     ⚠️ Rewrites (don't work for CSR)

Result: 404 after save ❌
```

### After (Fixed)
```
Blog Shell (5006)          Keystatic Admin (5007)
├─ /en/blog       ✅      ├─ /keystatic           ✅
├─ /vi/blog       ✅      └─ /keystatic/[...]     ✅
└─ Banner         ✅      

Result: Clean separation ✅
```

**Advantages:**
1. ✅ **No conflicts**: Each zone has distinct responsibilities
2. ✅ **No redirects**: Edit directly at 5007, view at 5006
3. ✅ **No 404s**: Keystatic navigation stays within its zone
4. ✅ **Better for production**: Can deploy zones independently
5. ✅ **Clearer mental model**: Blog = read, Admin = write

---

## 🚀 Production Deployment

### Vercel Multi-Zone Setup

**Project 1: Blog Shell**
```
Name: blog-shell
Port: N/A (serverless)
Routes: /*, /en/*, /vi/*
```

**Project 2: Keystatic Admin**
```
Name: keystatic-admin
Port: N/A (serverless)
Routes: /keystatic/*
basePath: /keystatic
```

**Main Project Configuration:**
```javascript
// vercel.json (root)
{
  "routes": [
    {
      "src": "/keystatic(.*)",
      "dest": "https://keystatic-admin.vercel.app/keystatic$1"
    },
    {
      "src": "/(.*)",
      "dest": "https://blog-shell.vercel.app/$1"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /keystatic" on blog-shell

**Cause:** Trying to access Keystatic UI on wrong port

**Fix:** Use http://localhost:5007/keystatic

### Issue: Changes not showing on blog

**Cause:** Contentlayer not regenerating

**Fix:**
```bash
# Kill and restart blog-shell
lsof -ti:5006 | xargs kill -9
pnpm start:blog
```

### Issue: Keystatic shows "No posts found"

**Cause:** Wrong content path in keystatic.config.tsx

**Fix:**
```tsx
// packages/keystatic-admin/keystatic.config.tsx
path: '../../blog-shell/content/posts/en/*'
```

---

## 📝 Summary

### What Was Wrong:
- Multi-zone setup with overlapping routes
- Client-side navigation broke rewrites
- 404 after saving posts

### What We Fixed:
- ✅ Removed Keystatic from blog-shell
- ✅ Clean separation: blog (5006) + admin (5007)
- ✅ Added dev banner for guidance
- ✅ Removed unnecessary rewrites

### Result:
- ✅ No more 404s
- ✅ Smooth editing experience
- ✅ Production-ready architecture
- ✅ Easy to understand and maintain

---

**Edit posts at:** http://localhost:5007/keystatic  
**View blog at:** http://localhost:5006/en/blog

🎉 Problem solved!
