# Blog Pagination Guide - Client-side Pagination

## 🎯 Overview

Blog sử dụng **Client-side Pagination** - tất cả posts được load sẵn trong bundle, pagination chỉ là slice array và render từng page.

---

## ✅ Đã Implement

### **Features:**
- ✅ Pagination với Previous/Next buttons
- ✅ Page numbers với smart ellipsis (1 ... 4 5 6 ... 10)
- ✅ Show info: "Showing 1-9 of 45 posts"
- ✅ Configurable posts per page (default: 9)
- ✅ Auto reset về page 1 khi filter by tag
- ✅ Disabled state cho buttons
- ✅ i18n support (EN/VI)

---

## 🔧 How It Works

### **1. Data Flow:**

```
Build Time:
├── Contentlayer đọc .md files
├── Generate allPosts array
└── Bundle vào JavaScript

Runtime:
├── Client receives ALL posts in bundle
├── Filter by tag (if needed)
├── Slice array: posts.slice(startIndex, endIndex)
└── Render currentPosts
```

### **2. Code Implementation:**

```tsx
// packages/blog-shell/src/components/blog/post-list.tsx

export function PostList({ posts, tags, postsPerPage = 9 }: PostListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filter posts by tag
  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags?.includes(selectedTag))
    : posts;

  // Pagination calculation
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex); // ← Just slice!

  // Reset page when filter changes
  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(1); // ← Important!
  };
}
```

---

## 📊 Performance Characteristics

### **Pros:**
- ⚡ **Instant navigation**: No loading state, no HTTP requests
- 🎨 **Smooth UX**: Pagination feels native
- 💰 **Zero backend cost**: No API calls
- 🔍 **SEO-friendly**: All content rendered at build time
- 📱 **Works offline**: Everything in bundle

### **Cons:**
- 📦 **Bundle size**: All posts loaded upfront
  - 100 posts ≈ +50-100KB (acceptable)
  - 1000+ posts ≈ +500KB+ (consider API approach)
- 🔄 **Not realtime**: Need rebuild to show new posts

### **Recommendation:**
- ✅ **Use client-side pagination if**: < 500 posts
- ⚠️ **Consider API approach if**: > 1000 posts

---

## 🎨 UI Components

### **Pagination Controls:**

```tsx
{totalPages > 1 && (
  <div className="flex items-center justify-center gap-4">
    {/* Previous Button */}
    <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
      Previous
    </Button>

    {/* Page Numbers with Smart Ellipsis */}
    <div className="flex gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        // Show: first, last, current, and adjacent pages
        if (
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 1 && page <= currentPage + 1)
        ) {
          return <Button variant={currentPage === page ? 'default' : 'outline'}>
            {page}
          </Button>;
        } else if (page === currentPage - 2 || page === currentPage + 2) {
          return <span>...</span>; // Ellipsis
        }
        return null;
      })}
    </div>

    {/* Next Button */}
    <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
      Next
    </Button>
  </div>
)}
```

### **Page Info:**

```tsx
<p>Showing {startIndex + 1}-{endIndex} of {filteredPosts.length} posts</p>
```

---

## 🌐 Internationalization

### **Translation Keys:**

```json
// messages/en.json
{
  "common": {
    "previous": "Previous",
    "next": "Next",
    "showingPosts": "Showing {start}-{end} of {total} posts"
  }
}

// messages/vi.json
{
  "common": {
    "previous": "Trước",
    "next": "Tiếp",
    "showingPosts": "Hiển thị {start}-{end} của {total} bài viết"
  }
}
```

### **Usage:**

```tsx
const t = useTranslations('common');

<Button>{t('previous')}</Button>
<p>{t('showingPosts', { start: 1, end: 9, total: 45 })}</p>
```

---

## ⚙️ Configuration

### **Change Posts Per Page:**

```tsx
// In packages/blog-shell/src/app/[locale]/blog/page.tsx

<PostList 
  posts={posts} 
  tags={tags}
  postsPerPage={12} // ← Change here (default: 9)
/>
```

### **Pagination Logic:**

```tsx
const postsPerPage = 9;
const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
const startIndex = (currentPage - 1) * postsPerPage;
const endIndex = startIndex + postsPerPage;
const currentPosts = filteredPosts.slice(startIndex, endIndex);
```

**Example:**
- Page 1: `posts.slice(0, 9)` → posts 0-8
- Page 2: `posts.slice(9, 18)` → posts 9-17
- Page 3: `posts.slice(18, 27)` → posts 18-26

---

## 🔄 Alternative: URL-based Pagination (Optional Enhancement)

Nếu muốn pagination persist khi reload page, dùng URL search params:

```tsx
import { useSearchParams, useRouter } from 'next/navigation';

export function PostList({ posts }: PostListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  // Rest of pagination logic...
}
```

**URL format:**
- Page 1: `/blog?page=1`
- Page 2: `/blog?page=2`
- With tag: `/blog?page=2&tag=react`

---

## 🎯 When to Switch to API Pagination

### **Consider API approach if:**

1. **Too many posts** (> 1000)
   - Bundle size becomes significant
   - Initial load time increases

2. **Need realtime updates**
   - Show new posts without rebuild
   - User-generated content

3. **Advanced filtering**
   - Search with backend index (Algolia, Elasticsearch)
   - Complex queries (date ranges, multiple filters)

### **API Pagination Pattern:**

```tsx
// Would need to create API route
const [posts, setPosts] = useState([]);
const [page, setPage] = useState(1);

useEffect(() => {
  fetch(`/api/posts?page=${page}&limit=9`)
    .then(r => r.json())
    .then(data => setPosts(data.posts));
}, [page]);
```

**But for current blog (< 100 posts):** Client-side pagination is perfect! ✅

---

## 📝 Summary

| Feature | Client-side | API-based |
|---------|-------------|-----------|
| Speed | ⚡ Instant | 🔄 Loading state |
| Bundle size | 📦 All posts | 💾 Minimal |
| SEO | ✅ Perfect | ⚠️ Needs SSR |
| Realtime | ❌ Need rebuild | ✅ Yes |
| Complexity | 🟢 Simple | 🟡 Moderate |
| **Best for** | < 500 posts | > 1000 posts |

**Current blog uses:** ✅ Client-side pagination (optimal cho < 100 posts)
