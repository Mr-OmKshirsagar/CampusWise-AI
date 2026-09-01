import React, { useState } from 'react';
import {
  FileUp,
  Scissors,
  Database,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import GlassIcon from './GlassIcon.jsx';

export default function RagPipelineVisualizer() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'ingest',
      stepNum: '01',
      title: 'Institutional Ingestion',
      subtitle: 'PDFs, Notices & OCR Scans',
      icon: FileUp,
      variant: 'cyan',
      badgeColor: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
      glowColor: 'from-sky-500/15 via-sky-500/5 to-transparent',
      borderColor: 'border-sky-500/35 dark:border-sky-500/40',
      activeProgressGradient: 'from-sky-500 to-blue-600',
      accentTextColor: 'text-sky-600 dark:text-sky-400',
      iconGlow: 'bg-sky-500/20',
      desc: 'Administrators upload official PDFs, fee circulars, and hostel guidelines. Scanned images are processed via Dual-Layer Vision OCR.',
      metric: 'Max 15MB Multi-page Support',
    },
    {
      id: 'chunk',
      stepNum: '02',
      title: 'Semantic Text Chunking',
      subtitle: 'Recursive Character Splitter',
      icon: Scissors,
      variant: 'purple',
      badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      glowColor: 'from-purple-500/15 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/35 dark:border-purple-500/40',
      activeProgressGradient: 'from-purple-500 to-indigo-600',
      accentTextColor: 'text-purple-600 dark:text-purple-400',
      iconGlow: 'bg-purple-500/20',
      desc: 'Documents are partitioned into 800-character semantically coherent passages with 100-char overlap, preserving page tags and metadata.',
      metric: '800-char window • 100 overlap',
    },
    {
      id: 'embed',
      stepNum: '03',
      title: '768-Dim Vector Embedding',
      subtitle: 'pgvector Cosine Space',
      icon: Database,
      variant: 'emerald',
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      glowColor: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/35 dark:border-emerald-500/40',
      activeProgressGradient: 'from-emerald-500 to-teal-600',
      accentTextColor: 'text-emerald-600 dark:text-emerald-400',
      iconGlow: 'bg-emerald-500/20',
      desc: 'Each text chunk is mapped into high-dimensional embedding space using Google Gemini text-embedding-004 and stored in PostgreSQL pgvector.',
      metric: '768 Float32 Vector Dimension',
    },
    {
      id: 'rag',
      stepNum: '04',
      title: 'Similarity Search & Grounding',
      subtitle: 'Top-K & Exact Page Citation',
      icon: Sparkles,
      variant: 'amber',
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      glowColor: 'from-amber-500/15 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/35 dark:border-amber-500/40',
      activeProgressGradient: 'from-amber-500 to-orange-600',
      accentTextColor: 'text-amber-600 dark:text-amber-400',
      iconGlow: 'bg-amber-500/20',
      desc: 'Student queries are matched using cosine distance (<=>). Top-4 verified passages are injected into Gemini Flash to generate grounded answers.',
      metric: 'Cosine Threshold >= 0.25',
    },
  ];

  const currentStep = steps[activeStep];

  return (
    <div className="w-full space-y-5">
      {/* Step Tabs Grid with Apple Liquid Glass Segmented Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {steps.map((step, idx) => {
          const isActive = activeStep === idx;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`text-left p-5 sm:p-6 rounded-4xl border transition-all duration-300 relative overflow-hidden group active:scale-95 cursor-pointer ${
                isActive
                  ? `glass-panel-elevated ${step.borderColor} shadow-liquid-md dark:shadow-glow-cyan scale-[1.02]`
                  : 'glass-card border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18]'
              }`}
            >
              {/* Active Ambient Glow */}
              {isActive && (
                <div
                  className={`absolute -top-10 -right-10 w-28 h-28 ${step.iconGlow} rounded-full blur-xl pointer-events-none transition-all duration-500 animate-stage-glow`}
                />
              )}

              <div className="flex items-center justify-between mb-3.5">
                <span
                  className={`text-xs font-mono font-black transition-colors duration-300 ${
                    isActive
                      ? step.accentTextColor
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }`}
                >
                  PHASE {step.stepNum}
                </span>
                <GlassIcon icon={step.icon} variant={step.variant} size="xs" />
              </div>

              <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug mb-1 transition-colors duration-300">
                {step.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{step.subtitle}</p>

              {/* Bottom Active Progress Line */}
              <div
                className={`mt-4 h-1.5 rounded-full transition-all duration-500 ease-out ${
                  isActive
                    ? `bg-gradient-to-r ${step.activeProgressGradient} w-full shadow-sm`
                    : 'bg-slate-200 dark:bg-white/[0.06] w-8 group-hover:w-16'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Detailed Active Step Showcase with Squircle Curvature */}
      <div
        className={`glass-panel-elevated p-6 sm:p-8 rounded-4xl border ${currentStep.borderColor} relative overflow-hidden shadow-liquid-md dark:shadow-glass-lg transition-all duration-500`}
      >
        {/* Dynamic ambient background mesh gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${currentStep.glowColor} pointer-events-none transition-all duration-700`}
        />

        {/* Ambient Corner Glow Bubble */}
        <div
          className={`absolute -top-16 -left-16 w-48 h-48 ${currentStep.iconGlow} rounded-full blur-3xl pointer-events-none animate-stage-glow transition-all duration-700`}
        />

        {/* Re-animated content container on step change */}
        <div
          key={activeStep}
          className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-stage-reveal"
        >
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm transition-all duration-300 ${currentStep.badgeColor}`}
              >
                Active Architecture Stage
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">
                Phase {currentStep.stepNum} of 04
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="hidden sm:block shrink-0">
                <GlassIcon icon={currentStep.icon} variant={currentStep.variant} size="md" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                  {currentStep.title} –{' '}
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-base sm:text-xl">
                    {currentStep.subtitle}
                  </span>
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
              {currentStep.desc}
            </p>
          </div>

          {/* Metric Highlight Box */}
          <div className="w-full md:w-auto p-4 sm:p-5 rounded-3xl glass-input border-slate-200/90 dark:border-white/[0.1] shrink-0 text-center sm:text-left space-y-1.5 shadow-sm transition-all duration-300 animate-metric-pop hover:scale-[1.02]">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
              Technical Specification
            </span>
            <div className={`text-xs sm:text-sm font-mono font-bold ${currentStep.accentTextColor} flex items-center justify-center sm:justify-start gap-2`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{currentStep.metric}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
