# Keystatic CMS Guide

## 🎯 Truy cập Keystatic

Mở trình duyệt: **http://localhost:5006/keystatic**

## 📝 Cách sử dụng

### Xem tất cả posts

1. Vào http://localhost:5006/keystatic
2. Bạn sẽ thấy 2 collections:
   - **Blog Posts (English)** - Bài viết tiếng Anh
   - **Blog Posts (Tiếng Việt)** - Bài viết tiếng Việt

### Tạo post mới

1. Click vào collection muốn tạo (English hoặc Tiếng Việt)
2. Click button **"Create Blog Post (English)"** hoặc **"Create Blog Post (Tiếng Việt)"**
3. Điền thông tin:
   - **Title**: Tên bài viết (slug sẽ tự động generate)
   - **Published Date**: Ngày xuất bản
   - **Excerpt**: Mô tả ngắn (bắt buộc)
   - **Tags**: Thêm tags (click + để thêm tag mới)
   - **Published**: Check để hiển thị trên blog
   - **Content**: Viết nội dung với rich text editor
4. Click **"Create Blog Post"**

### Edit post hiện có

1. Vào collection
2. Click vào post muốn sửa
3. Edit và click **"Save"**

### Xóa post

1. Vào post detail
2. Click **"Delete"** ở góc phải
3. Confirm xóa

## ✍️ Viết content

Keystatic hỗ trợ:

- **Bold**, *Italic*, ~~Strikethrough~~
- Headings (H1, H2, H3...)
- Lists (ordered & unordered)
- Links
- Code blocks
- Blockquotes
- Images (paste URL)
- Dividers

### Shortcuts

- `Cmd + B` - Bold
- `Cmd + I` - Italic
- `Cmd + K` - Add link
- `Cmd + Shift + 7` - Ordered list
- `Cmd + Shift + 8` - Bullet list

## 📁 File structure

Posts được lưu trong:
```
content/posts/
├── en/
│   ├── welcome.mdx
│   └── building-modern-blog.mdx
└── vi/
    ├── welcome.mdx
    └── building-modern-blog.mdx
```

## 🔄 Git workflow

**Local mode (development):**
- Changes được lưu trực tiếp vào files
- Bạn cần tự commit và push lên Git

**Commands:**
```bash
git add content/posts/
git commit -m "Add new blog post"
git push
```

**GitHub mode (production):**
- Keystatic tự động commit vào GitHub
- Không cần commit thủ công

## 🐛 Troubleshooting

### Keystatic không load

1. Check server đang chạy: `pnpm dev`
2. Restart server nếu cần
3. Clear cache: `rm -rf .next`

### Không thấy posts

1. Check file có trong `content/posts/en/` hoặc `content/posts/vi/`
2. Check format file đúng với Keystatic schema

### Content không hiển thị trên blog

1. Check `published: true` trong post
2. Restart Next.js dev server
3. Contentlayer sẽ auto-rebuild

## 💡 Tips

- **Preview trước khi publish**: Uncheck "Published" để draft
- **SEO-friendly**: Dùng excerpt tốt cho SEO
- **Tags**: Giúp filter posts dễ dàng
- **Consistent naming**: Dùng kebab-case cho slugs (my-post-title)

## 🚀 Production setup

Để enable GitHub mode (auto-commit):

1. Update `keystatic.config.tsx`:
```tsx
storage: 
  process.env.NODE_ENV === 'production' 
    ? { 
        kind: 'github',
        repo: { owner: 'sonpx98', name: 'microservice-research' }
      }
    : { kind: 'local' }
```

2. Setup GitHub OAuth App
3. Add env vars to Vercel
4. Deploy!

---

Happy blogging! ✍️
