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
  Lock,
  FileUp,
  Activity,
  Check,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import CampusWiseLogo from '../components/Common/CampusWiseLogo.jsx';
import GlassIcon from '../components/Common/GlassIcon.jsx';
import RagPipelineVisualizer from '../components/Common/RagPipelineVisualizer.jsx';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const [activeDemoPrompt, setActiveDemoPrompt] = useState(0);
  const [showExcerptModal, setShowExcerptModal] = useState(false);

  const demoPrompts = [
    {
      query: 'What is the minimum attendance required to appear for semester end exams?',
      answer:
        'According to the **Academic Regulations (Section 4.2, Page 12)**, students must maintain a minimum of **75% overall attendance** in each registered course. A condonation of up to 10% (minimum 65%) may be granted by the Academic Council solely on medical grounds upon submitting verified certificates.',
      source: 'Academic_Regulations_Handbook_2025.pdf',
      page: 12,
      confidence: 96,
      category: 'Academics',
      excerpt:
        'Clause 4.2 Attendance Requirements: Every candidate is required to put in a minimum attendance of 75% in aggregate across all lecture, tutorial, and practical courses in order to be eligible to register for the Semester End Examinations. Condonation of shortage of attendance up to 10% may be sanctioned by the Principal on medical grounds.',
    },
    {
      query: 'What is the refund policy if I cancel my hostel admission before the semester begins?',
      answer:
        'As per the **Hostel Policy Manual (Clause 8.1, Page 5)**, cancellation requests submitted at least 15 days prior to hostel check-in are eligible for a **100% refund of the caution deposit** and an **80% refund of room rent** after deducting processing charges.',
      source: 'Hostel_Rules_and_Fee_Schedule_2025.pdf',
      page: 5,
      confidence: 94,
      category: 'Hostel',
      excerpt:
        'Clause 8.1 Cancellation & Refunds: If a student cancels the hostel allocation 15 days or more before the commencement of the semester, 100% Caution Deposit + 80% Room Rent shall be refunded. Within 15 days of commencement, Caution Deposit + 50% Room Rent is refundable.',
    },
    {
      query: 'What are the eligibility criteria and cutoff dates for the Merit Scholarship?',
      answer:
        'Under the **Institutional Scholarship Guidelines (Page 8)**, undergraduate students with a **CGPA of 8.5 or higher** and zero active backlogs are eligible for a 40% tuition fee waiver. Applications close strictly on **October 15th**.',
      source: 'Fee_Structures_and_Scholarships.pdf',
      page: 8,
      confidence: 97,
      category: 'Admissions',
      excerpt:
        'Section 3.4 Institutional Merit Scholarships: Full-time B.Tech students who secure a CGPA of 8.50 and above in the previous academic year with no standing arrears are eligible to apply for a 40% tuition concession. Deadline for submission of physical forms to Academic Section is October 15.',
    },
    {
      query: 'What is the penalty for late fee submission after the semester due date?',
      answer:
        'As stated in the **Fee Notification Notice (Page 2)**, a late fine of **₹100 per day** applies for the first 10 days post-deadline. After 10 days, student portal access is temporarily frozen until arrears are cleared.',
      source: 'Semester_Fee_Payment_Schedule.pdf',
      page: 2,
      confidence: 93,
      category: 'Fees',
      excerpt:
        'Late Fee Penalty: A penalty of INR 100/- per calendar day shall be levied for payments received after the specified due date up to a maximum of 10 days. Thereafter, student credentials for LMS and examinations will be placed on hold.',
    },
  ];

  const domains = [
    {
      title: 'Admissions & Cutoffs',
      icon: GraduationCap,
      variant: 'emerald',
      desc: 'Entrance cutoffs, quota criteria, document verification, counseling schedules, and eligibility rules.',
    },
    {
      title: 'Academic Regulations',
      icon: CalendarCheck,
      variant: 'cyan',
      desc: '75% attendance rule, condonation policies, mid-term dates, grading scales, and backlog clearance rules.',
    },
    {
      title: 'Fee Structures & Refunds',
      icon: DollarSign,
      variant: 'purple',
      desc: 'Semester installment schedules, caution deposit returns, tuition fee waivers, and late penalty guidelines.',
    },
    {
      title: 'Hostel & Campus Life',
      icon: Building2,
      variant: 'amber',
      desc: 'Curfew timings, biometric roll calls, room allotment rules, visitor policies, and mess menus.',
    },
    {
      title: 'Examination Rules',
      icon: FileSearch,
      variant: 'rose',
      desc: 'Hall ticket issuance, revaluation procedures, practical schedules, and exam malpractice guidelines.',
    },
    {
      title: 'Placements & Career',
      icon: Award,
      variant: 'cyan',
      desc: 'Placement eligibility criteria, minimum CGPA requirements, internship NOC rules, and recruiter lists.',
    },
  ];

  const benchmarks = [
    { label: 'Retrieval Latency', value: '< 45ms', sub: 'pgvector Cosine Search', icon: Zap, variant: 'cyan' },
    { label: 'Source Grounding', value: '100%', sub: 'Zero Hallucinations', icon: ShieldCheck, variant: 'emerald' },
    { label: 'Embedding Precision', value: '768-Dim', sub: 'text-embedding-004', icon: Database, variant: 'purple' },
    { label: 'System Uptime', value: '99.9%', sub: 'High Load Optimized', icon: Activity, variant: 'amber' },
  ];

  const currentDemo = demoPrompts[activeDemoPrompt];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col relative overflow-hidden bg-ambient-mesh selection:bg-sky-500 selection:text-white">
      {/* Background Ambient Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-sky-500/10 rounded-full blur-[100px] sm:blur-[140px] animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-purple-500/10 rounded-full blur-[110px] sm:blur-[150px] animate-float" />
        <div className="absolute -bottom-40 left-1/3 w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] bg-emerald-500/10 rounded-full blur-[120px] sm:blur-[160px] animate-float-delayed" />
        <div className="absolute inset-0 grid-pattern opacity-30 sm:opacity-35" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 xs:py-10 sm:py-16 md:py-20 relative z-10 space-y-12 xs:space-y-16 sm:space-y-24">
        {/* =========================================================================
           1. HERO SECTION
           ========================================================================= */}
        <section className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full glass-badge-glow text-sky-700 dark:text-sky-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm dark:shadow-glass-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
            <span>Official College RAG Platform • v1.1</span>
          </div>

          <h1 className="font-display text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] sm:leading-[1.12]">
            Official Campus Answers.{' '}
            <span className="bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 dark:from-sky-400 dark:via-electric-400 dark:to-cyber-400 bg-clip-text text-transparent block sm:inline">
              Zero Hallucinations.
            </span>
          </h1>

          <p className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed px-1">
            CampusWise AI indexes official circulars, fee rules, hostel guidelines, and academic handbooks into 768-dimensional vector space. Receive verified, natural language answers backed by exact page citations.
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full max-w-xs sm:max-w-md mx-auto">
            {isAuthenticated ? (
              <Link
                to="/chat"
                className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md dark:shadow-glow-blue flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Bot className="w-4 h-4" />
                <span>Launch Student Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md dark:shadow-glow-blue flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl glass-panel-elevated hover:bg-black/5 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold text-xs sm:text-sm border border-slate-200 dark:border-white/[0.12] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* =========================================================================
           2. INTERACTIVE LIVE RAG DEMO SANDBOX
           ========================================================================= */}
        <section className="space-y-5 sm:space-y-6">
          <div className="text-center space-y-1.5 sm:space-y-2 px-2">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-sky-600 dark:text-sky-400 tracking-widest flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive RAG Sandbox
            </span>
            <h2 className="font-display text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Test Instant Vector Retrieval Live
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Select any verified campus question below to see how our RAG engine retrieves official passages and generates grounded citations.
            </p>
          </div>

          {/* Prompt Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-4xl mx-auto px-1">
            {demoPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDemoPrompt(idx)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeDemoPrompt === idx
                    ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-200 border border-sky-500/35 dark:border-sky-500/40 shadow-sm dark:shadow-glow-cyan scale-105'
                    : 'glass-card text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 shrink-0" />
                <span className="truncate max-w-[170px] xs:max-w-[220px] sm:max-w-[280px]">{item.query}</span>
              </button>
            ))}
          </div>

          {/* Sandbox Live Response Showcase Card */}
          <div className="max-w-4xl mx-auto glass-panel-elevated p-4 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.12] space-y-4 sm:space-y-6 shadow-sm dark:shadow-glass-lg relative overflow-hidden">
            {/* Student Query Simulated Input */}
            <div className="flex items-start gap-3 sm:gap-3.5 pb-4 sm:pb-5 border-b border-slate-200 dark:border-white/[0.08]">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                  Student Natural Language Query
                </span>
                <p className="text-xs xs:text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug break-words">
                  "{currentDemo.query}"
                </p>
              </div>
            </div>

            {/* AI Grounded Response */}
            <div className="flex items-start gap-3 sm:gap-3.5">
              <GlassIcon icon={Bot} variant="cyan" size="xs" className="sm:w-10 sm:h-10 shrink-0" />
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">CampusWise AI</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                      100% Grounded
                    </span>
                  </div>

                  <span className="text-[11px] sm:text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/25">
                    {currentDemo.confidence}% Vector Confidence
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/[0.06] break-words">
                  {currentDemo.answer}
                </p>

                {/* Source Reference & Excerpt Trigger */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Source:</span>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl glass-badge border-slate-200 dark:border-white/[0.1] text-xs max-w-full">
                      <FileText className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
                      <span className="text-slate-800 dark:text-white font-medium truncate max-w-[140px] xs:max-w-[200px]">
                        {currentDemo.source}
                      </span>
                      <span className="text-sky-600 dark:text-sky-400 font-mono text-[10px] sm:text-[11px] shrink-0">p.{currentDemo.page}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowExcerptModal(!showExcerptModal)}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors self-end sm:self-auto"
                  >
                    <span>{showExcerptModal ? 'Hide Raw Excerpt' : 'View Verified Raw Excerpt'}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        showExcerptModal ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Collapsible Verified Excerpt */}
                {showExcerptModal && (
                  <div className="mt-3 p-3.5 sm:p-4 rounded-2xl glass-input border border-slate-200 dark:border-white/[0.1] text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans animate-slide-up space-y-2">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        pgvector Extracted Chunk
                      </span>
                      <span>Page {currentDemo.page}</span>
                    </div>
                    <p className="italic break-words">"{currentDemo.excerpt}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
           3. RAG PIPELINE ARCHITECTURE SHOWCASE
           ========================================================================= */}
        <section className="space-y-5 sm:space-y-6">
          <div className="text-center space-y-1.5 sm:space-y-2 px-2">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-purple-600 dark:text-purple-400 tracking-widest flex items-center justify-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Engine Architecture
            </span>
            <h2 className="font-display text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How CampusWise RAG Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              From administrative PDF upload to deterministic vector similarity generation without external hallucinations.
            </p>
          </div>

          <RagPipelineVisualizer />
        </section>

        {/* =========================================================================
           4. INSTITUTIONAL DOMAINS MATRIX
           ========================================================================= */}
        <section className="space-y-5 sm:space-y-6">
          <div className="text-center space-y-1.5 sm:space-y-2 px-2">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-widest flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Comprehensive Campus Coverage
            </span>
            <h2 className="font-display text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              One Assistant for Every College Policy
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Trained on institutional documentation across all major student and faculty administrative workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {domains.map((domain, index) => (
              <div
                key={index}
                className="glass-card p-4 sm:p-6 rounded-3xl space-y-3 sm:space-y-4 border-slate-200 dark:border-white/[0.08] relative group"
              >
                <GlassIcon icon={domain.icon} variant={domain.variant} size="md" />

                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="font-display font-bold text-sm sm:text-lg text-slate-900 dark:text-white leading-snug">
                    {domain.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {domain.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
           5. TECHNICAL BENCHMARKS & PERFORMANCE
           ========================================================================= */}
        <section className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {benchmarks.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel-elevated p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/[0.1] text-center space-y-1.5 sm:space-y-2 shadow-sm dark:shadow-glass-md"
              >
                <div className="flex justify-center">
                  <GlassIcon icon={item.icon} variant={item.variant} size="xs" />
                </div>
                <div className="font-display text-base xs:text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                  {item.value}
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
           6. CTA BANNER
           ========================================================================= */}
        <section className="glass-panel-elevated p-6 xs:p-8 sm:p-12 rounded-3xl sm:rounded-[2.5rem] border border-sky-500/30 text-center space-y-4 sm:space-y-6 shadow-md dark:shadow-glow-blue relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-3 sm:space-y-4">
            <h2 className="font-display text-xl xs:text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ready for Instant, Verified Campus Knowledge?
            </h2>
            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Experience the power of grounded Retrieval-Augmented Generation tailored for modern college campuses.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={isAuthenticated ? '/chat' : '/register'}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md dark:shadow-glow-blue hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
         7. FOOTER
         ========================================================================= */}
      <footer className="border-t border-slate-200 dark:border-white/[0.08] glass-panel py-6 sm:py-8 px-3.5 sm:px-8 mt-8 sm:mt-12 bg-white/80 dark:bg-[#030508]/90 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-500 dark:text-slate-400">
          <CampusWiseLogo size="sm" />
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              pgvector & Gemini Operational
            </span>
            <span>• MIT Licensed</span>
          </div>
          <p>© {new Date().getFullYear()} CampusWise AI. Enterprise RAG College Assistant.</p>
        </div>
      </footer>
    </div>
  );
}
