import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@utils/index'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700',
        primary: 'bg-[#0F172A] text-white',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        purple: 'bg-purple-100 text-purple-700',
        blue: 'bg-blue-100 text-blue-700',
        outline: 'bg-transparent border border-[#0F172A] text-[#0F172A]',
        new: 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-sm',
        trending: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm',
        'top-seller': 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, className }))}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
