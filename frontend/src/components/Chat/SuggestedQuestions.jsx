import React from 'react';
import { Sparkles, GraduationCap, Calendar, Building, DollarSign, ArrowRight } from 'lucide-react';
import GlassIcon from '../Common/GlassIcon.jsx';

const CATEGORY_ICONS = {
  Academics: { icon: Calendar, variant: 'cyan' },
  Admissions: { icon: GraduationCap, variant: 'emerald' },
  Hostel: { icon: Building, variant: 'amber' },
  Fees: { icon: DollarSign, variant: 'purple' },
};

export default function SuggestedQuestions({ questions = [], onSelect }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3.5">
      <div className="flex items-center gap-2 justify-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
        <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
        <span>Suggested Campus Queries</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {questions.map((q, index) => {
          const catInfo = CATEGORY_ICONS[q.category] || { icon: Sparkles, variant: 'cyan' };
          return (
            <button
              key={index}
              onClick={() => onSelect(q.text)}
              className="glass-card p-3.5 sm:p-4 rounded-3xl text-left border-slate-200/90 dark:border-white/[0.08] hover:border-sky-500/40 hover:bg-sky-500/5 dark:hover:bg-sky-950/30 transition-all flex items-start gap-3 group active:scale-[0.98] shadow-liquid-sm"
            >
              <GlassIcon icon={catInfo.icon} variant={catInfo.variant} size="xs" />

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  {q.category}
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white font-medium line-clamp-2 leading-relaxed">
                  {q.text}
                </p>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
