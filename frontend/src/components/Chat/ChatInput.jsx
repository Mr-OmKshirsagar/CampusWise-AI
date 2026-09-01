import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Filter, Check, ArrowUp, Loader2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';
import LiquidSegmentedControl from '../Common/LiquidSegmentedControl.jsx';

const DOMAIN_CATEGORIES = [
  { id: 'All', label: 'All', color: 'lime' },
  { id: 'Admissions', label: 'Admissions', color: 'emerald' },
  { id: 'Academics', label: 'Academics', color: 'cyan' },
  { id: 'Hostel', label: 'Hostel', color: 'amber' },
  { id: 'Fees', label: 'Fees', color: 'purple' },
  { id: 'Exams', label: 'Exams', color: 'rose' },
  { id: 'Placements', label: 'Placements', color: 'indigo' },
];

export default function ChatInput() {
  const [query, setQuery] = useState('');
  const { sendQuery, sendMessage, isSendingQuery, categoryFilter, setCategoryFilter } = useChatStore();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [query]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim() || isSendingQuery) return;
    const textToSend = query.trim();
    setQuery('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    const sendFn = sendQuery || sendMessage;
    if (sendFn) {
      sendFn(textToSend, categoryFilter);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentCategory = categoryFilter || 'All';

  const handleSelectCategory = (cat) => {
    setCategoryFilter(cat === 'All' ? null : cat);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2 px-2 sm:px-4 pb-2 sm:pb-3">
      {/* Apple WWDC25 Sliding Liquid Glass Category Filter Switcher with Touch Pan */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 touch-scroll-momentum touch-pan-x">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Filter className="w-3 h-3 text-sky-500" />
          Filter:
        </span>
        <LiquidSegmentedControl
          options={DOMAIN_CATEGORIES}
          value={currentCategory}
          onChange={handleSelectCategory}
          className="p-0.5"
        />
      </div>

      {/* Inset Liquid Glass Input Form with Continuous Rounded Squircle */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 p-2 sm:p-2.5 rounded-4xl glass-panel-elevated border border-slate-200/90 dark:border-white/[0.12] shadow-liquid-md dark:shadow-glass-lg focus-within:border-sky-500/50 focus-within:ring-4 focus-within:ring-sky-500/15 transition-all duration-300 bg-white/90 dark:bg-[#070b12]/90 backdrop-blur-2xl"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask anything about ${currentCategory === 'All' ? 'campus rules, fees, hostels, or exams' : currentCategory.toLowerCase()}...`}
          className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 max-h-32 px-3 py-2 leading-relaxed"
        />

        <button
          type="submit"
          disabled={!query.trim() || isSendingQuery}
          className="group relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-sky-500 via-electric-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-liquid-md dark:shadow-glow-blue transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-30 disabled:scale-95 disabled:hover:scale-95 hover:scale-105 active:scale-90 cursor-pointer overflow-hidden select-none"
          title="Send query"
          aria-label="Send message"
        >
          {/* Top-down Specular Reflection Sheen */}
          <div className="absolute inset-x-1.5 top-0.5 h-1/2 bg-gradient-to-b from-white/70 to-transparent rounded-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Bottom Chromatic Dispersion Rainbow Refraction Line */}
          <div className="absolute inset-x-2 bottom-0 h-[1.5px] bg-gradient-to-r from-pink-400/80 via-cyan-300/90 to-emerald-400/80 blur-[0.5px] rounded-full pointer-events-none opacity-0 group-hover:opacity-90 transition-opacity duration-300" />

          {isSendingQuery ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin relative z-10" />
          ) : (
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5 group-active:translate-y-0" />
          )}
        </button>
      </form>
    </div>
  );
}
