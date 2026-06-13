import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  FolderOpen, GraduationCap, Shield, Clock, ShoppingCart, Zap,
  Plus, ArrowRight, TrendingUp, Eye, Download,
  Pencil, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AdminHeader from '@/components/admin/AdminHeader'
import { useQuery } from '@tanstack/react-query'
import adminService from '@/services/adminService'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalProjects: number
  pendingApprovals: number
  adminProjects: number
  studentProjects: number
  buyEnquiries: number
  customEnquiries: number
}

type ProjectStatus = 'pending' | 'approved' | 'rejected' | 'published'
type ProjectType = 'admin' | 'student'

interface MockProject {
  id: number
  title: string
  type: ProjectType
  price: number | null
  domain: string
  status: ProjectStatus
}

// ─── Constants / Mock Data ─────────────────────────────────────────────────────

const CHART_COLORS = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']

const FALLBACK_STATS: DashboardStats = {
  totalProjects: 29,
  pendingApprovals: 5,
  adminProjects: 9,
  studentProjects: 18,
  buyEnquiries: 10,
  customEnquiries: 3,
}

const MONTHLY_DATA = [
  { month: 'Jan', count: 3 },
  { month: 'Feb', count: 5 },
  { month: 'Mar', count: 4 },
  { month: 'Apr', count: 7 },
  { month: 'May', count: 6 },
  { month: 'Jun', count: 9 },
  { month: 'Jul', count: 8 },
  { month: 'Aug', count: 11 },
  { month: 'Sep', count: 10 },
  { month: 'Oct', count: 13 },
  { month: 'Nov', count: 12 },
  { month: 'Dec', count: 15 },
]

const CATEGORY_DATA = [
  { name: 'Web Dev', value: 10 },
  { name: 'AI/ML', value: 7 },
  { name: 'Mobile', value: 5 },
  { name: 'IoT', value: 4 },
  { name: 'Others', value: 3 },
]

const WEEKLY_VIEWS = [
  { day: 'Mon', views: 420 },
  { day: 'Tue', views: 380 },
  { day: 'Wed', views: 510 },
  { day: 'Thu', views: 470 },
  { day: 'Fri', views: 630 },
  { day: 'Sat', views: 290 },
  { day: 'Sun', views: 210 },
]

const MOCK_PROJECTS: MockProject[] = [
  { id: 1,  title: 'Smart Attendance System',       type: 'admin',   price: 1499, domain: 'IoT',       status: 'published' },
  { id: 2,  title: 'AI Resume Screener',             type: 'admin',   price: 2499, domain: 'AI/ML',    status: 'published' },
  { id: 3,  title: 'Hospital Management Portal',    type: 'student', price: null, domain: 'Web Dev',  status: 'pending'   },
  { id: 4,  title: 'Expense Tracker App',            type: 'student', price: null, domain: 'Mobile',   status: 'approved'  },
  { id: 5,  title: 'Voice Controlled Robot',         type: 'student', price: null, domain: 'IoT',      status: 'rejected'  },
  { id: 6,  title: 'E-Commerce Platform',            type: 'admin',   price: 3499, domain: 'Web Dev',  status: 'published' },
  { id: 7,  title: 'Gesture Recognition System',     type: 'student', price: null, domain: 'AI/ML',    status: 'pending'   },
  { id: 8,  title: 'Blockchain Voting System',       type: 'admin',   price: 4999, domain: 'Web Dev',  status: 'published' },
  { id: 9,  title: 'Plant Disease Detector',         type: 'student', price: null, domain: 'AI/ML',    status: 'approved'  },
  { id: 10, title: 'Smart Parking System',           type: 'admin',   price: 1999, domain: 'IoT',      status: 'published' },
  { id: 11, title: 'Online Exam Portal',             type: 'student', price: null, domain: 'Web Dev',  status: 'pending'   },
  { id: 12, title: 'Face Recognition Attendance',   type: 'admin',   price: 2999, domain: 'AI/ML',    status: 'published' },
  { id: 13, title: 'Inventory Management System',   type: 'student', price: null, domain: 'Web Dev',  status: 'approved'  },
  { id: 14, title: 'Real-time Chat Application',    type: 'student', price: null, domain: 'Web Dev',  status: 'pending'   },
  { id: 15, title: 'Energy Monitoring Dashboard',   type: 'admin',   price: 1799, domain: 'IoT',      status: 'published' },
]

// ─── Animation Variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ─── Colour Maps ───────────────────────────────────────────────────────────────

const iconColorMap: Record<string, string> = {
  teal:   'bg-teal-100 text-teal-600',
  amber:  'bg-amber-100 text-amber-600',
  blue:   'bg-blue-100 text-blue-600',
  green:  'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  pink:   'bg-pink-100 text-pink-600',
}

const statusBadgeMap: Record<ProjectStatus, React.ComponentProps<typeof Badge>['variant']> = {
  pending:   'warning',
  approved:  'success',
  rejected:  'danger',
  published: 'blue',
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType
  color: string
  label: string
  value: number
  link: string
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, color, label, value, link }) => (
  <motion.div variants={itemVariants}>
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconColorMap[color]}`}>
            <Icon size={22} />
          </div>
          <div>
            <p className="text-3xl font-bold font-sora text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 font-inter mt-0.5">{label}</p>
          </div>
        </div>
        <Link
          to={link}
          className="shrink-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          aria-label={`View ${label}`}
        >
          <ArrowRight size={16} />
        </Link>
      </CardContent>
    </Card>
  </motion.div>
)

// ─── Custom Pie Tooltip ────────────────────────────────────────────────────────

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-sm">
        <span className="font-semibold text-slate-800">{payload[0].name}:</span>{' '}
        <span className="text-slate-600">{payload[0].value}</span>
      </div>
    )
  }
  return null
}

// ─── Main Component ────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10

const AdminDashboardPage: React.FC = () => {
  const [page, setPage] = useState(1)

  // Fetch stats; fall back to mock on error
  const { data: rawStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
    retry: 1,
  })

  const stats: DashboardStats = {
    totalProjects:    (rawStats as DashboardStats | undefined)?.totalProjects    ?? FALLBACK_STATS.totalProjects,
    pendingApprovals: (rawStats as DashboardStats | undefined)?.pendingApprovals ?? FALLBACK_STATS.pendingApprovals,
    adminProjects:    (rawStats as DashboardStats | undefined)?.adminProjects    ?? FALLBACK_STATS.adminProjects,
    studentProjects:  (rawStats as DashboardStats | undefined)?.studentProjects  ?? FALLBACK_STATS.studentProjects,
    buyEnquiries:     (rawStats as DashboardStats | undefined)?.buyEnquiries     ?? FALLBACK_STATS.buyEnquiries,
    customEnquiries:  (rawStats as DashboardStats | undefined)?.customEnquiries  ?? FALLBACK_STATS.customEnquiries,
  }

  const statCards: StatCardProps[] = [
    { icon: FolderOpen,   color: 'teal',   label: 'Total Projects',    value: stats.totalProjects,    link: '/admin/projects' },
    { icon: Clock,        color: 'amber',  label: 'Pending Approvals', value: stats.pendingApprovals, link: '/admin/student-projects?filter=pending' },
    { icon: Shield,       color: 'blue',   label: 'Admin Projects',    value: stats.adminProjects,    link: '/admin/admin-projects' },
    { icon: GraduationCap,color: 'green',  label: 'Student Projects',  value: stats.studentProjects,  link: '/admin/student-projects' },
    { icon: ShoppingCart, color: 'purple', label: 'Buy Enquiries',     value: stats.buyEnquiries,     link: '/admin/project-requests' },
    { icon: Zap,          color: 'pink',   label: 'Custom Enquiries',  value: stats.customEnquiries,  link: '/admin/project-requests' },
  ]

  // Pagination
  const totalPages = Math.ceil(MOCK_PROJECTS.length / ROWS_PER_PAGE)
  const paginatedProjects = MOCK_PROJECTS.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <AdminHeader title="Dashboard" subtitle="Overview of your platform activity" />

      {/* Main content */}
      <main className="flex-1 px-6 py-8 space-y-8 max-w-screen-2xl mx-auto w-full">

        {/* ── Stats Grid ────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Platform Overview
          </h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </motion.div>
        </section>

        {/* ── Charts Row ────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Line Chart — Monthly Projects */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Monthly Projects Added</CardTitle>
                  <TrendingUp size={16} className="text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={MONTHLY_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#2563EB' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart — Projects by Category */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Projects by Category</CardTitle>
                  <Eye size={16} className="text-purple-500" />
                </div>
              </CardHeader>
              <CardContent className="pt-2 flex flex-col items-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={CATEGORY_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {CATEGORY_DATA.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                  {CATEGORY_DATA.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-xs text-slate-500">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart — Weekly Views */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Weekly Views</CardTitle>
                  <Download size={16} className="text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={WEEKLY_VIEWS} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Bar dataKey="views" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="gap-2">
              <Link to="/admin/admin-projects/add">
                <Plus size={16} />
                Add New Project
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/student-projects?filter=pending">
                <Clock size={16} />
                View Pending Approvals
                {stats.pendingApprovals > 0 && (
                  <span className="ml-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full px-2 py-0.5">
                    {stats.pendingApprovals}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Recent Projects Table ──────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              Recent Projects
            </h2>
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
              <Link to="/admin/projects">
                View All
                <ArrowRight size={13} />
              </Link>
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Title</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Type</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Price</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Domain</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {paginatedProjects.map((project) => (
                    <motion.tr
                      key={project.id}
                      variants={itemVariants}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-800 max-w-xs truncate">
                        {project.title}
                      </td>
                      <td className="px-5 py-3.5">
                        {project.type === 'admin' ? (
                          <Badge variant="blue">Admin</Badge>
                        ) : (
                          <Badge variant="purple">Student</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {project.price !== null ? (
                          <span className="font-medium">₹{project.price.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Free</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{project.domain}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusBadgeMap[project.status]}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/${project.type === 'admin' ? 'admin-projects' : 'student-projects'}/${project.id}/edit`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-600 text-slate-500 transition-colors"
                            aria-label={`Edit ${project.title}`}
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-colors"
                            aria-label={`Delete ${project.title}`}
                            onClick={() => {
                              // placeholder — wire to delete handler
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700">
                  {(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, MOCK_PROJECTS.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-700">{MOCK_PROJECTS.length}</span> projects
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white border border-blue-600'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default AdminDashboardPage
