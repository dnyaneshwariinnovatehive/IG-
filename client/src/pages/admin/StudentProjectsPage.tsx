import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Check, X, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import AdminHeader from '@/components/admin/AdminHeader'
import { MOCK_PROJECTS } from '@/data/mockData'
import { formatPrice, formatDate } from '@/lib/utils'

/* ─────────────────────────────────────────────
   Augmented type for student projects
───────────────────────────────────────────── */
type ApprovalStatus = 'pending' | 'approved' | 'rejected'

interface StudentProject {
  id: string
  title: string
  studentName: string
  email: string
  price: number
  domain: string
  approvalStatus: ApprovalStatus
  createdAt: string
}

/* ─────────────────────────────────────────────
   Mock student projects (seeded from MOCK_PROJECTS
   with student-specific fields overlaid)
───────────────────────────────────────────── */
const STUDENT_META: Array<{
  studentName: string
  email: string
  approvalStatus: ApprovalStatus
}> = [
  { studentName: 'Aditya Sharma',   email: 'aditya.sharma@college.edu',   approvalStatus: 'pending'  },
  { studentName: 'Priya Menon',     email: 'priya.menon@university.edu',   approvalStatus: 'approved' },
  { studentName: 'Rohit Gupta',     email: 'rohit.gupta@institute.edu',    approvalStatus: 'rejected' },
  { studentName: 'Sneha Iyer',      email: 'sneha.iyer@college.edu',       approvalStatus: 'pending'  },
  { studentName: 'Karthik Raj',     email: 'karthik.raj@university.edu',   approvalStatus: 'approved' },
  { studentName: 'Anjali Singh',    email: 'anjali.singh@tech.edu',        approvalStatus: 'pending'  },
  { studentName: 'Vikram Patel',    email: 'vikram.patel@college.edu',     approvalStatus: 'rejected' },
  { studentName: 'Meera Nair',      email: 'meera.nair@institute.edu',     approvalStatus: 'approved' },
  { studentName: 'Suresh Kumar',    email: 'suresh.kumar@university.edu',  approvalStatus: 'pending'  },
]

const BASE_PROJECTS = MOCK_PROJECTS.slice(0, STUDENT_META.length)

const STUDENT_PROJECTS: StudentProject[] = BASE_PROJECTS.map((p, i) => ({
  id: `stu-${p.id}`,
  title: p.title,
  studentName: STUDENT_META[i].studentName,
  email: STUDENT_META[i].email,
  price: Math.round(p.price * 0.6),
  domain: p.domain,
  approvalStatus: STUDENT_META[i].approvalStatus,
  createdAt: p.createdAt,
}))

/* ─────────────────────────────────────────────
   Helper
───────────────────────────────────────────── */
type FilterTab = 'all' | ApprovalStatus

const PAGE_SIZE = 10

const statusBadge = (status: ApprovalStatus) => {
  switch (status) {
    case 'pending':
      return <Badge variant="warning">Pending</Badge>
    case 'approved':
      return <Badge variant="success">Approved</Badge>
    case 'rejected':
      return <Badge variant="danger">Rejected</Badge>
  }
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const StudentProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<StudentProject[]>(STUDENT_PROJECTS)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [currentPage, setCurrentPage] = useState(1)

  /* Approve dialog */
  const [approveTarget, setApproveTarget] = useState<StudentProject | null>(null)

  /* Reject dialog */
  const [rejectTarget, setRejectTarget] = useState<StudentProject | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  /* View dialog */
  const [viewTarget, setViewTarget] = useState<StudentProject | null>(null)

  /* ── counts ── */
  const counts = useMemo(
    () => ({
      all: projects.length,
      pending: projects.filter((p) => p.approvalStatus === 'pending').length,
      approved: projects.filter((p) => p.approvalStatus === 'approved').length,
      rejected: projects.filter((p) => p.approvalStatus === 'rejected').length,
    }),
    [projects]
  )

  /* ── filtered ── */
  const filtered = useMemo(() => {
    if (activeTab === 'all') return projects
    return projects.filter((p) => p.approvalStatus === activeTab)
  }, [projects, activeTab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  /* ── Approve confirm ── */
  const confirmApprove = () => {
    if (!approveTarget) return
    setProjects((prev) =>
      prev.map((p) =>
        p.id === approveTarget.id ? { ...p, approvalStatus: 'approved' } : p
      )
    )
    setApproveTarget(null)
  }

  /* ── Reject confirm ── */
  const confirmReject = () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      setRejectError('Please provide a rejection reason.')
      return
    }
    // In production: call rejectProject(rejectTarget.id, rejectReason)
    setProjects((prev) =>
      prev.map((p) =>
        p.id === rejectTarget.id ? { ...p, approvalStatus: 'rejected' } : p
      )
    )
    setRejectTarget(null)
    setRejectReason('')
    setRejectError('')
  }

  const openReject = (project: StudentProject) => {
    setRejectTarget(project)
    setRejectReason('')
    setRejectError('')
  }

  /* ── Tab label helper ── */
  const TAB_LABELS: Array<{ key: FilterTab; label: string }> = [
    { key: 'all',      label: 'All'      },
    { key: 'pending',  label: 'Pending'  },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Student Projects Management" />

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sora font-bold text-xl text-primary-900">
            Student Submitted Projects
          </h2>
          <p className="mt-0.5 text-sm font-inter text-muted">
            Manage and moderate student project submissions
          </p>
        </div>
        <Link to="/admin/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft size={15} />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-1 border-b border-border">
        {TAB_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`
              px-4 py-2.5 text-sm font-inter font-medium rounded-t-lg
              transition-colors duration-150 whitespace-nowrap
              ${
                activeTab === key
                  ? 'bg-[#1E3A5F] text-white border border-b-0 border-border'
                  : 'text-muted hover:text-primary-900 hover:bg-slate-50'
              }
            `}
          >
            {label}{' '}
            <span
              className={`
                ml-1.5 inline-flex items-center justify-center
                rounded-full px-1.5 py-0.5 text-[10px] font-semibold
                ${
                  activeTab === key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-primary-600'
                }
              `}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-border shadow-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-inter">
            <thead>
              <tr className="bg-[#1E3A5F] text-white">
                <th className="text-left px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">
                  Title
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">
                  Student Name
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">
                  Email
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">
                  Price
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">
                  Domain
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">
                  Status
                </th>
                <th className="text-center px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-muted font-inter text-sm"
                  >
                    No projects found in this category.
                  </td>
                </tr>
              ) : (
                paginated.map((project) => (
                  <tr
                    key={project.id}
                    className="bg-white hover:bg-slate-50 transition-colors duration-100"
                  >
                    <td className="px-5 py-3.5 font-medium text-primary-900 whitespace-nowrap">
                      {project.title}
                    </td>
                    <td className="px-5 py-3.5 text-primary-700 whitespace-nowrap">
                      {project.studentName}
                    </td>
                    <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                      {project.email}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge variant="blue">{formatPrice(project.price)}</Badge>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge variant="default">{project.domain}</Badge>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {statusBadge(project.approvalStatus)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {/* View */}
                        <button
                          title="View details"
                          onClick={() => setViewTarget(project)}
                          className="p-1.5 rounded-lg text-teal-600 bg-teal-50 hover:bg-teal-100 transition-colors duration-150"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Approve */}
                        <button
                          title="Approve project"
                          onClick={() => setApproveTarget(project)}
                          disabled={project.approvalStatus === 'approved'}
                          className="
                            p-1.5 rounded-lg text-green-600 bg-green-50
                            hover:bg-green-100 transition-colors duration-150
                            disabled:opacity-40 disabled:pointer-events-none
                          "
                        >
                          <Check size={15} />
                        </button>

                        {/* Reject */}
                        <button
                          title="Reject project"
                          onClick={() => openReject(project)}
                          disabled={project.approvalStatus === 'rejected'}
                          className="
                            p-1.5 rounded-lg text-red-600 bg-red-50
                            hover:bg-red-100 transition-colors duration-150
                            disabled:opacity-40 disabled:pointer-events-none
                          "
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-white">
            <p className="text-xs font-inter text-muted">
              Page {currentPage} of {totalPages} &mdash; {filtered.length} total
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-primary-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`
                    h-7 w-7 rounded-lg text-xs font-inter font-medium transition-colors duration-150
                    ${page === currentPage ? 'bg-[#1E3A5F] text-white' : 'text-primary-600 hover:bg-slate-100'}
                  `}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-primary-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          View Details Dialog
      ══════════════════════════════════════════ */}
      <Dialog open={!!viewTarget} onOpenChange={() => setViewTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>
              Submitted student project information
            </DialogDescription>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-3 text-sm font-inter">
              <DetailRow label="Title"    value={viewTarget.title} />
              <DetailRow label="Student"  value={viewTarget.studentName} />
              <DetailRow label="Email"    value={viewTarget.email} />
              <DetailRow label="Domain"   value={viewTarget.domain} />
              <DetailRow label="Price"    value={formatPrice(viewTarget.price)} />
              <DetailRow label="Submitted" value={formatDate(viewTarget.createdAt)} />
              <div className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-muted font-medium">Status</span>
                <span>:</span>
                {statusBadge(viewTarget.approvalStatus)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setViewTarget(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════
          Approve Confirm Dialog
      ══════════════════════════════════════════ */}
      <Dialog open={!!approveTarget} onOpenChange={() => setApproveTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Approve Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve{' '}
              <span className="font-semibold text-primary-900">
                {approveTarget?.title}
              </span>
              ? The project will be visible in the marketplace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={confirmApprove}>
              <Check size={14} />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════
          Reject Dialog
      ══════════════════════════════════════════ */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={() => {
          setRejectTarget(null)
          setRejectReason('')
          setRejectError('')
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Project</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting{' '}
              <span className="font-semibold text-primary-900">
                {rejectTarget?.title}
              </span>
              . This will be shared with the student.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <label className="text-sm font-inter font-medium text-primary-900">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value)
                if (e.target.value.trim()) setRejectError('')
              }}
              rows={4}
              placeholder="Explain why this project is being rejected…"
              className="
                w-full px-3 py-2 text-sm font-inter resize-none
                bg-white border border-border rounded-lg
                text-primary-900 placeholder:text-muted
                focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                transition-all duration-150
              "
            />
            {rejectError && (
              <p className="text-xs text-red-500 font-inter">{rejectError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRejectTarget(null)
                setRejectReason('')
                setRejectError('')
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmReject}>
              <X size={14} />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ── Small helper component ── */
const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-start gap-2">
    <span className="w-28 shrink-0 text-muted font-medium">{label}</span>
    <span>:</span>
    <span className="text-primary-900 break-words">{value}</span>
  </div>
)

export default StudentProjectsPage
