# How Content Loading Works - Chi tiết từng bước

## 🎯 TL;DR

**Content được lấy KHI BUILD, KHÔNG PHẢI KHI RUNTIME!**

```
Build Time (Vercel):
├── Git clone repo → Có .md files locally
├── Contentlayer đọc .md files từ disk
├── Transform → HTML
└── Next.js pre-render tất cả pages

Runtime (User visit):
└── Serve HTML đã build sẵn (ZERO API calls!)
```

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUILD TIME (Vercel Server)                    │
└─────────────────────────────────────────────────────────────────┘

Step 1: Clone Repository
┌──────────────────────────────────────┐
│  $ git clone https://github.com/     │
│    sonpx98/microservice-research.git │
│                                      │
│  Result:                             │
│  /vercel/workspace/                  │
│  ├── packages/                       │
│  │   └── blog-shell/                 │
│  │       ├── content/                │
│  │       │   └── posts/              │
│  │       │       ├── en/             │
│  │       │       │   ├── welcome.md  │ ← FILES ON DISK!
│  │       │       │   └── post2.md    │
│  │       │       └── vi/             │
│  │       │           └── welcome.md  │
│  │       └── src/                    │
└──────────────────────────────────────┘
                  │
                  ▼
Step 2: Contentlayer Reads Files (Node.js fs module)
┌──────────────────────────────────────┐
│  // contentlayer.config.ts           │
│  export default makeSource({         │
│    contentDirPath: 'content/posts',  │ ← Read from DISK
│    documentTypes: [Post]             │
│  });                                 │
│                                      │
│  Contentlayer does:                  │
│  const files = fs.readdirSync(       │
│    'content/posts/en'                │ ← fs.readdirSync (NOT API!)
│  );                                  │
│                                      │
│  files.forEach(file => {             │
│    const content = fs.readFileSync(  │
│      `content/posts/en/${file}`      │ ← fs.readFileSync (NOT API!)
│    );                                │
│    processMarkdown(content);         │
│  });                                 │
└──────────────────────────────────────┘
                  │
                  ▼
Step 3: Transform Markdown → JSON
┌──────────────────────────────────────┐
│  Input: welcome.md                   │
│  ---                                 │
│  title: "Welcome"                    │
│  ---                                 │
│  # Hello World                       │
│                                      │
│          ↓ (remark/rehype)           │
│                                      │
│  Output: .contentlayer/generated/    │
│          Post/                       │
│          posts__en__welcome.md.json  │
│  {                                   │
│    "title": "Welcome",               │
│    "body": {                         │
│      "html": "<h1>Hello World</h1>"  │ ← HTML string
│    }                                 │
│  }                                   │
└──────────────────────────────────────┘
                  │
                  ▼
Step 4: Next.js Static Generation
┌──────────────────────────────────────┐
│  // src/app/[locale]/blog/           │
│  //   [slug]/page.tsx                │
│                                      │
│  export async function               │
│  generateStaticParams() {            │
│    const posts = allPosts;           │ ← Import from .contentlayer/
│    return posts.map(post => ({       │    (local files, NO API!)
│      slug: post.slug                 │
│    }));                              │
│  }                                   │
│                                      │
│  For each post:                      │
│  ├── /en/blog/welcome                │
│  │   → Pre-render HTML               │
│  ├── /en/blog/post2                  │
│  │   → Pre-render HTML               │
│  └── /vi/blog/welcome                │
│      → Pre-render HTML               │
│                                      │
│  Output: .next/server/pages/         │
│  ├── en/blog/welcome.html            │ ← Complete HTML!
│  ├── en/blog/post2.html              │
│  └── vi/blog/welcome.html            │
└──────────────────────────────────────┘
                  │
                  ▼
Step 5: Deploy to CDN
┌──────────────────────────────────────┐
│  Vercel uploads .next/ to CDN:       │
│                                      │
│  CDN Edge Servers (Global):          │
│  ├── us-east-1/                      │
│  │   ├── welcome.html                │
│  │   └── post2.html                  │
│  ├── europe-west1/                   │
│  │   ├── welcome.html                │
│  │   └── post2.html                  │
│  └── asia-southeast1/                │
│      ├── welcome.html                │
│      └── post2.html                  │
│                                      │
│  All HTML files cached on edge! ⚡    │
└──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    RUNTIME (User Browser)                        │
└─────────────────────────────────────────────────────────────────┘

User visits: https://yoursite.com/en/blog/welcome
                  │
                  ▼
┌──────────────────────────────────────┐
│  Request hits CDN Edge Server        │
│  (nearest to user)                   │
│                                      │
│  Edge Server:                        │
│  "I have welcome.html cached!"       │
│                                      │
│  ✅ NO GitHub API call               │
│  ✅ NO Database query                │
│  ✅ NO Markdown parsing              │
│  ✅ Just serve cached HTML           │
└──────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────┐
│  Response:                           │
│  HTTP 200 OK                         │
│  Content-Type: text/html             │
│  Cache-Control: public, max-age=0    │
│                                      │
│  <html>                              │
│    <body>                            │
│      <article>                       │
│        <h1>Welcome</h1>              │
│        <p>Content here...</p>        │
│      </article>                      │
│    </body>                           │
│  </html>                             │
│                                      │
│  Response time: ~10-50ms ⚡          │
└──────────────────────────────────────┘
```

---

## 🔍 Code Examples

### 1. Contentlayer đọc files như thế nào?

```typescript
// contentlayer.config.ts
import { makeSource } from 'contentlayer/source-files';

export default makeSource({
  contentDirPath: 'content/posts',  // ← Folder trên disk
  documentTypes: [Post],
});

// Internally, Contentlayer does:
import fs from 'fs';
import path from 'path';

function getAllMarkdownFiles(dir: string) {
  // Read directory from DISK (NOT GitHub API!)
  const files = fs.readdirSync(dir);
  
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(dir, file);
      
      // Read file content from DISK
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Parse frontmatter and markdown
      return parseMarkdown(content);
    });
}

// This runs during BUILD, when files are LOCAL on Vercel server
```

---

### 2. Next.js lấy data từ đâu?

```typescript
// src/app/[locale]/blog/[slug]/page.tsx

// ❌ KHÔNG có API call như thế này:
async function getPost(slug: string) {
  const response = await fetch(
    `https://api.github.com/repos/sonpx98/microservice-research/contents/...`
  );
  // NO! This doesn't happen!
}

// ✅ Thực tế là import local files:
import { allPosts } from 'contentlayer/generated';
//      ^^^^^^^^ This is from .contentlayer/generated/index.mjs
//               Which is a LOCAL file built during `contentlayer build`

export default function PostPage({ params }: { params: { slug: string } }) {
  // Find post from IN-MEMORY array (already loaded)
  const post = allPosts.find(p => p.slug === params.slug);
  
  // post.body.html is a STRING already processed during build
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.body.html }} />
    </article>
  );
}

// generateStaticParams runs during BUILD
export async function generateStaticParams() {
  // allPosts is already in memory, no I/O needed
  return allPosts.map(post => ({ slug: post.slug }));
}
```

---

### 3. Build output là gì?

```bash
# After `next build`:

.next/server/app/
├── en/
│   └── blog/
│       ├── page.html                    # Blog listing
│       └── [slug]/
│           ├── welcome.html             # ← Complete HTML!
│           │   <html>
│           │     <body>
│           │       <h1>Welcome</h1>     # Already rendered!
│           │       <p>Content...</p>
│           │     </body>
│           │   </html>
│           │
│           └── post2.html
│               <html>...</html>         # Also pre-rendered!
│
└── vi/
    └── blog/
        └── [slug]/
            └── welcome.html

# NO .md files in production build!
# Only HTML, CSS, JS
```

---

## 🚀 Performance Comparison

### Traditional CMS (e.g., WordPress):

```
User Request → CDN → Origin Server
                        ↓
                   PHP queries MySQL
                        ↓
                   Fetch post data
                        ↓
                   Render HTML
                        ↓
                   Return to user

Time: 200-500ms 🐌
Server load: High (every request hits DB)
```

### Git-based with Static Generation:

```
User Request → CDN Edge
                ↓
           Serve cached HTML
                ↓
           Return to user

Time: 10-50ms ⚡
Server load: Zero (just file serving)
```

---

## 📝 When Does GitHub API Get Used?

**Only by Keystatic during editing!**

```
┌────────────────────────────────────────────────┐
│  Keystatic CMS (yoursite.com/keystatic)        │
└────────────────────────────────────────────────┘
                    │
                    │ When you click "Save Post"
                    ▼
        ┌──────────────────────────┐
        │  Keystatic uses GitHub   │
        │  API to commit changes   │
        │                          │
        │  POST /repos/:owner/:repo│
        │       /contents/:path    │
        │                          │
        │  Body: {                 │
        │    message: "Update...", │
        │    content: base64(md)   │
        │  }                       │
        └──────────────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  GitHub commits file     │
        └──────────────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  Webhook → Vercel        │
        └──────────────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  Vercel rebuilds         │
        │  (clones repo again)     │
        └──────────────────────────┘

# Regular users visiting blog NEVER touch GitHub API!
```

---

## 🔍 Verify Yourself

### Check Network Tab:

```bash
# 1. Visit your blog:
https://yoursite.com/en/blog/welcome

# 2. Open DevTools → Network Tab

# You'll see:
GET /en/blog/welcome   200 OK   50ms   text/html   45KB
GET /_next/static/...  200 OK   20ms   text/css    5KB
GET /_next/static/...  200 OK   30ms   text/js     25KB

# NO requests to:
# ❌ https://api.github.com/...
# ❌ https://raw.githubusercontent.com/...
# ❌ Any external API

# Only static assets!
```

---

## 🎓 Key Concepts

### 1. Build Time vs Runtime

```typescript
// Build Time (Vercel server during deployment)
┌────────────────────────────────────┐
│ BUILD TIME                         │
│ - git clone (files on disk)       │
│ - fs.readFile() to read .md       │
│ - Contentlayer processes           │
│ - Next.js renders HTML             │
│ - Upload to CDN                    │
│                                    │
│ Happens: Once per deployment       │
│ Duration: 2-3 minutes              │
└────────────────────────────────────┘

// Runtime (User's browser)
┌────────────────────────────────────┐
│ RUNTIME                            │
│ - CDN serves pre-built HTML        │
│ - Browser renders                  │
│                                    │
│ Happens: Every page view           │
│ Duration: 10-50ms                  │
│ No I/O, No API calls! ⚡           │
└────────────────────────────────────┘
```

### 2. Where are files at each stage?

```
┌──────────────────────────────────────────────────────────┐
│ Location of Content at Different Stages                  │
└──────────────────────────────────────────────────────────┘

Stage 1: Development (Local)
├── Your Computer
│   └── /Users/aeronpham/personal/microservice-research/
│       └── packages/blog-shell/content/posts/
│           ├── en/welcome.md  ← File on YOUR disk
│           └── vi/welcome.md

Stage 2: Git Repository
├── GitHub Servers (git storage)
│   └── sonpx98/microservice-research
│       └── packages/blog-shell/content/posts/
│           ├── en/welcome.md  ← Stored in Git
│           └── vi/welcome.md

Stage 3: Build (Vercel Build Server)
├── Vercel Build Container (temporary)
│   └── /vercel/workspace/  ← git clone into here
│       └── packages/blog-shell/
│           ├── content/posts/
│           │   ├── en/welcome.md  ← Clone from GitHub
│           │   └── vi/welcome.md
│           └── .contentlayer/
│               └── generated/
│                   └── Post/
│                       └── *.json  ← Transformed
│
│   Then Next.js reads from .contentlayer/ (IN MEMORY)
│   and generates HTML files

Stage 4: Production (CDN Edge Servers)
├── Vercel CDN (multiple locations worldwide)
│   ├── us-east-1/
│   │   └── en/blog/welcome.html  ← Pre-rendered HTML
│   ├── europe-west1/
│   │   └── en/blog/welcome.html  ← Same HTML, cached
│   └── asia-southeast1/
│       └── en/blog/welcome.html  ← Same HTML, cached
│
│   NO .md files here!
│   Only HTML, CSS, JavaScript

Stage 5: User's Browser
├── Downloaded HTML (from nearest CDN)
│   └── DOM rendered on screen
│
│   User never sees or downloads .md files!
```

---

## ⚡ Why This is FAST

### 1. Zero Database Queries

```
Traditional CMS:       Git-based Static:
User request           User request
    ↓                      ↓
CDN miss               CDN hit ✅
    ↓                      ↓
Origin server          Return HTML (10ms)
    ↓                      
SQL query              # Done!
    ↓
Render PHP
    ↓
Return HTML (300ms)
```

### 2. Global CDN Caching

```
User in Vietnam → Asia CDN (10ms)
User in USA → US CDN (10ms)
User in Europe → EU CDN (10ms)

All get same performance!
No database bottleneck!
```

### 3. Immutable Builds

```
Build once → Cache forever

When you edit content:
- New build triggered
- Old HTML replaced
- CDN cache invalidated
- New HTML served

Users always get latest version!
```

---

## 🛠️ Debugging: Check What's Happening

### During Build:

```bash
# In Vercel deployment logs:

Running "git clone"
Cloning into '/vercel/workspace'...
✓ Repository cloned

Running "pnpm install"
✓ Dependencies installed

Running "contentlayer build"
Processing content/posts/en/welcome.md...    ← Reading from DISK
Processing content/posts/vi/welcome.md...    ← Reading from DISK
Generated 2 documents in .contentlayer       ← Transform complete

Running "next build"
○ Static page generated: /en/blog/welcome    ← Pre-render
○ Static page generated: /vi/blog/welcome    ← Pre-render
✓ Build completed
```

### During Runtime:

```bash
# Check CDN behavior:
curl -I https://yoursite.com/en/blog/welcome

HTTP/2 200
content-type: text/html; charset=utf-8
x-vercel-cache: HIT                    ← Served from CDN cache!
age: 3600                              ← Cached 1 hour ago
cache-control: public, max-age=0, must-revalidate

# No origin server hit!
# No database!
# No file I/O!
```

---

## 📊 Summary Table

| Question | Answer |
|----------|--------|
| **Khi user visit blog, có call GitHub API không?** | ❌ KHÔNG |
| **Khi nào .md files được đọc?** | ⏱️ BUILD TIME (Vercel server) |
| **Dùng gì để đọc .md files?** | 📁 Node.js `fs` module (local disk) |
| **Runtime có I/O operations không?** | ❌ KHÔNG - chỉ serve HTML có sẵn |
| **Performance?** | ⚡ ~10-50ms (CDN cache) |
| **Scalability?** | 🚀 Unlimited (static files on CDN) |
| **Cost?** | 💰 $0 (Vercel free tier) |

---

## 🎯 Mental Model

Think of it like this:

```
Git-based Static Site = Publishing a Book

Writing stage (Keystatic):
├── You write content (markdown)
└── Save to Git (like saving manuscript)

Publishing stage (Vercel Build):
├── Take manuscript
├── Typeset and design (Contentlayer + Next.js)
├── Print thousands of copies (HTML files)
└── Distribute to bookstores globally (CDN)

Reading stage (Users):
├── Walk into bookstore (CDN edge)
├── Pick up book (cached HTML)
└── Start reading instantly!

# No one calls the author every time they want to read!
# The book is ALREADY PRINTED and DISTRIBUTED!
```

---

## 🚀 Conclusion

**Content flow:**
```
Git (storage) 
  → Build time (transform to HTML) 
    → CDN (serve HTML)
      → Users (instant delivery)

NO runtime API calls!
NO runtime file reading!
NO runtime markdown processing!

Everything pre-built! ⚡
```

This is why JAMstack (JavaScript, APIs, Markup) is so fast! 🚀
