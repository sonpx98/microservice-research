import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "interfacegen:inline-flex interfacegen:h-10 interfacegen:items-center interfacegen:justify-center interfacegen:rounded-md interfacegen:bg-gray-100 interfacegen:p-1 interfacegen:text-gray-600",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "interfacegen:inline-flex interfacegen:items-center interfacegen:justify-center interfacegen:whitespace-nowrap interfacegen:rounded-sm interfacegen:px-3 interfacegen:py-1.5 interfacegen:text-sm interfacegen:font-medium interfacegen:transition-all focus-visible:interfacegen:outline-none focus-visible:interfacegen:ring-2 focus-visible:interfacegen:ring-blue-500 focus-visible:interfacegen:ring-offset-2 disabled:interfacegen:pointer-events-none disabled:interfacegen:opacity-50 data-[state=active]:interfacegen:bg-white data-[state=active]:interfacegen:text-gray-900 data-[state=active]:interfacegen:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "interfacegen:mt-2 focus-visible:interfacegen:outline-none focus-visible:interfacegen:ring-2 focus-visible:interfacegen:ring-blue-500 focus-visible:interfacegen:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }