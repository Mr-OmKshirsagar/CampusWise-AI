import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, MessageSquare, ShieldCheck, Loader2, Edit2, Trash2, Check, X } from 'lucide-react';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSendingQuery]);

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
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950/40 relative">
      {/* Active Conversation Title Header */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800/80 glass-panel flex items-center justify-between z-10 bg-slate-950/70">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              title="Open Chat History"
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 active:scale-95 transition-transform"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
            </button>
          )}
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0 hidden sm:block">
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
                  className="bg-slate-900 border border-sky-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                />
                <button
                  onClick={handleSaveRename}
                  title="Save title (Enter)"
                  className="p-1 rounded bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  title="Cancel (Esc)"
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                  {currentConversation ? currentConversation.title : 'New Campus Conversation'}
                </h2>
                {currentConversation && (
                  <button
                    onClick={handleStartRename}
                    title="Rename conversation"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 rounded transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Grounded AI Engine • Zero Hallucination Mode
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        {currentConversation && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartRename}
              title="Rename conversation"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rename</span>
            </button>
            <button
              onClick={handleDeleteConversation}
              title="Delete conversation"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/30 text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {isLoadingMessages ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Retrieving conversation history...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center space-y-6 py-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-campus-500 p-0.5 shadow-2xl shadow-sky-500/30 animate-pulse-subtle">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-8 h-8 text-sky-400" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                How can I help you today?
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Ask any question regarding admissions, fee schedules, exam rules, or hostel policies. Every answer is strictly grounded in official institutional documents with citations.
              </p>
            </div>

            {/* Suggested Question Chips */}
            <SuggestedQuestions onSelectQuestion={handleSendMessage} />
          </div>
        ) : (
          /* Render Message Bubbles */
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <MessageBubble key={msg.id || idx} message={msg} />
            ))}

            {/* Live Generation Indicator */}
            {isSendingQuery && (
              <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3 w-fit animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-sky-300">Searching official documents & synthesizing answer...</p>
                  <p className="text-[11px] text-slate-400">Computing vector similarity & enforcing grounding</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoadingMessages} />
      </div>

      {/* Slide-over Source Drawer */}
      <SourceDrawer />
    </div>
  );
}
