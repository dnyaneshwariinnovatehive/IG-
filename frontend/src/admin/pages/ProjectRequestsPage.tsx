import React, { useState, useMemo } from 'react'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@ui/dialog'
import AdminHeader from '@admin/components/AdminHeader'
import { formatDate } from '@utils/index'

type RequestStatus = 'pending' | 'in-progress' | 'completed' | 'rejected'

interface ProjectRequest {
  id: string
  name: string
  email: string
  phone: string
  projectType: string
  budget: string
  timeline: string
  technologies: string[]
  description: string
  additionalInfo: string
  status: RequestStatus
  createdAt: string
}

const MOCK_REQUESTS: ProjectRequest[] = [
  {
    id: 'req-001', name: 'Aditya Verma', email: 'aditya.verma@gmail.com', phone: '+91 98765 43210',
    projectType: 'AI / Machine Learning', budget: '₹3,000 – ₹5,000', timeline: '2 weeks',
    technologies: ['Python', 'TensorFlow', 'Flask', 'React'],
    description: 'I need a plant disease detection system using CNN that can identify common leaf diseases from uploaded images. The app should have a React frontend where users can upload images and get predictions with confidence scores.',
    additionalInfo: 'Deadline is before my university viva on 30 June. Must include a detailed project report and presentation slides.',
    status: 'pending', createdAt: '2026-06-01T09:30:00Z',
  },
  {
    id: 'req-002', name: 'Sneha Rao', email: 'sneha.rao@outlook.com', phone: '+91 87654 32109',
    projectType: 'Web Development', budget: '₹5,000 – ₹8,000', timeline: '3 weeks',
    technologies: ['React', 'Node.js', 'MongoDB', 'Razorpay'],
    description: 'A college event management portal where students can register for events, pay entry fees online, and receive e-tickets via email. Admin should be able to add events, view registrations, and export attendance sheets.',
    additionalInfo: 'The college logo and colour scheme (navy blue and gold) must be used. Source code ownership is required.',
    status: 'in-progress', createdAt: '2026-05-28T14:00:00Z',
  },
  {
    id: 'req-003', name: 'Kiran Nambiar', email: 'kiran.nambiar@yahoo.com', phone: '+91 76543 21098',
    projectType: 'IoT / Embedded Systems', budget: '₹2,000 – ₹3,500', timeline: '10 days',
    technologies: ['Arduino', 'Raspberry Pi', 'Python', 'MQTT', 'Grafana'],
    description: 'Smart greenhouse monitoring system with temperature, humidity, and soil moisture sensors. Data should be pushed to a cloud dashboard in real time and trigger alerts via SMS when thresholds are crossed.',
    additionalInfo: 'I already have the hardware. I only need the firmware and the dashboard integration code.',
    status: 'completed', createdAt: '2026-05-15T11:00:00Z',
  },
  {
    id: 'req-004', name: 'Divya Krishnamurthy', email: 'divya.k@iitm.edu', phone: '+91 99887 76655',
    projectType: 'Blockchain / Web3', budget: '₹8,000 – ₹12,000', timeline: '4 weeks',
    technologies: ['Solidity', 'Hardhat', 'React', 'ethers.js', 'IPFS'],
    description: 'A decentralised academic credential verification system where universities can issue digitally signed certificates as NFTs. Employers can verify authenticity on-chain without contacting the institution.',
    additionalInfo: 'This is for my MTech thesis. I need full documentation, UML diagrams, and a demo video for submission.',
    status: 'pending', createdAt: '2026-06-05T08:45:00Z',
  },
  {
    id: 'req-005', name: 'Mrunal Desai', email: 'mrunal.desai@hotmail.com', phone: '+91 88990 11223',
    projectType: 'Mobile Application', budget: '₹4,000 – ₹6,000', timeline: '2 weeks',
    technologies: ['React Native', 'Firebase', 'Expo', 'Push Notifications'],
    description: 'A daily habit tracker mobile app with streak counters, motivational quotes, push reminders, and a weekly progress chart. Users should be able to create custom habits and set reminder times.',
    additionalInfo: 'Must support both Android and iOS. Firebase Authentication for login and Firestore for data storage is preferred.',
    status: 'rejected', createdAt: '2026-05-20T16:30:00Z',
  },
]

const PAGE_SIZE = 10

const STATUS_OPTIONS: Array<{ value: RequestStatus; label: string }> = [
  { value: 'pending', label: 'Pending' }, { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }, { value: 'rejected', label: 'Rejected' },
]

const statusBadge = (status: RequestStatus) => {
  switch (status) {
    case 'pending':     return <Badge variant="warning">Pending</Badge>
    case 'in-progress': return <Badge variant="blue">In Progress</Badge>
    case 'completed':   return <Badge variant="success">Completed</Badge>
    case 'rejected':    return <Badge variant="danger">Rejected</Badge>
  }
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="text-xs font-semibold font-inter uppercase tracking-wider text-muted border-b border-border pb-1">{title}</h3>
    {children}
  </div>
)

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-start gap-2 text-sm font-inter">
    <span className="w-24 shrink-0 text-muted font-medium">{label}</span>
    <span>:</span>
    <span className="text-primary-900 break-words">{value}</span>
  </div>
)

const ProjectRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ProjectRequest[]>(MOCK_REQUESTS)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewTarget, setViewTarget] = useState<ProjectRequest | null>(null)
  const [statusUpdate, setStatusUpdate] = useState<RequestStatus>('pending')
  const [statusSaving, setStatusSaving] = useState(false)

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE))

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return requests.slice(start, start + PAGE_SIZE)
  }, [requests, currentPage])

  const goToPage = (page: number) => { if (page >= 1 && page <= totalPages) setCurrentPage(page) }

  const openViewDialog = (req: ProjectRequest) => { setViewTarget(req); setStatusUpdate(req.status) }

  const saveStatusChange = () => {
    if (!viewTarget) return
    setStatusSaving(true)
    setTimeout(() => {
      setRequests((prev) => prev.map((r) => r.id === viewTarget.id ? { ...r, status: statusUpdate } : r))
      setViewTarget((prev) => (prev ? { ...prev, status: statusUpdate } : null))
      setStatusSaving(false)
    }, 400)
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Project Requests" subtitle={`${requests.length} request${requests.length !== 1 ? 's' : ''} received`} />

      <div className="rounded-xl border border-border shadow-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-inter">
            <thead>
              <tr className="bg-[#1E3A5F] text-white">
                {['Date','Name','Email','Budget','Project Type','Status','Actions'].map((h, i) => (
                  <th key={h} className={`text-left px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap ${i === 6 ? 'text-center' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-muted font-inter text-sm">No requests found.</td></tr>
              ) : (
                paginated.map((req) => (
                  <tr key={req.id} className="bg-white hover:bg-slate-50 transition-colors duration-100">
                    <td className="px-5 py-3.5 text-muted whitespace-nowrap">{formatDate(req.createdAt)}</td>
                    <td className="px-5 py-3.5 font-medium text-primary-900 whitespace-nowrap">{req.name}</td>
                    <td className="px-5 py-3.5 text-muted whitespace-nowrap">{req.email}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><Badge variant="blue">{req.budget}</Badge></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><Badge variant="default">{req.projectType}</Badge></td>
                    <td className="px-5 py-3.5 whitespace-nowrap">{statusBadge(req.status)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-center">
                        <button onClick={() => openViewDialog(req)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-inter font-medium rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors duration-150 whitespace-nowrap">
                          <Eye size={13} />View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-white">
            <p className="text-xs font-inter text-muted">Page {currentPage} of {totalPages} &mdash; {requests.length} total</p>
            <div className="flex items-center gap-1">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded-lg text-primary-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"><ChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => goToPage(page)} className={`h-7 w-7 rounded-lg text-xs font-inter font-medium transition-colors duration-150 ${page === currentPage ? 'bg-[#1E3A5F] text-white' : 'text-primary-600 hover:bg-slate-100'}`}>{page}</button>
              ))}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-1.5 rounded-lg text-primary-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!viewTarget} onOpenChange={() => setViewTarget(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>Full information for this custom project request</DialogDescription>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-5 text-sm font-inter">
              <Section title="Contact Information">
                <DetailRow label="Name" value={viewTarget.name} />
                <DetailRow label="Email" value={viewTarget.email} />
                <DetailRow label="Phone" value={viewTarget.phone} />
              </Section>
              <Section title="Project Information">
                <DetailRow label="Type" value={viewTarget.projectType} />
                <DetailRow label="Budget" value={viewTarget.budget} />
                <DetailRow label="Timeline" value={viewTarget.timeline} />
                <DetailRow label="Date" value={formatDate(viewTarget.createdAt)} />
              </Section>
              <Section title="Technologies">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {viewTarget.technologies.map((tech) => <Badge key={tech} variant="default">{tech}</Badge>)}
                </div>
              </Section>
              <Section title="Project Description">
                <p className="text-primary-700 leading-relaxed whitespace-pre-wrap">{viewTarget.description}</p>
              </Section>
              {viewTarget.additionalInfo && (
                <Section title="Additional Information">
                  <p className="text-primary-700 leading-relaxed whitespace-pre-wrap">{viewTarget.additionalInfo}</p>
                </Section>
              )}
              <Section title="Update Status">
                <div className="flex items-center gap-3 mt-1">
                  <select value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value as RequestStatus)} className="flex-1 px-3 py-2 text-sm font-inter bg-white border border-border rounded-lg text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-150">
                    {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <Button variant="primary" size="sm" loading={statusSaving} onClick={saveStatusChange} disabled={statusUpdate === viewTarget.status || statusSaving}>Save</Button>
                </div>
                <div className="mt-2 flex items-center gap-2"><span className="text-muted">Current:</span>{statusBadge(viewTarget.status)}</div>
              </Section>
            </div>
          )}
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setViewTarget(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectRequestsPage
