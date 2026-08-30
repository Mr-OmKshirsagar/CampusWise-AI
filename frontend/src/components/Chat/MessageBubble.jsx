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
      className={`flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all animate-slide-up ${
        isUser
          ? 'bg-sky-950/35 border border-sky-500/25 ml-auto max-w-[90%] sm:max-w-[80%] shadow-glass-sm'
          : 'glass-panel-elevated border border-white/[0.1] mr-auto w-full shadow-glass-md'
      }`}
    >
      {/* Avatar Glass Emblem */}
      <div className="shrink-0">
        {isUser ? (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-electric-500 to-indigo-600 text-white flex items-center justify-center shadow-glow-blue">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        ) : (
          <GlassIcon
            icon={Bot}
            variant={isUnknown ? 'amber' : 'cyan'}
            size="sm"
            className="sm:w-10 sm:h-10"
            iconClassName="sm:w-5 sm:h-5"
          />
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 space-y-3 min-w-0">
        {/* Header Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">
              {isUser ? 'You' : 'CampusWise AI'}
            </span>
            {!isUser && (
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                  isUnknown
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {!isUnknown && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
                {isUnknown ? 'Out of Scope' : '100% Grounded'}
              </span>
            )}
          </div>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-300 transition-colors p-1.5 rounded-lg hover:bg-white/[0.08]"
              title="Copy answer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Markdown Text Area */}
        <div className="text-slate-100 text-xs sm:text-sm markdown-body leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-3 rounded-2xl border border-white/[0.1] shadow-glass-sm">
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
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Institutional Sources ({sources.length}):</span>
            </div>
            <div className="flex flex-wrap gap-2">
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
