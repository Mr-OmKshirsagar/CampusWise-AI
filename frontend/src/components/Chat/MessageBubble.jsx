import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, ShieldAlert, Sparkles, BookOpen, ExternalLink } from 'lucide-react';
import SourceCard from './SourceCard.jsx';

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';
  const sources = message.sources || [];
  const isUnknown = message.content.includes('not available in the uploaded college documents');

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all animate-slide-up ${
        isUser
          ? 'bg-sky-950/40 border border-sky-500/25 ml-auto max-w-[88%] sm:max-w-[78%] shadow-glass-sm'
          : 'glass-panel-elevated border border-white/[0.1] mr-auto w-full shadow-glass-md'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-9 h-9 rounded-2xl shrink-0 flex items-center justify-center shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-glow-blue'
            : isUnknown
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'glass-icon-box text-sky-400 shadow-glow-blue'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-3 min-w-0">
        {/* Header: Sender Label & Status & Copy Button */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">
              {isUser ? 'You' : 'CampusWise AI'}
            </span>
            {!isUser && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                isUnknown
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1'
              }`}>
                {!isUnknown && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                {isUnknown ? 'Out of Scope' : 'Document Grounded'}
              </span>
            )}
          </div>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-400 transition-colors p-1.5 rounded-lg hover:bg-white/[0.08]"
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

        {/* Markdown Rendered Text */}
        <div className="text-slate-100 text-sm markdown-body leading-relaxed">
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

        {/* Source Badges */}
        {!isUser && sources && sources.length > 0 && (
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Verified Institutional Citations:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map((src, idx) => (
                <SourceCard key={idx} source={src} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

