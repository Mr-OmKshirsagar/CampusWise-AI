import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
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
      className={`flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl transition-all ${
        isUser
          ? 'bg-slate-900/60 border border-slate-800 ml-auto max-w-[85%] sm:max-w-[75%]'
          : 'glass-panel border border-slate-800/80 mr-auto w-full'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-sky-600 to-campus-500 text-white'
            : isUnknown
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-3 min-w-0">
        {/* Header: Sender Label & Timestamp & Copy Button */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">
              {isUser ? 'You' : 'CampusWise AI'}
            </span>
            {!isUser && (
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                isUnknown
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {isUnknown ? 'Out of Scope' : 'Document Grounded'}
              </span>
            )}
          </div>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-400 transition-colors p-1 rounded hover:bg-slate-800"
              title="Copy answer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
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
                <div className="overflow-x-auto my-3 rounded-xl border border-slate-800 shadow-md">
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
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>Verified Document References:</span>
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
