---
title: "Blog Architecture Guide - From A to Z"
date: "2025-11-12"
excerpt: "Complete guide explaining how this blog works from content creation to final display. Learn about Contentlayer, Markdown processing, syntax highlighting, and more."
tags: ["nextjs", "architecture", "tutorial", "contentlayer", "markdown"]
published: true
locale: "en"
---

Complete guide explaining how this blog works from content creation to final display.

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Content Flow](#content-flow)
4. [Folder Structure](#folder-structure)
5. [Step-by-Step Process](#step-by-step-process)
6. [Syntax Highlighting Explained](#syntax-highlighting-explained)
7. [Multi-language Support](#multi-language-support)
8. [Keystatic CMS Integration](#keystatic-cms-integration)
9. [Common Issues & Solutions](#common-issues--solutions)

---

## 🎯 Overview

This is a **zero-cost, git-based blog** with:
- ✅ Markdown content (simple, portable)
- ✅ Multi-language support (English/Vietnamese)
- ✅ Syntax highlighting for code blocks
- ✅ CMS for easy content management
- ✅ No database needed (Git is the database)
- ✅ Free hosting on Vercel

---

## 🛠️ Tech Stack

| Technology | Purpose | Why? |
|------------|---------|------|
| **Next.js 15** | Framework | Server-side rendering, static generation, routing |
| **Contentlayer** | Content processor | Transforms Markdown → HTML at build time |
| **Keystatic** | CMS | Beautiful UI to create/edit posts |
| **next-intl** | i18n | Multi-language routing and translations |
| **Tailwind CSS** | Styling | Typography classes for beautiful text |
| **rehype-pretty-code** | Syntax highlighting | Colors for code blocks (via Shiki) |
| **Giscus** | Comments | GitHub Discussions integration |

---

## 🔄 Content Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT CREATION                              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────┐
        │  Write Markdown (.md files)          │
        │  - Via Keystatic CMS UI              │
        │  - Or directly edit files            │
        │  Location: content/posts/en/*.md     │
        │           content/posts/vi/*.md      │
        └──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUILD TIME PROCESSING                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────┐
        │  Contentlayer reads .md files        │
        │  - Parses frontmatter (title, date)  │
        │  - Transforms Markdown → HTML        │
        │  - Applies remark/rehype plugins     │
        │  - Generates .contentlayer/          │
        └──────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────┐
        │  Markdown Transformations            │
        │  1. remark-gfm (tables, strikethrough)│
        │  2. rehype-slug (heading IDs)        │
        │  3. rehype-pretty-code (syntax hl)   │
        └──────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────┐
        │  Generated Output                    │
        │  .contentlayer/generated/Post/       │
        │  - posts__en__welcome.md.json        │
        │  - posts__vi__welcome.md.json        │
        │                                      │
        │  Each contains:                      │
        │  {                                   │
        │    title: "...",                     │
        │    date: "...",                      │
        │    body: {                           │
        │      html: "<h1>...</h1><pre>..."   │
        │    }                                 │
        │  }                                   │
        └──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RUNTIME (BROWSER)                             │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────┐
        │  User visits /en/blog/welcome        │
        └──────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────┐
        │  [slug]/page.tsx (Server Component)  │
        │  - Gets post from Contentlayer       │
        │  - Passes post.body.html to render   │
        └──────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────┐
        │  MarkdownContent component           │
        │  - Receives HTML string              │
        │  - Renders with dangerouslySetInner  │
        │  - Applies Tailwind prose classes    │
        └──────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────┐
        │  Browser displays beautiful post     │
        │  - Styled headings                   │
        │  - Colorful code blocks              │
        │  - Formatted lists, quotes           │
        └──────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
packages/blog-shell/
├── content/                          # 📝 Your blog posts
│   └── posts/
│       ├── en/                       # English posts
│       │   ├── welcome.md
│       │   └── building-modern-blog.md
│       └── vi/                       # Vietnamese posts
│           ├── welcome.md
│           └── building-modern-blog.md
│
├── .contentlayer/                    # 🔧 Generated by Contentlayer (auto)
│   └── generated/
│       └── Post/
│           ├── posts__en__welcome.md.json
│           └── posts__vi__welcome.md.json
│
├── src/
│   ├── app/
│   │   ├── globals.css              # 🎨 Global styles + syntax highlighting
│   │   ├── layout.tsx               # Root layout
│   │   │
│   │   ├── [locale]/                # 🌍 i18n routing
│   │   │   ├── layout.tsx           # Locale-specific layout
│   │   │   ├── page.tsx             # Home page
│   │   │   └── blog/
│   │   │       ├── page.tsx         # Blog listing (/en/blog)
│   │   │       └── [slug]/
│   │   │           └── page.tsx     # Individual post (/en/blog/welcome)
│   │   │
│   │   ├── api/
│   │   │   └── keystatic/           # Keystatic API routes
│   │   │
│   │   └── keystatic/               # 🎛️ Keystatic CMS UI
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       └── [...params]/page.tsx
│   │
│   ├── components/
│   │   ├── mdx-content.tsx          # Renders Markdown HTML
│   │   └── blog/
│   │       ├── post-card.tsx        # Blog post preview card
│   │       ├── post-list.tsx        # Grid of post cards
│   │       └── comment-section.tsx  # Giscus comments
│   │
│   ├── lib/
│   │   └── posts.ts                 # Helper functions (getAllPosts, etc.)
│   │
│   └── i18n/
│       └── request.ts               # next-intl configuration
│
├── messages/                         # 🌐 Translations
│   ├── en.json
│   └── vi.json
│
├── contentlayer.config.ts           # ⚙️ Contentlayer configuration
├── keystatic.config.tsx             # ⚙️ Keystatic CMS configuration
├── next.config.mjs                  # ⚙️ Next.js configuration
└── package.json                     # Dependencies
```

---

## 🔢 Step-by-Step Process

### 1️⃣ **Write Content**

**Option A: Via Keystatic CMS (Recommended)**
```
1. Start dev server: pnpm dev
2. Go to: http://localhost:5006/keystatic
3. Click "Blog Posts (English)" or "Blog Posts (Tiếng Việt)"
4. Click "Create Blog Post"
5. Fill form:
   - Title: "My First Post"
   - Date: Today
   - Excerpt: Short description
   - Tags: nextjs, typescript
   - Published: ✓ Check
   - Content: Write Markdown
6. Click "Create Blog Post"
7. File saved to: content/posts/en/my-first-post.md
```

**Option B: Manual File Creation**
```markdown
---
title: "My First Post"
date: "2025-11-12"
excerpt: "This is my first blog post"
tags: ["nextjs", "typescript"]
published: true
locale: "en"
---

# Welcome to My Blog

This is **bold** text and this is *italic*.

## Code Example

```typescript
const greeting: string = "Hello World!";
console.log(greeting);
```

## Lists

- Item 1
- Item 2
- Item 3
```

Save to: `content/posts/en/my-first-post.md`

---

### 2️⃣ **Contentlayer Processing** (Automatic)

When you save a file or start the dev server:

```bash
# Contentlayer watches for changes
Contentlayer config change detected. Updating type definitions and data...
Generated 4 documents in .contentlayer
```

**What happens:**
1. Reads `content/posts/**/*.md`
2. Parses frontmatter (YAML between `---`)
3. Transforms Markdown body → HTML
4. Applies plugins:
   - `remark-gfm`: Tables, strikethrough, task lists
   - `rehype-slug`: Adds IDs to headings (`<h1 id="welcome-to-my-blog">`)
   - `rehype-pretty-code`: Syntax highlighting for code blocks
5. Saves to `.contentlayer/generated/Post/*.json`

**Generated JSON Example:**
```json
{
  "title": "My First Post",
  "date": "2025-11-12T00:00:00.000Z",
  "excerpt": "This is my first blog post",
  "tags": ["nextjs", "typescript"],
  "published": true,
  "locale": "en",
  "slug": "my-first-post",
  "url": "/en/blog/my-first-post",
  "body": {
    "html": "<h1 id=\"welcome-to-my-blog\">Welcome...</h1>"
  }
}
```

---

### 3️⃣ **Display on Website**

**Blog Listing Page** (`/en/blog`):
```tsx
// src/app/[locale]/blog/page.tsx
const posts = getAllPosts(locale);  // Gets all posts for 'en'

return (
  <PostList posts={posts} tags={allTags} />
);
```

**Individual Post Page** (`/en/blog/my-first-post`):
```tsx
// src/app/[locale]/blog/[slug]/page.tsx
const post = getPostBySlug('my-first-post', 'en');

return (
  <article>
    <h1>{post.title}</h1>
    <time>{post.date}</time>
    <MarkdownContent html={post.body.html} />
  </article>
);
```

**Render HTML:**
```tsx
// src/components/mdx-content.tsx
export function MarkdownContent({ html }) {
  return (
    <div 
      className="prose prose-lg max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

---

## 🎨 Syntax Highlighting Explained

### How Code Blocks Get Colors

**1. You write Markdown:**
````markdown
```typescript
const hello: string = "world";
```
````

**2. Contentlayer processes with rehype-pretty-code:**
```typescript
// contentlayer.config.ts
rehypePlugins: [
  [
    rehypePrettyCode,
    {
      theme: {
        dark: 'github-dark',
        light: 'github-light',
      },
      keepBackground: true,
    },
  ],
]
```

**3. Generated HTML with CSS variables:**
```html
<figure data-rehype-pretty-code-figure>
  <pre 
    style="--shiki-dark:#e1e4e8;--shiki-light:#24292e;--shiki-dark-bg:#24292e;--shiki-light-bg:#fff" 
    data-language="typescript"
  >
    <code>
      <span data-line>
        <span style="--shiki-dark:#ff7b72;--shiki-light:#d73a49">const</span>
        <span style="--shiki-dark:#79c0ff;--shiki-light:#005cc5"> hello</span>
        <span style="--shiki-dark:#ff7b72;--shiki-light:#d73a49">:</span>
        <span style="--shiki-dark:#79c0ff;--shiki-light:#005cc5"> string</span>
        <span style="--shiki-dark:#ff7b72;--shiki-light:#d73a49"> =</span>
        <span style="--shiki-dark:#a5d6ff;--shiki-light:#032f62"> "world"</span>
        <span style="--shiki-dark:#c9d1d9;--shiki-light:#24292e">;</span>
      </span>
    </code>
  </pre>
</figure>
```

**4. CSS applies colors based on theme:**
```css
/* globals.css */

/* Light mode */
html:not(.dark) [data-rehype-pretty-code-figure] code span {
  color: var(--shiki-light) !important;
}

/* Dark mode */
html.dark [data-rehype-pretty-code-figure] code span {
  color: var(--shiki-dark) !important;
}
```

**5. Result:**
- **Light mode:** Uses `--shiki-light` colors (GitHub Light theme)
- **Dark mode:** Uses `--shiki-dark` colors (GitHub Dark theme)
- **Automatic switching:** Based on `html.dark` class

---

### Supported Languages

rehype-pretty-code supports 100+ languages:

- `typescript`, `javascript`, `tsx`, `jsx`
- `python`, `java`, `go`, `rust`
- `html`, `css`, `scss`, `json`
- `bash`, `shell`, `markdown`
- `sql`, `graphql`, `yaml`
- And many more!

**Usage:**
````markdown
```python
def hello():
    print("Hello World!")
```
````

---

## 🌍 Multi-language Support

### How it works:

**1. Folder Structure:**
```
content/posts/
├── en/          # English posts
│   └── welcome.md
└── vi/          # Vietnamese posts
    └── welcome.md
```

**2. Frontmatter specifies locale:**
```yaml
---
locale: "en"    # or "vi"
---
```

**3. Contentlayer filters by locale:**
```typescript
// src/lib/posts.ts
export function getAllPosts(locale: string) {
  return allPosts
    .filter(post => post.locale === locale)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
```

**4. Routing:**
```
/en/blog          → English blog listing
/en/blog/welcome  → English post
/vi/blog          → Vietnamese blog listing
/vi/blog/welcome  → Vietnamese post
```

**5. Middleware handles language switching:**
```typescript
// src/middleware.ts
export default createMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'en',
});
```

**6. Translations:**
```json
// messages/en.json
{
  "blog": {
    "title": "Blog",
    "allPosts": "All Posts"
  }
}

// messages/vi.json
{
  "blog": {
    "title": "Blog",
    "allPosts": "Tất cả bài viết"
  }
}
```

---

## 🎛️ Keystatic CMS Integration

### Configuration:

```tsx
// keystatic.config.tsx
export default config({
  storage: { kind: 'local' },  // Or 'github' for production
  collections: {
    postsEn: collection({
      label: 'Blog Posts (English)',
      path: 'content/posts/en/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({ label: 'Published Date' }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true }),
        tags: fields.array(fields.text({ label: 'Tag' })),
        published: fields.checkbox({ label: 'Published' }),
        content: fields.markdoc({ label: 'Content', extension: 'md' })
      }
    }),
    postsVi: collection({
      // Same structure for Vietnamese
    })
  }
});
```

### How to use:

1. **Access CMS:**
   ```
   http://localhost:5006/keystatic
   ```

2. **Collections:**
   - Blog Posts (English)
   - Blog Posts (Tiếng Việt)

3. **Create Post:**
   - Click collection → "Create Blog Post"
   - Fill form (title, date, excerpt, tags, content)
   - Click "Create"
   - File saved to `content/posts/{locale}/{slug}.md`

4. **Edit Post:**
   - Click post from list
   - Edit content in Markdown editor
   - Click "Save"
   - File updated in Git

5. **Local vs GitHub mode:**
   - **Local:** Changes saved directly to files (manual Git commit)
   - **GitHub:** Keystatic auto-commits to repository

---

## 🐛 Common Issues & Solutions

### Issue 1: Code blocks not showing colors

**Symptoms:**
- Code blocks appear but no syntax highlighting
- All text is one color

**Solution:**
```bash
# 1. Clean build cache
rm -rf .contentlayer .next

# 2. Restart dev server
pnpm dev

# 3. Check globals.css has Shiki styles
# See: "Syntax Highlighting Explained" section above
```

---

### Issue 2: Posts not appearing

**Checklist:**
- ✅ File in correct location? `content/posts/{locale}/*.md`
- ✅ Frontmatter has `published: true`?
- ✅ Frontmatter has correct `locale: "en"` or `locale: "vi"`?
- ✅ Contentlayer generated? Check `.contentlayer/generated/Post/`

**Debug:**
```typescript
// Check what Contentlayer sees
import { allPosts } from 'contentlayer/generated';
console.log('All posts:', allPosts);
```

---

### Issue 3: Keystatic 404 error

**Solution:**
```typescript
// src/middleware.ts - Must exclude /keystatic
export const config = {
  matcher: [
    '/((?!api|keystatic|_next|_vercel|.*\\..*).*)',
  ]
};
```

---

### Issue 4: Card heights uneven

**Solution:**
```tsx
// post-list.tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">

// post-card.tsx
<Link href={post.url} className="h-full">
  <Card className="h-full flex flex-col">
    <CardContent className="flex-1 flex flex-col">
      <p className="line-clamp-3 flex-1">{post.excerpt}</p>
    </CardContent>
  </Card>
</Link>
```

---

### Issue 5: Styles not updating

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Hard refresh browser
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

---

## 🚀 Deployment Checklist

### Before deploying to Vercel:

1. **Update Keystatic for GitHub mode:**
```tsx
// keystatic.config.tsx
storage: 
  process.env.NODE_ENV === 'production'
    ? { 
        kind: 'github',
        repo: { 
          owner: 'sonpx98', 
          name: 'microservice-research' 
        }
      }
    : { kind: 'local' }
```

2. **Setup Giscus:**
   - Go to https://giscus.app
   - Enable GitHub Discussions in repo
   - Get repo ID and category ID
   - Update `src/components/blog/comment-section.tsx`

3. **Vercel Environment Variables:**
   ```
   NODE_ENV=production
   ```

4. **Build test locally:**
   ```bash
   pnpm build
   pnpm start
   ```

5. **Deploy:**
   ```bash
   git push
   # Vercel auto-deploys
   ```

---

## 📚 Key Concepts Summary

| Concept | What it does | Where it happens |
|---------|-------------|------------------|
| **Markdown** | Simple text format | `content/posts/**/*.md` |
| **Frontmatter** | Post metadata (title, date, tags) | Top of .md files |
| **Contentlayer** | Transforms MD → HTML | Build time |
| **rehype-pretty-code** | Adds syntax highlighting | Build time (Contentlayer) |
| **Shiki** | Provides color themes | Embedded in HTML |
| **Tailwind Prose** | Styles HTML elements | Runtime (CSS) |
| **next-intl** | Multi-language routing | Runtime |
| **Keystatic** | CMS interface | Development & Production |

---

## 🎓 Learning Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Contentlayer:** https://contentlayer.dev
- **Keystatic:** https://keystatic.com
- **rehype-pretty-code:** https://rehype-pretty-code.netlify.app
- **Tailwind Typography:** https://tailwindcss.com/docs/typography-plugin
- **next-intl:** https://next-intl-docs.vercel.app

---

## ✨ Final Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR BLOG                                │
│                                                                  │
│  Content (Markdown)                                              │
│       ↓                                                          │
│  Contentlayer (Build)                                            │
│       ↓                                                          │
│  Generated JSON with HTML                                        │
│       ↓                                                          │
│  Next.js Pages (Runtime)                                         │
│       ↓                                                          │
│  Browser (Beautiful Display)                                     │
│                                                                  │
│  Tools:                                                          │
│  - Keystatic (Create/Edit)                                       │
│  - next-intl (Multi-language)                                    │
│  - Giscus (Comments)                                             │
│  - Vercel (Hosting)                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

**🎉 You now understand the complete blog architecture!**

Any questions? Check the sections above or ask for clarification.

Happy blogging! 📝✨
