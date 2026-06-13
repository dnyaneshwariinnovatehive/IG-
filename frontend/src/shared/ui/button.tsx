import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'
import { cn } from '@utils/index'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-md hover:shadow-lg hover:shadow-blue-500/30 hover:brightness-110 focus-visible:ring-blue-500',
        secondary:
          'bg-[#0F172A] text-white shadow-sm hover:bg-[#1E293B] focus-visible:ring-slate-500',
        outline:
          'bg-white border border-[#0F172A] text-[#0F172A] hover:bg-slate-50 focus-visible:ring-slate-500',
        ghost:
          'bg-transparent text-[#0F172A] hover:bg-slate-100 focus-visible:ring-slate-400',
        'accent-gradient':
          'bg-gradient-to-r from-[#2563EB] to-purple-600 text-white shadow-md hover:shadow-lg hover:shadow-purple-500/30 hover:brightness-110 focus-visible:ring-purple-500',
        destructive:
          'bg-[#EF4444] text-white shadow-sm hover:bg-red-600 focus-visible:ring-red-500',
        success:
          'bg-[#10B981] text-white shadow-sm hover:bg-emerald-600 focus-visible:ring-emerald-500',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-lg',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : size === 'xl' ? 20 : 16} />
        )}
        {asChild ? <Slottable>{children}</Slottable> : children}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
