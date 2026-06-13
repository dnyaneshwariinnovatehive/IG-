import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import PublicLayout from '@user/layouts/PublicLayout'
import AdminLayout from '@admin/layouts/AdminLayout'
import ProtectedRoute from '@components/ProtectedRoute'

// Public Pages
import HomePage from '@user/pages/HomePage'
import BrowsePage from '@user/pages/BrowsePage'
import ProjectDetailPage from '@user/pages/ProjectDetailPage'
import CustomRequestPage from '@user/pages/CustomRequestPage'
import UploadProjectPage from '@user/pages/UploadProjectPage'
import LoginPage from '@user/pages/LoginPage'
import NotFoundPage from '@user/pages/NotFoundPage'
import StaticPage from '@user/pages/StaticPage'

// Admin Pages
import AdminDashboardPage from '@admin/pages/AdminDashboardPage'
import AdminProjectsPage from '@admin/pages/AdminProjectsPage'
import StudentProjectsPage from '@admin/pages/StudentProjectsPage'
import ProjectRequestsPage from '@admin/pages/ProjectRequestsPage'
import AddProjectPage from '@admin/pages/AddProjectPage'
import EditProjectPage from '@admin/pages/EditProjectPage'
import AdminSettingsPage from '@admin/pages/AdminSettingsPage'

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
          <Route path="/how-it-works" element={<StaticPage />} />
          <Route path="/case-study" element={<StaticPage />} />
          <Route path="/faq" element={<StaticPage />} />
          <Route path="/about" element={<StaticPage />} />
          <Route path="/contact" element={<StaticPage />} />
          <Route path="/privacy-policy" element={<StaticPage />} />
          <Route path="/terms-of-service" element={<StaticPage />} />
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
