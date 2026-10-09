import * as React from "react"

import { cn } from "@/lib/utils"

const TONES = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  danger: "text-danger",
} as const

interface CodeBlockProps extends React.ComponentProps<"pre"> {
  tone?: keyof typeof TONES
}

/** Monospace block for payloads, tokens and queries. Wraps long tokens instead of overflowing. */
function CodeBlock({ tone = "default", className, ...props }: CodeBlockProps) {
  return (
    <pre
      data-slot="code-block"
      className={cn(
        "overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs break-all whitespace-pre-wrap",
        TONES[tone],
        className
      )}
      {...props}
    />
  )
}

export { CodeBlock }
