# Content Management Solutions Comparison

## 🎯 So sánh các giải pháp cho 1000+ posts

---

## 📊 Overview Table

| Solution | Best For | Cost | Build Time | Bundle Size | Realtime | Search |
|----------|----------|------|------------|-------------|----------|--------|
| **Markdown + Contentlayer** | < 500 posts | Free | O(n) slow | O(n) large | ❌ | 🔴 Limited |
| **Sanity CMS** | 500-10K posts | $0-99/mo | O(1) fast | O(1) small | ✅ | 🟢 Built-in |
| **Contentful** | Enterprise | $300+/mo | O(1) fast | O(1) small | ✅ | 🟢 Powerful |
| **Strapi (Self-hosted)** | Full control | $20/mo | O(1) fast | O(1) small | ✅ | 🟡 Custom |
| **Payload CMS** | Developer-first | $0-20/mo | O(1) fast | O(1) small | ✅ | 🟢 Built-in |
| **Database + API** | Custom needs | $20/mo | O(1) fast | O(1) small | ✅ | 🟡 Custom |
| **Notion API** | Small teams | Free-$10/mo | Slow API | Small | ✅ | 🟡 Basic |

---

## 1️⃣ **Sanity CMS** (🏆 Recommended for Scale)

### **Overview:**
- Structured content platform với realtime collaboration
- GraphQL/GROQ query language
- Customizable studio
- Excellent DX (Developer Experience)

### **Architecture:**

```
┌─────────────────────────────────────────┐
│   Sanity Studio (Admin UI)              │
│   https://your-blog.sanity.studio       │
│                                          │
│   ┌─────────────────────────────────┐   │
│   │  Rich Text Editor (Portable     │   │
│   │  Text with custom blocks)       │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  │
                  ▼ (Save via API)
┌─────────────────────────────────────────┐
│   Sanity Content Lake (Cloud)           │
│   - Versioned content                   │
│   - Real-time APIs                      │
│   - CDN for media                       │
└─────────────────────────────────────────┘
                  │
                  ▼ (Fetch via GROQ)
┌─────────────────────────────────────────┐
│   Next.js Blog (blog-shell)             │
│   - ISR (Incremental Static Regen)     │
│   - On-demand revalidation              │
└─────────────────────────────────────────┘
```

### **Setup Example:**

```bash
# Install Sanity CLI
npm install -g @sanity/cli

# Create new Sanity project
sanity init

# Install client in blog-shell
cd packages/blog-shell
pnpm add @sanity/client next-sanity
```

```typescript
// sanity/client.ts
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // for faster reads
  token: process.env.SANITY_API_TOKEN, // for writes
});
```

```typescript
// lib/posts.ts - AFTER migration
import { client } from '@/sanity/client';
import { groq } from 'next-sanity';

export async function getAllPosts(locale: string, page = 1, limit = 9) {
  const start = (page - 1) * limit;
  const end = start + limit;
  
  const query = groq`
    *[_type == "post" && locale == $locale && published == true] 
    | order(date desc) 
    [$start...$end] {
      _id,
      title,
      slug,
      date,
      excerpt,
      coverImage,
      tags,
      "readingTime": round(length(pt::text(body)) / 5 / 180)
    }
  `;
  
  return await client.fetch(query, { locale, start, end });
}

export async function getPostBySlug(slug: string, locale: string) {
  const query = groq`
    *[_type == "post" && slug.current == $slug && locale == $locale][0] {
      _id,
      title,
      slug,
      date,
      excerpt,
      coverImage,
      tags,
      body,
      "readingTime": round(length(pt::text(body)) / 5 / 180)
    }
  `;
  
  return await client.fetch(query, { slug, locale });
}
```

```tsx
// app/[locale]/blog/page.tsx
export default async function BlogPage({ 
  searchParams 
}: { 
  searchParams: { page?: string } 
}) {
  const page = Number(searchParams.page) || 1;
  const posts = await getAllPosts(locale, page, 9);
  
  return <PostList posts={posts} />;
}

// Enable ISR
export const revalidate = 60; // Revalidate every 60 seconds
```

### **Pros:**
- ✅ **Free tier:** 100K requests/month, 10GB bandwidth
- ✅ **GROQ queries:** Very powerful, like GraphQL but simpler
- ✅ **Portable Text:** Rich text format that's structured
- ✅ **Real-time collaboration:** Multiple editors at once
- ✅ **Version history:** Built-in
- ✅ **Image optimization:** Automatic with Sanity CDN
- ✅ **Webhooks:** Trigger builds on content changes
- ✅ **Fast queries:** < 100ms for most queries
- ✅ **Excellent DX:** TypeScript support, great docs

### **Cons:**
- 💰 **Paid plans:** $99/mo for 1M requests (but still cheaper than rebuild costs!)
- 🔧 **Learning curve:** GROQ query language
- 🔧 **Setup time:** Initial migration effort

### **Pricing:**
- **Free:** 100K requests, 10GB bandwidth, 3 users
- **Growth:** $99/mo for 1M requests, unlimited users
- **Business:** $949/mo for enterprise features

### **Best For:**
- ✅ 500-10,000 posts
- ✅ Multiple authors/editors
- ✅ Need realtime updates
- ✅ Media-heavy blogs

---

## 2️⃣ **Contentful**

### **Overview:**
- Enterprise-grade headless CMS
- GraphQL API
- Advanced content modeling

### **Pros:**
- ✅ Very powerful content modeling
- ✅ GraphQL API
- ✅ Enterprise features (roles, workflows)
- ✅ Great UI for non-technical users
- ✅ Excellent media management

### **Cons:**
- 💰 **Expensive:** $300+/month for meaningful usage
- 🔧 Complex setup for simple blogs
- 🔧 Slower than Sanity for reads

### **Pricing:**
- **Community:** Free (limited to 25K records, 500 users)
- **Team:** $300/mo
- **Premium:** $900+/mo

### **Best For:**
- 🏢 Enterprise teams
- 📊 Complex content relationships
- 🌍 Multi-brand/multi-site management

---

## 3️⃣ **Strapi (Self-hosted)**

### **Overview:**
- Open-source headless CMS
- Self-hosted or Strapi Cloud
- REST & GraphQL APIs

### **Setup:**

```bash
# Create Strapi project
npx create-strapi-app@latest my-blog-cms

# Start Strapi
cd my-blog-cms
npm run develop # Admin at http://localhost:1337/admin
```

### **Pros:**
- ✅ **Free & open-source**
- ✅ Full control over data
- ✅ Customizable admin panel (React-based)
- ✅ Plugin ecosystem
- ✅ REST + GraphQL APIs
- ✅ Good documentation

### **Cons:**
- 🔧 **Self-hosting:** Need to manage server, database, backups
- 🔧 **Maintenance:** Updates, security patches
- 💰 **Hosting costs:** VPS ($20-50/mo) or Strapi Cloud ($99/mo)
- ⚠️ Heavier than others (Node.js + PostgreSQL)

### **Pricing:**
- **Self-hosted:** Free (+ hosting costs)
- **Strapi Cloud:** $99-299/mo

### **Best For:**
- ✅ Full control needed
- ✅ Custom business logic
- ✅ Budget-conscious with DevOps skills
- ✅ Data sovereignty requirements

---

## 4️⃣ **Payload CMS** (🔥 Rising Star)

### **Overview:**
- Modern, TypeScript-first headless CMS
- Code-first configuration (like Prisma)
- Built with Next.js

### **Setup:**

```bash
# Create Payload project
npx create-payload-app@latest my-blog-cms

# Or integrate into existing Next.js
pnpm add payload
```

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config';

export default buildConfig({
  serverURL: 'http://localhost:3000',
  collections: [
    {
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'richText', required: true },
        { name: 'publishedAt', type: 'date' },
        { name: 'tags', type: 'text', hasMany: true },
      ],
    },
  ],
});
```

### **Pros:**
- ✅ **TypeScript-first:** Full type safety
- ✅ **Code-first:** Config in code, not UI
- ✅ **Next.js integration:** Can run in same app
- ✅ **Free & open-source**
- ✅ **Modern DX:** Very developer-friendly
- ✅ **Built-in auth & access control**
- ✅ **GraphQL + REST APIs**

### **Cons:**
- 🆕 Newer project (less mature than others)
- 📚 Smaller community
- 🔧 Self-hosting needed

### **Pricing:**
- **Self-hosted:** Free
- **Payload Cloud:** Coming soon

### **Best For:**
- ✅ TypeScript developers
- ✅ Want CMS in same codebase as blog
- ✅ Modern tech stack
- ✅ Small to medium projects

---

## 5️⃣ **Database + Custom API Routes**

### **Overview:**
- Roll your own with Prisma + PostgreSQL
- Full control, maximum flexibility

### **Setup:**

```bash
# Install Prisma
pnpm add prisma @prisma/client
npx prisma init

# Setup schema
```

```prisma
// prisma/schema.prisma
model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String   @db.Text
  excerpt     String?
  published   Boolean  @default(false)
  locale      String
  tags        String[]
  coverImage  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
  
  @@index([slug, locale])
  @@index([published, publishedAt])
}
```

```typescript
// app/api/posts/route.ts
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 9;
  const locale = searchParams.get('locale') || 'en';
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { published: true, locale },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        publishedAt: true,
      },
    }),
    prisma.post.count({
      where: { published: true, locale },
    }),
  ]);
  
  return Response.json({ posts, total, page, pages: Math.ceil(total / limit) });
}
```

### **Admin UI Options:**

#### **Option A: Keep Keystatic (Recommended)**
```typescript
// Keystatic can connect to database via custom storage adapter
// You write posts in Keystatic UI, it saves to database instead of files
```

#### **Option B: Build custom admin** (React Admin, Refine, etc.)

#### **Option C: Use Payload/Strapi as admin only**

### **Pros:**
- ✅ **Full control:** No vendor lock-in
- ✅ **Cheap:** Just database hosting ($20/mo)
- ✅ **Fast queries:** With proper indexes
- ✅ **Type-safe:** Prisma generates types
- ✅ **Flexible:** Add any feature you want

### **Cons:**
- 🔧 **DIY everything:** Auth, media upload, search, etc.
- 🔧 **No built-in admin:** Need to build or integrate
- 🔧 **Maintenance:** Database backups, migrations, etc.

### **Best For:**
- ✅ Maximum control needed
- ✅ Custom requirements
- ✅ Have DevOps skills
- ✅ Want to own all infrastructure

---

## 6️⃣ **Notion API** (🎨 Creative Solution)

### **Overview:**
- Use Notion as CMS
- Fetch content via official API

### **Setup:**

```bash
pnpm add @notionhq/client
```

```typescript
// lib/notion.ts
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function getPosts() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      property: 'Published',
      checkbox: { equals: true },
    },
    sorts: [
      { property: 'Date', direction: 'descending' },
    ],
  });
  
  return response.results;
}
```

### **Pros:**
- ✅ **Familiar UI:** Everyone knows Notion
- ✅ **Free:** For small usage
- ✅ **Easy collaboration:** Built-in comments, mentions
- ✅ **No setup:** Just create database, get API key

### **Cons:**
- 🐌 **Slow API:** 3-5 seconds per request (rate limited)
- 🔴 **Not built for this:** Notion is a productivity tool, not a CMS
- ⚠️ **Limited querying:** Basic filters only
- ⚠️ **No media CDN:** Images served from Notion (slow)
- 🔴 **Rate limits:** 3 requests/second

### **Best For:**
- 🎨 Small blogs (< 50 posts)
- 👥 Non-technical teams already using Notion
- 🧪 Prototypes/MVPs

---

## 🎯 **Decision Matrix**

### **Choose Markdown + Contentlayer if:**
```
✅ Posts < 500
✅ Infrequent updates (< 5/week)
✅ 1-2 authors
✅ Simple content structure
✅ Git workflow is OK
✅ Budget = $0
```

### **Choose Sanity if:**
```
✅ Posts 500-10,000
✅ Need realtime updates
✅ Multiple authors
✅ Budget $0-100/month
✅ Want managed service
✅ Need good search
```

### **Choose Contentful if:**
```
✅ Enterprise team
✅ Complex content relationships
✅ Multi-brand management
✅ Budget $300+/month
✅ Need enterprise features
```

### **Choose Strapi/Payload if:**
```
✅ Want open-source
✅ Need full control
✅ Have DevOps skills
✅ Custom business logic
✅ Budget $20-50/month (hosting)
```

### **Choose Database + API if:**
```
✅ Maximum flexibility needed
✅ Custom requirements
✅ Have full-stack skills
✅ Want to own everything
✅ Budget $20-50/month
```

### **Choose Notion if:**
```
✅ Posts < 50
✅ Team already uses Notion
✅ MVP/prototype
✅ Budget = $0
⚠️ Don't mind slow API
```

---

## 📊 **Performance Comparison (1000 Posts)**

| Metric | Markdown | Sanity | Contentful | Database | Notion |
|--------|----------|--------|------------|----------|--------|
| **Build Time** | 60-100s 🔴 | 10-15s ✅ | 10-15s ✅ | 10-15s ✅ | 15-20s ✅ |
| **Bundle Size** | 2MB 🔴 | 50KB ✅ | 50KB ✅ | 50KB ✅ | 50KB ✅ |
| **First Load** | 3-5s 🔴 | 0.5-1s ✅ | 0.5-1s ✅ | 0.5-1s ✅ | 3-5s 🔴 |
| **API Latency** | N/A | 50-100ms ✅ | 100-200ms 🟡 | 50-100ms ✅ | 3-5s 🔴 |
| **Search** | Client-side 🔴 | Built-in ✅ | Built-in ✅ | Custom 🟡 | Basic 🔴 |
| **Images** | Git LFS 🔴 | CDN ✅ | CDN ✅ | Custom 🟡 | Notion 🔴 |

---

## 💰 **Total Cost of Ownership (Monthly)**

### **Scenario: 1000 posts, 100K visitors/month**

| Solution | Service Cost | Build Cost | CDN | Total | Notes |
|----------|-------------|------------|-----|-------|-------|
| **Markdown** | $0 | $20-40 🔴 | $0 | $20-40 | Vercel builds |
| **Sanity** | $99 | $5 | Included | $104 | Fast builds |
| **Contentful** | $300 | $5 | Included | $305 | Enterprise |
| **Strapi (VPS)** | $20-50 | $5 | $10 | $35-65 | + DevOps time |
| **Database** | $20 | $5 | $10 | $35 | + Dev time |
| **Notion** | $0-10 | $10 | $10 | $20-30 | Slow perf |

---

## 🚀 **Migration Path: Markdown → Sanity**

### **Step 1: Export Current Content**

```bash
# Script to export all markdown to JSON
node scripts/export-markdown.js
```

```javascript
// scripts/export-markdown.js
const { allPosts } = require('.contentlayer/generated');
const fs = require('fs');

fs.writeFileSync(
  'posts-export.json',
  JSON.stringify(allPosts, null, 2)
);
```

### **Step 2: Setup Sanity Project**

```bash
npm install -g @sanity/cli
sanity init
# Follow prompts, create project
```

### **Step 3: Import to Sanity**

```javascript
// scripts/import-to-sanity.js
const sanityClient = require('@sanity/client');
const posts = require('./posts-export.json');

const client = sanityClient({
  projectId: 'your-project-id',
  dataset: 'production',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function importPosts() {
  for (const post of posts) {
    await client.create({
      _type: 'post',
      title: post.title,
      slug: { current: post.slug },
      body: convertToPortableText(post.body), // Need converter
      publishedAt: post.date,
      locale: post.locale,
      tags: post.tags,
    });
  }
}

importPosts();
```

### **Step 4: Update Blog Code**

Replace `getAllPosts()` implementation to use Sanity client instead of Contentlayer.

### **Step 5: Test & Deploy**

---

## 📝 **Final Recommendation for Your Blog**

### **Current (< 100 posts):**
✅ **Keep using Markdown + Contentlayer**
- Perfect for your current scale
- Zero cost
- Simple workflow

### **When you reach 200-300 posts:**
⚠️ **Start planning migration**
- Setup Sanity project (free tier)
- Test workflow
- Keep both running in parallel

### **When you reach 500+ posts:**
🔴 **MUST migrate to avoid issues**
- Recommended: **Sanity CMS**
- Alternative: **Database + API** (if you want full control)

### **Why Sanity over others?**
1. ✅ Best price/performance ratio
2. ✅ Excellent DX (Developer Experience)
3. ✅ Great documentation & community
4. ✅ Flexible enough for future needs
5. ✅ Built-in features (search, media CDN, real-time)
6. ✅ Free tier is generous

---

**Bottom line:** Markdown is great now, but have a migration plan ready for when you scale! 🚀
