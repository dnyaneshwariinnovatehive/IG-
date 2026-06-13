import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Star,
  Download,
  Eye,
  MessageCircle,
  Share2,
  ChevronLeft,
  Play,
  ExternalLink,
  Check,
  Shield,
  FileText,
  Video,
  Code2,
  Bookmark,
  Copy,
  Tag,
  BarChart2,
  Calendar,
} from 'lucide-react'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ui/tabs'
import { ProjectSlider } from '@components/ProjectSlider'
import { useProject } from '@hooks/useProjects'
import { MOCK_PROJECTS } from '@shared/constants/mockData'
import {
  formatPrice,
  formatDate,
  getWhatsAppLink,
  generateCreatorId,
} from '@utils/index'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-200 text-slate-200'
          }
        />
      ))}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: project, isLoading, isError } = useProject(id)

  const proj = project ?? MOCK_PROJECTS.find((p) => p.id === id) ?? MOCK_PROJECTS[0]

  const [mainImage, setMainImage] = useState<number>(0)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (isError && !proj) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-slate-500">Project not found.</p>
        <Button asChild variant="outline">
          <Link to="/browse">Back to Browse</Link>
        </Button>
      </div>
    )
  }

  const images: string[] = proj.screenshots.length > 0 ? proj.screenshots : []
  const hasImages = images.length > 0

  const creatorLabel = generateCreatorId(proj.id)
  const whatsappHref = getWhatsAppLink(proj.title, proj.price)

  const diffVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  }
  const diffVariant = diffVariantMap[proj.difficulty] ?? 'default'

  const highlights = [
    `Domain: ${proj.domain}`,
    `Difficulty: ${proj.difficulty.charAt(0).toUpperCase() + proj.difficulty.slice(1)}`,
    `Technologies: ${proj.technologies.join(', ')}`,
    'Complete source code included',
    'Detailed documentation provided',
    ...(proj.videoUrl ? ['Step-by-step video tutorial included'] : []),
    '7-day WhatsApp support after purchase',
  ]

  const mockReviews = [
    { id: 'r1', name: 'Anonymous Buyer', rating: 5, comment: 'Excellent project, well documented and easy to run. Highly recommended!', date: '2026-05-10' },
    { id: 'r2', name: 'Anonymous Buyer', rating: 4, comment: 'Good quality code, support team was responsive on WhatsApp.', date: '2026-04-28' },
  ]

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const related = MOCK_PROJECTS.filter((p) => p.id !== proj.id).slice(0, 5)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <Link to="/browse" className="hover:text-accent transition-colors">Browse</Link>
          <span>/</span>
          <span className="text-[#0F172A] font-medium truncate max-w-xs">{proj.title}</span>
        </nav>
      </div>

      {/* ── Back link ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent transition-colors"
        >
          <ChevronLeft size={15} />
          Back to Browse
        </Link>
      </div>

      {/* ── Two-column layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ══ LEFT CONTENT (2/3) ══════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex-1 min-w-0"
          >
            {/* ── Image Gallery ── */}
            <div className="mb-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 shadow-lg">
                {hasImages ? (
                  <img
                    src={images[mainImage]}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Code2 size={32} className="text-white" />
                    </div>
                    <span className="font-sora font-bold text-white text-xl text-center px-4">
                      {proj.title}
                    </span>
                    <span className="text-white/70 text-sm">{proj.domain}</span>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                  {proj.isTrending && <Badge variant="trending">Trending</Badge>}
                  {proj.isNew && <Badge variant="new">New</Badge>}
                  {proj.isTopSelling && <Badge variant="top-seller">Top Seller</Badge>}
                  {proj.isFeatured && <Badge variant="purple">Featured</Badge>}
                </div>
              </div>

              {(hasImages || proj.videoUrl) && (
                <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(idx)}
                      className={`relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        mainImage === idx
                          ? 'border-accent shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={src} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}

                  {proj.videoUrl && (
                    <a
                      href={proj.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 border-transparent bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center hover:border-accent transition-all duration-200"
                      title="Watch Video Tutorial"
                    >
                      <Play size={18} className="text-white fill-white" />
                      <span className="sr-only">Play tutorial video</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* ── Tabs Section ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <Tabs defaultValue="overview">
                <TabsList className="flex-wrap h-auto gap-1 mb-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="technologies">Technologies</TabsTrigger>
                  <TabsTrigger value="documentation">Documentation</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews ({proj.reviewCount})
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-sora font-semibold text-[#0F172A] text-lg mb-3">
                        About this Project
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                        {proj.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-sora font-semibold text-[#0F172A] text-base mb-3">
                        Key Highlights
                      </h3>
                      <ul className="space-y-2">
                        {highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <Check
                              size={16}
                              className="text-emerald-500 mt-0.5 shrink-0"
                            />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {proj.tags.length > 0 && (
                      <div>
                        <h3 className="font-sora font-semibold text-[#0F172A] text-base mb-3">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {proj.tags.map((tag) => (
                            <Badge key={tag} variant="default" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features">
                  <div className="space-y-3">
                    <h3 className="font-sora font-semibold text-[#0F172A] text-lg mb-4">
                      Project Features
                    </h3>
                    <ul className="space-y-3">
                      {[
                        'Complete, production-ready source code',
                        'Modular and well-commented codebase',
                        'Detailed README with setup and installation guide',
                        'Database schema and sample data included',
                        'Responsive UI compatible with all screen sizes',
                        'Admin panel with role-based access control',
                        'Secure authentication and authorization flow',
                        'RESTful API with proper error handling',
                        'Unit and integration test suite',
                        'Deployment-ready configuration files',
                        ...(proj.videoUrl ? ['Full video walkthrough of all features'] : []),
                        'WhatsApp support for 7 days post-purchase',
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={12} className="text-accent" />
                          </span>
                          <span className="text-sm text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                {/* Technologies Tab */}
                <TabsContent value="technologies">
                  <div className="space-y-5">
                    <h3 className="font-sora font-semibold text-[#0F172A] text-lg">
                      Technologies Used
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {proj.technologies.map((tech) => (
                        <div
                          key={tech}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                            <Code2 size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-[#0F172A] text-sm">{tech}</p>
                            <p className="text-xs text-slate-500">Core technology</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Documentation Tab */}
                <TabsContent value="documentation">
                  <div className="space-y-5">
                    <h3 className="font-sora font-semibold text-[#0F172A] text-lg">
                      Documentation
                    </h3>
                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <FileText size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-800 text-sm mb-1">
                          Comprehensive Documentation Included
                        </p>
                        <p className="text-emerald-700 text-sm leading-relaxed">
                          This project comes with detailed documentation covering system architecture,
                          database design, API endpoints, installation steps, and usage instructions.
                          Perfect for academic submission and personal learning.
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {[
                        'System Design and Architecture Document',
                        'Database Schema (ER Diagram + SQL/NoSQL scripts)',
                        'API Reference with request/response examples',
                        'Step-by-step Installation & Setup Guide',
                        'User Manual with screenshots',
                        'Project Report Template (IEEE format)',
                        'Environment configuration instructions',
                      ].map((doc, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <Check size={14} className="text-emerald-500 shrink-0" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="text-center">
                        <p className="font-sora font-bold text-4xl text-[#0F172A]">
                          {proj.rating.toFixed(1)}
                        </p>
                        <StarRating rating={proj.rating} size={14} />
                        <p className="text-xs text-slate-500 mt-1">
                          {proj.reviewCount} reviews
                        </p>
                      </div>
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const pct = star === 5 ? 65 : star === 4 ? 22 : star === 3 ? 8 : star === 2 ? 3 : 2
                          return (
                            <div key={star} className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-slate-500 w-3">{star}</span>
                              <Star size={10} className="fill-amber-400 text-amber-400" />
                              <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-400 w-6">{pct}%</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {mockReviews.length > 0 ? (
                      <div className="space-y-4">
                        {mockReviews.map((review) => (
                          <div
                            key={review.id}
                            className="p-4 bg-white border border-slate-100 rounded-xl"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                  AB
                                </div>
                                <span className="text-sm font-medium text-[#0F172A]">
                                  {review.name}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400">
                                {formatDate(review.date)}
                              </span>
                            </div>
                            <StarRating rating={review.rating} size={13} />
                            <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-400">
                        <Star size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No reviews yet. Be the first to review!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>

          {/* ══ RIGHT SIDEBAR (1/3) ══════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="w-full lg:w-[340px] xl:w-[360px] flex-shrink-0"
          >
            <div className="sticky top-24 space-y-4">
              {/* ── Purchase Card ── */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h1 className="font-sora font-bold text-2xl text-[#0F172A] leading-snug mb-1">
                  {proj.title}
                </h1>

                <p className="text-sm text-slate-500 mb-3">
                  by{' '}
                  <span className="font-medium text-accent">
                    {creatorLabel}
                  </span>
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={proj.rating} />
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {proj.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-400">
                    ({proj.reviewCount} reviews)
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-5">
                  <span className="font-sora font-bold text-3xl text-accent">
                    {formatPrice(proj.price)}
                  </span>
                  <span className="text-sm text-slate-400">one-time</span>
                </div>

                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="block w-full mb-3">
                  <Button
                    variant="success"
                    size="lg"
                    className="w-full bg-[#25D366] hover:bg-[#1ebe57] focus-visible:ring-green-500 text-white shadow-md hover:shadow-green-400/30"
                  >
                    <MessageCircle size={18} />
                    Buy via WhatsApp
                  </Button>
                </a>

                <Link to="/custom-project" className="block w-full mb-4">
                  <Button variant="outline" size="lg" className="w-full">
                    <ExternalLink size={16} />
                    Request Similar Project
                  </Button>
                </Link>

                <button
                  onClick={() => setSaved((s) => !s)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    saved ? 'text-accent font-medium' : 'text-slate-500 hover:text-accent'
                  }`}
                >
                  <Bookmark
                    size={16}
                    className={saved ? 'fill-accent text-accent' : ''}
                  />
                  {saved ? 'Saved to Wishlist' : 'Save to Wishlist'}
                </button>

                <hr className="my-4 border-slate-100" />

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                    <Eye size={15} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Views</p>
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {proj.views.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                    <Download size={15} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Downloads</p>
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {proj.downloads.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                    <BarChart2 size={15} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Difficulty</p>
                      <Badge variant={diffVariant} className="text-xs capitalize mt-0.5">
                        {proj.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                    <Tag size={15} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Category</p>
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {proj.domain}
                      </p>
                    </div>
                  </div>
                </div>

                {proj.updatedAt && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                    <Calendar size={13} />
                    Last updated {formatDate(proj.updatedAt)}
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((t) => (
                      <Badge key={t} variant="blue" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <hr className="my-4 border-slate-100" />

                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    What's Included
                  </p>
                  {[
                    { icon: Shield, label: 'Admin Approved' },
                    { icon: Code2, label: 'Source Code Included' },
                    ...(proj.videoUrl ? [{ icon: Video, label: 'Video Tutorial Included' }] : []),
                    { icon: FileText, label: 'Documentation Included' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check size={11} className="text-emerald-600" />
                      </span>
                      <Icon size={14} className="text-slate-400 shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>

                <hr className="my-4 border-slate-100" />

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Share
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `Check out "${proj.title}" on InnovateGuide — ${window.location.href}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1DA1F2] transition-colors"
                    >
                      <Share2 size={14} />
                      Share
                    </a>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="text-emerald-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy Link
                        </>
                      )}
                    </button>
                    <Button variant="ghost" size="icon" className="text-slate-500">
                      <Share2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Related / Similar Projects ── */}
        <div className="mt-16">
          <ProjectSlider
            title="Similar Projects"
            subtitle="You might also like these projects"
            projects={related}
            viewAllLink="/browse"
          />
        </div>
      </div>
    </div>
  )
}
