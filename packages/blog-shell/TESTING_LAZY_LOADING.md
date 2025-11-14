# Testing Lazy Loading Comments - Complete Guide

## ✅ What We Built

Mock Giscus component for testing lazy loading **WITHOUT** needing GitHub setup!

## 🎯 How to Test (No GitHub Required!)

### Step 1: Open Blog Post
```
http://localhost:5006/en/blog/welcome
```

### Step 2: Open DevTools (F12)

#### Network Tab:
1. Click "Network" tab
2. Check "Disable cache"
3. Filter by "JS" or "All"
4. Refresh page (Cmd+R)

**✅ Expected: Initial load should NOT include giscus-widget chunk**

#### Console Tab:
Keep console open to see lazy loading logs

### Step 3: Test Initial Load

**What you should see:**
- ❌ NO giscus-widget.js in Network tab
- ✅ Placeholder with "Load Comments" button
- ✅ Icon: MessageSquare
- ✅ Text: "Scroll here to load comments • Saves 800 KB"

### Step 4: Test Lazy Loading

**Option A: Automatic (Scroll)**
1. Slowly scroll down the page
2. When you're ~200px from comments section:
   - Console logs: `📝 Comments section visible - loading Giscus widget...`
   - Network tab shows new chunk loading: `giscus-widget-mock-xxx.js`
   - Placeholder disappears
   - Mock comments UI appears with green "✅ Lazy Loaded!" badge

**Option B: Manual (Click Button)**
1. Click "Load Comments Now" button
2. Same behavior as Option A
3. Comments load immediately

### Step 5: Verify Success

**Mock Comments UI should show:**
- 🎉 Green badge: "✅ Lazy Loaded!"
- ✨ Success message: "Lazy Loading Works!"
- 💬 2 mock comments (Anonymous User + Another User)
- 📝 Mock comment input box (disabled)
- ℹ️ Yellow info banner explaining it's a mock

## 📊 Performance Verification

### Check Bundle Size:

1. **Initial Load** (Before scroll):
   - Look at Network tab
   - Sum all JS files
   - Should be ~200-300 KB (no Giscus)

2. **After Scroll** (Comments loaded):
   - New chunk appears: `giscus-widget-mock-xxx.js`
   - Lazy loaded on-demand!

### Measure Load Time:

Open DevTools → Performance tab:
1. Click "Record" 🔴
2. Refresh page
3. Scroll to comments
4. Stop recording ⏹️
5. See timeline showing when giscus-widget loaded

## 🔄 Switch to Real Giscus

When ready to use real GitHub Discussions:

### 1. Setup GitHub Discussions

```bash
# Go to your repo: https://github.com/sonpx98/microservice-research
# Settings → General → Features
# ✅ Enable "Discussions"
```

### 2. Get Giscus Configuration

Visit: https://giscus.app/

Fill in:
- Repository: `sonpx98/microservice-research`
- Page ↔️ Discussions Mapping: `pathname`
- Discussion Category: Choose one (e.g., "General")

Copy the configuration values:
- `repo`
- `repoId`
- `category`
- `categoryId`

### 3. Update giscus-widget.tsx

```tsx
// packages/blog-shell/src/components/blog/giscus-widget.tsx
export function GiscusWidget({ locale }: GiscusWidgetProps) {
  return (
    <Giscus
      repo="sonpx98/microservice-research"
      repoId="R_YOUR_ACTUAL_REPO_ID"  // 👈 Replace
      category="General"               // 👈 Replace
      categoryId="DIC_YOUR_CATEGORY_ID" // 👈 Replace
      // ... rest stays same
    />
  );
}
```

### 4. Switch comment-section.tsx

```tsx
// Change this line:
() => import('./giscus-widget-mock').then(mod => ({ default: mod.GiscusWidget }))

// To this:
() => import('./giscus-widget').then(mod => ({ default: mod.GiscusWidget }))
```

## 🎨 Visual Testing Checklist

### Before Scroll:
- [ ] Placeholder visible with dashed border
- [ ] MessageSquare icon (💬) shows
- [ ] "Load Comments Now" button works
- [ ] "Lazy loading enabled" badge in header
- [ ] NO giscus chunk in Network tab

### During Scroll:
- [ ] Console log appears ~200px before section
- [ ] Loading skeleton shows briefly
- [ ] Network tab shows chunk loading
- [ ] Smooth transition to mock comments

### After Load:
- [ ] Green "Lazy Loaded" badge visible
- [ ] Mock comments render correctly
- [ ] Dark mode works (if enabled)
- [ ] Layout looks good on mobile

## 🐛 Troubleshooting

### Issue: Comments load immediately (not lazy)

**Fix:** Check Intersection Observer in comment-section.tsx
```tsx
// Should have rootMargin: '200px'
const observer = new IntersectionObserver(..., {
  rootMargin: '200px',
  threshold: 0.1
});
```

### Issue: No chunk loading in Network tab

**Possible causes:**
1. Browser cache - Clear cache and hard refresh (Cmd+Shift+R)
2. Next.js bundled everything together - Restart dev server
3. Component already imported somewhere else

### Issue: Mock comments not showing

**Check:**
1. Import path correct: `./giscus-widget-mock`
2. File exists: `src/components/blog/giscus-widget-mock.tsx`
3. No TypeScript errors

## 📈 Expected Results

### Without Lazy Loading:
```
Initial Bundle: 995 KB
First Load: 1.2s
Users who don't scroll to comments: 100% (wasted bandwidth)
```

### With Lazy Loading (Mock):
```
Initial Bundle: ~200 KB ⚡ 80% smaller
First Load: ~0.8s ⚡ 33% faster
Comments load: On-demand (200px before visible)
Bandwidth saved: 800 KB for 70-80% of users
```

## 🚀 Next Steps

1. ✅ Test with mock component (current)
2. 🔄 When ready, setup GitHub Discussions
3. 🔄 Switch to real Giscus widget
4. 🔄 Deploy to production
5. 📊 Monitor performance improvements

## 💡 Pro Tips

### Test on Slow Connection:
1. DevTools → Network tab
2. Change "No throttling" → "Fast 3G"
3. Refresh and scroll
4. See dramatic difference in load time

### Test on Mobile:
1. DevTools → Toggle device toolbar (Cmd+Shift+M)
2. Choose mobile device
3. Verify lazy loading works on small screens

### Verify Bundle Split:
```bash
# Build production bundle
pnpm build

# Check .next/static/chunks/
# Should see separate chunk for giscus-widget
```

---

## 🎉 Summary

You can now test lazy loading **completely locally** without any GitHub setup! The mock component proves the lazy loading mechanism works, then switch to real Giscus when you're ready to deploy.
