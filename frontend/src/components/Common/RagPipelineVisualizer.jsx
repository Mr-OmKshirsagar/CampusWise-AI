import React, { useState } from 'react';
import {
  FileUp,
  Scissors,
  Cpu,
  Database,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
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
      desc: 'Student queries are matched using cosine distance (<=>). Top-4 verified passages are injected into Gemini Flash to generate grounded answers.',
      metric: 'Cosine Threshold >= 0.25',
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Step Tabs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {steps.map((step, idx) => {
          const isActive = activeStep === idx;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`text-left p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                isActive
                  ? 'glass-panel-elevated border-sky-500/50 shadow-glow-blue scale-[1.02]'
                  : 'glass-card border-white/[0.08] hover:border-white/[0.18]'
              }`}
            >
              {/* Active Ambient Glow */}
              {isActive && (
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/20 rounded-full blur-xl pointer-events-none" />
              )}

              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-mono font-black ${
                    isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  PHASE {step.stepNum}
                </span>
                <GlassIcon icon={step.icon} variant={step.variant} size="sm" />
              </div>

              <h4 className="font-display font-bold text-sm sm:text-base text-white leading-snug mb-1">
                {step.title}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-1">{step.subtitle}</p>

              {/* Bottom Active Progress Line */}
              <div
                className={`mt-3 h-1 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-400 to-indigo-500 w-full'
                    : 'bg-white/[0.06] w-8 group-hover:w-16'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Detailed Active Step Showcase */}
      <div className="glass-panel-elevated p-5 sm:p-7 rounded-3xl border border-white/[0.12] relative overflow-hidden shadow-glass-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
                Active Architecture Stage
              </span>
              <span className="text-xs font-mono text-slate-400">
                Phase {steps[activeStep].stepNum} of 04
              </span>
            </div>

            <h3 className="font-display font-extrabold text-lg sm:text-2xl text-white tracking-tight">
              {steps[activeStep].title} –{' '}
              <span className="text-slate-300 font-medium text-base sm:text-xl">
                {steps[activeStep].subtitle}
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {steps[activeStep].desc}
            </p>
          </div>

          {/* Metric Highlight Box */}
          <div className="w-full md:w-auto p-4 rounded-2xl glass-input border-white/[0.1] shrink-0 text-center sm:text-left space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Technical Specification
            </span>
            <div className="text-xs sm:text-sm font-mono font-bold text-sky-400 flex items-center justify-center sm:justify-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{steps[activeStep].metric}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
