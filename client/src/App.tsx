import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import PublicLayout from '@/layouts/PublicLayout'
import AdminLayout from '@/layouts/AdminLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'

// Public Pages
import HomePage from '@/pages/HomePage'
import BrowsePage from '@/pages/BrowsePage'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import CustomRequestPage from '@/pages/CustomRequestPage'
import UploadProjectPage from '@/pages/UploadProjectPage'
import LoginPage from '@/pages/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminProjectsPage from '@/pages/admin/AdminProjectsPage'
import StudentProjectsPage from '@/pages/admin/StudentProjectsPage'
import ProjectRequestsPage from '@/pages/admin/ProjectRequestsPage'
import AddProjectPage from '@/pages/admin/AddProjectPage'
import EditProjectPage from '@/pages/admin/EditProjectPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/custom-project" element={<CustomRequestPage />} />
          <Route path="/upload" element={<UploadProjectPage />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes (Protected) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/projects" element={<AdminProjectsPage />} />
            <Route path="/admin/admin-projects" element={<AdminProjectsPage />} />
            <Route path="/admin/student-projects" element={<StudentProjectsPage />} />
            <Route path="/admin/project-requests" element={<ProjectRequestsPage />} />
            <Route path="/admin/projects/add" element={<AddProjectPage />} />
            <Route path="/admin/projects/edit/:id" element={<EditProjectPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
