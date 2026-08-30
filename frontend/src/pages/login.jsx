import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bot, Lock, Mail, ArrowRight, AlertCircle, Loader2, CheckCircle2, Shield, Sparkles, KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center p-4 sm:p-6 relative bg-ambient-mesh selection:bg-sky-500 selection:text-white overflow-hidden py-8 sm:py-12">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl glass-icon-box flex items-center justify-center mx-auto shadow-glow-blue">
            <Bot className="w-7 h-7 text-sky-400" />
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In to CampusWise <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Access verified college documents and grounded assistant</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/[0.12] space-y-6 shadow-glass-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide">College Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  required
                  className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 via-electric-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-glow-blue flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
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

          {/* Quick Demo Fill Buttons for Testing */}
          <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
            <p className="text-[11px] text-slate-400 font-semibold text-center flex items-center justify-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-sky-400" />
              <span>One-Click Demo Accounts:</span>
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { setEmail('admin@campus.edu'); setPassword('AdminPassword123!'); }}
                className="p-2.5 rounded-xl glass-card text-[11px] font-semibold text-amber-300 border-amber-500/20 hover:border-amber-500/40 text-center transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Fill Admin</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('student@campus.edu'); setPassword('StudentPassword123!'); }}
                className="p-2.5 rounded-xl glass-card text-[11px] font-semibold text-sky-300 border-sky-500/20 hover:border-sky-500/40 text-center transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Fill Student</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-sky-400 hover:text-sky-300 underline font-semibold transition-colors">
            Register as Student
          </Link>
        </p>
      </div>
    </div>
  );
}

