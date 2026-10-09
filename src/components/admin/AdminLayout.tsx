import React, { useState, ReactNode } from 'react';
import { useRouter, Link } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Stethoscope,
  Calendar,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  User,
  AlertTriangle,
  Image as ImageIcon,
  Star,
  DollarSign,
} from 'lucide-react';
import { ClinicLogo } from '../ui/ClinicLogo';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const { currentPath, navigate } = useRouter();
  const { user, profile, role, logout, isDemoMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Lady Doctors', path: '/admin/doctors', icon: UserCheck },
    { label: 'Clinical Services', path: '/admin/services', icon: Stethoscope },
    { label: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { label: 'Patient Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { label: 'Clinic Posters', path: '/admin/posters', icon: ImageIcon },
    { label: 'Patient Reviews', path: '/admin/reviews', icon: Star },
    ...(role === 'admin'
      ? [{ label: 'Doctor Salaries', path: '/admin/salaries', icon: DollarSign }]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 shrink-0 select-none">
        {/* Brand Area */}
        <div className="p-5 border-b border-slate-800/80">
          <Link to="/admin" className="block hover:opacity-95 transition-opacity">
            <ClinicLogo variant="admin" size="sm" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout Bottom */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
          {isDemoMode && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Demo Session (Supabase keys not yet provided)</span>
            </div>
          )}

          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-400 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-medium text-white truncate">
                {profile?.full_name || user?.email || 'Authorized User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium uppercase bg-rose-950 text-rose-300 border border-rose-800/60">
                  {role || 'staff'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <Link
              to="/"
              className="text-slate-400 hover:text-white flex items-center gap-1.5 py-1 px-2 rounded hover:bg-slate-900 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Public Site</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3.5 bg-slate-950 border-b border-slate-800">
          <Link to="/admin" className="flex items-center gap-2">
            <ClinicLogo variant="admin" size="sm" showSubtitle={false} />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-rose-700 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 truncate max-w-[180px]">{user?.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Top Content Title Header */}
        <div className="px-6 py-6 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>}
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>RLS Protected</span>
            </span>
          </div>
        </div>

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
