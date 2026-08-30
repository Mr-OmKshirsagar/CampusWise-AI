import React, { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, ShieldAlert, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import SourceCard from './SourceCard.jsx';
import GlassIcon from '../Common/GlassIcon.jsx';

const MessageBubble = memo(function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';
  const sources = message.sources || [];
  const isUnknown = message.content?.includes('not available in the uploaded college documents');

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-2.5 xs:gap-3 sm:gap-4 p-3.5 xs:p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all animate-slide-up ${
        isUser
          ? 'bg-sky-500/10 dark:bg-sky-950/35 border border-sky-500/25 ml-auto max-w-[95%] xs:max-w-[90%] sm:max-w-[80%] shadow-sm dark:shadow-glass-sm text-slate-900 dark:text-white'
          : 'glass-panel-elevated border border-slate-200/80 dark:border-white/[0.1] mr-auto w-full shadow-sm dark:shadow-glass-md'
      }`}
    >
      {/* Avatar Glass Emblem */}
      <div className="shrink-0">
        {isUser ? (
          <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-xl xs:rounded-2xl bg-gradient-to-tr from-sky-600 via-electric-500 to-indigo-600 text-white flex items-center justify-center shadow-md dark:shadow-glow-blue">
            <User className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
          </div>
        ) : (
          <GlassIcon
            icon={Bot}
            variant={isUnknown ? 'amber' : 'cyan'}
            size="xs"
            className="xs:w-9 xs:h-9 sm:w-10 sm:h-10"
            iconClassName="xs:w-4 xs:h-4 sm:w-5 sm:h-5"
          />
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 space-y-2.5 sm:space-y-3 min-w-0">
        {/* Header Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-1.5">
          <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
              {isUser ? 'You' : 'CampusWise AI'}
            </span>
            {!isUser && (
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                  isUnknown
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {!isUnknown && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                )}
                {isUnknown ? 'Out of Scope' : '100% Grounded'}
              </span>
            )}
          </div>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors p-1 xs:p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/[0.08] shrink-0"
              title="Copy answer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[10px] xs:text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline text-[11px]">Copy</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Markdown Text Area */}
        <div className="text-slate-800 dark:text-slate-100 text-xs sm:text-sm markdown-body leading-relaxed break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-3 rounded-2xl border border-slate-200 dark:border-white/[0.1] shadow-sm touch-pan-x">
                  <table className="w-full text-left" {...props} />
                </div>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Verified Citation Sources Badges */}
        {!isUser && sources && sources.length > 0 && (
          <div className="pt-2.5 sm:pt-3 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Institutional Sources ({sources.length}):</span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {sources.map((source, index) => (
                <SourceCard key={index} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageBubble;
