import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  FileSearch,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Building2,
  CalendarCheck,
  DollarSign,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();

  const domains = [
    { title: 'Admissions & Eligibility', icon: GraduationCap, color: 'from-blue-500 to-sky-400', desc: 'Entrance cutoffs, quotas, application deadlines & required certificates.' },
    { title: 'Academic Regulations', icon: CalendarCheck, color: 'from-sky-500 to-indigo-400', desc: '75% attendance policy, mid-sem exam dates, condonations & grade appeals.' },
    { title: 'Fee Schedules & Refunds', icon: DollarSign, color: 'from-purple-500 to-pink-400', desc: 'Semester installment deadlines, caution deposits & cancellation policies.' },
    { title: 'Hostel & Residential Rules', icon: Building2, color: 'from-amber-500 to-orange-400', desc: 'Curfew timings, biometric attendance, room allotment & dining schedules.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-campus-500/10 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10 space-y-24">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider animate-fade-in shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official College Retrieval-Augmented Generation (RAG) Platform</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Official Campus Answers,{' '}
            <span className="bg-gradient-to-r from-sky-400 via-campus-400 to-indigo-400 bg-clip-text text-transparent">
              Zero Hallucinations.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CampusWise AI indexes official college PDFs, academic calendars, fee rules, and hostel regulations. Students receive instant, grounded responses backed by exact document titles and page citations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <Link
                to="/chat"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-campus-600 hover:from-sky-500 hover:to-campus-500 text-white font-semibold text-sm shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <Bot className="w-4 h-4" />
                <span>Open Student Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-campus-600 hover:from-sky-500 hover:to-campus-500 text-white font-semibold text-sm shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Feature Highlights Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Strict Document Grounding
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Exact Page Citations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Deterministic Out-of-Scope Fallback
            </span>
          </div>
        </section>

        {/* Knowledge Domains Covered */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Institutional Knowledge Coverage
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Direct answers extracted from official institutional records and guidelines
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {domains.map((d, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl space-y-3 relative overflow-hidden group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${d.color} p-0.5 shadow-lg group-hover:scale-105 transition-transform`}>
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <d.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="font-display font-semibold text-base text-white group-hover:text-sky-300 transition-colors">
                  {d.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {d.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Architecture Overview */}
        <section className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">Architecture</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Enterprise-Grade RAG Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 w-fit">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-white">1. Recursive Semantic Chunking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                PDFs are decomposed into 500-1000 character overlapping chunks retaining exact page numbers and document metadata.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-white">2. High-Dimensional Vector Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Queries are embedded into 768-dim vector space and matched via Cosine similarity with strict threshold filtering.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-white">3. Grounded Synthesis & Citations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                System prompts command the LLM to ground answers exclusively in retrieved passages, preventing any outside hallucinations.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CampusWise AI. Official College RAG Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">PostgreSQL pgvector</span>
            <span>•</span>
            <span className="text-slate-400">Google Gemini & OpenAI</span>
            <span>•</span>
            <span className="text-slate-400">Node.js & React</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
