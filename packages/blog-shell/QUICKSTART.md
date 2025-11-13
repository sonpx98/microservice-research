# Blog Shell - Quick Start Guide

## Installation

```bash
cd packages/blog-shell
pnpm install
```

## Development

Start the development server:

```bash
pnpm start:blog
```

Or from root:

```bash
pnpm start:blog
```

Blog will run on: http://localhost:5006

## Accessing CMS

Keystatic CMS: http://localhost:5006/keystatic

## First Steps

1. **Install dependencies**
   ```bash
   cd packages/blog-shell
   pnpm install
   ```

2. **Run dev server**
   ```bash
   pnpm dev
   ```

3. **Setup Giscus Comments**
   - Go to https://giscus.app
   - Enter your repo: `sonpx98/microservice-research`
   - Get your repo ID and category ID
   - Update `src/components/blog/comment-section.tsx`

4. **Write your first post**
   - Option 1: Use CMS at `/keystatic`
   - Option 2: Create MDX file in `content/posts/en/`

## Writing Posts

### Using Keystatic CMS

1. Navigate to http://localhost:5006/keystatic
2. Click "Create Post"
3. Fill in the form
4. Click Save (auto-commits to Git)

### Manual MDX

Create `content/posts/en/my-post.mdx`:

```mdx
---
title: "My Post"
date: "2024-11-07"
excerpt: "Description"
tags: ["tag1"]
published: true
locale: "en"
---

# Content here

Write your post!
```

## Common Commands

```bash
pnpm dev          # Development
pnpm build        # Production build
pnpm start        # Start production server
pnpm type-check   # TypeScript check
pnpm lint         # Lint check
```

## Port

- Dev: 5006
- Production: 5006

## Learn More

See full [README.md](./README.md) for complete documentation.
