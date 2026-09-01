import React from 'react';
import { FileText, ArrowUpRight } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';

export default function SourceCard({ source, isCompact = true }) {
  const { openSourceDrawer } = useChatStore();
  const scorePercent = Math.round((source.similarity_score || 0) * 100);

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    if (score >= 75) return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30';
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
  };

  const cleanDocTitle = (source.document_title || 'Document').replace(/^\d+-\d+-/, '');

  return (
    <button
      type="button"
      onClick={() => openSourceDrawer(source)}
      className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-panel-elevated bg-white/80 dark:bg-white/[0.04] hover:bg-sky-500/[0.08] dark:hover:bg-sky-500/[0.12] border border-slate-200/90 dark:border-white/[0.12] hover:border-sky-500/50 text-left transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] text-xs active:scale-95 shadow-liquid-sm hover:shadow-glow-blue max-w-full cursor-pointer overflow-hidden select-none"
      title={`Inspect passage from ${cleanDocTitle} (p. ${source.page_number})`}
    >
      {/* Top-down Specular Reflection Sheen */}
      <div className="absolute inset-x-1.5 top-0.5 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-white/30 rounded-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Bottom Chromatic Dispersion Refraction Line */}
      <div className="absolute inset-x-2 bottom-0 h-[1.5px] bg-gradient-to-r from-pink-400/60 via-cyan-400/80 to-emerald-400/60 blur-[0.5px] rounded-full pointer-events-none opacity-0 group-hover:opacity-80 transition-opacity duration-300" />

      <div className="w-4 h-4 rounded-md glass-icon-cyan flex items-center justify-center text-sky-500 dark:text-sky-400 shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110">
        <FileText className="w-2.5 h-2.5" />
      </div>

      <div className="min-w-0 flex items-center gap-1.5 truncate relative z-10">
        <span className="font-semibold text-[11px] text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-300 truncate max-w-[130px] sm:max-w-[200px] transition-colors duration-200">
          {cleanDocTitle}
        </span>
        {source.page_number && (
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono shrink-0 px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            p.{source.page_number}
          </span>
        )}
      </div>

      {source.similarity_score && (
        <span
          className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold border shrink-0 relative z-10 transition-transform duration-200 group-hover:scale-105 ${getScoreColor(
            scorePercent
          )}`}
        >
          {scorePercent}%
        </span>
      )}

      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-300 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 relative z-10" />
    </button>
  );
}
