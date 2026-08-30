import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bot, Sparkles, Shield, User, LogOut, FileText, BarChart3, MessageSquare, Menu, X, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
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
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] glass-panel bg-[#05070a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl glass-icon-box flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-glow-blue">
              <Bot className="w-5 h-5 text-sky-400 group-hover:rotate-6 transition-transform duration-300" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#05070a] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-white tracking-tight flex items-center">
                CampusWise <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent ml-1">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/25 rounded-full glass-badge">
                RAG v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              Official College Knowledge Assistant
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/chat"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive('/chat') || location.pathname.startsWith('/chat/')
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-glow-blue'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Student Assistant</span>
              </Link>

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/documents"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive('/admin/documents')
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Documents</span>
                  </Link>

                  <Link
                    to="/admin/analytics"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive('/admin/analytics')
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-glow-purple'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Analytics</span>
                  </Link>
                </>
              )}

              {/* User Badge & Logout */}
              <div className="flex items-center gap-2.5 pl-4 border-l border-white/[0.08] ml-2">
                <div className="flex items-center gap-2 glass-badge rounded-full px-3 py-1.5 border border-white/[0.1]">
                  <span className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'} animate-pulse`} />
                  <span className="text-xs text-slate-200 font-medium max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full ${
                    user?.role === 'admin' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl border border-transparent hover:border-white/[0.1] transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-sky-600 via-electric-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 rounded-xl shadow-glow-blue transition-all hover:scale-105 flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && (
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              user?.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {user?.role}
            </span>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl glass-badge text-slate-300 hover:text-white transition-all active:scale-95"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] glass-panel-elevated px-4 py-4 space-y-3 animate-slide-up shadow-2xl">
          {isAuthenticated ? (
            <>
              {/* User Profile Header in Mobile Menu */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/[0.1]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-3.5 h-3.5 rounded-full ${user?.role === 'admin' ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b]' : 'bg-emerald-400 shadow-[0_0_10px_#10b981]'} animate-pulse shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <span className={`text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                  user?.role === 'admin' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {user?.role}
                </span>
              </div>

              {/* Navigation Actions */}
              <div className="space-y-1.5 pt-1">
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive('/chat') || location.pathname.startsWith('/chat/')
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-glow-blue'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Student Chat Assistant</span>
                </Link>

                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/documents"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive('/admin/documents')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Document Ingestion Portal</span>
                    </Link>

                    <Link
                      to="/admin/analytics"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive('/admin/analytics')
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span>System & Vector Analytics</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Logout Button */}
              <div className="pt-2 border-t border-white/[0.08]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 font-semibold text-xs transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of CampusWise</span>
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-4 text-center text-xs font-semibold text-slate-200 glass-card rounded-xl hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-4 text-center text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 rounded-xl shadow-glow-blue"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

