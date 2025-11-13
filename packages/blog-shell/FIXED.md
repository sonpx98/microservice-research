# Blog Shell - Fixed! ✅

## 🎉 Server đang chạy

Blog của bạn đang chạy tại:
- **Home**: http://localhost:5006/en hoặc http://localhost:5006/vi
- **Blog Listing**: http://localhost:5006/en/blog
- **Keystatic CMS**: http://localhost:5006/keystatic

## 📝 Các fixes đã áp dụng

1. ✅ Fixed Next.js config (removed deprecated `swcMinify`)
2. ✅ Fixed i18n config (moved to `src/i18n/request.ts`)
3. ✅ Fixed TypeScript baseUrl warning
4. ✅ Updated to async params (Next.js 15 requirement)
5. ✅ Added missing root layout
6. ✅ Added home page for each locale
7. ✅ Fixed Contentlayer warnings

## 🚀 Quick Links

### View Blog
- English: http://localhost:5006/en/blog
- Vietnamese: http://localhost:5006/vi/blog

### Sample Posts
- http://localhost:5006/en/blog/welcome
- http://localhost:5006/en/blog/building-modern-blog
- http://localhost:5006/vi/blog/welcome
- http://localhost:5006/vi/blog/building-modern-blog

### CMS Admin
- Keystatic: http://localhost:5006/keystatic

## 📖 How to Use

### 1. View Blog Posts
Navigate to `/en/blog` or `/vi/blog` to see all posts with filtering by tags.

### 2. Create New Post via Keystatic

1. Go to http://localhost:5006/keystatic
2. Click on "Blog Posts" in sidebar
3. Click "+ Create Post"
4. Fill in:
   - **Title**: Your post title
   - **Language**: en or vi
   - **Published Date**: Pick a date
   - **Excerpt**: Short description
   - **Tags**: Add tags (one per line)
   - **Content**: Use the rich text editor
   - **Published**: Check to make post visible
5. Click "Create Post"
6. Files will be saved to `content/posts/{locale}/`

### 3. Create New Post Manually

Create file: `content/posts/en/my-new-post.mdx`

```mdx
---
title: "My New Post"
date: "2024-11-07"
excerpt: "This is a new post"
tags: ["nextjs", "react"]
published: true
locale: "en"
---

# My New Post

Write your content here with **markdown**!

## Code Example

```typescript
const hello = "world";
```
```

### 4. Edit Existing Posts

**Option A: Via Keystatic**
1. Go to /keystatic
2. Click on post in list
3. Edit and save

**Option B: Edit MDX files directly**
- Files are in `content/posts/{locale}/`
- Edit with any text editor
- Hot reload will update the site

## 🎨 Customize

### Change Theme Colors
Edit `src/app/globals.css`:
```css
@theme {
  --color-primary: #3b82f6; /* Change this */
}
```

### Add New Language
1. Add to `src/middleware.ts`:
   ```typescript
   locales: ['en', 'vi', 'ja'],
   ```
2. Create `messages/ja.json`
3. Create `content/posts/ja/` folder

## 🐛 Troubleshooting

### TypeScript Errors
Run once to generate types:
```bash
pnpm build
```

### Port Already in Use
```bash
pkill -f "next dev"
pnpm dev
```

### Clear Cache
```bash
rm -rf .next .contentlayer
pnpm dev
```

## 📦 Structure

```
blog-shell/
├── content/posts/          # Your blog posts
│   ├── en/                # English posts
│   └── vi/                # Vietnamese posts
├── src/
│   ├── app/
│   │   ├── [locale]/      # Locale routes
│   │   └── keystatic/     # CMS admin
│   └── components/        # React components
└── messages/              # Translations
```

## 🎯 Next Steps

1. **Setup Giscus Comments**
   - Go to https://giscus.app
   - Get your repo/category IDs
   - Update `src/components/blog/comment-section.tsx`

2. **Deploy to Vercel**
   - Push to GitHub
   - Import in Vercel
   - Set root directory: `packages/blog-shell`
   - Deploy!

3. **Write Content**
   - Use Keystatic CMS for easy editing
   - Or edit MDX files directly for full control

---

Enjoy your new blog! 🎊
