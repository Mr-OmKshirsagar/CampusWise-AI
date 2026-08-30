import React from 'react';
import { FileText, Award, ArrowUpRight } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';

export default function SourceCard({ source }) {
  const { openSourceDrawer } = useChatStore();
  const scorePercent = Math.round((source.similarity_score || 0) * 100);

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    if (score >= 75) return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30';
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
  };

  return (
    <button
      onClick={() => openSourceDrawer(source)}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card hover:bg-sky-500/10 dark:hover:bg-sky-950/40 border-slate-200 dark:border-white/[0.1] hover:border-sky-500/40 text-left transition-all text-xs group active:scale-95 shadow-sm max-w-full"
    >
      <div className="w-5 h-5 rounded-lg glass-icon-cyan flex items-center justify-center text-sky-500 dark:text-sky-400 shrink-0">
        <FileText className="w-3 h-3" />
      </div>

      <div className="min-w-0 truncate">
        <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-300 truncate max-w-[140px] sm:max-w-[220px] inline-block align-bottom">
          {source.document_title}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5 font-mono">
          p.{source.page_number}
        </span>
      </div>

      {source.similarity_score && (
        <span
          className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border shrink-0 ${getScoreColor(
            scorePercent
          )}`}
        >
          {scorePercent}%
        </span>
      )}

      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-300 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </button>
  );
}
