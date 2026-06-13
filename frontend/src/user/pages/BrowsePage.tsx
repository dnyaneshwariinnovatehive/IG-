import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  ChevronDown,
  Filter,
  Frown,
} from 'lucide-react'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import { Input } from '@ui/input'
import { ProjectCard } from '@components/ProjectCard'
import { CardSkeleton } from '@ui/skeleton'
import { useProjects } from '@hooks/useProjects'
import { useCategories } from '@hooks/useCategories'
import { MOCK_PROJECTS, MOCK_CATEGORIES } from '@shared/constants/mockData'
import { cn } from '@utils/index'
import type { FilterOptions, DifficultyLevel } from '@ig-types/index'

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'trending', label: 'Trending' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'most-viewed', label: 'Most Viewed' },
  { value: 'top-rated', label: 'Top Rated' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

const DIFFICULTY_OPTIONS: { value: DifficultyLevel | ''; label: string }[] = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  advanced: 'bg-red-100 text-red-700 border-red-200',
}

const PROJECTS_PER_PAGE = 9

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyLocalFilters(
  projects: typeof MOCK_PROJECTS,
  filters: FilterOptions,
  filterFlag: string = ''
): typeof MOCK_PROJECTS {
  let results = [...projects]

  if (filterFlag === 'trending') {
    results = results.filter((p) => p.isTrending)
  } else if (filterFlag === 'new') {
    results = results.filter((p) => p.isNew)
  } else if (filterFlag === 'top-selling') {
    results = results.filter((p) => p.isTopSelling)
  } else if (filterFlag === 'featured') {
    results = results.filter((p) => p.isFeatured)
  }

  if (filters.search) {
    const q = filters.search.toLowerCase()
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.technologies?.some((t) => t.toLowerCase().includes(q))
    )
  }

  if (filters.category) {
    results = results.filter(
      (p) =>
        p.domain?.toLowerCase() === filters.category?.toLowerCase() ||
        (p as unknown as Record<string, unknown>)['category'] === filters.category
    )
  }

  if (filters.difficulty) {
    results = results.filter((p) => p.difficulty === filters.difficulty)
  }

  if (filters.minPrice !== undefined) {
    results = results.filter((p) => p.price >= (filters.minPrice as number))
  }
  if (filters.maxPrice !== undefined) {
    results = results.filter((p) => p.price <= (filters.maxPrice as number))
  }

  switch (filters.sort) {
    case 'trending':
      results = results.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0))
      break
    case 'price-asc':
      results = results.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      results = results.sort((a, b) => b.price - a.price)
      break
    case 'most-viewed':
      results = results.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      break
    case 'top-rated':
      results = results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      break
    case 'top-selling':
      results = results.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
      break
    default:
      results = results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }

  return results
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ActiveFilterPillProps {
  label: string
  onRemove: () => void
}

function ActiveFilterPill({ label, onRemove }: ActiveFilterPillProps) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-2.5 py-1"
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full hover:bg-blue-200 p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={10} />
      </button>
    </motion.span>
  )
}

interface SidebarProps {
  searchQuery: string
  setSearchQuery: (v: string) => void
  selectedCategories: string[]
  toggleCategory: (slug: string) => void
  minPrice: string
  maxPrice: string
  setMinPrice: (v: string) => void
  setMaxPrice: (v: string) => void
  difficulty: DifficultyLevel | ''
  setDifficulty: (v: DifficultyLevel | '') => void
  sort: SortValue
  setSort: (v: SortValue) => void
  clearAll: () => void
  activeFilterCount: number
  categories: Array<{ id: string; name: string; slug: string; count: number; color: string }>
  onClose?: () => void
}

function Sidebar({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  toggleCategory,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  difficulty,
  setDifficulty,
  sort,
  setSort,
  clearAll,
  activeFilterCount,
  categories,
  onClose,
}: SidebarProps) {
  const [priceOpen, setPriceOpen] = useState(true)
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [difficultyOpen, setDifficultyOpen] = useState(true)
  const [sortOpen, setSortOpen] = useState(true)

  return (
    <aside className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-slate-500" />
          <span className="font-sora font-bold text-sm text-slate-800">Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close filters"
            >
              <X size={18} className="text-slate-600" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-6 overflow-y-auto">
        {/* Search within results */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Search
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm bg-slate-50 border-slate-200 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Sort */}
        <div>
          <button
            onClick={() => setSortOpen((p) => !p)}
            className="flex w-full items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2"
          >
            Sort By
            <ChevronDown
              size={14}
              className={cn('text-slate-400 transition-transform duration-200', sortOpen && 'rotate-180')}
            />
          </button>
          <AnimatePresence initial={false}>
            {sortOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortValue)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Categories */}
        <div>
          <button
            onClick={() => setCategoryOpen((p) => !p)}
            className="flex w-full items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2"
          >
            Category
            <ChevronDown
              size={14}
              className={cn('text-slate-400 transition-transform duration-200', categoryOpen && 'rotate-180')}
            />
          </button>
          <AnimatePresence initial={false}>
            {categoryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const checked = selectedCategories.includes(cat.slug)
                    return (
                      <label
                        key={cat.id}
                        className={cn(
                          'flex items-center justify-between gap-2 rounded-xl px-3 py-2 cursor-pointer transition-all duration-150',
                          checked
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-slate-50 border border-transparent'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCategory(cat.slug)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                          />
                          <span
                            className={cn(
                              'text-sm truncate',
                              checked ? 'font-semibold text-blue-700' : 'font-medium text-slate-700'
                            )}
                          >
                            {cat.name}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'text-[11px] font-medium rounded-full px-1.5 py-0.5 flex-shrink-0',
                            checked
                              ? 'bg-blue-200 text-blue-700'
                              : 'bg-slate-100 text-slate-500'
                          )}
                        >
                          {cat.count}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price Range */}
        <div>
          <button
            onClick={() => setPriceOpen((p) => !p)}
            className="flex w-full items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2"
          >
            Price Range
            <ChevronDown
              size={14}
              className={cn('text-slate-400 transition-transform duration-200', priceOpen && 'rotate-180')}
            />
          </button>
          <AnimatePresence initial={false}>
            {priceOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] text-slate-400 mb-1">Min (₹)</label>
                      <Input
                        type="number"
                        min={0}
                        max={5000}
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="h-8 text-sm bg-slate-50 border-slate-200"
                      />
                    </div>
                    <span className="text-slate-300 mt-5">—</span>
                    <div className="flex-1">
                      <label className="block text-[11px] text-slate-400 mb-1">Max (₹)</label>
                      <Input
                        type="number"
                        min={0}
                        max={5000}
                        placeholder="5000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-8 text-sm bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Under ₹1k', min: '', max: '1000' },
                      { label: '₹1k–₹2k', min: '1000', max: '2000' },
                      { label: '₹2k+', min: '2000', max: '' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setMinPrice(preset.min)
                          setMaxPrice(preset.max)
                        }}
                        className={cn(
                          'text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all',
                          minPrice === preset.min && maxPrice === preset.max
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Difficulty */}
        <div>
          <button
            onClick={() => setDifficultyOpen((p) => !p)}
            className="flex w-full items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2"
          >
            Difficulty
            <ChevronDown
              size={14}
              className={cn('text-slate-400 transition-transform duration-200', difficultyOpen && 'rotate-180')}
            />
          </button>
          <AnimatePresence initial={false}>
            {difficultyOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-1">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl px-3 py-2 cursor-pointer transition-all duration-150',
                        difficulty === opt.value
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-slate-50 border border-transparent'
                      )}
                    >
                      <input
                        type="radio"
                        name="difficulty"
                        value={opt.value}
                        checked={difficulty === opt.value}
                        onChange={() => setDifficulty(opt.value)}
                        className="w-3.5 h-3.5 border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {opt.value ? (
                        <span
                          className={cn(
                            'text-xs font-semibold px-2 py-0.5 rounded-full border',
                            DIFFICULTY_COLORS[opt.value]
                          )}
                        >
                          {opt.label}
                        </span>
                      ) : (
                        <span
                          className={cn(
                            'text-sm font-medium',
                            difficulty === '' ? 'text-blue-700' : 'text-slate-700'
                          )}
                        >
                          {opt.label}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-5">
        <Frown size={36} className="text-slate-400" />
      </div>
      <h3 className="font-sora font-bold text-xl text-slate-800 mb-2">No projects found</h3>
      <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
        We couldn't find any projects matching your current filters. Try adjusting your search
        or clearing the filters to see all projects.
      </p>
      <Button variant="outline" onClick={onClearFilters} className="gap-2">
        <X size={15} />
        Clear all filters
      </Button>
    </motion.div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  totalPages: number
  setPage: (p: number) => void
}

function Pagination({ page, totalPages, setPage }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-10 pb-6">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className={cn(
          'h-9 px-3.5 rounded-xl text-sm font-medium border transition-all',
          page === 1
            ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
            : 'border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
        )}
      >
        Prev
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-9 text-center text-slate-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => setPage(p as number)}
            className={cn(
              'w-9 h-9 rounded-xl text-sm font-medium border transition-all',
              p === page
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                : 'border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        className={cn(
          'h-9 px-3.5 rounded-xl text-sm font-medium border transition-all',
          page === totalPages
            ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
            : 'border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
        )}
      >
        Next
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const mainRef = useRef<HTMLDivElement>(null)

  // ── Filter state (synced with URL) ─────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const c = searchParams.get('category')
    return c ? c.split(',').filter(Boolean) : []
  })
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')
  const [difficulty, setDifficulty] = useState<DifficultyLevel | ''>(
    (searchParams.get('difficulty') as DifficultyLevel | '') ?? ''
  )
  const [sort, setSort] = useState<SortValue>((searchParams.get('sort') as SortValue) ?? 'newest')
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1))
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (searchParams.get('view') as 'grid' | 'list') ?? 'grid'
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filter, setFilter] = useState(searchParams.get('filter') ?? '')

  // ── Sync state → URL ───────────────────────────────────────────────────────
  useEffect(() => {
    const params: Record<string, string> = {}
    if (searchQuery) params.q = searchQuery
    if (selectedCategories.length) params.category = selectedCategories.join(',')
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice
    if (difficulty) params.difficulty = difficulty
    if (sort && sort !== 'newest') params.sort = sort
    if (page > 1) params.page = String(page)
    if (viewMode !== 'grid') params.view = viewMode
    if (filter) params.filter = filter
    setSearchParams(params, { replace: true })
  }, [searchQuery, selectedCategories, minPrice, maxPrice, difficulty, sort, page, viewMode, filter, setSearchParams])

  // ── Reset page on filter change ────────────────────────────────────────────
  const resetPage = useCallback(() => setPage(1), [])

  const handleSetSearchQuery = useCallback((v: string) => { setSearchQuery(v); resetPage() }, [resetPage])
  const handleSetMinPrice = useCallback((v: string) => { setMinPrice(v); resetPage() }, [resetPage])
  const handleSetMaxPrice = useCallback((v: string) => { setMaxPrice(v); resetPage() }, [resetPage])
  const handleSetDifficulty = useCallback((v: DifficultyLevel | '') => { setDifficulty(v); resetPage() }, [resetPage])
  const handleSetSort = useCallback((v: SortValue) => { setSort(v); resetPage() }, [resetPage])

  const toggleCategory = useCallback((slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
    resetPage()
  }, [resetPage])

  const clearAll = useCallback(() => {
    setSearchQuery('')
    setSelectedCategories([])
    setMinPrice('')
    setMaxPrice('')
    setDifficulty('')
    setSort('newest')
    setFilter('')
    setPage(1)
  }, [])

  // ── Build filter options ───────────────────────────────────────────────────
  const filterOptions: FilterOptions = {
    search: searchQuery || undefined,
    category: selectedCategories[0] || undefined,
    difficulty: difficulty || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort: sort || undefined,
    page,
    limit: PROJECTS_PER_PAGE,
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data: apiProjects, isLoading } = useProjects(filterOptions)
  const { data: apiCategories } = useCategories()

  const categories: Array<{ id: string; name: string; slug: string; count: number; color: string }> =
    apiCategories?.length
      ? apiCategories.map((c) => {
          const mock = MOCK_CATEGORIES.find((m) => m.slug === (c as { slug?: string }).slug)
          return {
            id: c.id,
            name: c.name,
            slug: (c as { slug?: string }).slug ?? c.id,
            count:
              (c as { count?: number }).count ??
              (c as { projectCount?: number }).projectCount ??
              mock?.count ??
              0,
            color: mock?.color ?? '#6366f1',
          }
        })
      : MOCK_CATEGORIES

  const allFiltered = (() => {
    const base =
      apiProjects?.length !== undefined && !isLoading
        ? (apiProjects as typeof MOCK_PROJECTS)
        : applyLocalFilters(MOCK_PROJECTS, filterOptions)

    let filtered = base
    if (filter === 'trending') {
      filtered = filtered.filter((p) => p.isTrending)
    } else if (filter === 'new') {
      filtered = filtered.filter((p) => p.isNew)
    } else if (filter === 'top-selling') {
      filtered = filtered.filter((p) => p.isTopSelling)
    } else if (filter === 'featured') {
      filtered = filtered.filter((p) => p.isFeatured)
    }

    if (selectedCategories.length > 1) {
      filtered = filtered.filter((p) => {
        const domain = p.domain?.toLowerCase() ?? ''
        return selectedCategories.some(
          (slug) =>
            slug === domain.replace(/\s+/g, '-') ||
            slug === domain.replace(/[^a-z]/g, '-') ||
            categories.find((c) => c.slug === slug)?.name.toLowerCase() === domain
        )
      })
    }

    if (filterOptions.search) {
      const q = filterOptions.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          p.technologies?.some((t) => t.toLowerCase().includes(q))
      )
    }

    if (filterOptions.category) {
      filtered = filtered.filter(
        (p) =>
          p.domain?.toLowerCase() === filterOptions.category?.toLowerCase() ||
          (p as unknown as Record<string, unknown>)['category'] === filterOptions.category
      )
    }

    if (filterOptions.difficulty) {
      filtered = filtered.filter((p) => p.difficulty === filterOptions.difficulty)
    }

    if (filterOptions.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= (filterOptions.minPrice as number))
    }
    if (filterOptions.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= (filterOptions.maxPrice as number))
    }

    switch (filterOptions.sort) {
      case 'trending':
        filtered = filtered.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0))
        break
      case 'price-asc':
        filtered = filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered = filtered.sort((a, b) => b.price - a.price)
        break
      case 'most-viewed':
        filtered = filtered.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
        break
      case 'top-rated':
        filtered = filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
      case 'top-selling':
        filtered = filtered.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
        break
      default:
        filtered = filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }

    return filtered
  })()

  const totalCount = allFiltered.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PROJECTS_PER_PAGE))
  const paginatedProjects = allFiltered.slice((page - 1) * PROJECTS_PER_PAGE, page * PROJECTS_PER_PAGE)

  // ── Active filters count ───────────────────────────────────────────────────
  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    selectedCategories.length +
    (minPrice || maxPrice ? 1 : 0) +
    (difficulty ? 1 : 0) +
    (sort && sort !== 'newest' ? 1 : 0) +
    (filter ? 1 : 0)

  // ── Active filter pills data ───────────────────────────────────────────────
  const activePills: Array<{ key: string; label: string; remove: () => void }> = []
  if (searchQuery) activePills.push({ key: 'q', label: `"${searchQuery}"`, remove: () => handleSetSearchQuery('') })
  selectedCategories.forEach((slug) => {
    const cat = categories.find((c) => c.slug === slug)
    activePills.push({ key: slug, label: cat?.name ?? slug, remove: () => toggleCategory(slug) })
  })
  if (minPrice || maxPrice) {
    const label = minPrice && maxPrice ? `₹${minPrice}–₹${maxPrice}` : minPrice ? `₹${minPrice}+` : `Under ₹${maxPrice}`
    activePills.push({ key: 'price', label, remove: () => { handleSetMinPrice(''); handleSetMaxPrice('') } })
  }
  if (difficulty) {
    activePills.push({
      key: 'diff',
      label: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      remove: () => handleSetDifficulty(''),
    })
  }
  if (sort && sort !== 'newest') {
    const sortLabel = SORT_OPTIONS.find((s) => s.value === sort)?.label ?? sort
    activePills.push({ key: 'sort', label: sortLabel, remove: () => handleSetSort('newest') })
  }
  if (filter) {
    const filterLabels: Record<string, string> = { trending: 'Trending', new: 'Newly Added', 'top-selling': 'Top Selling', featured: 'Featured' }
    activePills.push({ key: 'filter', label: filterLabels[filter] ?? filter, remove: () => setFilter('') })
  }

  const sidebarProps: SidebarProps = {
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    selectedCategories,
    toggleCategory,
    minPrice,
    maxPrice,
    setMinPrice: handleSetMinPrice,
    setMaxPrice: handleSetMaxPrice,
    difficulty,
    setDifficulty: handleSetDifficulty,
    sort,
    setSort: handleSetSort,
    clearAll,
    activeFilterCount,
    categories,
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="blue" className="text-[11px]">Catalogue</Badge>
            </div>
            <h1 className="font-sora font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">
              {filter === 'trending' ? 'Trending Projects' : filter === 'new' ? 'Newly Added' : filter === 'top-selling' ? 'Top Selling' : filter === 'featured' ? 'Featured Projects' : 'Browse All Projects'}
            </h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              {filter === 'trending' ? 'Discover the most popular projects right now.' : filter === 'new' ? 'Check out the latest projects just published by creators.' : filter === 'top-selling' ? 'Best-performing projects loved by thousands of buyers.' : filter === 'featured' ? 'Handpicked by our team for exceptional quality and impact.' : 'Explore our complete library of student and professional projects. Filter by category, difficulty, and budget to find what fits your needs.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex gap-7">

          {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col w-[280px] flex-shrink-0">
            <div className="sticky top-4 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden max-h-[calc(100vh-6rem)]">
              <Sidebar {...sidebarProps} />
            </div>
          </div>

          {/* ── Main Content ─────────────────────────────────────────────────── */}
          <div ref={mainRef} className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {/* Mobile filter button */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden gap-2 flex-shrink-0"
                onClick={() => setDrawerOpen(true)}
              >
                <Filter size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {/* Result count */}
              <p className="text-sm text-slate-500 flex-1 min-w-0">
                {isLoading ? (
                  <span className="inline-block w-24 h-4 bg-slate-200 animate-pulse rounded" />
                ) : (
                  <>
                    <span className="font-semibold text-slate-800">{totalCount}</span>{' '}
                    {totalCount === 1 ? 'result' : 'results'}
                    {activeFilterCount > 0 && (
                      <span className="text-slate-400"> (filtered)</span>
                    )}
                  </>
                )}
              </p>

              {/* Sort (desktop inline) */}
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-400 whitespace-nowrap">Sort:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => handleSetSort(e.target.value as SortValue)}
                    className="h-8 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 pl-3 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-0.5 bg-slate-100 rounded-xl p-0.5 flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={cn(
                    'p-2 rounded-lg transition-all duration-150',
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <Grid3X3 size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={cn(
                    'p-2 rounded-lg transition-all duration-150',
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <List size={15} />
                </button>
              </div>
            </div>

            {/* Active filter pills */}
            <AnimatePresence>
              {activePills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-5"
                >
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {activePills.map((pill) => (
                        <ActiveFilterPill key={pill.key} label={pill.label} onRemove={pill.remove} />
                      ))}
                    </AnimatePresence>
                    {activePills.length > 1 && (
                      <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={clearAll}
                        className="text-xs text-slate-500 hover:text-red-500 font-medium transition-colors underline underline-offset-2"
                      >
                        Clear all
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid / List */}
            {isLoading ? (
              <div
                className={cn(
                  'grid gap-5',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : paginatedProjects.length === 0 ? (
              <EmptyState onClearFilters={clearAll} />
            ) : (
              <motion.div
                key={`${page}-${sort}-${searchQuery}-${selectedCategories.join()}`}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06 } },
                }}
                className={cn(
                  'grid gap-5',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {paginatedProjects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    variants={{
                      hidden: { opacity: 0, y: 18 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
                    }}
                  >
                    <ProjectCard
                      project={project as Parameters<typeof ProjectCard>[0]['project']}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                      index={i}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {!isLoading && paginatedProjects.length > 0 && (
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-full bg-white shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  {...sidebarProps}
                  onClose={() => setDrawerOpen(false)}
                />
              </div>
              <div className="p-4 border-t border-slate-100">
                <Button
                  className="w-full gap-2"
                  onClick={() => setDrawerOpen(false)}
                >
                  Show {totalCount} results
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
