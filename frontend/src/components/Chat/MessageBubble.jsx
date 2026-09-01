import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import GlassIcon from '../Common/GlassIcon.jsx';
import SourceCard from './SourceCard.jsx';

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
  const isUser = message.sender === 'user' || message.role === 'user';
  const sources = message.sources || [];

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine if the AI response indicates no context / ungrounded query
  const contentLower = (message.content || '').toLowerCase();
  const isNoContext =
    message.is_grounded === false ||
    sources.length === 0 ||
    contentLower.includes('not available in the uploaded') ||
    contentLower.includes('not available in the provided') ||
    contentLower.includes('not found in the uploaded') ||
    contentLower.includes('no relevant information') ||
    contentLower.includes('cannot find any information') ||
    contentLower.includes('do not have information regarding');

  const PREVIEW_LIMIT = 2;
  const hasMoreSources = sources.length > PREVIEW_LIMIT;

  return (
    <div
      className={`flex items-start gap-3 sm:gap-4 max-w-4xl mx-auto w-full animate-slide-up ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* 3D Glass Avatar with Squircle Dimensions */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-liquid-sm">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        ) : (
          <GlassIcon icon={Bot} variant={isNoContext ? 'amber' : 'cyan'} size="sm" />
        )}
      </div>

      {/* Message Content Bubble with Soft Squircle Corners */}
      <div
        className={`relative group max-w-[85%] sm:max-w-[80%] rounded-4xl p-4 sm:p-6 transition-all duration-300 ${
          isUser
            ? 'bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 text-white shadow-liquid-md rounded-br-2xl'
            : isNoContext
            ? 'glass-panel-elevated border border-amber-500/30 text-slate-800 dark:text-slate-100 shadow-liquid-md dark:shadow-glass-md rounded-tl-2xl bg-amber-500/[0.02]'
            : 'glass-panel-elevated border border-slate-200/90 dark:border-white/[0.12] text-slate-800 dark:text-slate-100 shadow-liquid-md dark:shadow-glass-md rounded-tl-2xl'
        }`}
      >
        {/* Assistant Header Badge */}
        {!isUser && (
          <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xs text-slate-900 dark:text-white">
                CampusWise AI
              </span>

              {/* Dynamic Context Badge: Verified vs No Context */}
              {isNoContext ? (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                  <AlertCircle className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                  No Campus Context
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Verified Context
                </span>
              )}
            </div>

            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] transition-all cursor-pointer"
              title="Copy answer"
              aria-label="Copy message text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Formatted Markdown Body */}
        <div className={`text-xs sm:text-sm leading-relaxed ${isUser ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap font-sans">{message.content}</p>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  table: ({ node, ...props }) => (
                    <div className="w-full my-3 overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-white/[0.1] bg-slate-50/60 dark:bg-white/[0.02] shadow-liquid-sm custom-scrollbar overscroll-contain max-w-full">
                      <table className="w-full text-left text-xs min-w-[320px] sm:min-w-full border-collapse" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-slate-100/90 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200/90 dark:border-white/[0.08]" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="px-3.5 py-2.5 font-bold text-slate-900 dark:text-white text-left border-r border-slate-200/60 dark:border-white/[0.06] last:border-r-0 whitespace-nowrap" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-3.5 py-2 text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-white/[0.04] border-r border-slate-200/50 dark:border-white/[0.04] last:border-r-0 align-top" {...props} />
                  ),
                  tr: ({ node, ...props }) => (
                    <tr className="hover:bg-sky-500/[0.04] dark:hover:bg-white/[0.03] transition-colors last:border-b-0" {...props} />
                  ),
                }}
              >
                {message.content || ''}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            LIQUID GLASS MORPHING REFERENCES CARD (MAXIMIZE / MINIMIZE)
           ══════════════════════════════════════════════════════════════ */}
        {!isUser && !isNoContext && sources.length > 0 && (
          <div
            className={`mt-4 p-3 sm:p-3.5 rounded-3xl border liquid-morph-card relative overflow-hidden transition-all duration-500 ${
              isSourcesExpanded
                ? 'bg-sky-500/[0.08] dark:bg-sky-500/[0.08] border-sky-500/40 shadow-liquid-md dark:shadow-[0_0_25px_-5px_rgba(56,189,248,0.25)]'
                : 'bg-slate-100/60 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.07] shadow-liquid-sm'
            }`}
          >
            {/* Ambient specular highlight glow on expand */}
            {isSourcesExpanded && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-sky-500/15 rounded-full blur-2xl animate-pulse" />
              </div>
            )}

            {/* Header Bar with Title and Maximize/Minimize Action */}
            <div className="relative z-10 flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span className="truncate">Verified References ({sources.length})</span>
              </div>

              {/* Liquid Glass Maximize / Minimize Action Pill */}
              {hasMoreSources && (
                <button
                  type="button"
                  onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all shadow-liquid-sm cursor-pointer active:scale-95 ${
                    isSourcesExpanded
                      ? 'bg-sky-500 text-white shadow-glow-blue hover:bg-sky-400'
                      : 'glass-badge text-sky-600 dark:text-sky-400 hover:bg-sky-500/10'
                  }`}
                  title={isSourcesExpanded ? 'Minimize reference card' : 'Maximize to view all references'}
                >
                  <span>{isSourcesExpanded ? 'Show Less' : `+${sources.length - PREVIEW_LIMIT} More`}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-400 ${
                      isSourcesExpanded ? 'rotate-180 text-white' : 'text-sky-500'
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Top 2 Primary Reference Pills */}
            <div className="relative z-10 flex flex-wrap gap-1.5">
              {sources.slice(0, PREVIEW_LIMIT).map((src, index) => (
                <SourceCard key={index} source={src} />
              ))}
            </div>

            {/* Expandable Fluid Grid for Remaining References with Liquid Spring Stagger */}
            {hasMoreSources && (
              <div
                className={`liquid-morph-expand-grid relative z-10 ${
                  isSourcesExpanded ? 'is-expanded pt-1.5' : 'is-collapsed'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sources.slice(PREVIEW_LIMIT).map((src, index) => (
                      <div
                        key={index + PREVIEW_LIMIT}
                        style={{ animationDelay: `${index * 35}ms` }}
                        className={isSourcesExpanded ? 'animate-liquid-row will-change-[transform,opacity]' : ''}
                      >
                        <SourceCard source={src} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        {message.created_at && (
          <div
            className={`text-[9px] mt-2 font-mono ${
              isUser ? 'text-sky-100 text-right' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}
