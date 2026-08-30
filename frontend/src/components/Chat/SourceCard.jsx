import React from 'react';
import { FileText, ExternalLink, Award } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';

export default function SourceCard({ source }) {
  const { openSourceDrawer } = useChatStore();

  const scorePercent = Math.round((source.similarity_score || 0) * 100);

  return (
    <button
      onClick={() => openSourceDrawer(source)}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl glass-badge hover:bg-white/[0.08] border border-sky-500/30 hover:border-sky-500/50 text-sky-300 text-xs font-semibold transition-all group shadow-sm hover:scale-[1.02] active:scale-[0.98]"
      title="Click to view verified source citation excerpt"
    >
      <FileText className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
      <span className="truncate max-w-[160px] sm:max-w-[220px]">{source.document_title}</span>
      <span className="text-[10px] text-sky-300 font-mono bg-sky-500/20 px-1.5 py-0.5 rounded-md border border-sky-500/30">
        p.{source.page_number}
      </span>
      {scorePercent > 0 && (
        <span className="text-[10px] text-emerald-400 font-mono font-bold hidden sm:inline-flex items-center gap-1">
          <Award className="w-3 h-3 text-amber-400" />
          {scorePercent}%
        </span>
      )}
      <ExternalLink className="w-3 h-3 text-sky-400/60 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
    </button>
  );
}

