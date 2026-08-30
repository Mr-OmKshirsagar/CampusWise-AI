import React from 'react';
import { X, FileText, CheckCircle2, Award, ShieldCheck } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';

export default function SourceDrawer() {
  const { isSourceDrawerOpen, selectedSource, closeSourceDrawer } = useChatStore();

  if (!isSourceDrawerOpen || !selectedSource) return null;

  const scorePercent = Math.round((selectedSource.similarity_score || 0) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={closeSourceDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slide-up">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-white">Source Document Citation</h3>
                <p className="text-xs text-slate-400">Verified institutional context chunk</p>
              </div>
            </div>
            <button
              onClick={closeSourceDrawer}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Document Metadata Card */}
            <div className="glass-card p-4 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Document Name</span>
                  <h4 className="font-medium text-sm text-white mt-0.5">{selectedSource.document_title}</h4>
                </div>
                <span className="px-2 py-1 bg-sky-500/15 border border-sky-500/30 rounded-lg text-xs font-mono text-sky-300">
                  Page {selectedSource.page_number}
                </span>
              </div>

              {selectedSource.similarity_score && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Vector Cosine Confidence
                  </span>
                  <span className="font-mono text-emerald-400 font-semibold">{scorePercent}% Match</span>
                </div>
              )}
            </div>

            {/* Extracted Passage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Referenced Passage Excerpt
                </h4>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Anti-Hallucination Grounded
                </span>
              </div>
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap selection:bg-sky-500 selection:text-white">
                {selectedSource.excerpt || 'Full excerpt is preserved in vector store chunk.'}
              </div>
            </div>

            {/* Grounding Info Box */}
            <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-sky-300/90 leading-relaxed flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p>
                CampusWise AI strictly grounds every answer in this exact passage chunk. When information cannot be validated against official documents, queries are deterministically rejected to eliminate hallucinations.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
            <button
              onClick={closeSourceDrawer}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
