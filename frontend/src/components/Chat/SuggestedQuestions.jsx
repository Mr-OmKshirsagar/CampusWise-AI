import React from 'react';
import { Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';

export default function SuggestedQuestions({ onSelectQuestion }) {
  const { suggestedQuestions } = useChatStore();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        <span>Suggested Inquiries (Official College Records)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q.text)}
            className="group text-left p-3 rounded-xl glass-card flex flex-col justify-between text-xs transition-all hover:scale-[1.01]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-200 font-medium group-hover:text-sky-300 transition-colors line-clamp-2">
                {q.text}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {q.category}
              </span>
              <span className="text-[10px] text-slate-500">Verified document context</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
