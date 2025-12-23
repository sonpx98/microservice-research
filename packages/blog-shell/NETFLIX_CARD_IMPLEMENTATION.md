# Netflix-Style Expanding Card Implementation

This document details the implementation of the media-rich, expanding hover card used in the "Explore" news feed. This design replicates the interaction pattern found on platforms like Netflix, where a card expands in place to reveal more details without shifting the surrounding layout.

## 1. Core Concept: "Placeholder + Overlay"

Instead of scaling the original card using CSS `transform: scale()` (which can cause blurriness and z-index fighting) or using a Portal (which loses context of the scroll position), we use a **dual-render approach**:

1.  **Base Card (Placeholder)**: The card that sits in the grid. It holds the space.
2.  **Overlay Card (Expanded)**: A completely separate, absolutely positioned element that renders *on top* of the Base Card when hovered.

## 2. Technical Implementation

### Components
The logic is encapsulated in the `NewsCard` component (`packages/blog-shell/src/components/blog/news-list.tsx`).

### State Management
We use a simple React state with a timeout ref to handle hover delays. This prevents the card from "flashing" if the user quickly moves their mouse across the grid.

```typescript
const [isExpanded, setIsExpanded] = useState(false);
const timeoutRef = useRef<NodeJS.Timeout | null>(null);

// Open with 400ms delay (intent detection)
const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsExpanded(true), 400); 
};

// Close with 200ms delay (smooth exit)
const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsExpanded(false), 200);
};
```

### Layout Strategy

#### The Wrapper
The entire component is wrapped in a `relative` div. This establishes the positioning context for the Overlay Card.

```tsx
<div className="relative h-full" onMouseEnter={...} onMouseLeave={...}>
```

#### The Base Card
This is the "closed" state. When `isExpanded` is true, we simply hide it visually (`opacity-0`) but **keep it in the DOM** to preserve the grid layout height/width.

```tsx
<div className={`h-full transition-opacity ${isExpanded ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
    {/* Standard Card Content */}
</div>
```

#### The Overlay Card
This element is absolutely positioned relative to the Wrapper. We use negative margins and width > 100% to make it "grow" outwards from the center.

*   **Position**: `absolute top-[-10%] left-[-10%]`
*   **Size**: `w-[120%]` (20% larger than base)
*   **Z-Index**: `z-50` (Ensures it floats above neighbors)
*   **Animation**: `animate-in fade-in zoom-in-95` (Subtle pop effect)

```tsx
{isExpanded && (
    <div className="absolute top-[-10%] left-[-10%] w-[120%] z-50 ...">
        <Link href="...">
             {/* Rich Media Card Design */}
        </Link>
    </div>
)}
```

## 3. Design Tokens

The Expanded Card uses a distinct layout designed for high visual impact:

*   **Cinematic Thumbnail**: Full-width image (`aspect-video`) at the top.
*   **Gradient Overlay**: `bg-gradient-to-t` from bottom to ensure text readability.
*   **Minimal Metadata**: Only essential info (Source, Date) to reduce clutter.
*   **Action Button**: A single "Read Now" button with icon (`BookOpen`) for clear call-to-action.

## 4. Why This Approach?

| Method | Pros | Cons |
| :--- | :--- | :--- |
| **CSS Scale (`transform`)** | Easy to implement | Blurry text, neighbor overlap issues, layout shifts if not careful. |
| **Radix UI `HoverCard`** | Accessible, handles portals | Positioning can be tricky (often detached from card), logic overhead. |
| **Placeholder + Overlay** | **Pixel-perfect control**, no blurry text, reliable z-index | Slightly more verbose code (dual rendering). |

## 5. Future Improvements

*   **Video Preview**: Auto-play a video loop in the Overlay Card on hover.
*   **Quick Actions**: Add "Save to Later" or "Share" buttons in the expanded view.
*   **Mobile Handling**: Currently hover-only; consider "Long Press" for mobile devices.
