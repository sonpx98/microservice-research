---
title: "Chào mừng đến với Blog của tôi"
date: "2024-11-07"
excerpt: "Đây là bài viết đầu tiên trên blog. Tìm hiểu về các công nghệ được sử dụng để xây dựng blog này và những gì bạn có thể mong đợi trong các bài viết tương lai."
tags: ["nextjs", "typescript", "mdx"]
published: true
locale: "vi"
---

# Chào mừng đến với Blog của tôi

Xin chào và chào mừng! Đây là bài viết đầu tiên của tôi được xây dựng với **Next.js 15** và **MDX**.

## Về Blog này

Blog này được xây dựng bằng các công nghệ web hiện đại:

- **Next.js 15** với App Router
- **TypeScript** cho type safety
- **MDX** cho nội dung phong phú
- **TailwindCSS v4** cho styling
- **Keystatic** cho quản lý nội dung
- **Giscus** cho bình luận

## Tính năng

### 1. Hỗ trợ đa ngôn ngữ

Blog này hỗ trợ cả tiếng Anh và tiếng Việt. Bạn có thể chuyển đổi giữa các ngôn ngữ bằng trình chọn ngôn ngữ.

### 2. CMS dựa trên Git

Tất cả các bài viết được lưu trữ dưới dạng file MDX trong repository. Điều này có nghĩa là:

- Version control cho tất cả nội dung
- Không cần database bên ngoài
- Viết bài trong editor yêu thích của bạn

### 3. Bình luận ẩn danh

Bình luận được hỗ trợ bởi GitHub Discussions thông qua Giscus, cung cấp trải nghiệm bình luận không spam.

## Ví dụ Code

Đây là một ví dụ TypeScript đơn giản:

```typescript
interface BlogPost {
  title: string;
  date: string;
  tags: string[];
}

const post: BlogPost = {
  title: "Bài viết đầu tiên",
  date: "2024-11-07",
  tags: ["nextjs", "typescript"]
};
```

## Tiếp theo là gì?

Hãy đón xem các bài viết sắp tới về:

- Best practices trong phát triển web
- TypeScript tips và tricks
- Hướng dẫn Next.js
- Và nhiều hơn nữa!

Cảm ơn bạn đã đọc! 🎉
