import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "videoeditor:relative videoeditor:flex videoeditor:w-full videoeditor:touch-none videoeditor:select-none videoeditor:items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="videoeditor:relative videoeditor:h-1.5 videoeditor:w-full videoeditor:grow videoeditor:overflow-hidden videoeditor:rounded-full videoeditor:bg-[var(--videoeditor-secondary)]">
      <SliderPrimitive.Range className="videoeditor:absolute videoeditor:h-full videoeditor:bg-[var(--videoeditor-primary)]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="videoeditor:block videoeditor:h-4 videoeditor:w-4 videoeditor:rounded-full videoeditor:border videoeditor:border-[var(--videoeditor-primary)]/50 videoeditor:bg-[var(--videoeditor-background)] videoeditor:shadow videoeditor:transition-colors focus-visible:videoeditor:outline-none focus-visible:videoeditor:ring-1 focus-visible:videoeditor:ring-[var(--videoeditor-ring)] disabled:videoeditor:pointer-events-none disabled:videoeditor:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }