import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ─── Animated placeholder strings ─────────────────────────────────────────────
const PLACEHOLDER_CYCLE = [
  'Search AI projects...',
  'Find React projects...',
  'Explore ML systems...',
  'Browse final year projects...',
]

// ─── Props ────────────────────────────────────────────────────────────────────
export interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SearchBar({
  onSearch,
  placeholder,
  className,
  autoFocus = false,
}: SearchBarProps) {
  const navigate = useNavigate()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [value, setValue] = React.useState('')
  const [placeholderIndex, setPlaceholderIndex] = React.useState(0)
  const [placeholderVisible, setPlaceholderVisible] = React.useState(true)

  // ── Cycling placeholder ────────────────────────────────────
  React.useEffect(() => {
    if (placeholder) return // user provided a static placeholder
    const tick = setInterval(() => {
      // fade out
      setPlaceholderVisible(false)
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_CYCLE.length)
        setPlaceholderVisible(true)
      }, 350)
    }, 2800)
    return () => clearInterval(tick)
  }, [placeholder])

  const activePlaceholder = placeholder ?? PLACEHOLDER_CYCLE[placeholderIndex]

  // ── Handlers ───────────────────────────────────────────────
  const handleSubmit = React.useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (onSearch) {
      onSearch(trimmed)
    } else {
      navigate(`/browse?search=${encodeURIComponent(trimmed)}`)
    }
  }, [value, onSearch, navigate])

  const handleClear = () => {
    setValue('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      handleClear()
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className={cn('relative flex items-center gap-2 w-full', className)}>
      {/* Input wrapper */}
      <div
        className={cn(
          'relative flex items-center flex-1 bg-white border border-slate-200 rounded-2xl',
          'shadow-card focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]',
          'transition-all duration-200'
        )}
      >
        {/* Left search icon */}
        <Search
          size={18}
          className="absolute left-4 text-slate-400 pointer-events-none shrink-0"
          aria-hidden="true"
        />

        {/* Animated placeholder layer */}
        {value === '' && (
          <span
            aria-hidden="true"
            className={cn(
              'absolute left-11 right-14 top-1/2 -translate-y-1/2',
              'text-slate-400 text-sm pointer-events-none truncate',
              'transition-opacity duration-300',
              placeholderVisible ? 'opacity-100' : 'opacity-0'
            )}
          >
            {activePlaceholder}
          </span>
        )}

        {/* Actual input – placeholder="" so custom layer above is used */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder=""
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search projects"
          className={cn(
            'w-full h-14 pl-11 pr-10 bg-transparent rounded-2xl',
            'text-sm text-primary font-inter',
            'focus:outline-none'
          )}
        />

        {/* Clear button */}
        <AnimatePresence>
          {value.length > 0 && (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'w-6 h-6 flex items-center justify-center rounded-full',
                'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
                'transition-colors duration-150'
              )}
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Search button */}
      <Button
        variant="primary"
        size="md"
        onClick={handleSubmit}
        aria-label="Submit search"
        className="shrink-0 h-14 px-6 rounded-2xl"
      >
        Search
      </Button>
    </div>
  )
}

export default SearchBar
