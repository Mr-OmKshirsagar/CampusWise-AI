import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Bot,
  Layers,
  FileText,
  BarChart3,
  LogOut,
  Shield,
  Menu,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import ThemeToggle from '../Common/ThemeToggle.jsx';
import CampusWiseLogo from '../Common/CampusWiseLogo.jsx';
import GlassIcon from '../Common/GlassIcon.jsx';
import LiquidSegmentedControl from '../Common/LiquidSegmentedControl.jsx';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

  // Animated close: play dismiss animation then unmount
  const closeMobileMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsClosing(false);
    }, 260);
  };

  // Track vertical scroll to activate deeper liquid glass transparency morphing
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dismiss mobile pop-up when tapping anywhere outside on the screen
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleOutsideClick = (e) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        hamburgerButtonRef.current &&
        !hamburgerButtonRef.current.contains(e.target)
      ) {
        closeMobileMenu();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const isActive = (path) => location.pathname === path;

  // Build options array with dedicated icons and chromatic colors
  const navOptions = [
    { id: '/', label: 'Home', icon: Home, color: 'emerald' },
    ...(isAuthenticated
      ? [
          { id: '/chat', label: 'AI Assistant', icon: MessageSquare, color: 'cyan' },
        ]
      : []),
    ...(isAuthenticated && user?.role === 'admin'
      ? [
          { id: '/admin/documents', label: 'Documents', icon: FileText, color: 'amber' },
          { id: '/admin/analytics', label: 'Analytics', icon: BarChart3, color: 'purple' },
        ]
      : []),
  ];

  // Match active path (handling dynamic /chat/:id routes as well)
  const currentNavValue = location.pathname.startsWith('/chat')
    ? '/chat'
    : location.pathname;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full h-16 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isScrolled
          ? 'bg-white/45 dark:bg-[#070b12]/50 backdrop-blur-3xl backdrop-saturate-200 border-b border-white/80 dark:border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_15px_45px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)]'
          : 'bg-white/35 dark:bg-[#070b12]/40 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/60 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.08)]'
      }`}
      style={{
        WebkitBackdropFilter: isScrolled ? 'blur(28px) saturate(200%)' : 'blur(20px) saturate(160%)',
      }}
    >
      {/* Animated Liquid Glass Light Sheen Sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/[0.07] to-transparent -translate-x-full animate-liquid-shimmer pointer-events-none" />

      {/* Top Specular Liquid Glass Highlight Sheen */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/50 to-transparent pointer-events-none transition-opacity duration-500" />

      {/* Bottom Chromatic Dispersion Refraction Line */}
      <div
        className={`absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-pink-500/40 via-cyan-400/60 to-emerald-400/50 blur-[0.5px] pointer-events-none transition-opacity duration-500 ${
          isScrolled ? 'opacity-100' : 'opacity-60'
        }`}
      />

      {/* Subtle Liquid Ambient Wave Aura */}
      <div className="absolute -top-10 left-1/4 w-96 h-20 bg-gradient-to-r from-sky-400/20 via-indigo-500/15 to-emerald-400/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <CampusWiseLogo size="md" />
          </Link>

          {/* Desktop Navigation Links with Sliding Liquid Glass Control */}
          <div className="hidden md:flex items-center">
            <LiquidSegmentedControl
              options={navOptions}
              value={currentNavValue}
              className="p-1"
            />
          </div>

          {/* Right Area (Desktop & Medium Screens): Theme Toggle & User Status */}
          <div className="hidden md:flex items-center gap-1.5 md:gap-2 lg:gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
                <div className="flex items-center gap-1.5 md:gap-2 glass-badge rounded-full px-2 md:px-2 lg:px-3.5 py-1 md:py-1 lg:py-1.5 border border-slate-200/90 dark:border-white/[0.1] shadow-liquid-sm">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      user?.role === 'admin' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-sky-500 shadow-[0_0_8px_#38bdf8]'
                    } animate-pulse shrink-0`}
                  />
                  <span className="hidden xl:inline text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                  <span
                    className={`text-[9px] uppercase px-1.5 lg:px-2 py-0.5 rounded-full font-extrabold border ${
                      user?.role === 'admin'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        : 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30'
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="group relative flex items-center justify-center h-9 px-2.5 hover:px-3.5 rounded-full border border-slate-300/80 dark:border-white/[0.14] bg-white/90 dark:bg-white/[0.04] backdrop-blur-2xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gradient-to-b hover:from-rose-500/15 hover:via-rose-500/10 hover:to-pink-500/15 dark:hover:from-rose-500/25 dark:hover:via-rose-500/15 dark:hover:to-pink-500/25 hover:border-rose-500/50 dark:hover:border-rose-400/60 shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:shadow-[0_0_18px_rgba(244,63,94,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-liquid-sm dark:hover:shadow-[0_0_20px_rgba(244,63,94,0.4),inset_0_1px_1px_rgba(255,255,255,0.7)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95 cursor-pointer overflow-hidden select-none"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  {/* Top-down Specular Reflection Sheen */}
                  <div className="absolute inset-x-1.5 top-0.5 h-1/2 bg-gradient-to-b from-white/80 dark:from-white/40 to-transparent rounded-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Bottom Chromatic Dispersion Rainbow Refraction Line */}
                  <div className="absolute inset-x-2 bottom-0 h-[1.5px] bg-gradient-to-r from-rose-500/80 via-pink-400/90 to-amber-400/80 blur-[0.5px] rounded-full pointer-events-none opacity-0 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Dynamic Logout Label (Expands on left) */}
                  <span className="max-w-0 group-hover:max-w-[70px] opacity-0 group-hover:opacity-100 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] text-rose-600 dark:text-rose-400 pr-0 group-hover:pr-1.5 relative z-10">
                    Logout
                  </span>

                  {/* LogOut Icon */}
                  <LogOut className="w-4 h-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 relative z-10" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-300 glass-badge hover:bg-sky-500/[0.08] dark:hover:bg-white/[0.08] hover:border-sky-500/40 transition-all duration-200 hover:scale-105 active:scale-95 shadow-liquid-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-glow-blue transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button (Theme toggle is relocated inside drawer for clean UX) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              ref={hamburgerButtonRef}
              onClick={() => mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true)}
              className="min-w-[42px] min-h-[42px] p-2.5 rounded-2xl glass-panel-elevated text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200/90 dark:border-white/[0.12] active:scale-90 transition-all shadow-liquid-sm flex items-center justify-center cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Liquid Glass Pop-Up Overlay for Mobile View (Does NOT push content down) */}
      {mobileMenuOpen && (
        <>
          {/* Frosted Click-Outside Backdrop — starts at top-16 so the fixed navbar stays visible */}
          <div
            className={`fixed top-16 left-0 right-0 bottom-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm md:hidden cursor-pointer ${
              isClosing ? 'animate-fade-out' : 'animate-fade-in'
            }`}
            onClick={closeMobileMenu}
          />

          {/* Floating Glass Island Modal */}
          <div
            ref={mobileMenuRef}
            className={`fixed top-20 inset-x-3 xs:inset-x-4 max-w-md mx-auto z-50 md:hidden glass-panel-elevated bg-white/95 dark:bg-[#070b12]/95 backdrop-blur-3xl p-4 sm:p-5 rounded-4xl border border-white/90 dark:border-white/20 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6),0_0_40px_rgba(56,189,248,0.25)] space-y-2.5 overflow-hidden ${
              isClosing ? 'animate-liquid-dismiss' : 'animate-liquid-pop'
            }`}
          >
            {/* Top Specular Rim */}
            <div className="absolute inset-x-8 top-0 h-1 bg-gradient-to-b from-white/80 to-transparent dark:from-white/40 rounded-full pointer-events-none" />

            {/* Bottom Chromatic Dispersion Line */}
            <div className="absolute inset-x-12 bottom-0 h-[1.5px] bg-gradient-to-r from-pink-500/60 via-cyan-400/80 to-emerald-400/60 blur-[0.5px] rounded-full pointer-events-none opacity-80" />

            {isAuthenticated && (
              <div className="p-3.5 rounded-3xl glass-input flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-2xl glass-icon-box flex items-center justify-center text-sky-500 dark:text-sky-400 shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{user?.email}</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 shrink-0 ml-2">
                  {user?.role}
                </span>
              </div>
            )}

            {/* Navigation Route Links with Dedicated Chromatic Glass Colors */}
            <div className="space-y-1.5 pt-1">
              {/* 1. Mobile Home Link - Emerald */}
              <Link
                to="/"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  isActive('/')
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35 font-bold shadow-liquid-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10'
                }`}
              >
                <Home className="w-4 h-4 text-emerald-500" />
                <span>Home</span>
              </Link>

              {isAuthenticated ? (
                <>
                  {/* 2. Mobile AI Assistant Link - Cyan */}
                  <Link
                    to="/chat"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                      isActive('/chat')
                        ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/35 font-bold shadow-liquid-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-sky-500/10'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-sky-500" />
                    <span>AI Assistant</span>
                  </Link>

                  {user?.role === 'admin' && (
                    <>
                      {/* 3. Mobile Documents Link - Amber */}
                      <Link
                        to="/admin/documents"
                        onClick={closeMobileMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                          isActive('/admin/documents')
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/35 font-bold shadow-liquid-sm'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-amber-500/10'
                        }`}
                      >
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>Documents</span>
                      </Link>

                      {/* 4. Mobile Analytics Link - Purple */}
                      <Link
                        to="/admin/analytics"
                        onClick={closeMobileMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                          isActive('/admin/analytics')
                            ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/35 font-bold shadow-liquid-sm'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-purple-500/10'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4 text-purple-500" />
                        <span>Analytics</span>
                      </Link>
                    </>
                  )}
                </>
              ) : null}
            </div>

            {/* Dedicated Appearance & Theme Switcher Row Inside Menu */}
            <div className="pt-2 border-t border-slate-200/70 dark:border-white/[0.08]">
              <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl glass-input shadow-xs">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  Appearance Mode
                </span>
                <ThemeToggle />
              </div>
            </div>

            {/* Bottom Actions (Sign Out / Auth Buttons) */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-300 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 active:scale-95 transition-all shadow-liquid-sm mt-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="py-3 text-center rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 glass-badge hover:bg-black/5 dark:hover:bg-white/[0.08]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="py-3 text-center rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 shadow-glow-blue"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
