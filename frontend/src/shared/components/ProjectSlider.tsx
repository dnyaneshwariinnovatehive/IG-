import * as React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { cn } from '@utils/index'
import { CardSkeleton } from '@ui/skeleton'
import { ProjectCard } from './ProjectCard'
import type { Project } from '@ig-types/index'

export interface ProjectSliderProps {
  title: string
  subtitle?: string
  projects: Project[]
  viewAllLink?: string
  isLoading?: boolean
  className?: string
}

export function ProjectSlider({
  title,
  subtitle,
  projects,
  viewAllLink,
  isLoading = false,
  className,
}: ProjectSliderProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const isDown = React.useRef(false)
  const startX = React.useRef(0)
  const scrollLeft = React.useRef(0)

  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)
  const [progress, setProgress] = React.useState(0)
  const [totalDots, setTotalDots] = React.useState(1)

  const updateState = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < maxScroll - 4)
    const dots = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth))
    setTotalDots(dots)
    setProgress(maxScroll > 0 ? Math.round((el.scrollLeft / maxScroll) * (dots - 1)) : 0)
  }, [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateState()
    el.addEventListener('scroll', updateState, { passive: true })
    window.addEventListener('resize', updateState)
    return () => {
      el.removeEventListener('scroll', updateState)
      window.removeEventListener('resize', updateState)
    }
  }, [updateState, projects, isLoading])

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const scrollToDot = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    el.scrollTo({ left: (index / (totalDots - 1)) * maxScroll, behavior: 'smooth' })
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
    e.preventDefault()
    el.scrollBy({ left: e.deltaY * 2, behavior: 'auto' })
  }

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
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.2
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  return (
    <section className={cn('relative', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
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
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-blue-700 transition-colors shrink-0 mt-3"
            >
              <LayoutGrid size={14} />
              View All
              <ChevronRight size={14} />
            </Link>
          )}
        </div>

        {/* Slider */}
        <div className="relative">
          {/* Left arrow — always visible on desktop when scrollable */}
          <button
            onClick={() => scrollBy('left')}
            aria-label="Scroll left"
            disabled={!canScrollLeft}
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-5',
              'w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg',
              'flex items-center justify-center text-slate-600',
              'transition-all duration-200',
              'hidden sm:flex',
              canScrollLeft
                ? 'opacity-100 hover:bg-accent hover:text-white hover:border-accent hover:shadow-xl'
                : 'opacity-20 cursor-not-allowed'
            )}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right arrow — always visible on desktop when scrollable */}
          <button
            onClick={() => scrollBy('right')}
            aria-label="Scroll right"
            disabled={!canScrollRight}
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-5',
              'w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg',
              'flex items-center justify-center text-slate-600',
              'transition-all duration-200',
              'hidden sm:flex',
              canScrollRight
                ? 'opacity-100 hover:bg-accent hover:text-white hover:border-accent hover:shadow-xl'
                : 'opacity-20 cursor-not-allowed'
            )}
          >
            <ChevronRight size={20} />
          </button>

          {/* Scroll area */}
          {isLoading ? (
            <div className="flex justify-center">
              <div className="inline-flex gap-4 overflow-hidden">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="min-w-[300px] md:min-w-[320px] flex-shrink-0">
                    <CardSkeleton />
                  </div>
                ))}
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-dashed border-slate-200 rounded-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <LayoutGrid size={24} className="text-slate-400" />
              </div>
              <p className="font-sora font-semibold text-base text-primary">No projects yet</p>
              <p className="mt-1 text-sm text-muted max-w-xs">
                Check back soon — new projects are added regularly.
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                ref={scrollRef}
                role="list"
                className="inline-flex gap-4 overflow-x-auto pb-2 scrollbar-hide cursor-grab select-none max-w-full"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onWheel={handleWheel}
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
            </div>
          )}
        </div>

        {/* Progress dots */}
        {!isLoading && projects.length > 0 && totalDots > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {Array.from({ length: totalDots }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToDot(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === progress
                    ? 'w-6 h-2 bg-accent'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProjectSlider
