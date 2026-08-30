import React, { useState } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  Award,
  ShieldCheck,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';
import GlassIcon from '../Common/GlassIcon.jsx';

export default function SourceDrawer() {
  const { isSourceDrawerOpen, selectedSource, closeSourceDrawer } = useChatStore();
  const [copied, setCopied] = useState(false);

  if (!isSourceDrawerOpen || !selectedSource) return null;

  const scorePercent = Math.round((selectedSource.similarity_score || 0) * 100);

  const handleCopyExcerpt = () => {
    if (!selectedSource.excerpt) return;
    navigator.clipboard.writeText(selectedSource.excerpt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark Frosted Backdrop */}
      <div
        className="absolute inset-0 bg-[#030508]/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={closeSourceDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md md:max-w-lg glass-panel-elevated border-l border-white/[0.12] shadow-2xl flex flex-col animate-slide-in-right bg-[#070b12]/95 backdrop-blur-2xl">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <GlassIcon icon={FileText} variant="cyan" size="md" />
              <div>
                <h3 className="font-display font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Source Citation Excerpt
                </h3>
                <p className="text-[11px] text-slate-400">Verified institutional context chunk</p>
              </div>
            </div>
            <button
              onClick={closeSourceDrawer}
              className="p-2 rounded-xl glass-badge text-slate-400 hover:text-white transition-all active:scale-95"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
            {/* Document Metadata Glass Card */}
            <div className="glass-card p-5 rounded-2xl space-y-4 border-white/[0.1]">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                    Institutional Record
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-white leading-snug">
                    {selectedSource.document_title}
                  </h4>
                </div>
                <span className="px-3 py-1 bg-sky-500/20 border border-sky-500/35 rounded-xl text-xs font-mono font-bold text-sky-300 shadow-sm shrink-0">
                  Page {selectedSource.page_number}
                </span>
              </div>

              {selectedSource.similarity_score && (
                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Vector Cosine Similarity
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">{scorePercent}% Match</span>
                  </div>

                  {/* Gradient Confidence Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white/[0.06] p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-emerald-300 shadow-[0_0_12px_#34d399] transition-all duration-500"
                      style={{ width: `${Math.max(scorePercent, 15)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Passage Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  Referenced Text Passage
                </h4>
                <button
                  onClick={handleCopyExcerpt}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.08]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Excerpt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 sm:p-5 glass-input rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap selection:bg-sky-500 selection:text-white border-white/[0.1]">
                {selectedSource.excerpt || 'Full excerpt chunk is stored in the PostgreSQL pgvector database.'}
              </div>
            </div>

            {/* Anti-Hallucination Verified Badge */}
            <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/25 text-xs text-sky-200/90 leading-relaxed flex items-start gap-3 shadow-glass-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">Strict Grounding Guarantee</strong>
                <span>
                  This excerpt was directly retrieved from official college records. The LLM was restricted to answering strictly from this context.
                </span>
              </div>
            </div>
          </div>

          {/* Drawer Footer Action */}
          <div className="p-4 border-t border-white/[0.08] bg-white/[0.02]">
            <button
              onClick={closeSourceDrawer}
              className="w-full py-2.5 rounded-xl glass-badge hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              Close Citation Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
