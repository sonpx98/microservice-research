import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "videoeditor:inline-flex videoeditor:items-center videoeditor:justify-center videoeditor:gap-2 videoeditor:whitespace-nowrap videoeditor:rounded-md videoeditor:text-sm videoeditor:font-medium videoeditor:transition-colors focus-visible:videoeditor:outline-none focus-visible:videoeditor:ring-1 disabled:videoeditor:pointer-events-none disabled:videoeditor:opacity-50 [&_svg]:videoeditor:pointer-events-none [&_svg]:videoeditor:size-4 [&_svg]:videoeditor:shrink-0",
  {
    variants: {
      variant: {
        default:
          "videoeditor:bg-[var(--videoeditor-primary)] videoeditor:text-[var(--videoeditor-primary-foreground)] videoeditor:shadow hover:videoeditor:bg-[var(--videoeditor-primary)]/90",
        destructive:
          "videoeditor:bg-[var(--videoeditor-destructive)] videoeditor:text-[var(--videoeditor-destructive-foreground)] videoeditor:shadow-sm hover:videoeditor:bg-[var(--videoeditor-destructive)]/90",
        outline:
          "videoeditor:border videoeditor:border-[var(--videoeditor-border)] videoeditor:bg-[var(--videoeditor-background)] videoeditor:shadow-sm hover:videoeditor:bg-[var(--videoeditor-accent)] hover:videoeditor:text-[var(--videoeditor-accent-foreground)]",
        secondary:
          "videoeditor:bg-[var(--videoeditor-secondary)] videoeditor:text-[var(--videoeditor-secondary-foreground)] videoeditor:shadow-sm hover:videoeditor:bg-[var(--videoeditor-secondary)]/80",
        ghost: "hover:videoeditor:bg-[var(--videoeditor-accent)] hover:videoeditor:text-[var(--videoeditor-accent-foreground)]",
        link: "videoeditor:text-[var(--videoeditor-primary)] videoeditor:underline-offset-4 hover:videoeditor:underline",
      },
      size: {
        default: "videoeditor:h-9 videoeditor:px-4 videoeditor:py-2",
        sm: "videoeditor:h-8 videoeditor:rounded-md videoeditor:px-3 videoeditor:text-xs",
        lg: "videoeditor:h-10 videoeditor:rounded-md videoeditor:px-8",
        icon: "videoeditor:h-9 videoeditor:w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }