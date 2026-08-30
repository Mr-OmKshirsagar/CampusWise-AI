import React from 'react';
import { FileText, ExternalLink, Sparkles } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';

export default function SourceCard({ source }) {
  const { openSourceDrawer } = useChatStore();

  const scorePercent = Math.round((source.similarity_score || 0) * 100);

  return (
    <button
      onClick={() => openSourceDrawer(source)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/30 text-sky-300 text-xs font-medium transition-all group shadow-sm"
      title="Click to view citation excerpt"
    >
      <FileText className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
      <span className="truncate max-w-[160px] sm:max-w-[200px]">{source.document_title}</span>
      <span className="text-[10px] text-sky-400/80 font-mono bg-sky-900/50 px-1 rounded">
        p.{source.page_number}
      </span>
      {scorePercent > 0 && (
        <span className="text-[10px] text-emerald-400/90 font-mono hidden sm:inline">
          {scorePercent}% match
        </span>
      )}
      <ExternalLink className="w-3 h-3 text-sky-400/60 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
    </button>
  );
}
