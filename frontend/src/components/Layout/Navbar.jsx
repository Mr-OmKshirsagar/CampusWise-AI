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
  Activity,
} from 'lucide-react';
import CampusWiseLogo from '../Common/CampusWiseLogo.jsx';
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
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] glass-panel bg-[#030508]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center">
          <CampusWiseLogo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/chat"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive('/chat') || location.pathname.startsWith('/chat/')
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 shadow-glow-cyan'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>AI Assistant</span>
              </Link>

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/documents"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive('/admin/documents')
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-glow-amber'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Documents</span>
                  </Link>

                  <Link
                    to="/admin/analytics"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive('/admin/analytics')
                        ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-glow-purple'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Analytics</span>
                  </Link>
                </>
              )}

              {/* User Profile Pill & Sign Out */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08] ml-2">
                <div className="flex items-center gap-2 glass-badge rounded-full px-3 py-1 border border-white/[0.1]">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      user?.role === 'admin'
                        ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    } animate-pulse`}
                  />
                  <span className="text-xs text-slate-200 font-medium max-w-[130px] truncate">
                    {user?.name || user?.email || 'Student'}
                  </span>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded-md font-extrabold ${
                      user?.role === 'admin'
                        ? 'bg-amber-500/25 text-amber-300'
                        : 'bg-sky-500/25 text-sky-300'
                    }`}
                  >
                    {user?.role || 'student'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white glass-badge hover:bg-white/[0.08] transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-glow-blue transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && (
            <div className="flex items-center gap-1.5 px-2 py-1 glass-badge rounded-full text-[10px] text-slate-300 font-medium">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  user?.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'
                } animate-pulse`}
              />
              <span className="max-w-[80px] truncate">{user?.name?.split(' ')[0] || 'User'}</span>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl glass-badge text-slate-300 hover:text-white active:scale-95 transition-transform"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel-elevated border-b border-white/[0.1] px-4 py-4 space-y-3 animate-slide-up bg-[#070b12]/95 backdrop-blur-2xl">
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="p-3 rounded-2xl glass-input mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl glass-icon-box flex items-center justify-center text-sky-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{user?.name || 'Student'}</div>
                    <div className="text-[10px] text-slate-400">{user?.email}</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {user?.role}
                </span>
              </div>

              <Link
                to="/chat"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive('/chat') || location.pathname.startsWith('/chat/')
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>AI Student Assistant</span>
              </Link>

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/documents"
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive('/admin/documents')
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Institutional Documents</span>
                  </Link>

                  <Link
                    to="/admin/analytics"
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive('/admin/analytics')
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span>System Analytics</span>
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/login"
                className="py-2.5 text-center rounded-xl text-xs font-semibold text-slate-200 glass-badge hover:bg-white/[0.08]"
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
