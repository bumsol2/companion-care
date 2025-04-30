import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-600 hover:animate-hover-lift",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:animate-hover-lift",
        outline:
          "border border-input bg-background hover:bg-accent/10 hover:text-accent-foreground hover:animate-hover-lift",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-600 hover:animate-hover-lift",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground hover:animate-hover-lift",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
