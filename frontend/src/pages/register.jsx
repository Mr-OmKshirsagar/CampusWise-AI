import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import CampusWiseLogo from '../components/Common/CampusWiseLogo.jsx';
import GlassIcon from '../components/Common/GlassIcon.jsx';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
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

  // Password strength calculation
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

  const fillDemoStudent = () => {
    clearError();
    setName('Aarav Sharma');
    setEmail(`student_${Math.floor(Math.random() * 8999 + 1000)}@campus.edu`);
    setPassword('StudentPass123!');
    setRole('student');
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center p-4 sm:p-6 relative bg-ambient-mesh selection:bg-sky-500 selection:text-white overflow-hidden py-8 sm:py-12 transition-colors duration-300">
      {/* Ambient Floating Glows */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <CampusWiseLogo size="lg" showText={false} />
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Create Your Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Join the official campus AI knowledge platform
            </p>
          </div>
        </div>

        {/* Quick Demo Autofill Button */}
        <div className="glass-card p-2.5 rounded-2xl border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-500 dark:text-sky-400" />
            Quick Test
          </span>
          <button
            type="button"
            onClick={fillDemoStudent}
            className="py-1 px-3 rounded-xl glass-badge hover:bg-sky-500/15 text-[11px] font-semibold text-sky-700 dark:text-sky-300 border-sky-500/30 transition-all flex items-center gap-1 active:scale-95"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Generate Demo Student Info</span>
          </button>
        </div>

        {/* Register Card */}
        <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.12] space-y-5 shadow-sm dark:shadow-glass-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2.5 animate-slide-up">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                  className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
                Institutional Email
              </label>
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

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1 pt-1 animate-fade-in">
                  <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-300 dark:border-white/[0.05]">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        strength <= 25
                          ? 'bg-rose-500 w-1/4'
                          : strength <= 50
                          ? 'bg-amber-500 w-2/4'
                          : strength <= 75
                          ? 'bg-sky-500 w-3/4'
                          : 'bg-emerald-500 w-full'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Strength:</span>
                    <span
                      className={`font-semibold ${
                        strength <= 25
                          ? 'text-rose-500 dark:text-rose-400'
                          : strength <= 50
                          ? 'text-amber-500 dark:text-amber-400'
                          : strength <= 75
                          ? 'text-sky-500 dark:text-sky-400'
                          : 'text-emerald-500 dark:text-emerald-400'
                      }`}
                    >
                      {strength <= 25
                        ? 'Weak'
                        : strength <= 50
                        ? 'Fair'
                        : strength <= 75
                        ? 'Good'
                        : 'Strong'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    role === 'student'
                      ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-200 border border-sky-500/35 dark:border-sky-500/40 shadow-sm dark:shadow-glow-cyan'
                      : 'glass-badge text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    role === 'admin'
                      ? 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-200 border border-amber-500/35 dark:border-amber-500/40 shadow-sm dark:shadow-glow-amber'
                      : 'glass-badge text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Administrator</span>
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
                  <span>Create Campus Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-200/80 dark:border-white/[0.08]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
