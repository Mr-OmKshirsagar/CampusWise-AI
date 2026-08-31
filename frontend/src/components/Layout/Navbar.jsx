import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import CampusWiseLogo from '../Common/CampusWiseLogo.jsx';
import ThemeToggle from '../Common/ThemeToggle.jsx';
import { useAuthStore } from '../../store/authStore.js';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.08] glass-panel bg-[var(--glass-bg)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo (Responsive sizes) */}
        <Link to="/" className="flex items-center shrink-0 min-w-0">
          <CampusWiseLogo size="md" />
        </Link>

        {/* Desktop Navigation Links & Controls (>= 768px) */}
        <nav className="hidden md:flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <>
              <Link
                to="/chat"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive('/chat') || location.pathname.startsWith('/chat/')
                    ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-200 border border-sky-500/35 dark:border-sky-500/40 shadow-sm dark:shadow-glow-cyan'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                <span>AI Assistant</span>
              </Link>

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/documents"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive('/admin/documents')
                        ? 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-200 border border-amber-500/35 dark:border-amber-500/40 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.06] border border-transparent'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Documents</span>
                  </Link>

                  <Link
                    to="/admin/analytics"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive('/admin/analytics')
                        ? 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-600 dark:text-purple-200 border border-purple-500/35 dark:border-purple-500/40 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.06] border border-transparent'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                    <span>Analytics</span>
                  </Link>
                </>
              )}

              {/* Theme Toggle Button */}
              <ThemeToggle />

              {/* User Profile Pill & Sign Out */}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-white/[0.08] ml-1">
                <div className="flex items-center gap-2 glass-badge rounded-full px-3 py-1 border border-slate-200 dark:border-white/[0.1]">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      user?.role === 'admin'
                        ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    } animate-pulse`}
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-200 font-medium max-w-[110px] lg:max-w-[140px] truncate">
                    {user?.name || user?.email || 'Student'}
                  </span>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded-md font-extrabold ${
                      user?.role === 'admin'
                        ? 'bg-amber-500/15 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300'
                        : 'bg-sky-500/15 dark:bg-sky-500/25 text-sky-700 dark:text-sky-300'
                    }`}
                  >
                    {user?.role || 'student'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Link
                to="/login"
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-300 glass-badge hover:bg-sky-500/[0.08] dark:hover:bg-white/[0.08] hover:border-sky-500/40 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-glow-blue transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile View Controls (< 768px) */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:hidden shrink-0">
          <ThemeToggle />

          {isAuthenticated && (
            <div className="flex items-center gap-1.5 px-2 py-1 glass-badge rounded-full text-[10px] text-slate-700 dark:text-slate-300 font-medium max-w-[90px] xs:max-w-[120px] truncate">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  user?.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'
                } animate-pulse`}
              />
              <span className="truncate">{user?.name?.split(' ')[0] || 'User'}</span>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl glass-badge text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-transform"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel-elevated border-b border-slate-200 dark:border-white/[0.1] px-4 py-4 space-y-3 animate-slide-up bg-white/95 dark:bg-[#070b12]/95 backdrop-blur-2xl max-h-[calc(100dvh-4rem)] overflow-y-auto">
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="p-3 rounded-2xl glass-input mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl glass-icon-box flex items-center justify-center text-sky-500 dark:text-sky-400 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Student'}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 shrink-0 ml-2">
                  {user?.role}
                </span>
              </div>

              <Link
                to="/chat"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive('/chat') || location.pathname.startsWith('/chat/')
                    ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/[0.05]'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                <span>AI Student Assistant</span>
              </Link>

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/documents"
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive('/admin/documents')
                        ? 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Institutional Documents</span>
                  </Link>

                  <Link
                    to="/admin/analytics"
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive('/admin/analytics')
                        ? 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                    <span>System Analytics</span>
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/login"
                className="py-2.5 text-center rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 glass-badge hover:bg-black/5 dark:hover:bg-white/[0.08]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="py-2.5 text-center rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 shadow-glow-blue"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
