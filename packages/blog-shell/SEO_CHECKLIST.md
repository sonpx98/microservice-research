🚀 SEO & Performance Checklist for Developers
Mục tiêu: Google Lighthouse > 90 điểm | Core Web Vitals Xanh | Google Bot hiểu 100% nội dung.

1. Semantic & Schema (Giúp Bot "hiểu")
Phần này đảm bảo Google Bot đọc được dữ liệu có cấu trúc thay vì chỉ đoán mò qua HTML.

[ ] JSON-LD Schema Implementation:

[ ] Đã inject thẻ <script type="application/ld+json"> vào <head> hoặc <body>.

[ ] Blog Post: Sử dụng type Article hoặc BlogPosting (Khai báo: Headline, Image, Author, DatePublished).

[ ] Knowledge Graph: Sử dụng type DefinedTerm hoặc TechArticle.

[ ] Homepage: Sử dụng type Organization hoặc Person (để xác thực E-E-A-T).

[ ] Validate: Đã kiểm tra code trên Schema Validator.

[ ] Semantic HTML:

[ ] Chỉ có duy nhất một thẻ <h1> cho mỗi trang (thường là tiêu đề bài viết).

[ ] Sử dụng đúng thứ tự <h2> -> <h3> -> <h4> (không nhảy cóc từ h2 xuống h4).

[ ] Dùng <button> cho hành động click, dùng <a> cho hành động điều hướng (link).

[ ] Meta Tags:

[ ] Title tag: Ngắn gọn, chứa từ khóa chính, độ dài < 60 ký tự.

[ ] Meta Description: Tóm tắt hấp dẫn, độ dài < 160 ký tự.

[ ] Canonical Tag: <link rel="canonical" href="..." /> để tránh lỗi trùng lặp nội dung.

2. Rendering Strategy (Giúp Bot "thấy")
Chọn chiến lược render phù hợp để cân bằng giữa SEO và trải nghiệm người dùng.

[ ] Phân loại chiến lược Render:

[ ] Module Blog: Dùng SSG (Static Site Generation) -> Build ra HTML tĩnh.

[ ] Module Knowledge Graph: Dùng ISR (Incremental Static Regeneration) -> Revalidate sau 60s hoặc 1h.

[ ] Module Playground/User Dashboard: Dùng CSR (Client-Side Rendering) -> Tối ưu tương tác.

[ ] Server-Side Rendering (SSR) Check:

[ ] Đảm bảo HTML trả về từ Server đã có chứa nội dung chính (View Source phải thấy text bài viết, không phải thấy div rỗng).

[ ] Kiểm tra Status Code: Các trang lỗi phải trả về 404, không được trả về 200 với giao diện lỗi (Soft 404).

3. Web Performance & Core Web Vitals (Giúp User "sướng")
Tối ưu các chỉ số Google dùng để xếp hạng trải nghiệm trang.

🖼️ Media Optimization (LCP)
[ ] Format: Sử dụng định dạng WebP hoặc AVIF thay cho JPG/PNG.

[ ] Sizing: Luôn set thuộc tính width và height (hoặc aspect-ratio trong CSS) để tránh CLS.

[ ] Lazy Loading: Thêm loading="lazy" cho ảnh ở dưới màn hình đầu tiên (below the fold).

[ ] LCP Element: Ảnh to nhất ở màn hình đầu (Banner/Hero image) nên có thuộc tính priority (Next.js) hoặc loading="eager".

⚡ Code & Resource Optimization (INP & FID)
[ ] Fonts: Sử dụng font-display: swap trong CSS. Nên Self-host font thay vì CDN nếu có thể.

[ ] Minification: Đảm bảo code JS/CSS đã được Minify khi build production.

[ ] Code Splitting: Sử dụng Dynamic Import (import()) cho các component nặng (Ví dụ: Modal, Chart, Code Editor) chỉ tải khi cần.

[ ] Third-party Scripts: Review lại các script theo dõi (Analytics, Chatbot). Dùng defer hoặc async để không chặn luồng render chính.

🌐 Caching Policy
[ ] Static Assets (JS, CSS, Img): Cache-Control: public, max-age=31536000, immutable.

[ ] HTML/Dynamic Content: Cache-Control: public, s-maxage=60, stale-while-revalidate=30 (Tùy chiến lược ISR).