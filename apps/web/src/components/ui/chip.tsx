import * as React from "react"

import { cn } from "@/lib/utils"

interface ChipProps extends React.ComponentProps<"button"> {
  /** Selected state of a filter chip; also exposed as aria-pressed. */
  active?: boolean
}

/** Toggle pill for filters (tags, levels, topics). Use Button for actions. */
function Chip({ active = false, className, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      data-slot="chip"
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Chip }
