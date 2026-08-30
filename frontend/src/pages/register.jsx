import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Lock, Mail, User, Shield, ArrowRight, AlertCircle, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      const user = await register({ name, email, password, role });
      if (user.role === 'admin') {
        navigate('/admin/documents');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Basic password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9!@#$%^&*]/.test(password)) score += 25;
    return score;
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 relative bg-ambient-mesh selection:bg-sky-500 selection:text-white overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl glass-icon-box flex items-center justify-center mx-auto shadow-glow-blue">
            <Bot className="w-7 h-7 text-sky-400" />
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create Your Account
            </h2>
            <p className="text-xs text-slate-400 mt-1">Join the official campus AI knowledge platform</p>
          </div>
        </div>

        {/* Register Card */}
        <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/[0.12] space-y-5 shadow-glass-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                  className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide">Institutional Email</label>
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
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 transition-all"
                />
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden border border-white/[0.05]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        strength <= 25 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : strength <= 50 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : strength <= 75 ? 'bg-sky-500 shadow-[0_0_8px_#0ea5e9]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                      }`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-right font-medium">
                    {strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong'} password
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide">Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    role === 'student'
                      ? 'bg-sky-500/20 text-sky-200 border-sky-500/40 shadow-glow-blue scale-[1.02]'
                      : 'glass-card text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-4 h-4 text-sky-400" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    role === 'admin'
                      ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm scale-[1.02]'
                      : 'glass-card text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Administrator</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !name.trim() || !email.trim() || password.length < 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 via-electric-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-glow-blue flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-400 hover:text-sky-300 underline font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

