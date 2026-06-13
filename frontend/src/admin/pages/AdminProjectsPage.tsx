import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Edit, Plus, Search, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import AdminHeader from '@admin/components/AdminHeader'
import { MOCK_PROJECTS } from '@shared/constants/mockData'
import { formatPrice, formatDate, truncate } from '@utils/index'

const PAGE_SIZE = 10

const AdminProjectsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const adminProjects = useMemo(
    () => MOCK_PROJECTS.filter((p) => p.type === 'admin'),
    []
  )

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return adminProjects
    return adminProjects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q)
    )
  }, [adminProjects, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Admin Projects" subtitle={`${filtered.length} project${filtered.length !== 1 ? 's' : ''} found`} />

      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/admin/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft size={15} />
            Back to Dashboard
          </Button>
        </Link>
          <Link to="/admin/projects/add">
          <Button variant="success" size="sm">
            <Plus size={15} />
            Add New Project
          </Button>
        </Link>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by title or domain…"
          className="w-full pl-9 pr-4 py-2 text-sm font-inter bg-white border border-border rounded-lg text-primary-900 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-150"
        />
      </div>

      <div className="rounded-xl border border-border shadow-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-inter">
            <thead>
              <tr className="bg-[#1E3A5F] text-white">
                <th className="text-left px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">Title</th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">Description</th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">Price</th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">Domain</th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">Created Date</th>
                <th className="text-center px-5 py-3.5 font-semibold tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted font-inter text-sm">
                    No projects found matching your search.
                  </td>
                </tr>
              ) : (
                paginated.map((project) => (
                  <tr key={project.id} className="bg-white hover:bg-slate-50 transition-colors duration-100">
                    <td className="px-5 py-3.5 font-medium text-primary-900 whitespace-nowrap">{project.title}</td>
                    <td className="px-5 py-3.5 text-muted max-w-xs">{truncate(project.description, 50)}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge variant="blue">{formatPrice(project.price)}</Badge>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge variant="default">{project.domain}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted whitespace-nowrap">{formatDate(project.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/projects/${project.id}`}>
                          <button title="View project" className="p-1.5 rounded-lg text-teal-600 bg-teal-50 hover:bg-teal-100 transition-colors duration-150">
                            <Eye size={15} />
                          </button>
                        </Link>
                        <Link to={`/admin/projects/edit/${project.id}`}>
                          <button title="Edit project" className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-150">
                            <Edit size={15} />
                          </button>
                        </Link>
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
            <p className="text-xs font-inter text-muted">
              Page {currentPage} of {totalPages} &mdash; {filtered.length} total
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-primary-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors duration-150"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`h-7 w-7 rounded-lg text-xs font-inter font-medium transition-colors duration-150 ${
                    page === currentPage ? 'bg-[#1E3A5F] text-white' : 'text-primary-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-primary-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors duration-150"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProjectsPage
