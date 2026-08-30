import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, MessageSquare, ShieldCheck, Loader2, Edit2, Trash2, Check, X, Zap } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';
import MessageBubble from './MessageBubble.jsx';
import SuggestedQuestions from './SuggestedQuestions.jsx';
import ChatInput from './ChatInput.jsx';
import SourceDrawer from './SourceDrawer.jsx';

export default function ChatContainer({ onOpenMobileSidebar }) {
  const {
    currentConversationId,
    currentConversation,
    messages,
    isLoadingMessages,
    isSendingQuery,
    sendMessage,
    renameConversation,
    deleteConversation,
  } = useChatStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const titleInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSendingQuery, scrollToBottom]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleStartRename = () => {
    if (!currentConversation) return;
    setNewTitle(currentConversation.title || '');
    setIsEditingTitle(true);
  };

  const handleSaveRename = async () => {
    if (!newTitle.trim() || !currentConversationId) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await renameConversation(currentConversationId, newTitle.trim());
      setIsEditingTitle(false);
    } catch (err) {
      alert('Failed to rename conversation.');
    }
  };

  const handleDeleteConversation = () => {
    if (!currentConversationId) return;
    if (confirm('Are you sure you want to delete this conversation thread?')) {
      deleteConversation(currentConversationId);
      navigate('/chat');
    }
  };

  const handleSendMessage = (text) => {
    sendMessage(text);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#05070a]/60 relative bg-ambient-mesh selection:bg-sky-500 selection:text-white">
      {/* Active Conversation Title Header */}
      <div className="px-3.5 sm:px-6 py-3 border-b border-white/[0.08] glass-panel flex items-center justify-between z-10 bg-[#05070a]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              title="Open Chat History"
              className="md:hidden p-2 rounded-xl glass-badge text-slate-300 hover:text-white shrink-0 active:scale-95 transition-transform"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
            </button>
          )}

          <div className="w-9 h-9 rounded-xl glass-icon-box flex items-center justify-center text-sky-400 shrink-0 hidden sm:flex shadow-glow-blue">
            <Bot className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="glass-input rounded-xl px-3 py-1 text-xs text-white focus:outline-none"
                />
                <button
                  onClick={handleSaveRename}
                  title="Save title (Enter)"
                  className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  title="Cancel (Esc)"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md tracking-tight">
                  {currentConversation ? currentConversation.title : 'Campus Knowledge Assistant'}
                </h2>
                {currentConversation && (
                  <button
                    onClick={handleStartRename}
                    title="Rename conversation"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-sky-400 hover:bg-white/[0.08] rounded-lg transition-all"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Grounded RAG Engine • Anti-Hallucination Active</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        {currentConversation && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartRename}
              title="Rename conversation"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-badge hover:bg-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rename</span>
            </button>
            <button
              onClick={handleDeleteConversation}
              title="Delete conversation"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-300 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
        {isLoadingMessages ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 border-2 border-sky-400 border-t-transparent rounded-full animate-spin shadow-glow-blue" />
              <p className="text-xs text-slate-400 font-medium tracking-wide">Retrieving conversation context...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center space-y-6 py-6 animate-fade-in">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl glass-icon-box flex items-center justify-center shadow-glow-blue">
                <Bot className="w-8 h-8 text-sky-400 animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 p-1.5 bg-emerald-500 rounded-full border-2 border-[#05070a] shadow-[0_0_8px_#10b981]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                How can CampusWise help you today?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Ask about admissions, hostel curfews, exam schedules, or fee refund policies. Every answer is strictly extracted from official college circulars with citations.
              </p>
            </div>

            {/* Suggested Question Chips */}
            <SuggestedQuestions onSelectQuestion={handleSendMessage} />
          </div>
        ) : (
          /* Render Message Bubbles */
          <div className="max-w-4xl mx-auto space-y-4 gpu-layer">
            {messages.map((msg, idx) => (
              <MessageBubble key={msg.id || idx} message={msg} />
            ))}

            {/* Live Generation Indicator */}
            {isSendingQuery && (
              <div className="glass-panel-elevated p-4 rounded-2xl border border-sky-500/30 flex items-center gap-3.5 w-fit animate-pulse shadow-glow-blue">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    Searching vector index & synthesizing verified answer...
                  </p>
                  <p className="text-[10px] text-slate-400">Computing 768-dim cosine similarity with guardrails</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3.5 sm:p-5 border-t border-white/[0.08] bg-[#05070a]/80 backdrop-blur-xl">
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoadingMessages} />
      </div>

      {/* Slide-over Source Drawer */}
      <SourceDrawer />
    </div>
  );
}

