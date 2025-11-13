# Production Content Management Workflow

## 🎯 TL;DR - Tóm tắt ngắn gọn

**Git đóng vai trò là DATABASE cho blog của bạn!**

- 💾 **Git = Database**: Lưu trữ tất cả markdown files
- ✍️ **Keystatic = Admin Panel**: UI để edit content từ browser
- 🚀 **Vercel = Build & Deploy**: Tự động build khi có thay đổi
- 📝 **Workflow**: Edit trên Keystatic → Commit to GitHub → Vercel auto-deploy

---

## 🏗️ Kiến trúc Production

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION WORKFLOW                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   GitHub Repo    │ ← Git = Your Database
│                  │   - Stores all .md files
│  content/        │   - Version control
│  └── posts/      │   - History of changes
│      ├── en/     │
│      └── vi/     │
└────────┬─────────┘
         │
         │ ① Keystatic reads/writes
         │    via GitHub API
         │
         ▼
┌──────────────────┐
│  Keystatic CMS   │ ← Admin Panel (your site)
│                  │   - https://yoursite.com/keystatic
│  [Edit UI]       │   - Login with GitHub OAuth
│  [Create Post]   │   - Edit posts in browser
│  [Commit]        │   - Auto-commit to GitHub
└────────┬─────────┘
         │
         │ ② Commits trigger webhook
         │
         ▼
┌──────────────────┐
│  Vercel Build    │ ← Deployment Platform
│                  │   - Detects new commits
│  1. git pull     │   - Pulls latest content
│  2. contentlayer │   - Generates HTML
│  3. next build   │   - Builds static site
│  4. deploy       │   - Deploys to CDN
└────────┬─────────┘
         │
         │ ③ Site updated
         │
         ▼
┌──────────────────┐
│   Live Website   │ ← Users see new content
│                  │   - https://yoursite.com
│  [Blog Posts]    │   - Fresh content
└──────────────────┘
```

---

## 🔄 Chi tiết từng bước

### 1️⃣ Git đóng vai trò gì?

**Git = Database của blog bạn**

```
Thay vì:
├── MySQL Database
│   └── posts table
│       ├── id, title, content, date
│       └── ...

Bạn có:
├── GitHub Repository
│   └── content/posts/
│       ├── en/
│       │   ├── welcome.md
│       │   └── tutorial.md
│       └── vi/
│           ├── welcome.md
│           └── tutorial.md
```

**Ưu điểm:**
- ✅ **Free**: Không tốn phí database
- ✅ **Version Control**: Xem lịch sử thay đổi, rollback dễ dàng
- ✅ **Backup tự động**: GitHub đã backup giúp bạn
- ✅ **Git blame**: Biết ai viết bài gì, lúc nào
- ✅ **Portable**: Download về là có tất cả content

---

### 2️⃣ Keystatic trong Production

**Current config (Local mode):**
```tsx
// keystatic.config.tsx
export default config({
  storage: { kind: 'local' },  // ❌ Không dùng trong production
  collections: { ... }
});
```

**Production config (GitHub mode):**
```tsx
export default config({
  storage: 
    process.env.NODE_ENV === 'production'
      ? {
          kind: 'github',
          repo: {
            owner: 'sonpx98',              // GitHub username
            name: 'microservice-research'  // Repository name
          }
        }
      : { kind: 'local' },
  collections: { ... }
});
```

**Workflow khi edit trên production:**

```
User visits: https://yoursite.com/keystatic
         ↓
Keystatic checks: Are you logged in with GitHub?
         ↓ (No)
Shows GitHub OAuth login
         ↓
User authorizes with GitHub account
         ↓
Keystatic loads content from GitHub via API
         ↓
User edits post in browser
         ↓
User clicks "Update Blog Post"
         ↓
Keystatic creates a Git commit:
  - Commit message: "Update blog-post.md"
  - Author: Your GitHub account
  - File: content/posts/en/blog-post.md
         ↓
Push commit to GitHub
         ↓
GitHub webhook notifies Vercel
         ↓
Vercel starts new deployment
         ↓ (2-3 minutes)
New content live!
```

---

### 3️⃣ Vercel Build Process

**Khi có commit mới:**

```bash
# 1. Vercel detects new commit
[Vercel] New commit detected: abc123f

# 2. Clone repository
git clone https://github.com/sonpx98/microservice-research.git
cd packages/blog-shell

# 3. Install dependencies
pnpm install

# 4. Contentlayer processes markdown
[Contentlayer] Processing content...
[Contentlayer] Generated 10 documents

# 5. Build Next.js
next build
[Next.js] Building production bundle...
[Next.js] Collecting page data...
[Next.js] ✓ Compiled successfully

# 6. Deploy to CDN
[Vercel] Deploying to production...
[Vercel] ✓ Deployment complete!
[Vercel] https://yoursite.com
```

**Build output:**
```
.next/
├── static/
│   ├── chunks/          # JavaScript bundles
│   └── css/             # Stylesheets
├── server/
│   └── pages/
│       └── [locale]/
│           └── blog/
│               └── [slug].html  # Pre-rendered HTML với content
└── ...

.contentlayer/
└── generated/
    └── Post/
        ├── posts__en__welcome.md.json  # Content đã transform
        └── posts__vi__welcome.md.json
```

---

## 🔐 Setup GitHub OAuth cho Keystatic

### Bước 1: Tạo GitHub OAuth App

1. Vào: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill form:
   ```
   Application name: Keystatic CMS - My Blog
   Homepage URL: https://yoursite.com
   Authorization callback URL: https://yoursite.com/api/keystatic/github/oauth/callback
   ```
4. Click **"Register application"**
5. Note lại:
   - **Client ID**: abc123xyz (public)
   - **Client Secret**: secret_token_here (private)

### Bước 2: Add Environment Variables vào Vercel

```bash
# Vercel Dashboard → Settings → Environment Variables

KEYSTATIC_GITHUB_CLIENT_ID=abc123xyz
KEYSTATIC_GITHUB_CLIENT_SECRET=secret_token_here
KEYSTATIC_SECRET=random_32_character_string_here
```

**Tạo KEYSTATIC_SECRET:**
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Bước 3: Update keystatic.config.tsx

```tsx
import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: 
    process.env.NODE_ENV === 'production'
      ? {
          kind: 'github',
          repo: {
            owner: 'sonpx98',
            name: 'microservice-research'
          }
        }
      : { kind: 'local' },
  
  // Optional: Restrict who can edit
  ui: {
    brand: {
      name: 'My Blog',
    },
  },
  
  collections: {
    // ... existing collections
  }
});
```

---

## 📝 Workflow Examples

### Scenario 1: Tạo bài viết mới trên Production

```
1. Visit https://yoursite.com/keystatic
2. Login with GitHub (first time only)
3. Click "Blog Posts (English)"
4. Click "Create Blog Post"
5. Fill form:
   - Title: "My New Post"
   - Date: Today
   - Content: Write markdown
6. Click "Create Blog Post"

→ Keystatic creates commit:
   - File: content/posts/en/my-new-post.md
   - Commit: "Create my-new-post.md"
   - Push to GitHub

→ Vercel webhook triggered
→ Build starts (~2 minutes)
→ Live at: https://yoursite.com/en/blog/my-new-post
```

### Scenario 2: Edit bài viết existing

```
1. Visit https://yoursite.com/keystatic
2. Click post from list
3. Edit content
4. Click "Update Blog Post"

→ Keystatic updates commit:
   - Modified: content/posts/en/my-post.md
   - Commit: "Update my-post.md"
   - Push to GitHub

→ Vercel redeploys
→ Updated content live!
```

### Scenario 3: Xóa bài viết

```
1. Visit https://yoursite.com/keystatic
2. Click post
3. Click delete button
4. Confirm

→ Keystatic deletes:
   - Removed: content/posts/en/old-post.md
   - Commit: "Delete old-post.md"
   - Push to GitHub

→ Vercel rebuilds without that post
```

---

## 🔍 Git Commit History Example

```bash
git log --oneline

abc123f Update blog-architecture-guide.md (via Keystatic)
def456g Create welcome.md (via Keystatic)
789hij0 Initial blog setup
```

**View changes:**
```bash
git show abc123f

commit abc123f
Author: Son Pham <sonpx98@github.com>
Date:   Wed Nov 13 2025

    Update blog-architecture-guide.md

diff --git a/content/posts/en/blog-architecture-guide.md b/content/posts/en/blog-architecture-guide.md
@@ -1,7 +1,7 @@
 ---
 title: "Blog Architecture Guide"
-date: "2025-11-12"
+date: "2025-11-13"
 excerpt: "Complete guide..."
```

---

## 🚀 Deploy Checklist

### Pre-deployment:

- [ ] **Update keystatic.config.tsx** với GitHub storage
- [ ] **Create GitHub OAuth App** và note Client ID/Secret
- [ ] **Push code to GitHub**
- [ ] **Connect Vercel to GitHub repo**
- [ ] **Add Environment Variables** trong Vercel:
  - `KEYSTATIC_GITHUB_CLIENT_ID`
  - `KEYSTATIC_GITHUB_CLIENT_SECRET`
  - `KEYSTATIC_SECRET`
- [ ] **Set Build Command**: `cd packages/blog-shell && pnpm build`
- [ ] **Set Output Directory**: `packages/blog-shell/.next`
- [ ] **Deploy!**

### Post-deployment testing:

```bash
# 1. Test website
curl https://yoursite.com
→ Should load homepage

# 2. Test blog listing
curl https://yoursite.com/en/blog
→ Should show posts

# 3. Test Keystatic access
→ Visit https://yoursite.com/keystatic
→ Should show GitHub login

# 4. Login and create test post
→ Create "Test Post" via Keystatic
→ Wait for Vercel to rebuild
→ Check https://yoursite.com/en/blog/test-post
→ Should display new post!

# 5. Edit post
→ Update content via Keystatic
→ Wait for rebuild
→ Verify changes live

# 6. Check Git history
git log
→ Should see Keystatic commits
```

---

## 🆚 Local vs Production Comparison

| Aspect | Local (Development) | Production |
|--------|---------------------|------------|
| **Storage** | `kind: 'local'` | `kind: 'github'` |
| **Keystatic** | Direct file editing | GitHub API via OAuth |
| **Git** | Manual commits (`git commit`) | Auto commits by Keystatic |
| **Deploy** | Manual (`pnpm dev`) | Auto by Vercel on commit |
| **URL** | `localhost:5006` | `yoursite.com` |
| **Authentication** | None | GitHub OAuth required |

---

## 💡 Advanced: Branch-based workflows

**Optional: Use branches for draft posts**

```tsx
// keystatic.config.tsx
export default config({
  storage: {
    kind: 'github',
    repo: {
      owner: 'sonpx98',
      name: 'microservice-research'
    },
    branchPrefix: 'keystatic/'  // Creates branches for each change
  }
});
```

**Workflow:**
```
1. Edit post via Keystatic
2. Keystatic creates branch: keystatic/update-post-123
3. Creates Pull Request to main
4. You review PR on GitHub
5. Merge → Vercel deploys
```

**Benefit:** Review content before publishing!

---

## 🐛 Common Issues & Solutions

### Issue 1: "GitHub OAuth failed"

**Cause:** Wrong callback URL

**Solution:**
```
OAuth App settings → Authorization callback URL:
Must be: https://yoursite.com/api/keystatic/github/oauth/callback
         ^^^^^^^^^^^^^^^^^ (exact domain)
```

---

### Issue 2: "Permission denied" when saving

**Cause:** GitHub user doesn't have write access

**Solution:**
```bash
# On GitHub repo:
Settings → Collaborators → Add user
OR
Make repo public and give OAuth app write permissions
```

---

### Issue 3: Vercel không rebuild sau khi edit

**Cause:** Webhook not configured

**Solution:**
```
Vercel Dashboard → Your Project → Settings → Git
→ Check "Deploy Hooks" enabled
→ Or redeploy manually first time
```

---

### Issue 4: Content không update sau deploy

**Cause:** Browser cache

**Solution:**
```bash
# Hard refresh
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R

# Or check deployment logs
Vercel → Deployments → View logs
→ Ensure contentlayer processed files
```

---

## 📊 Cost Breakdown (Free Tier)

| Service | Cost | Limits |
|---------|------|--------|
| **GitHub** | $0 | Unlimited public repos |
| **Vercel** | $0 | 100GB bandwidth/month |
| **Keystatic** | $0 | Open source, self-hosted |
| **Total** | **$0/month** | Perfect for personal blog |

---

## 🎓 Key Concepts Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    GIT-BASED BLOG ARCHITECTURE                   │
│                                                                  │
│  Markdown Files (content/posts/)                                 │
│       ↓                                                          │
│  Git Repository (GitHub)         ← Your "Database"              │
│       ↓                                                          │
│  Keystatic CMS (yoursite.com/keystatic) ← Your "Admin Panel"    │
│       ↓                                                          │
│  Git Commits (auto by Keystatic)                                │
│       ↓                                                          │
│  Vercel Webhook (detects commits)                               │
│       ↓                                                          │
│  Build Process:                                                  │
│    1. Contentlayer (MD → HTML)                                  │
│    2. Next.js (Static Generation)                               │
│       ↓                                                          │
│  Deploy to CDN (Vercel Edge Network)                            │
│       ↓                                                          │
│  Users see content (yoursite.com)                               │
│                                                                  │
│  Everything is FREE and SCALABLE! 🚀                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Next Steps

1. **Update keystatic config** với GitHub mode
2. **Create GitHub OAuth App**
3. **Deploy to Vercel** với environment variables
4. **Test workflow** end-to-end
5. **Write và publish** first production post!

---

## 📚 Resources

- **Keystatic Docs**: https://keystatic.com/docs/github-mode
- **Vercel Deployment**: https://vercel.com/docs
- **GitHub OAuth**: https://docs.github.com/en/apps/oauth-apps
- **Contentlayer**: https://contentlayer.dev

---

**🎉 Bây giờ bạn đã hiểu cách blog hoạt động trong production!**

Git = Database, Keystatic = CMS, Vercel = Deployment - tất cả FREE! 🚀
