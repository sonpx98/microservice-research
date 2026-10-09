import * as React from "react"

import { cn } from "@/lib/utils"

// Floating chrome sits above the page, so unlike surfaces it casts a shadow.

const FAB_VARIANTS = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  surface: "border border-border bg-popover text-muted-foreground hover:text-foreground",
} as const

interface FabProps extends React.ComponentProps<"button"> {
  variant?: keyof typeof FAB_VARIANTS
}

/** Round floating action button (scroll, bookmark, table of contents). Position it with className. */
function Fab({ variant = "surface", className, type = "button", ...props }: FabProps) {
  return (
    <button
      type={type}
      data-slot="fab"
      className={cn(
        "inline-flex size-12 items-center justify-center rounded-full shadow-lg transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-5",
        FAB_VARIANTS[variant],
        className
      )}
      {...props}
    />
  )
}

/** Small floating surface for prompts and toasts. */
function FloatingCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="floating-card"
      className={cn("rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg", className)}
      {...props}
    />
  )
}

export { Fab, FloatingCard }
