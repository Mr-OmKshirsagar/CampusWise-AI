import React, { useState } from 'react';
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
  CheckCircle2,
  Cpu,
  Database,
  Award,
  ChevronRight,
  FileText,
  Search,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const [activeDemoPrompt, setActiveDemoPrompt] = useState(0);

  const demoPrompts = [
    {
      query: "What is the minimum attendance required to appear for semester end exams?",
      answer: "According to the **Academic Regulations (Section 4.2, Page 12)**, students must maintain a minimum of **75% overall attendance** in each registered course. A condonation of up to 10% (minimum 65%) may be granted by the Academic Council solely on medical grounds.",
      source: "Academic_Regulations_Handbook_2025.pdf",
      page: 12,
      confidence: 96,
      category: "Academics",
    },
    {
      query: "What is the refund policy if I cancel my hostel admission before the semester begins?",
      answer: "As per the **Hostel Policy Manual (Clause 8.1, Page 5)**, cancellation requests submitted at least 15 days prior to hostel check-in are eligible for a **100% refund of the caution deposit** and an **80% refund of room rent** after deducting processing charges.",
      source: "Hostel_Rules_and_Fee_Schedule_2025.pdf",
      page: 5,
      confidence: 94,
      category: "Hostel",
    },
    {
      query: "What are the eligibility criteria and cutoff dates for the Merit Scholarship?",
      answer: "Under the **Institutional Scholarship Guidelines (Page 8)**, undergraduate students with a **CGPA of 8.5 or higher** and zero active backlogs are eligible for a 40% tuition fee waiver. Applications close strictly on **October 15th**.",
      source: "Fee_Structures_and_Scholarships.pdf",
      page: 8,
      confidence: 97,
      category: "Admissions",
    },
  ];

  const domains = [
    {
      title: 'Admissions & Eligibility',
      icon: GraduationCap,
      color: 'from-blue-500 to-sky-400',
      borderGlow: 'hover:border-sky-500/50 hover:shadow-glow-blue',
      desc: 'Entrance cutoffs, document verification, quota criteria, application deadlines & required certificates.',
    },
    {
      title: 'Academic Regulations',
      icon: CalendarCheck,
      color: 'from-indigo-500 to-electric-400',
      borderGlow: 'hover:border-indigo-500/50 hover:shadow-glow-blue',
      desc: '75% attendance rule, mid-term schedules, condonations, grading scales, and backlog clearance rules.',
    },
    {
      title: 'Fee Schedules & Refunds',
      icon: DollarSign,
      color: 'from-purple-500 to-pink-400',
      borderGlow: 'hover:border-purple-500/50 hover:shadow-glow-purple',
      desc: 'Semester installment timelines, caution deposit returns, tuition waivers, and cancellation policies.',
    },
    {
      title: 'Hostel & Campus Life',
      icon: Building2,
      color: 'from-amber-500 to-orange-400',
      borderGlow: 'hover:border-amber-500/50',
      desc: 'Curfew timings, biometric roll calls, room allocation protocols, visitor rules, and mess schedules.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col relative overflow-hidden bg-ambient-mesh selection:bg-sky-500 selection:text-white">
      {/* Background Animated Floating Light Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-purple-500/10 rounded-full blur-[130px] animate-float" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] animate-float-delayed" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20 relative z-10 space-y-20 sm:space-y-28">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-badge text-sky-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider shadow-glass-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
            <span>Official College RAG Platform • v1.0</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Official Campus Answers.{' '}
            <span className="bg-gradient-to-r from-sky-400 via-electric-400 to-indigo-400 bg-clip-text text-transparent">
              Zero Hallucinations.
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CampusWise AI indexes institutional PDFs, circulars, fee structures, and hostel policies into 768-dimensional vector space. Get instant, verified answers with exact page citations and confidence scores.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 w-full max-w-md sm:max-w-none mx-auto">
            {isAuthenticated ? (
              <Link
                to="/chat"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-electric-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow-blue flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95"
              >
                <Bot className="w-4 h-4" />
                <span>Open Student Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-electric-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow-blue flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Explore Assistant Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card text-slate-200 hover:text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>

          {/* Feature Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-2 glass-badge px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Strict Vector Grounding
            </span>
            <span className="flex items-center gap-2 glass-badge px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Exact Page Citations
            </span>
            <span className="flex items-center gap-2 glass-badge px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Deterministic Scope Fallback
            </span>
          </div>
        </section>

        {/* Interactive Live Prompt Demo Showcase Card */}
        <section className="max-w-4xl mx-auto space-y-4">
          <div className="text-center space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400">Interactive Demo</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">Experience Grounded Retrieval</h2>
          </div>

          <div className="glass-panel-elevated p-5 sm:p-7 rounded-3xl border border-white/[0.12] space-y-5 shadow-glass-lg relative overflow-hidden">
            {/* Top Prompt Switcher Buttons */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-4">
              <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-sky-400" />
                Try Query:
              </span>
              {demoPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDemoPrompt(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeDemoPrompt === idx
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-glow-blue'
                      : 'glass-badge text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.category}
                </button>
              ))}
            </div>

            {/* Simulated Chat Dialogue */}
            <div className="space-y-4">
              {/* User Question */}
              <div className="flex items-start gap-3 ml-auto max-w-[90%] sm:max-w-[80%]">
                <div className="flex-1 glass-card p-3.5 rounded-2xl border-white/[0.1] bg-sky-950/40 text-xs sm:text-sm text-sky-100">
                  <p className="font-medium">{demoPrompts[activeDemoPrompt].query}</p>
                </div>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 text-white shadow-md text-xs font-bold">
                  U
                </div>
              </div>

              {/* AI Grounded Response */}
              <div className="flex items-start gap-3 mr-auto w-full">
                <div className="w-7 h-7 rounded-xl glass-icon-box flex items-center justify-center shrink-0 text-sky-400 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 glass-card p-4 rounded-2xl border-white/[0.1] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      CampusWise AI
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Document Grounded
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {demoPrompts[activeDemoPrompt].answer}
                  </p>

                  {/* Citation Box */}
                  <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Source:</span>
                      <span className="glass-badge px-2.5 py-1 rounded-lg text-[11px] text-sky-300 font-mono flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-sky-400" />
                        {demoPrompts[activeDemoPrompt].source} (Pg {demoPrompts[activeDemoPrompt].page})
                      </span>
                    </div>

                    <span className="glass-badge px-2.5 py-1 rounded-lg text-[11px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" />
                      {demoPrompts[activeDemoPrompt].confidence}% Similarity Match
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          <div className="glass-card p-5 rounded-2xl space-y-1.5 text-center">
            <div className="w-8 h-8 rounded-xl glass-icon-box flex items-center justify-center mx-auto mb-2 text-sky-400">
              <Cpu className="w-4 h-4" />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">768-dim</p>
            <p className="text-[11px] text-slate-400 font-medium">Vector Embeddings</p>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-1.5 text-center">
            <div className="w-8 h-8 rounded-xl glass-icon-box flex items-center justify-center mx-auto mb-2 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">&lt; 150ms</p>
            <p className="text-[11px] text-slate-400 font-medium">Cosine Vector Search</p>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-1.5 text-center">
            <div className="w-8 h-8 rounded-xl glass-icon-box flex items-center justify-center mx-auto mb-2 text-purple-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">100%</p>
            <p className="text-[11px] text-slate-400 font-medium">Citation Grounding</p>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-1.5 text-center">
            <div className="w-8 h-8 rounded-xl glass-icon-box flex items-center justify-center mx-auto mb-2 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">0%</p>
            <p className="text-[11px] text-slate-400 font-medium">Hallucination Guarantee</p>
          </div>
        </section>

        {/* Knowledge Domains Covered */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400">Knowledge Coverage</span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Institutional Intelligence Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Direct synthesis extracted from verified university records, official notices, and statutory handbooks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {domains.map((d, i) => (
              <div key={i} className={`glass-card p-6 rounded-3xl space-y-4 relative overflow-hidden group ${d.borderGlow}`}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${d.color} p-0.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
                    <d.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-base text-white group-hover:text-sky-300 transition-colors">
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
        <section className="glass-panel-elevated p-7 sm:p-10 rounded-3xl border border-white/[0.1] space-y-8 shadow-glass-lg">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400">Under The Hood</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Enterprise Grounded RAG Architecture
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              How CampusWise AI transforms raw PDF notices and scanned notices into precise, deterministic student answers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-3 p-6 rounded-2xl glass-card border border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl glass-icon-box flex items-center justify-center text-sky-400">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-white">1. Ingestion & Dual OCR</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                PDFs and scanned notice images are ingested with Gemini Vision + Tesseract OCR and split into 800-character recursive chunks with 100-character overlaps.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl glass-card border border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl glass-icon-box flex items-center justify-center text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-white">2. pgvector Similarity Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                User queries are vectorized and compared against indexed document chunks using PostgreSQL pgvector cosine distance (<code className="text-purple-300">&lt;=&gt;</code>) with threshold filtering.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl glass-card border border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl glass-icon-box flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-white">3. Strict Context Synthesis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Retrieved chunks are injected into the system prompt. If similarity falls below threshold, the query is deterministically rejected rather than hallucinated.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Card */}
        <section className="relative overflow-hidden glass-panel-elevated rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-white/[0.15] shadow-glass-lg">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl glass-icon-box flex items-center justify-center mx-auto text-sky-400">
            <Bot className="w-6 h-6" />
          </div>

          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to empower your campus with verified intelligence?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Eliminate misinformation and provide 24/7 instant policy guidance to your students and administrators.
          </p>

          <div className="pt-2 flex justify-center">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-electric-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow-blue flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-slate-500 bg-[#05070a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CampusWise AI. Official College RAG Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">PostgreSQL pgvector</span>
            <span>•</span>
            <span className="text-slate-400">Google Gemini</span>
            <span>•</span>
            <span className="text-slate-400">React 18 & Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

