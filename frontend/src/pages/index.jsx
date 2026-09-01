import React, { useState, useRef, useEffect } from 'react';
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

  const promptContainerRef = useRef(null);
  const [promptIndicatorStyle, setPromptIndicatorStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });
  const [isPromptStretching, setIsPromptStretching] = useState(false);
  const prevPromptRef = useRef(activeDemoPrompt);

  const demoPrompts = [
    {
      query: 'What is the minimum attendance required to appear for semester end exams?',
      answer:
        'According to the **Academic Regulations (Section 4.2, Page 12)**, students must maintain a minimum of **75% overall attendance** in each registered course. A condonation of up to 10% (minimum 65%) may be granted by the Academic Council solely on medical grounds upon submitting verified certificates.',
      source: 'Academic_Regulations_Handbook_2025.pdf',
      page: 12,
      confidence: 96,
      category: 'Academics',
      variant: 'cyan',
      glowColor: 'from-sky-500/15 via-sky-500/5 to-transparent',
      borderColor: 'border-sky-500/35 dark:border-sky-500/40',
      activeTabClass: 'text-sky-700 dark:text-sky-200 font-bold scale-[1.02]',
      confidenceBadge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25',
      categoryBadge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/35',
      iconGlow: 'bg-sky-500/20',
      dotColor: 'bg-sky-500 dark:bg-sky-400',
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
      variant: 'amber',
      glowColor: 'from-amber-500/15 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/35 dark:border-amber-500/40',
      activeTabClass: 'text-amber-700 dark:text-amber-200 font-bold scale-[1.02]',
      confidenceBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
      categoryBadge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35',
      iconGlow: 'bg-amber-500/20',
      dotColor: 'bg-amber-500 dark:bg-amber-400',
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
      variant: 'emerald',
      glowColor: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/35 dark:border-emerald-500/40',
      activeTabClass: 'text-emerald-700 dark:text-emerald-200 font-bold scale-[1.02]',
      confidenceBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
      categoryBadge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/35',
      iconGlow: 'bg-emerald-500/20',
      dotColor: 'bg-emerald-500 dark:bg-emerald-400',
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
      variant: 'purple',
      glowColor: 'from-purple-500/15 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/35 dark:border-purple-500/40',
      activeTabClass: 'text-purple-700 dark:text-purple-200 font-bold scale-[1.02]',
      confidenceBadge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
      categoryBadge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/35',
      iconGlow: 'bg-purple-500/20',
      dotColor: 'bg-purple-500 dark:bg-purple-400',
      excerpt:
        'Late Fee Penalty: A penalty of INR 100/- per calendar day shall be levied for payments received after the specified due date up to a maximum of 10 days. Thereafter, student credentials for LMS and examinations will be placed on hold.',
    },
  ];

  // Track and animate 2D sliding liquid droplet behind active prompt across all screen sizes
  useEffect(() => {
    const updateDroplet = () => {
      if (!promptContainerRef.current) return;
      const container = promptContainerRef.current;
      const activeButton = container.querySelector(`[data-demo-idx="${activeDemoPrompt}"]`);

      if (activeButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        const left = buttonRect.left - containerRect.left;
        const top = buttonRect.top - containerRect.top;
        const width = buttonRect.width;
        const height = buttonRect.height;

        setPromptIndicatorStyle({
          left,
          top,
          width,
          height,
          opacity: 1,
        });
      }
    };

    updateDroplet();

    if (prevPromptRef.current !== activeDemoPrompt) {
      setIsPromptStretching(true);
      const timer = setTimeout(() => setIsPromptStretching(false), 380);
      prevPromptRef.current = activeDemoPrompt;
      window.addEventListener('resize', updateDroplet);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateDroplet);
      };
    }

    window.addEventListener('resize', updateDroplet);
    return () => window.removeEventListener('resize', updateDroplet);
  }, [activeDemoPrompt]);

  const currentDemo = demoPrompts[activeDemoPrompt];

  const getPromptTheme = (variant) => {
    const map = {
      cyan: {
        glow: 'shadow-[0_0_24px_rgba(14,165,233,0.35),inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1.5px_2px_0_rgba(56,189,248,0.5)]',
        bg: 'bg-gradient-to-b from-sky-500/25 via-sky-500/15 to-indigo-500/25 dark:from-sky-400/30 dark:via-sky-400/20 dark:to-indigo-500/30',
        border: 'border-sky-500/50 dark:border-sky-400/60',
        rainbow: 'from-pink-500/60 via-cyan-400/80 to-emerald-400/60',
      },
      amber: {
        glow: 'shadow-[0_0_24px_rgba(245,158,11,0.35),inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1.5px_2px_0_rgba(251,191,36,0.5)]',
        bg: 'bg-gradient-to-b from-amber-500/25 via-amber-500/15 to-orange-500/25 dark:from-amber-400/30 dark:via-amber-400/20 dark:to-orange-500/30',
        border: 'border-amber-500/50 dark:border-amber-400/60',
        rainbow: 'from-amber-400/70 via-orange-400/80 to-rose-400/70',
      },
      emerald: {
        glow: 'shadow-[0_0_24px_rgba(16,185,129,0.35),inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1.5px_2px_0_rgba(52,211,153,0.5)]',
        bg: 'bg-gradient-to-b from-emerald-500/25 via-emerald-500/15 to-teal-500/25 dark:from-emerald-400/30 dark:via-emerald-400/20 dark:to-teal-500/30',
        border: 'border-emerald-500/50 dark:border-emerald-400/60',
        rainbow: 'from-emerald-400/70 via-teal-400/80 to-cyan-400/70',
      },
      purple: {
        glow: 'shadow-[0_0_24px_rgba(168,85,247,0.35),inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1.5px_2px_0_rgba(192,132,252,0.5)]',
        bg: 'bg-gradient-to-b from-purple-500/25 via-purple-500/15 to-indigo-500/25 dark:from-purple-400/30 dark:via-purple-400/20 dark:to-indigo-500/30',
        border: 'border-purple-500/50 dark:border-purple-400/60',
        rainbow: 'from-purple-400/70 via-pink-400/80 to-indigo-400/70',
      },
    };
    return map[variant] || map.cyan;
  };

  const activePromptTheme = getPromptTheme(currentDemo.variant);

  const domains = [
    {
      title: 'Admissions & Cutoffs',
      icon: GraduationCap,
      variant: 'emerald',
      hoverBorder: 'hover:border-emerald-500/50',
      hoverShadow: 'hover:shadow-[0_20px_45px_-15px_rgba(16,185,129,0.3)] dark:hover:shadow-glow-emerald',
      glowColor: 'bg-emerald-500/20',
      titleColor: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
      lineGradient: 'from-emerald-500 to-teal-600',
      desc: 'Entrance cutoffs, quota criteria, document verification, counseling schedules, and eligibility rules.',
    },
    {
      title: 'Academic Regulations',
      icon: CalendarCheck,
      variant: 'cyan',
      hoverBorder: 'hover:border-sky-500/50',
      hoverShadow: 'hover:shadow-[0_20px_45px_-15px_rgba(14,165,233,0.3)] dark:hover:shadow-glow-cyan',
      glowColor: 'bg-sky-500/20',
      titleColor: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
      lineGradient: 'from-sky-500 to-blue-600',
      desc: '75% attendance rule, condonation policies, mid-term dates, grading scales, and backlog clearance rules.',
    },
    {
      title: 'Fee Structures & Refunds',
      icon: DollarSign,
      variant: 'purple',
      hoverBorder: 'hover:border-purple-500/50',
      hoverShadow: 'hover:shadow-[0_20px_45px_-15px_rgba(168,85,247,0.3)] dark:hover:shadow-glow-purple',
      glowColor: 'bg-purple-500/20',
      titleColor: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
      lineGradient: 'from-purple-500 to-indigo-600',
      desc: 'Semester installment schedules, caution deposit returns, tuition fee waivers, and late penalty guidelines.',
    },
    {
      title: 'Hostel & Campus Life',
      icon: Building2,
      variant: 'amber',
      hoverBorder: 'hover:border-amber-500/50',
      hoverShadow: 'hover:shadow-[0_20px_45px_-15px_rgba(245,158,11,0.3)] dark:hover:shadow-glow-amber',
      glowColor: 'bg-amber-500/20',
      titleColor: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
      lineGradient: 'from-amber-500 to-orange-600',
      desc: 'Curfew timings, biometric roll calls, room allotment rules, visitor policies, and mess menus.',
    },
    {
      title: 'Examination Rules',
      icon: FileSearch,
      variant: 'rose',
      hoverBorder: 'hover:border-rose-500/50',
      hoverShadow: 'hover:shadow-[0_20px_45px_-15px_rgba(244,63,94,0.3)] dark:hover:shadow-glow-rose',
      glowColor: 'bg-rose-500/20',
      titleColor: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
      lineGradient: 'from-rose-500 to-pink-600',
      desc: 'Hall ticket issuance, revaluation procedures, practical schedules, and exam malpractice guidelines.',
    },
    {
      title: 'Placements & Career',
      icon: Award,
      variant: 'cyan',
      hoverBorder: 'hover:border-sky-500/50',
      hoverShadow: 'hover:shadow-[0_20px_45px_-15px_rgba(14,165,233,0.3)] dark:hover:shadow-glow-cyan',
      glowColor: 'bg-sky-500/20',
      titleColor: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
      lineGradient: 'from-sky-500 to-blue-600',
      desc: 'Placement eligibility criteria, minimum CGPA requirements, internship NOC rules, and recruiter lists.',
    },
  ];

  const benchmarks = [
    {
      label: 'Retrieval Latency',
      value: '< 45ms',
      sub: 'pgvector Cosine Search',
      icon: Zap,
      variant: 'cyan',
      hoverBorder: 'hover:border-sky-500/50',
      hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(14,165,233,0.35)] dark:hover:shadow-glow-cyan',
      glowColor: 'bg-sky-500/20',
      valueColor: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
    },
    {
      label: 'Source Grounding',
      value: '100%',
      sub: 'Zero Hallucinations',
      icon: ShieldCheck,
      variant: 'emerald',
      hoverBorder: 'hover:border-emerald-500/50',
      hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.35)] dark:hover:shadow-glow-emerald',
      glowColor: 'bg-emerald-500/20',
      valueColor: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    },
    {
      label: 'Embedding Precision',
      value: '768-Dim',
      sub: 'text-embedding-004',
      icon: Database,
      variant: 'purple',
      hoverBorder: 'hover:border-purple-500/50',
      hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.35)] dark:hover:shadow-glow-purple',
      glowColor: 'bg-purple-500/20',
      valueColor: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    },
    {
      label: 'System Uptime',
      value: '99.9%',
      sub: 'High Load Optimized',
      icon: Activity,
      variant: 'amber',
      hoverBorder: 'hover:border-amber-500/50',
      hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.35)] dark:hover:shadow-glow-amber',
      glowColor: 'bg-amber-500/20',
      valueColor: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    },
  ];

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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-badge-glow text-sky-700 dark:text-sky-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-liquid-sm dark:shadow-glass-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
            <span>Official College RAG Platform • v1.2</span>
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full max-w-xs sm:max-w-md mx-auto">
            {isAuthenticated ? (
              <Link
                to="/chat"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-liquid-md dark:shadow-glow-blue flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Bot className="w-4 h-4" />
                <span>Launch Student Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-liquid-md dark:shadow-glow-blue flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/login"
                  className="group relative w-full sm:w-auto px-6 py-3.5 rounded-full glass-panel-elevated hover:bg-sky-500/[0.06] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-300 font-bold text-xs sm:text-sm border border-slate-200/90 dark:border-white/[0.12] hover:border-sky-500/40 dark:hover:border-sky-500/50 hover:shadow-[0_12px_28px_-8px_rgba(14,165,233,0.25)] dark:hover:shadow-glow-cyan transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 shadow-liquid-sm overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/[0.06] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" />
                  <span className="relative z-10">Sign In</span>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* =========================================================================
           2. INTERACTIVE LIVE RAG DEMO SANDBOX
           ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center space-y-2 px-2">
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

          {/* Prompt Selector Tabs with 2D Sliding Liquid Glass Droplet */}
          <div
            ref={promptContainerRef}
            className="relative grid grid-cols-1 md:grid-cols-2 gap-2.5 max-w-4xl mx-auto p-1.5 rounded-4xl glass-panel-elevated border border-slate-200/90 dark:border-white/[0.12] shadow-liquid-sm select-none"
          >
            {/* Viscous 2D Sliding Liquid Droplet Indicator */}
            <div
              style={{
                transform: `translateX(${promptIndicatorStyle.left}px) translateY(${promptIndicatorStyle.top}px) scaleX(${isPromptStretching ? 1.06 : 1}) scaleY(${isPromptStretching ? 0.94 : 1})`,
                width: `${promptIndicatorStyle.width}px`,
                height: `${promptIndicatorStyle.height}px`,
                opacity: promptIndicatorStyle.opacity,
                transformOrigin: 'center',
              }}
              className={`absolute top-0 left-0 rounded-full border backdrop-blur-xl pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${activePromptTheme.bg} ${activePromptTheme.border} ${activePromptTheme.glow}`}
            >
              {/* Top-down Specular Reflection Sheen */}
              <div className="absolute inset-x-3 top-0.5 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-white/30 rounded-full pointer-events-none" />

              {/* Bottom Chromatic Dispersion Rainbow Refraction Line */}
              <div
                className={`absolute inset-x-4 bottom-0 h-[1.5px] bg-gradient-to-r ${activePromptTheme.rainbow} blur-[0.5px] rounded-full pointer-events-none opacity-80`}
              />
            </div>

            {demoPrompts.map((item, idx) => {
              const isActive = activeDemoPrompt === idx;
              return (
                <button
                  key={idx}
                  data-demo-idx={idx}
                  onClick={() => setActiveDemoPrompt(idx)}
                  className={`relative z-10 px-4 py-3 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-300 flex items-center gap-2.5 cursor-pointer active:scale-95 text-left ${isActive
                      ? `${item.activeTabClass}`
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${item.dotColor} ${isActive ? 'animate-pulse scale-125' : 'opacity-70'
                      } shrink-0`}
                  />
                  <span className="truncate flex-1">
                    {item.query}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sandbox Live Response Showcase Card with Smooth Squircle Corners */}
          <div
            className={`max-w-4xl mx-auto glass-panel-elevated p-6 sm:p-10 rounded-4xl border ${currentDemo.borderColor} shadow-liquid-lg dark:shadow-glass-lg relative overflow-hidden transition-all duration-500`}
          >
            {/* Dynamic ambient background mesh gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${currentDemo.glowColor} pointer-events-none transition-all duration-700`}
            />

            {/* Ambient Corner Glow Bubble */}
            <div
              className={`absolute -top-16 -right-16 w-48 h-48 ${currentDemo.iconGlow} rounded-full blur-3xl pointer-events-none animate-stage-glow transition-all duration-700`}
            />

            {/* Inner Content Container */}
            <div
              key={activeDemoPrompt}
              className="relative z-10 space-y-5 sm:space-y-6 animate-stage-reveal"
            >
              {/* Student Query Simulated Input */}
              <div className="flex items-start gap-3.5 pb-5 border-b border-slate-200/80 dark:border-white/[0.08]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md animate-metric-pop">
                  <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                      Student Natural Language Query
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider shadow-sm transition-all duration-300 border ${currentDemo.categoryBadge}`}
                    >
                      {currentDemo.category}
                    </span>
                  </div>
                  <p className="text-xs xs:text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug break-words">
                    "{currentDemo.query}"
                  </p>
                </div>
              </div>

              {/* AI Grounded Response */}
              <div className="flex items-start gap-3.5">
                <div className="shrink-0 transition-transform duration-300">
                  <GlassIcon icon={Bot} variant={currentDemo.variant} size="xs" className="sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-3.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">CampusWise AI</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                        100% Grounded
                      </span>
                    </div>

                    <span className={`text-[11px] sm:text-xs font-mono font-bold px-3 py-0.5 rounded-full border shadow-sm transition-all duration-300 ${currentDemo.confidenceBadge}`}>
                      {currentDemo.confidence}% Vector Confidence
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50/80 dark:bg-white/[0.03] p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] break-words shadow-inner">
                    {currentDemo.answer}
                  </p>

                  {/* Source Reference & Excerpt Trigger */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Source:</span>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-badge border-slate-200/90 dark:border-white/[0.1] text-xs max-w-full shadow-liquid-sm">
                        <FileText className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
                        <span className="text-slate-800 dark:text-white font-medium truncate max-w-[140px] xs:max-w-[200px]">
                          {currentDemo.source}
                        </span>
                        <span className="text-sky-600 dark:text-sky-400 font-mono text-[10px] sm:text-[11px] shrink-0 font-bold">p.{currentDemo.page}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowExcerptModal(!showExcerptModal)}
                      className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold flex items-center gap-1.5 transition-all self-end sm:self-auto active:scale-95 cursor-pointer py-1.5 px-3 rounded-full hover:bg-sky-500/10"
                    >
                      <span>{showExcerptModal ? 'Hide Raw Excerpt' : 'View Verified Raw Excerpt'}</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${showExcerptModal ? 'rotate-90 text-sky-600 dark:text-sky-400' : 'text-slate-400'
                          }`}
                      />
                    </button>
                  </div>

                  {/* Smooth Expanding Collapsible Verified Excerpt with Squircle Rounded Corners */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showExcerptModal
                        ? 'grid-rows-[1fr] opacity-100 mt-3'
                        : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-4 sm:p-5 rounded-3xl glass-input border border-slate-200/90 dark:border-white/[0.1] text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans space-y-2 shadow-inner bg-slate-50/90 dark:bg-white/[0.02]">
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            pgvector Extracted Chunk
                          </span>
                          <span className="font-mono text-slate-500 dark:text-slate-400">Page {currentDemo.page}</span>
                        </div>
                        <p className="italic break-words text-slate-600 dark:text-slate-300 leading-relaxed">
                          "{currentDemo.excerpt}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
           3. RAG PIPELINE ARCHITECTURE SHOWCASE
           ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center space-y-2 px-2">
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
        <section className="space-y-6">
          <div className="text-center space-y-2 px-2">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {domains.map((domain, index) => (
              <div
                key={index}
                className={`group relative glass-panel-elevated p-6 sm:p-8 rounded-4xl border border-slate-200/90 dark:border-white/[0.08] space-y-4 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] cursor-pointer overflow-hidden shadow-liquid-sm dark:shadow-glass-sm ${domain.hoverBorder} ${domain.hoverShadow}`}
              >
                {/* Ambient dynamic radial glow bubble on hover */}
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 ${domain.glowColor} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                {/* Subtle glass top-down sheen reflection */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent dark:from-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-1">
                    <GlassIcon icon={domain.icon} variant={domain.variant} size="md" />
                  </div>
                  <div className="w-8 h-8 rounded-full glass-badge flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300 shadow-liquid-sm">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                  </div>
                </div>

                <div className="relative z-10 space-y-2">
                  <h3
                    className={`font-display font-bold text-sm sm:text-lg text-slate-900 dark:text-white leading-snug transition-colors duration-200 ${domain.titleColor}`}
                  >
                    {domain.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {domain.desc}
                  </p>
                </div>

                {/* Bottom accent progress bar indicator */}
                <div className="relative z-10 pt-1">
                  <div
                    className={`h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.06] group-hover:bg-gradient-to-r ${domain.lineGradient} w-10 group-hover:w-full transition-all duration-500 ease-out shadow-sm`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
           5. TECHNICAL BENCHMARKS & PERFORMANCE
           ========================================================================= */}
        <section className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {benchmarks.map((item, idx) => (
              <div
                key={idx}
                className={`group relative glass-panel-elevated p-5 sm:p-7 rounded-4xl border border-slate-200/90 dark:border-white/[0.1] text-center space-y-2.5 shadow-liquid-sm dark:shadow-glass-md transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] cursor-pointer overflow-hidden ${item.hoverBorder} ${item.hoverShadow}`}
              >
                {/* Ambient dynamic radial glow bubble on hover */}
                <div
                  className={`absolute -top-12 -right-12 w-28 h-28 ${item.glowColor} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                {/* Subtle top-down glass reflection sheen */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent dark:from-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Icon with float & scale animation on hover */}
                <div className="flex justify-center relative z-10">
                  <div className="transition-transform duration-300 ease-out group-hover:scale-115 group-hover:-translate-y-1">
                    <GlassIcon icon={item.icon} variant={item.variant} size="xs" />
                  </div>
                </div>

                {/* Big Metric Value */}
                <div
                  className={`font-display text-base xs:text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight relative z-10 transition-all duration-300 ${item.valueColor}`}
                >
                  {item.value}
                </div>

                {/* Label and Subtitle */}
                <div className="relative z-10 space-y-0.5">
                  <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors duration-200">
                    {item.label}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
           6. CTA BANNER
           ========================================================================= */}
        <section className="glass-panel-elevated p-6 xs:p-8 sm:p-14 rounded-4xl sm:rounded-[3rem] border border-sky-500/30 text-center space-y-4 sm:space-y-6 shadow-liquid-lg dark:shadow-glow-blue relative overflow-hidden">
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
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-liquid-md dark:shadow-glow-blue hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
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
      <footer className="border-t border-slate-200 dark:border-white/[0.08] glass-panel py-6 sm:py-8 px-4 sm:px-8 mt-8 sm:mt-12 bg-white/80 dark:bg-[#030508]/90 transition-colors duration-300">
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
