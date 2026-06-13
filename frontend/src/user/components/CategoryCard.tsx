import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@utils/index'
import type { Category } from '@ig-types/index'

const COLOR_GLOW: Record<string, string> = {
  blue: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.35)]',
  red: 'hover:shadow-[0_8px_30px_rgba(239,68,68,0.35)]',
  sky: 'hover:shadow-[0_8px_30px_rgba(14,165,233,0.35)]',
  violet: 'hover:shadow-[0_8px_30px_rgba(139,92,246,0.35)]',
  green: 'hover:shadow-[0_8px_30px_rgba(34,197,94,0.35)]',
  amber: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.35)]',
  orange: 'hover:shadow-[0_8px_30px_rgba(249,115,22,0.35)]',
  teal: 'hover:shadow-[0_8px_30px_rgba(20,184,166,0.35)]',
  purple: 'hover:shadow-[0_8px_30px_rgba(168,85,247,0.35)]',
  pink: 'hover:shadow-[0_8px_30px_rgba(236,72,153,0.35)]',
}

const COLOR_ICON_BG: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  red: 'bg-red-100 text-red-600',
  sky: 'bg-sky-100 text-sky-600',
  violet: 'bg-violet-100 text-violet-600',
  green: 'bg-green-100 text-green-600',
  amber: 'bg-amber-100 text-amber-600',
  orange: 'bg-orange-100 text-orange-600',
  teal: 'bg-teal-100 text-teal-600',
  purple: 'bg-purple-100 text-purple-600',
  pink: 'bg-pink-100 text-pink-600',
}

export interface CategoryCardProps {
  category: Category
  index?: number
  className?: string
}

export function CategoryCard({
  category,
  index = 0,
  className,
}: CategoryCardProps) {
  const colorKey = (category.color ?? 'blue').toLowerCase()
  const glowClass = COLOR_GLOW[colorKey] ?? COLOR_GLOW['blue']
  const iconBgClass = COLOR_ICON_BG[colorKey] ?? COLOR_ICON_BG['blue']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Link
        to={`/browse?domain=${encodeURIComponent(category.slug ?? category.name?.toLowerCase().replace(/\s+/g, '-') ?? '')}`}
        className={cn(
          'group relative flex flex-col gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-card',
          'hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300',
          glowClass,
          className
        )}
      >
        <div
          className={cn(
            'inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl shrink-0',
            iconBgClass
          )}
          aria-hidden="true"
        >
          {category.icon ?? '📁'}
        </div>

        <div className="flex-1">
          <h3 className="font-sora font-bold text-base text-primary leading-snug">
            {category.name}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {category.count ?? 0} projects
          </p>
        </div>

        <ChevronRight
          size={18}
          className={cn(
            'absolute right-5 top-1/2 -translate-y-1/2 text-slate-300',
            'opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0',
            'transition-all duration-300'
          )}
        />
      </Link>
    </motion.div>
  )
}

export default CategoryCard
