import { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAuth } from '@/hooks/useAuth';

const PATH_TITLE_MAP: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/projects': 'All Projects',
  '/admin/admin-projects': 'Admin Projects',
  '/admin/student-projects': 'Student Projects',
  '/admin/project-requests': 'Project Requests',
  '/admin/settings': 'Settings',
};

const getTitleFromPathname = (pathname: string): string => {
  if (PATH_TITLE_MAP[pathname]) return PATH_TITLE_MAP[pathname];

  // Fallback: capitalise the last path segment
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1] ?? 'Admin';
  return last
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const AdminLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const pageTitle = getTitleFromPathname(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-200
          md:static md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <AdminSidebar />
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col min-w-0 md:ml-0">

        {/* Mobile hamburger bar */}
        <div className="flex items-center gap-3 border-b border-border bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="rounded-md p-1.5 text-primary-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-accent/30"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-sora font-bold text-primary-900 text-sm">
            InnovateGuide Admin
          </span>
        </div>

        {/* Desktop header */}
        <div className="hidden md:block">
          <AdminHeader title={pageTitle} />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
