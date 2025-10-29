# IncomingProject Component

Một component React đẹp để hiển thị trạng thái "Incoming Project" với thiết kế hiện đại và icon đẹp.

## 🎨 Features

- ✨ Thiết kế hiện đại với gradient và animations
- 🎯 3 mức độ ưu tiên: low, medium, high
- 📊 Progress bar với animation
- 👥 Team avatars
- 🔔 Notification indicators
- 🎭 Hover effects và transitions
- 📱 Responsive design

## 📁 File Locations

- **Main Component**: `packages/portfolio-home/src/components/IncomingProject.tsx`
- **Demo Component**: `packages/portfolio-home/src/components/IncomingProjectDemo.tsx`
- **Config & Types**: `packages/shared/components/Incoming.tsx`

## 🚀 Quick Start

```tsx
import IncomingProject from './components/IncomingProject';

// Basic usage
<IncomingProject />

// With custom props
<IncomingProject
  title="AI-Powered Analytics Dashboard"
  description="A comprehensive analytics platform with real-time data visualization"
  estimatedTime="2 weeks"
  priority="high"
  className="mb-4"
/>
```

## 📋 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | "New Project Coming Soon" | Tiêu đề của project |
| `description` | string | "An exciting new project..." | Mô tả chi tiết |
| `estimatedTime` | string | "Coming Soon" | Thời gian dự kiến |
| `priority` | 'low' \| 'medium' \| 'high' | 'medium' | Mức độ ưu tiên |
| `className` | string | '' | CSS classes bổ sung |

## 🎨 Priority Colors

### High Priority
- Gradient: `from-red-500 to-orange-500`
- Badge: `bg-red-100 text-red-800 border-red-200`

### Medium Priority  
- Gradient: `from-blue-500 to-purple-500`
- Badge: `bg-blue-100 text-blue-800 border-blue-200`

### Low Priority
- Gradient: `from-green-500 to-teal-500`
- Badge: `bg-green-100 text-green-800 border-green-200`

## 📱 Layout Examples

### Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <IncomingProject priority="high" />
  <IncomingProject priority="medium" />
  <IncomingProject priority="low" />
</div>
```

### Full Width
```tsx
<IncomingProject 
  title="Large Project"
  className="md:col-span-2 lg:col-span-3"
/>
```

## 🎭 Animations

- **Icon**: `animate-pulse` trên lightbulb icon
- **Notification**: `animate-bounce` + `animate-ping` trên notification bell
- **Progress Bar**: Smooth transition khi thay đổi width
- **Card**: `hover:shadow-2xl` với transition

## 🔧 Customization

Component sử dụng TailwindCSS với design system nhất quán. Bạn có thể:

1. **Thay đổi colors**: Sửa trong `getPriorityColor()` và `getPriorityBadgeColor()`
2. **Thêm animations**: Sử dụng các Tailwind animation classes
3. **Custom layout**: Thêm `className` prop với grid/flex utilities
4. **Icon replacement**: Thay thế SVG icon trong component

## 🎬 Demo

Chạy demo component:

```bash
cd packages/portfolio-home
npm start
```

Sau đó import và sử dụng `IncomingProjectDemo` trong App component để xem các examples.

## 📝 Usage in Portfolio

Component này được thiết kế để tích hợp vào portfolio-home package, hiển thị các project đang trong quá trình phát triển với thông tin chi tiết và trạng thái trực quan.

## 💡 Best Practices

1. **Grouping**: Nhóm các project cùng priority
2. **Spacing**: Sử dụng gap utilities cho consistent spacing
3. **Responsive**: Test trên các screen sizes khác nhau
4. **Performance**: Lazy load nếu có nhiều components
5. **Accessibility**: Đảm bảo contrast tốt cho text và backgrounds

---

*Created with ❤️ for microservice-research portfolio*