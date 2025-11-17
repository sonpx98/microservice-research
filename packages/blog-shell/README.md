# Blog Shell - Next.js 15 Personal Blog

A modern, zero-cost personal blog built with Next.js 15, MDX, and Git-based CMS.

---

## 📚 Documentation Index

### **🚀 Getting Started:**
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide (if exists)
- **[HOW_CONTENT_LOADING_WORKS.md](./HOW_CONTENT_LOADING_WORKS.md)** - How Contentlayer loads content at build time

### **📈 Scalability Guides:**
- **[CONTENT_STRATEGY_SUMMARY.md](./CONTENT_STRATEGY_SUMMARY.md)** - 📋 **START HERE!** Quick summary & recommendations
- **[MARKDOWN_SCALABILITY_ANALYSIS.md](./MARKDOWN_SCALABILITY_ANALYSIS.md)** - Limitations when scaling > 1000 posts
- **[CMS_COMPARISON.md](./CMS_COMPARISON.md)** - Compare 6 CMS solutions (Sanity, Contentful, etc.)
- **[SCALABILITY_VISUAL_GUIDE.md](./SCALABILITY_VISUAL_GUIDE.md)** - Visual graphs & comparisons

### **🎨 Features:**
- **[PAGINATION_GUIDE.md](./PAGINATION_GUIDE.md)** - Client-side pagination implementation
- **[KEYSTATIC-GUIDE.md](./KEYSTATIC-GUIDE.md)** - Keystatic CMS usage guide

### **🚢 Deployment:**
- **[MULTI_ZONE_SETUP.md](./MULTI_ZONE_SETUP.md)** - Multi-zone with keystatic-admin
- **[PRODUCTION_CONTENT_WORKFLOW.md](./PRODUCTION_CONTENT_WORKFLOW.md)** - Production workflow

---

## ⚡ Current State

### **✅ Optimal for < 500 posts**
Your current Markdown + Contentlayer setup is **PERFECT** for:
- Small to medium blogs (< 500 posts)
- Infrequent updates (< 5 posts/week)
- 1-2 authors
- Zero budget
- Git-based workflow

### **⚠️ When to Consider Migration:**

| Posts | Build Time | Bundle Size | Status | Action |
|-------|------------|-------------|--------|--------|
| < 200 | < 20s | < 500KB | 🟢 Optimal | Keep Markdown |
| 200-500 | 20-60s | 500KB-1MB | 🟡 Warning | Plan migration |
| > 500 | > 60s | > 1MB | 🔴 Critical | Migrate to CMS |

**Read:** [CONTENT_STRATEGY_SUMMARY.md](./CONTENT_STRATEGY_SUMMARY.md) for migration roadmap.

---

## Features

- ✅ **Next.js 15** with App Router
- ✅ **Multi-language** support (English & Vietnamese)
- ✅ **MDX** for rich content with React components
- ✅ **Keystatic CMS** - Git-based content management
- ✅ **Giscus Comments** - GitHub Discussions powered
- ✅ **TailwindCSS v4** with prefix pattern
- ✅ **TypeScript** for type safety
- ✅ **Zero Cost** - No database, no external services
- ✅ **SEO Optimized** - Static generation
- ✅ **Dark Mode** support

## Architecture

### Content Management
- **Storage**: MDX files in `content/posts/{locale}/` directory
- **CMS**: Keystatic provides a visual editor that commits to Git
- **Versioning**: Git history for all content changes
- **No Database**: Everything is file-based

### Comments System
- **Giscus**: GitHub Discussions integration
- **Anonymous**: Users comment via GitHub (can be anonymous)
- **Free**: No cost, no ads
- **Moderation**: Managed through GitHub Discussions

### Multi-language
- **next-intl**: Locale routing and translations
- **Structure**: Separate content files for each language
- **URLs**: `/{locale}/blog/{slug}` pattern

## Getting Started

### Installation

```bash
cd packages/blog-shell
pnpm install
```

### Development

```bash
pnpm dev
```

Blog will be available at:
- English: http://localhost:5006/en/blog
- Vietnamese: http://localhost:5006/vi/blog

### CMS Access

Access Keystatic CMS at: http://localhost:5006/keystatic

## Project Structure

```
blog-shell/
├── content/
│   └── posts/
│       ├── en/              # English posts
│       │   ├── welcome.mdx
│       │   └── ...
│       └── vi/              # Vietnamese posts
│           ├── welcome.mdx
│           └── ...
├── src/
│   ├── app/
│   │   ├── [locale]/        # Locale routing
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx           # Blog listing
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx       # Post detail
│   │   │   └── layout.tsx
│   │   ├── keystatic/       # CMS routes
│   │   │   └── [...params]/
│   │   └── api/
│   │       └── keystatic/   # CMS API
│   ├── components/
│   │   ├── blog/
│   │   │   ├── post-card.tsx
│   │   │   ├── post-list.tsx
│   │   │   └── comment-section.tsx
│   │   ├── ui/              # shadcn/ui components
│   │   └── mdx-components.tsx
│   ├── lib/
│   │   ├── posts.ts         # Post utilities
│   │   └── utils.ts
│   └── i18n.ts              # i18n config
├── messages/
│   ├── en.json              # English translations
│   └── vi.json              # Vietnamese translations
├── contentlayer.config.ts   # Content transformation
├── keystatic.config.tsx     # CMS configuration
└── next.config.mjs
```

## Workflow

### 1. Writing Posts

#### Option A: Using Keystatic CMS (Recommended)

1. Start dev server: `pnpm dev`
2. Open CMS: http://localhost:5006/keystatic
3. Click "Create Post"
4. Fill in details:
   - Title
   - Language (en/vi)
   - Date
   - Excerpt
   - Tags
   - Content (WYSIWYG editor)
5. Save (commits to Git automatically)

#### Option B: Manual MDX Files

1. Create file: `content/posts/{locale}/{slug}.mdx`
2. Add frontmatter:

```mdx
---
title: "Your Post Title"
date: "2024-11-07"
excerpt: "Brief description"
tags: ["tag1", "tag2"]
published: true
locale: "en"
---

# Your Content Here

Write your post content with **markdown** and React components!
```

3. Commit and push

### 2. Adding Components to Posts

Create custom React components in MDX:

```mdx
import { CustomAlert } from '@/components/custom-alert';

# My Post

<CustomAlert type="info">
  This is a custom component inside MDX!
</CustomAlert>
```

### 3. Managing Comments

Comments are managed via GitHub Discussions:

1. Go to your repo's Discussions tab
2. Enable Discussions if not enabled
3. Create a "Blog Comments" category
4. Update `comment-section.tsx` with your repo details:

```tsx
<Giscus
  repo="your-username/your-repo"
  repoId="YOUR_REPO_ID"
  category="Blog Comments"
  categoryId="YOUR_CATEGORY_ID"
  // ... other props
/>
```

**Get your IDs**: https://giscus.app/

### 4. Deployment

#### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure:
   - Root directory: `packages/blog-shell`
   - Build command: `pnpm build`
   - Output directory: `.next`
4. Deploy!

#### Environment Variables

For production, add to Vercel:

```env
NODE_ENV=production
```

Keystatic will automatically switch to GitHub mode in production.

### 5. Adding New Languages

1. Add locale to `src/i18n.ts`:

```typescript
const locales = ['en', 'vi', 'ja']; // Add 'ja'
```

2. Create translations: `messages/ja.json`
3. Create content directory: `content/posts/ja/`
4. Update `keystatic.config.tsx`:

```typescript
locale: fields.select({
  label: 'Language',
  options: [
    { label: 'English', value: 'en' },
    { label: 'Tiếng Việt', value: 'vi' },
    { label: '日本語', value: 'ja' }, // Add this
  ],
  defaultValue: 'en'
}),
```

## Customization

### Theme Colors

Edit `src/app/globals.css`:

```css
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  /* Add your colors */
}
```

### Typography

MDX components are in `src/components/mdx-components.tsx`. Customize styling there.

### Blog Layout

Edit components in `src/components/blog/`:
- `post-card.tsx` - Post preview cards
- `post-list.tsx` - Listing with filters
- `comment-section.tsx` - Comments UI

## Performance

- **Static Generation**: All pages pre-rendered at build time
- **Incremental Static Regeneration**: Update posts without rebuild
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic by Next.js
- **Edge Caching**: Via Vercel Edge Network

## SEO

Each post automatically generates:
- Meta tags (title, description)
- Open Graph tags
- Twitter Card tags
- Structured data (JSON-LD)
- Sitemap (via next-sitemap)

## Troubleshooting

### TypeScript errors after install

Run: `pnpm build` to generate Contentlayer types

### Keystatic not loading

1. Check `keystatic.config.tsx` paths
2. Ensure content directory exists
3. Restart dev server

### Comments not showing

1. Verify repo is public
2. Enable Discussions in GitHub repo settings
3. Get correct repo/category IDs from giscus.app
4. Update `comment-section.tsx`

## Tech Stack

- **Framework**: Next.js 15.0.3
- **Language**: TypeScript 5.6
- **Styling**: TailwindCSS v4
- **Content**: Contentlayer + MDX
- **CMS**: Keystatic
- **i18n**: next-intl
- **Comments**: Giscus
- **UI**: Radix UI + shadcn/ui
- **Icons**: Lucide React

## Contributing

This is a personal blog template. Feel free to fork and customize!

## License

MIT

---

Built with ❤️ using Next.js 15
