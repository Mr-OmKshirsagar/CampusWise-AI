import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bot,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Shield,
  Sparkles,
  Eye,
  EyeOff,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import CampusWiseLogo from '../components/Common/CampusWiseLogo.jsx';
import GlassIcon from '../components/Common/GlassIcon.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/chat';

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      const user = await login({ email, password });
      if (user.role === 'admin') {
        navigate('/admin/documents');
      } else {
        navigate(from);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fillDemoAccount = (role) => {
    clearError();
    if (role === 'admin') {
      setEmail('admin@campus.edu');
      setPassword('AdminPassword123!');
    } else {
      setEmail('student@campus.edu');
      setPassword('StudentPassword123!');
    }
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center p-4 sm:p-6 relative bg-ambient-mesh selection:bg-sky-500 selection:text-white overflow-hidden py-8 sm:py-12 transition-colors duration-300">
      {/* Ambient Floating Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <CampusWiseLogo size="lg" showText={false} />
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sign In to CampusWise{' '}
              <span className="bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
                AI
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Access verified college knowledge and grounded assistant
            </p>
          </div>
        </div>

        {/* Quick Demo Credentials Autofill Pill Bar */}
        <div className="glass-card p-3 rounded-2xl border-slate-200 dark:border-white/[0.08] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            Quick Demo Autofill (1-Click)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('student')}
              className="py-1.5 px-3 rounded-xl glass-badge hover:bg-sky-500/15 text-[11px] font-semibold text-sky-700 dark:text-sky-300 border-sky-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>Student Account</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="py-1.5 px-3 rounded-xl glass-badge hover:bg-amber-500/15 text-[11px] font-semibold text-amber-700 dark:text-amber-300 border-amber-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Admin Account</span>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.12] space-y-6 shadow-sm dark:shadow-glass-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2.5 animate-slide-up">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide">College Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  required
                  className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-electric-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md dark:shadow-glow-blue flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-200/80 dark:border-white/[0.08]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold underline">
                Register as Student
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
