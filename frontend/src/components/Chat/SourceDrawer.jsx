import React from 'react';
import { X, FileText, CheckCircle2, Award, ShieldCheck, Sparkles, BookOpen, Layers } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';

export default function SourceDrawer() {
  const { isSourceDrawerOpen, selectedSource, closeSourceDrawer } = useChatStore();

  if (!isSourceDrawerOpen || !selectedSource) return null;

  const scorePercent = Math.round((selectedSource.similarity_score || 0) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#05070a]/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={closeSourceDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-lg glass-panel-elevated border-l border-white/[0.12] shadow-2xl flex flex-col animate-slide-in-right bg-[#090d16]/95">
          {/* Header */}
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl glass-icon-box flex items-center justify-center text-sky-400 shadow-glow-blue">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-tight">
                  Source Citation Excerpt
                </h3>
                <p className="text-[11px] text-slate-400">Verified institutional context chunk</p>
              </div>
            </div>
            <button
              onClick={closeSourceDrawer}
              className="p-2 rounded-xl glass-badge text-slate-400 hover:text-white transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 no-scrollbar">
            {/* Document Metadata Card */}
            <div className="glass-card p-5 rounded-2xl space-y-3.5 border-white/[0.1]">
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
                  {/* Visual Confidence Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 shadow-[0_0_10px_#10b981] transition-all duration-500"
                      style={{ width: `${Math.max(scorePercent, 10)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Passage */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  Referenced Passage
                </h4>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Anti-Hallucination Verified
                </span>
              </div>
              <div className="p-4 sm:p-5 glass-input rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap selection:bg-sky-500 selection:text-white border-white/[0.1]">
                {selectedSource.excerpt || 'Full excerpt chunk is stored in PostgreSQL vector database.'}
              </div>
            </div>

            {/* Grounding Info Box */}
            <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/25 text-xs text-sky-200/90 leading-relaxed flex items-start gap-3 shadow-glass-sm">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p>
                CampusWise AI strictly synthesizes student prompts using verified institutional passages. Any ungrounded question is rejected to preserve campus compliance.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex justify-end">
            <button
              onClick={closeSourceDrawer}
              className="px-5 py-2.5 glass-card rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:border-white/[0.2] transition-all active:scale-95"
            >
              Close Citation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

