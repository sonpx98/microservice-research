import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "interfacegen:inline-flex interfacegen:items-center interfacegen:justify-center interfacegen:gap-2 interfacegen:whitespace-nowrap interfacegen:rounded-md interfacegen:text-sm interfacegen:font-medium interfacegen:transition-colors focus-visible:interfacegen:outline-none focus-visible:interfacegen:ring-2 focus-visible:interfacegen:ring-blue-500 focus-visible:interfacegen:ring-offset-2 disabled:interfacegen:pointer-events-none disabled:interfacegen:opacity-50 [&_svg]:interfacegen:pointer-events-none [&_svg]:interfacegen:size-4 [&_svg]:interfacegen:shrink-0",
  {
    variants: {
      variant: {
        default: "interfacegen:bg-blue-600 interfacegen:text-white hover:interfacegen:bg-blue-700 interfacegen:dark:bg-blue-700 interfacegen:dark:hover:bg-blue-800",
        destructive:
          "interfacegen:bg-red-600 interfacegen:text-white hover:interfacegen:bg-red-700 interfacegen:dark:bg-red-700 interfacegen:dark:hover:bg-red-800",
        outline:
          "interfacegen:border interfacegen:border-gray-300 interfacegen:dark:border-gray-600 interfacegen:bg-white interfacegen:dark:bg-gray-800 hover:interfacegen:bg-gray-50 interfacegen:dark:hover:bg-gray-700 hover:interfacegen:text-gray-900 interfacegen:dark:text-gray-100 interfacegen:dark:hover:text-gray-100",
        secondary:
          "interfacegen:bg-gray-100 interfacegen:dark:bg-gray-700 interfacegen:text-gray-900 interfacegen:dark:text-gray-100 hover:interfacegen:bg-gray-200 interfacegen:dark:hover:bg-gray-600",
        ghost: "hover:interfacegen:bg-gray-100 interfacegen:dark:hover:bg-gray-700 hover:interfacegen:text-gray-900 interfacegen:dark:hover:text-gray-100",
        link: "interfacegen:text-blue-600 interfacegen:dark:text-blue-400 interfacegen:underline-offset-4 hover:interfacegen:underline",
      },
      size: {
        default: "interfacegen:h-10 interfacegen:px-4 interfacegen:py-2",
        sm: "interfacegen:h-9 interfacegen:rounded-md interfacegen:px-3",
        lg: "interfacegen:h-11 interfacegen:rounded-md interfacegen:px-8",
        icon: "interfacegen:h-10 interfacegen:w-10",
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