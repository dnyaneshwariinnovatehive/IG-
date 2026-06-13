import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CardSkeleton } from '@/components/ui/skeleton'
import { ProjectCard } from './ProjectCard'
import type { Project } from '@/types'

// ─── Props ────────────────────────────────────────────────────────────────────
export interface ProjectSliderProps {
  title: string
  subtitle?: string
  projects: Project[]
  viewAllLink?: string
  isLoading?: boolean
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ProjectSlider({
  title,
  subtitle,
  projects,
  viewAllLink,
  isLoading = false,
  className,
}: ProjectSliderProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Drag-to-scroll state
  const isDown = React.useRef(false)
  const startX = React.useRef(0)
  const scrollLeft = React.useRef(0)

  // Arrow visibility
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)
  const [isHovered, setIsHovered] = React.useState(false)

  // ── Scroll helpers ──────────────────────────────────────────
  const updateArrows = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [updateArrows, projects, isLoading])

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  // ── Drag-to-scroll handlers ─────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDown.current = true
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0)
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing'
  }

  const handleMouseLeave = () => {
    isDown.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }

  const handleMouseUp = () => {
    isDown.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDown.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - (scrollRef.current.offsetLeft ?? 0)
    const walk = (x - startX.current) * 1.2
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <section className={cn('relative', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-sora font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-slate-500">{subtitle}</p>
          )}
        </div>

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-blue-700 transition-colors shrink-0 mb-1"
          >
            <LayoutGrid size={14} />
            View All
            <ChevronRight size={14} />
          </Link>
        )}
      </div>

      {/* Slider wrapper – position:relative for absolute arrows */}
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left arrow */}
        <AnimatePresence>
          {isHovered && canScrollLeft && (
            <motion.button
              key="arrow-left"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
              onClick={() => scrollBy('left')}
              aria-label="Scroll left"
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2',
                'w-9 h-9 rounded-full bg-white border border-slate-200 shadow-card-hover',
                'flex items-center justify-center text-primary',
                'hover:bg-accent hover:text-white hover:border-accent transition-colors duration-200'
              )}
            >
              <ChevronLeft size={18} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right arrow */}
        <AnimatePresence>
          {isHovered && canScrollRight && (
            <motion.button
              key="arrow-right"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              onClick={() => scrollBy('right')}
              aria-label="Scroll right"
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2',
                'w-9 h-9 rounded-full bg-white border border-slate-200 shadow-card-hover',
                'flex items-center justify-center text-primary',
                'hover:bg-accent hover:text-white hover:border-accent transition-colors duration-200'
              )}
            >
              <ChevronRight size={18} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Loading skeletons */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div key={i} className="min-w-[300px] md:min-w-[320px] flex-shrink-0">
                <CardSkeleton />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-dashed border-slate-200 rounded-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <LayoutGrid size={24} className="text-slate-400" />
            </div>
            <p className="font-sora font-semibold text-base text-primary">
              No projects yet
            </p>
            <p className="mt-1 text-sm text-muted max-w-xs">
              Check back soon — new projects are added regularly.
            </p>
          </div>
        ) : (
          /* Scrollable cards */
          <div
            ref={scrollRef}
            role="list"
            className={cn(
              'flex gap-4 overflow-x-auto pb-2',
              'scrollbar-hide',
              // native touch scrolling + drag cursor
              'cursor-grab select-none'
            )}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {projects.map((project, i) => (
              <div
                key={project.id}
                role="listitem"
                className="min-w-[300px] md:min-w-[320px] flex-shrink-0"
              >
                <ProjectCard project={project} variant="default" index={i} />
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </section>
  )
}

export default ProjectSlider
