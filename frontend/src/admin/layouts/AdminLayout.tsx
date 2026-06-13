import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AdminSidebar from '@admin/components/AdminSidebar';
import { useAuth } from '@hooks/useAuth';

const AdminLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-200 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <AdminSidebar />
      </div>

      <div className="flex flex-1 flex-col min-w-0 md:ml-0">

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

        <main className="flex-1 overflow-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
