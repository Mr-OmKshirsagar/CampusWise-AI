import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Filter, Loader2 } from 'lucide-react';
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
    <div className="w-full max-w-4xl mx-auto space-y-2.5">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1 shrink-0 mr-1.5">
          <Filter className="w-3 h-3 text-sky-400" />
          Filter Scope:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
              categoryFilter === cat.id
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-glow-blue scale-105'
                : 'glass-badge text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative glass-panel-elevated rounded-2xl p-2 sm:p-2.5 flex items-end gap-2 border border-white/[0.12] focus-within:border-sky-500/60 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all shadow-glass-md"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about admissions, attendance, fees, exams, or hostel rules..."
          disabled={isSendingQuery || disabled}
          rows={1}
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-3 py-2 max-h-36 sm:max-h-40 min-h-[40px] leading-relaxed"
        />

        <button
          type="submit"
          disabled={!input.trim() || isSendingQuery || disabled}
          className={`p-2.5 sm:p-3 rounded-xl flex items-center justify-center transition-all shrink-0 ${
            input.trim() && !isSendingQuery && !disabled
              ? 'bg-gradient-to-r from-sky-600 via-electric-500 to-indigo-600 text-white shadow-glow-blue hover:scale-105 active:scale-95'
              : 'glass-badge text-slate-500 cursor-not-allowed'
          }`}
          title="Send query"
        >
          {isSendingQuery ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Helper text */}
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 px-2 font-mono">
        <span className="hidden sm:inline">Press <kbd className="bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.1] text-slate-300">Enter</kbd> to ask, <kbd className="bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.1] text-slate-300">Shift + Enter</kbd> for new line</span>
        <span className="sm:hidden text-[10px]">Official verified sources</span>
        <span className="flex items-center gap-1 text-sky-400">
          <Sparkles className="w-3 h-3" />
          Cosine Distance &bull; Vector Retrieval
        </span>
      </div>
    </div>
  );
}


