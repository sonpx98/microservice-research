---
title: "Xây dựng Blog hiện đại với Next.js 15"
date: "2024-11-08"
excerpt: "Tìm hiểu cách xây dựng một blog hiện đại, hiệu suất cao sử dụng Next.js 15, MDX và Keystatic CMS mà không cần database bên ngoài."
tags: ["nextjs", "tutorial", "mdx", "keystatic"]
published: true
locale: "vi"
---

# Xây dựng Blog hiện đại với Next.js 15

Trong bài viết này, tôi sẽ hướng dẫn bạn về kiến trúc của blog này và giải thích tại sao tôi chọn các công nghệ này.

## Tech Stack

### Next.js 15 với App Router

Next.js 15 mang đến nhiều cải tiến:

- **Build nhanh hơn** với Turbopack
- **Caching tốt hơn**
- **TypeScript support** tốt hơn
- **SEO nâng cao**

### MDX cho nội dung

MDX cho phép bạn viết JSX trong markdown:

```mdx
import { CustomComponent } from './components';

# Bài viết của tôi

Nội dung markdown thông thường...

<CustomComponent prop="value" />
```

Điều này cung cấp sự linh hoạt của React components trong nội dung của bạn.

### Keystatic CMS

Keystatic là CMS dựa trên Git:

- Commit trực tiếp vào repository của bạn
- Không cần database
- UI chỉnh sửa đẹp mắt
- Open source và miễn phí

## Kiến trúc Zero-Cost

Phần tuyệt vời nhất? Toàn bộ setup này tốn **$0** để chạy:

- **Hosting**: Vercel free tier
- **Database**: Không cần (Git là database của chúng ta)
- **Comments**: GitHub Discussions qua Giscus
- **CMS**: Keystatic (open source)

## Hiệu suất

Kiến trúc này mang lại hiệu suất xuất sắc:

- Static generation cho tốc độ tải trang nhanh
- Edge caching cho phân phối toàn cầu
- Tải hình ảnh tối ưu với Next.js Image
- Code splitting mặc định

## Kết luận

Xây dựng một blog không phải tốn kém hay phức tạp. Với các công cụ hiện đại như Next.js 15, MDX và Keystatic, bạn có thể tạo một blog nhanh, dễ bảo trì với chi phí định kỳ bằng không.

Chúc bạn code vui vẻ! 🚀
