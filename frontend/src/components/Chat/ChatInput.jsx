import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Filter, Loader2, CornerDownLeft } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';

const CATEGORIES = [
  { id: null, label: 'All Topics' },
  { id: 'Admissions', label: 'Admissions' },
  { id: 'Academics', label: 'Academics' },
  { id: 'Hostel', label: 'Hostel' },
  { id: 'Fees', label: 'Fees' },
  { id: 'Exams', label: 'Exams' },
];

export default function ChatInput({ onSendMessage, disabled }) {
  const [input, setInput] = useState('');
  const { isSendingQuery, categoryFilter, setCategoryFilter } = useChatStore();
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isSendingQuery || disabled) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2">
      {/* Scope Filter Chips (CSS Flexbox Responsive Wrapping - No Scrollbars) */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs select-none">
        <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3 h-3 text-sky-500 dark:text-sky-400" />
          Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all shrink-0 active:scale-95 ${
              categoryFilter === cat.id
                ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-200 border border-sky-500/35 dark:border-sky-500/40 shadow-sm dark:shadow-glow-cyan scale-105'
                : 'glass-badge text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/[0.08]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Glass Input Field (CSS Flexbox) */}
      <form
        onSubmit={handleSubmit}
        className="relative glass-panel-elevated rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 flex items-end gap-1.5 sm:gap-2 border border-slate-200 dark:border-white/[0.12] focus-within:border-sky-500/60 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all shadow-md dark:shadow-glass-lg bg-white/90 dark:bg-[#070b12]/90"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about admissions, attendance, fees, exams, hostel..."
          disabled={isSendingQuery || disabled}
          rows={1}
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none px-2.5 sm:px-3 py-2 max-h-32 sm:max-h-40 min-h-[38px] sm:min-h-[42px] leading-relaxed"
        />

        <button
          type="submit"
          disabled={!input.trim() || isSendingQuery || disabled}
          className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shrink-0 min-w-[38px] min-h-[38px] sm:min-w-[44px] sm:min-h-[44px] ${
            input.trim() && !isSendingQuery && !disabled
              ? 'bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 text-white shadow-sm dark:shadow-glow-blue hover:scale-105 active:scale-95'
              : 'glass-badge text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
          title="Send query (Enter)"
        >
          {isSendingQuery ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-500 dark:text-sky-300" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Keyboard Shortcut Subtext (CSS Flexbox) */}
      <div className="hidden sm:flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-2">
        <span className="flex items-center gap-1">
          <CornerDownLeft className="w-2.5 h-2.5" /> Press <strong className="text-slate-600 dark:text-slate-400">Enter</strong> to send, <strong className="text-slate-600 dark:text-slate-400">Shift + Enter</strong> for new line
        </span>
        <span>Anti-Hallucination RAG Pipeline Active</span>
      </div>
    </div>
  );
}
