'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        primary: "bg-blue-100 text-blue-800",
        secondary: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200/80",
        destructive: "bg-red-100 text-red-800",
        warning: "bg-yellow-100 text-yellow-800",
        success: "bg-green-100 text-green-800",
        outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
