import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, Star, Download, Zap, Shield, Code2, Brain, MessageCircle, CheckCircle, Users, TrendingUp, Award, Sparkles } from 'lucide-react'
import { Button } from '@ui/button'
import { Card, CardContent } from '@ui/card'
import { SectionHeader } from '@components/SectionHeader'
import { ProjectSlider } from '@components/ProjectSlider'
import { CategoryCard } from '@user/components/CategoryCard'
import { SearchBar } from '@components/SearchBar'
import { useTrendingProjects } from '@hooks/useProjects'
import { useFeaturedProjects } from '@hooks/useProjects'
import { useNewProjects } from '@hooks/useProjects'
import { useCategories } from '@hooks/useCategories'
import { MOCK_PROJECTS, MOCK_CATEGORIES, FAQ_ITEMS } from '@shared/constants/mockData'

// ─── AnimateCounter ───────────────────────────────────────────────────────────
interface AnimateCounterProps {
  value: number
  suffix?: string
  duration?: number
}

function AnimateCounter({ value, suffix = '', duration = 2 }: AnimateCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (isInView) motionValue.set(value)
  }, [isInView, motionValue, value])

  useEffect(() => {
    const unsub = springValue.on('change', (v) => setDisplay(Math.floor(v)))
    return unsub
  }, [springValue])

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  )
}

// ─── Floating Hero Cards ──────────────────────────────────────────────────────
const FLOAT_CARDS = [
  { emoji: '🤖', title: 'AI Assistant',       price: '₹1,999', tags: ['Python', 'OpenAI', 'Flask'], rating: 4.9, color: '#3B82F6', top: '4%',  left: '4%',   rotation: '-5deg', delay: 0   },
  { emoji: '✅', title: 'Smart Attendance',    price: '₹999',   tags: ['React', 'Node.js'],          rating: 4.7, color: '#10B981', top: '4%',  right: '3%',  rotation:  '4deg', delay: 0.6 },
  { emoji: '🔒', title: 'Cybersecurity',       price: '₹2,499', tags: ['Python', 'C++'],             rating: 4.8, color: '#EF4444', top: '38%', left: '2%',   rotation:  '5deg', delay: 1.1 },
  { emoji: '📊', title: 'ML Predictor',        price: '₹1,499', tags: ['Scikit', 'Pandas'],          rating: 4.6, color: '#8B5CF6', bottom:'4%', right: '3%', rotation: '-4deg', delay: 0.3 },
  { emoji: '🛒', title: 'E-Commerce Platform', price: '₹2,999', tags: ['Next.js', 'MongoDB'],        rating: 5.0, color: '#F59E0B', top: '62%', left: '22%',  rotation: '-3deg', delay: 0.9 },
]

interface FloatCardProps {
  card: typeof FLOAT_CARDS[0]
}

function FloatCard({ card }: FloatCardProps) {
  const posStyle: React.CSSProperties = {
    position: 'absolute',
    top: card.top,
    left: card.left,
    right: card.right,
    bottom: card.bottom,
    transform: `rotate(${card.rotation})`,
    animation: `float-card-${Math.round(card.delay * 10)} ${3.5 + card.delay}s ease-in-out infinite`,
    zIndex: 10,
  }

  return (
    <motion.div
      style={posStyle}
      initial={{ opacity: 0, y: 30, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.4 + card.delay, ease: 'easeOut' }}
      className="float-card"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-premium border border-white/60 p-3.5 w-48 select-none">
        <div className="flex items-center gap-3 mb-3">
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${card.color}22` }}
          >
            {card.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{card.title}</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: card.color }}>{card.price}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {card.tags.map((tag) => (
            <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 rounded-md px-1.5 py-0.5 font-medium">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={11}
              className={i < Math.floor(card.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
            />
          ))}
          <span className="text-[10px] text-slate-500 ml-1">{card.rating}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── FAQ Item ────────────────────────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left group"
      >
        <span className="font-semibold text-slate-800 text-sm pr-4 leading-snug">{question}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors"
        >
          <span className="text-lg leading-none font-light">+</span>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [location.hash])

  const { data: trendingProjects, isLoading: isTrendingLoading } = useTrendingProjects()
  const { data: featuredProjects, isLoading: isFeaturedLoading } = useFeaturedProjects()
  const { data: newProjects, isLoading: isNewLoading } = useNewProjects()
  const { data: categories } = useCategories()

  const statsRef = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' })

  const STATS = [
    { value: 1500, label: 'Projects', suffix: '+' },
    { value: 500, label: 'Creators', suffix: '+' },
    { value: 3000, label: 'Buyers', suffix: '+' },
    { value: 95, label: 'Satisfaction', suffix: '%' },
  ]

  const MARQUEE_ITEMS = [
    'Trending: AI Assistant',
    'Smart Attendance',
    'Cybersecurity Toolkit',
    'ML Price Predictor',
    'E-Commerce Platform',
    'Blockchain Voting',
    'IoT Dashboard',
    'Chat Application',
    'Inventory Manager',
    'Data Visualizer',
  ]

  return (
    <>
      {/* ─── Global CSS ──────────────────────────────────────────────────── */}
      <style>{`
        @keyframes float-card {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50%       { transform: translateY(-12px) rotate(var(--rot, 0deg)); }
        }
        .float-card { animation: float-card 4s ease-in-out infinite; }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 28s linear infinite; }
        .hero-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .shadow-premium { box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10); }
        .shadow-card    { box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
        .text-gradient-blue-purple {
          background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-gradient-num {
          background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
        }
        .category-slider::-webkit-scrollbar { display: none; }
        .category-slider { scrollbar-width: none; }
      `}</style>

      {/* ════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center hero-grid"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="glow-orb w-[500px] h-[500px] bg-blue-600/20 top-[-100px] left-[-100px]" />
          <div className="glow-orb w-[400px] h-[400px] bg-purple-600/15 bottom-[-80px] right-[10%]" />
          <div className="glow-orb w-[300px] h-[300px] bg-blue-400/10 top-[30%] right-[35%]" />
          {[...Array(18)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{ top: `${10 + (i * 47) % 80}%`, left: `${5 + (i * 37) % 90}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-28 lg:py-0 min-h-screen"
        >
          {/* Left — Text Content */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-300 text-sm font-semibold">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400" />
                </span>
                🎓 #1 Student Innovation Marketplace
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight"
            >
              <span className="text-white">Discover &amp; Buy</span>
              <br />
              <span className="text-white">Student-Built</span>
              <br />
              <span className="text-gradient-blue-purple">Software</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-slate-400 text-lg leading-relaxed max-w-lg"
            >
              InnovateGuide is the premium marketplace where students sell real-world projects.
              Buy source code, get documentation, and build faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <SearchBar />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Button
                variant="accent-gradient"
                size="lg"
                onClick={() => navigate('/browse')}
                className="gap-2 shadow-lg shadow-blue-500/30"
              >
                Browse All Projects <ArrowRight size={18} />
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/upload')}
                className="border border-white/30 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Sell Your Project
              </Button>
            </motion.div>

            <motion.div
              ref={statsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2"
            >
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="text-2xl xl:text-3xl font-extrabold text-white">
                    {statsInView ? (
                      <AnimateCounter value={stat.value} suffix={stat.suffix} />
                    ) : (
                      '0' + stat.suffix
                    )}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Floating Cards */}
          <div className="relative hidden lg:block h-[560px] w-full">
            <div
              className="absolute rounded-full"
              style={{
                width: 280, height: 280,
                top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(139,92,246,0.12) 60%, transparent 80%)',
                filter: 'blur(20px)',
              }}
            />
            {FLOAT_CARDS.map((card) => (
              <FloatCard key={card.title} card={card} />
            ))}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5, type: 'spring' }}
              className="absolute z-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 shadow-premium text-white text-center w-36"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <Sparkles size={26} className="mx-auto mb-2 opacity-90" />
              <p className="text-xs font-bold leading-tight">500+ Creators<br />Building Today</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 2 — MARQUEE BAR
      ════════════════════════════════════════════════════════ */}
      <div className="py-4 overflow-hidden" style={{ background: '#1E293B', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex">
          <div className="marquee-track flex whitespace-nowrap">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 text-sm font-medium text-slate-300 px-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          SECTION 3 — FEATURED PROJECTS
      ════════════════════════════════════════════════════════ */}
      <section id="featured" className="py-16 bg-slate-50">
        <ProjectSlider
          title="Featured Projects"
          subtitle="Handpicked by our team for exceptional quality and impact"
          projects={featuredProjects || MOCK_PROJECTS.filter((p: any) => p.isFeatured)}
          viewAllLink="/browse?filter=featured"
          isLoading={isFeaturedLoading}
        />
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 4 — TRENDING PROJECTS
      ════════════════════════════════════════════════════════ */}
      <section id="trending" className="py-16 bg-white">
        <ProjectSlider
          title="Trending This Week"
          subtitle="Most viewed and downloaded projects right now"
          projects={trendingProjects || MOCK_PROJECTS.filter((p: any) => p.isTrending)}
          viewAllLink="/browse?filter=trending"
          isLoading={isTrendingLoading}
        />
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 5 — CATEGORIES
      ════════════════════════════════════════════════════════ */}
      <section id="categories" className="py-16 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Explore by Category"
            subtitle="Browse 500+ projects across 10 technical domains"
          />
          <div
            className="category-slider flex gap-4 overflow-x-auto pb-4 mt-8 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              const el = e.currentTarget
              const startX = e.pageX - el.offsetLeft
              const scrollLeft = el.scrollLeft
              const onMove = (ev: MouseEvent) => {
                const x = ev.pageX - el.offsetLeft
                el.scrollLeft = scrollLeft - (x - startX)
              }
              const onUp = () => {
                window.removeEventListener('mousemove', onMove)
                window.removeEventListener('mouseup', onUp)
              }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}
          >
            {(categories || MOCK_CATEGORIES).map((cat: any) => (
              <div key={cat.id || cat.slug} className="shrink-0">
                <CategoryCard category={cat} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 6 — NEWLY ADDED
      ════════════════════════════════════════════════════════ */}
      <section id="newly-added" className="py-16 bg-white">
        <ProjectSlider
          title="Newly Added"
          subtitle="Fresh projects just published by creators"
          projects={newProjects || MOCK_PROJECTS.filter((p: any) => p.isNew)}
          viewAllLink="/browse?filter=new"
          isLoading={isNewLoading}
        />
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 7 — TOP SELLING
      ════════════════════════════════════════════════════════ */}
      <section id="top-selling" className="py-16 bg-slate-50">
        <ProjectSlider
          title="Top Selling"
          subtitle="Best-performing projects loved by thousands of buyers"
          projects={MOCK_PROJECTS.filter((p: any) => p.isTopSelling)}
          viewAllLink="/browse?filter=top-selling"
        />
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 8 — CUSTOM PROJECT CTA
      ════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#0F172A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65 }}
            className="flex flex-col gap-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 text-sm font-semibold w-fit">
              <MessageCircle size={15} /> Custom Projects
            </span>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Need a Custom<br />
              <span className="text-gradient-blue-purple">Solution?</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              Can't find exactly what you need? Our expert student creators can build a custom project tailored to your requirements.
            </p>
            <ul className="flex flex-col gap-3">
              {['Project Architecture', 'Student & Industry Experts', 'Delivery & Industry Guidance'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                  <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              variant="accent-gradient"
              size="lg"
              onClick={() => navigate('/custom-project')}
              className="w-fit mt-2 shadow-lg shadow-purple-500/25"
            >
              Request Custom Project <ArrowRight size={18} />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl" />
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Brain size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold">Custom AI Dashboard</p>
                  <p className="text-slate-400 text-sm">Requested by TechCorp Pvt. Ltd.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Code2 size={16} />, label: 'Full Source Code' },
                  { icon: <Shield size={16} />, label: 'Quality Assured' },
                  { icon: <Zap size={16} />, label: 'Fast Delivery' },
                  { icon: <Users size={16} />, label: 'Expert Team' },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2 bg-white/5 rounded-xl p-3">
                    <span className="text-blue-400">{f.icon}</span>
                    <span className="text-slate-300 text-xs font-medium">{f.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-slate-400 text-sm">Starting from</span>
                <span className="text-white font-extrabold text-xl">₹4,999</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 11 — FAQ
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about InnovateGuide"
          />
          <div className="flex flex-col gap-3 mt-10">
            {(FAQ_ITEMS || []).slice(0, 6).map((item: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
              >
                <FAQItem
                  question={item.question}
                  answer={item.answer}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 12 — FINAL CTA BANNER
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 40%, #7C3AED 100%)' }}>
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="absolute top-[-60px] right-[-60px] w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 text-white text-sm font-semibold mb-6">
              <Award size={15} /> Join 3,000+ Satisfied Buyers
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Ready to Find Your<br />Perfect Project?
            </h2>
            <p className="text-blue-100 text-lg mt-4 leading-relaxed max-w-xl mx-auto">
              Browse 1,500+ student-built projects. Source code included.
              Start building today.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-xl"
          >
            <SearchBar />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={() => navigate('/browse')}
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-xl gap-2"
            >
              Browse Projects <ArrowRight size={18} />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/upload')}
              className="border-2 border-white/60 bg-transparent text-white hover:bg-white/10 font-semibold"
            >
              Sell Your Project
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-4"
          >
            {[
              { icon: <Shield size={15} />, text: 'Secure Payments' },
              { icon: <CheckCircle size={15} />, text: 'Verified Projects' },
              { icon: <Download size={15} />, text: 'Instant Download' },
              { icon: <TrendingUp size={15} />, text: '95% Satisfaction' },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <span className="text-white">{b.icon}</span>
                {b.text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
