import * as React from 'react'
import { cn } from '@/lib/utils'

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg bg-slate-200 animate-pulse',
        className
      )}
      {...props}
    />
  )
)
Skeleton.displayName = 'Skeleton'

const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('bg-white border border-slate-200 rounded-2xl overflow-hidden', className)}>
    {/* Image area */}
    <Skeleton className="w-full h-48 rounded-none" />

    <div className="p-5 space-y-3">
      {/* Category badge */}
      <Skeleton className="h-5 w-20 rounded-full" />

      {/* Title - two lines */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Description line */}
      <Skeleton className="h-3 w-3/4" />

      {/* Author row */}
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-7 w-7 rounded-full shrink-0" />
        <Skeleton className="h-3 w-28" />
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
        {/* Price */}
        <Skeleton className="h-5 w-16" />
        {/* Button */}
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  </div>
)
CardSkeleton.displayName = 'CardSkeleton'

interface TextSkeletonProps {
  lines?: number
  className?: string
  lastLineWidth?: string
}

const TextSkeleton = ({ lines = 3, className, lastLineWidth = 'w-3/4' }: TextSkeletonProps) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn('h-4', i === lines - 1 ? lastLineWidth : 'w-full')}
      />
    ))}
  </div>
)
TextSkeleton.displayName = 'TextSkeleton'

export { Skeleton, CardSkeleton, TextSkeleton }
