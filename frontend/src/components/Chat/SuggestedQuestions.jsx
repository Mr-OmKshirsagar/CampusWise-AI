import React from 'react';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';

export default function SuggestedQuestions({ onSelectQuestion }) {
  const { suggestedQuestions } = useChatStore();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3.5 animate-fade-in">
      <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-sky-400">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Frequently Inquired Policies (Official Knowledge Base)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q.text)}
            className="group text-left p-4 rounded-2xl glass-card border-white/[0.08] hover:border-sky-500/40 flex flex-col justify-between text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-glass-sm hover:shadow-glow-blue"
          >
            <div className="flex items-start justify-between gap-2.5">
              <span className="text-slate-200 font-semibold group-hover:text-sky-300 transition-colors line-clamp-2 leading-relaxed">
                {q.text}
              </span>
              <div className="p-1 rounded-lg glass-badge text-slate-400 group-hover:text-sky-400 group-hover:bg-sky-500/20 transition-all shrink-0 mt-0.5">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
                {q.category}
              </span>
              <span className="text-[10px] text-slate-400">Verified document context</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

