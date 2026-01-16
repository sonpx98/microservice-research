"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * SegmentTabs - A mobile-friendly segmented control variant of Tabs
 * Features: pill-style design, icon support, smooth transitions
 */

function SegmentTabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="segment-tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function SegmentTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="segment-tabs-list"
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-gray-200/80 p-1 dark:bg-gray-800/80",
        className
      )}
      {...props}
    />
  )
}

interface SegmentTabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  icon?: React.ReactNode
}

function SegmentTabsTrigger({
  className,
  icon,
  children,
  ...props
}: SegmentTabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="segment-tabs-trigger"
      className={cn(
        // Base styles
        "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        // Inactive state
        "text-gray-600 dark:text-gray-400",
        // Active state
        "data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md",
        "dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400",
        // Focus state
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        // SVG icon styling
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </TabsPrimitive.Trigger>
  )
}

function SegmentTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="segment-tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { SegmentTabs, SegmentTabsList, SegmentTabsTrigger, SegmentTabsContent }
