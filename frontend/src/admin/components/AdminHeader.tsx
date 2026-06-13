import { Search } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
}

const AdminHeader = ({ title, subtitle, showSearch = false }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-border px-8 py-4">
      <div className="flex items-center justify-between gap-6">

        <div className="flex flex-col min-w-0">
          <h1 className="font-sora font-bold text-2xl text-primary-900 leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm font-inter text-muted truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">

          {showSearch && (
            <div className="relative hidden sm:flex items-center">
              <Search
                size={15}
                className="absolute left-3 text-muted pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 w-56 text-sm font-inter bg-background border border-border rounded-lg text-primary-900 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-150"
              />
            </div>
          )}

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-accent-gradient text-white font-sora font-bold text-sm shadow-card ring-2 ring-accent/20 select-none">
              A
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-inter font-semibold text-primary-900">
                Admin User
              </span>
              <span className="inline-flex items-center self-start px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-inter font-semibold uppercase tracking-wider leading-none mt-0.5">
                Administrator
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
