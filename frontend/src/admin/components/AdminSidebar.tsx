import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Shield,
  GraduationCap,
  ClipboardList,
  Settings,
  LogOut,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@utils/index';
import { useAuth } from '@hooks/useAuth';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',        path: '/admin/dashboard'        },
  { icon: FolderOpen,      label: 'All Projects',     path: '/admin/projects'         },
  { icon: Shield,          label: 'Admin Projects',   path: '/admin/admin-projects'   },
  { icon: GraduationCap,   label: 'Student Projects', path: '/admin/student-projects' },
  { icon: ClipboardList,   label: 'Project Requests', path: '/admin/project-requests' },
  { icon: Settings,        label: 'Settings',         path: '/admin/settings'         },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-white border-r border-border overflow-hidden shrink-0">

      <div className="px-6 py-5 border-b border-border">
        <Link to="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-accent-gradient flex items-center justify-center shadow-premium shrink-0">
            <span className="text-lg leading-none select-none">💡</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-sora font-bold text-sm text-primary-900 tracking-tight">
              InnovateGuide
            </span>
            <span className="text-[11px] font-inter text-muted font-medium tracking-wide uppercase">
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = isActive(path);

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-inter font-medium transition-all duration-150',
                active
                  ? 'bg-accent/10 text-accent border-r-2 border-accent rounded-r-none'
                  : 'text-primary-600 hover:bg-slate-50 hover:text-primary-900',
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'shrink-0',
                  active ? 'text-accent' : 'text-muted',
                )}
              />
              <span className="truncate">{label}</span>

              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              )}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-inter font-medium w-full text-danger hover:bg-danger/5 hover:text-danger transition-all duration-150"
        >
          <LogOut size={18} className="shrink-0 text-danger" />
          <span className="truncate">Logout</span>
        </button>
      </nav>

      <div className="mx-4 border-t border-border" />

      <div className="px-6 py-4">
        <p className="text-[11px] font-inter text-muted text-center tracking-wide">
          Powered by{' '}
          <span className="font-semibold text-accent">InnovateHive</span>
        </p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
