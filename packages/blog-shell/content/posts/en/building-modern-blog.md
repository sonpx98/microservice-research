---
title: Building a Modern Blog with Next.js 15
date: 2024-11-08
excerpt: >-
  Learn how to build a modern, performant blog using Next.js 15, MDX, and
  Keystatic CMS without any external database.
tags:
  - nextjs
  - tutorial
  - mdx
  - keystatic
published: true
locale: en
---
# Building a Modern Blog with Next.js 15

In this post, I'll walk you through the architecture of this blog and explain why I chose these technologies.

## Tech Stack

### Next.js 15 with App Router

Next.js 15 brings several improvements:

- **Faster builds** with Turbopack
- **Improved caching** strategies
- **Better TypeScript** support
- **Enhanced SEO** capabilities

### MDX for Content

MDX allows you to write JSX in markdown:

```mdx
import { CustomComponent } from './components';

# My Post

Regular markdown content...

<CustomComponent prop="value" />
```

This gives you the flexibility of React components within your content.

### Keystatic CMS

Keystatic is a Git-based CMS that:

- Commits directly to your repository
- No database required
- Beautiful editing UI
- Open source and free

## Zero-Cost Architecture

The best part? This entire setup costs **$0** to run:

- **Hosting**: Vercel free tier
- **Database**: None needed (Git is our database)
- **Comments**: GitHub Discussions via Giscus
- **CMS**: Keystatic (open source)

## Performance

This architecture delivers excellent performance:

- Static generation for fast page loads
- Edge caching for global distribution
- Optimal image loading with Next.js Image
- Code splitting by default

## Conclusion

Building a blog doesn't have to be expensive or complex. With modern tools like Next.js 15, MDX, and Keystatic, you can create a fast, maintainable blog with zero recurring costs.

Happy coding! 🚀
