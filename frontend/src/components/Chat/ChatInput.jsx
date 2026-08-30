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
    <div className="w-full max-w-4xl mx-auto space-y-2">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-500 text-[11px] flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3 h-3" />
          Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
              categoryFilter === cat.id
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative glass-panel rounded-2xl p-2 sm:p-2.5 flex items-end gap-2 border border-slate-800 focus-within:border-sky-500/60 focus-within:ring-1 focus-within:ring-sky-500/20 transition-all shadow-xl"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about admissions, attendance, fees, exams, or hostel rules..."
          disabled={isSendingQuery || disabled}
          rows={1}
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-2.5 sm:px-3 py-2 max-h-36 sm:max-h-40 min-h-[38px] leading-relaxed"
        />

        <button
          type="submit"
          disabled={!input.trim() || isSendingQuery || disabled}
          className={`p-2 sm:p-2.5 rounded-xl flex items-center justify-center transition-all shrink-0 ${
            input.trim() && !isSendingQuery && !disabled
              ? 'bg-gradient-to-tr from-sky-600 to-campus-500 text-white shadow-md shadow-sky-600/30 hover:scale-105 active:scale-95'
              : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
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
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 px-2">
        <span className="hidden sm:inline">Press <kbd className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">Enter</kbd> to ask, <kbd className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">Shift + Enter</kbd> for new line</span>
        <span className="sm:hidden text-[10px]">Official verified sources</span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-400" />
          Grounded Vector Search
        </span>
      </div>
    </div>
  );
}
