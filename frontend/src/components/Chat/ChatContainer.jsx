import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Layers,
  ArrowDown,
  RotateCcw,
  ShieldCheck,
  Zap,
  Menu,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';
import MessageBubble from './MessageBubble.jsx';
import ChatInput from './ChatInput.jsx';
import GlassIcon from '../Common/GlassIcon.jsx';
import ConfirmModal from '../Common/ConfirmModal.jsx';
import { toast } from '../../store/toastStore.js';

export default function ChatContainer({ onOpenMobileSidebar }) {
  const {
    messages = [],
    isSendingQuery = false,
    conversations = [],
    currentConversationId,
    deleteConversation,
    renameConversation,
    sendQuery,
    lastAutoRenamedId,
  } = useChatStore();

  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Inline rename header title state
  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [headerTitle, setHeaderTitle] = useState(currentConversation?.title || 'Official Academic Assistant');
  const [justRenamed, setJustRenamed] = useState(false);

  // Delete confirmation popup state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setHeaderTitle(currentConversation?.title || 'Official Academic Assistant');
    setIsEditingTitle(false);
  }, [currentConversationId, currentConversation?.title]);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSendingQuery, currentConversationId]);

  const handleSaveTitle = async () => {
    const oldTitle = currentConversation?.title || 'Official Academic Assistant';
    const newTitle = headerTitle.trim();

    if (currentConversation?.id && newTitle) {
      if (newTitle !== oldTitle) {
        try {
          await renameConversation(currentConversation.id, newTitle);
          setJustRenamed(true);
          setTimeout(() => setJustRenamed(false), 1800);
          toast.success(`Renamed "${oldTitle}" → "${newTitle}"`, 'Chat Renamed');
        } catch (err) {
          toast.error(`Failed to rename "${oldTitle}": ${err.message}`, 'Rename Failed');
        }
      }
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    const oldTitle = currentConversation?.title || 'Official Academic Assistant';
    toast.cancel(`Rename cancelled for "${oldTitle}"`, 'Action Cancelled');
    setHeaderTitle(oldTitle);
    setIsEditingTitle(false);
  };

  const handleCancelDeleteChat = () => {
    const chatTitle = currentConversation?.title || 'Official Academic Assistant';
    toast.cancel(`Deletion cancelled for "${chatTitle}"`, 'Action Cancelled');
    setShowDeleteConfirm(false);
  };

  const handleConfirmDeleteCurrentChat = async () => {
    if (currentConversation?.id) {
      const chatTitle = currentConversation.title || 'Official Academic Assistant';
      setShowDeleteConfirm(false);
      try {
        await deleteConversation(currentConversation.id);
        toast.success(`Successfully deleted conversation "${chatTitle}"`, 'Chat Deleted');
      } catch (err) {
        toast.error(`Failed to delete conversation "${chatTitle}": ${err.message || 'Error occurred'}`, 'Deletion Failed');
      }
    }
  };

  const isHeaderRenamed = justRenamed || lastAutoRenamedId === currentConversationId;

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col h-full overflow-hidden relative selection:bg-sky-500 selection:text-white bg-ambient-mesh"
    >
      {/* Dynamic Ambient Mesh Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Session Header Bar with Inline Rename & Delete Controls */}
      <div className="py-2.5 px-3 sm:px-6 shrink-0 z-20 border-b border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-[#070b12]/60 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {onOpenMobileSidebar && (
              <button
                onClick={onOpenMobileSidebar}
                className="p-2 rounded-2xl glass-badge md:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-liquid-sm shrink-0 cursor-pointer"
                aria-label="Open Conversation History"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`w-2 h-2 rounded-full ${isHeaderRenamed ? 'bg-purple-500 shadow-[0_0_12px_#a855f7]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'} animate-pulse shrink-0 transition-colors duration-300`} />
              
              {isEditingTitle ? (
                <div className="flex items-center gap-1.5 max-w-sm w-full animate-fade-in">
                  <input
                    type="text"
                    autoFocus
                    value={headerTitle}
                    onChange={(e) => setHeaderTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') handleCancelTitle();
                    }}
                    className="flex-1 glass-input rounded-xl px-2.5 py-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white border border-sky-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTitle}
                    className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                    title="Save title"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelTitle}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  key={currentConversationId || 'new-title-heading'}
                  className={`flex items-center gap-2 min-w-0 ${
                    isHeaderRenamed
                      ? 'animate-liquid-renamed px-2.5 py-0.5 rounded-xl bg-purple-500/15 border border-purple-500/40'
                      : 'animate-fade-in'
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-bold truncate ${isHeaderRenamed ? 'text-purple-600 dark:text-purple-300' : 'text-slate-800 dark:text-slate-200'}`}>
                    {currentConversation?.title || 'Official Academic Assistant'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Header Actions: Rename & Delete (Only when a conversation is active) */}
          {currentConversation && !isEditingTitle && (
            <div className="flex items-center gap-1 shrink-0 animate-fade-in">
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="p-2 rounded-full glass-badge text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-500/10 active:scale-95 transition-all shadow-liquid-sm cursor-pointer"
                title="Rename conversation"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-full glass-badge text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all shadow-liquid-sm cursor-pointer"
                title="Delete conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SCROLLABLE CONVERSATION STREAM WITH LIQUID GLASS SWITCH ANIMATION
         ══════════════════════════════════════════════════════════════ */}
      <div
        key={currentConversationId || 'new-session-stream'}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-6 relative z-10 no-scrollbar animate-liquid-chat-switch"
      >
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {messages.length === 0 ? (
            <div className="py-8 sm:py-14 text-center space-y-8 max-w-2xl mx-auto animate-scale-up">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <GlassIcon icon={Bot} variant="cyan" size="lg" className="sm:w-16 sm:h-16 animate-bounce [animation-duration:3s]" />
                </div>

                <div className="space-y-2">
                  <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    How can I assist you today?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                    Ask anything about academic regulations, syllabus, exams, fee schedules, or hostel policies.
                  </p>
                </div>
              </div>

              {/* Starter Query Cards with Staggered Cascading Reveal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                {[
                  {
                    title: 'B.Tech Web Security Syllabus',
                    query: 'What are the main units and topics covered in B.Tech Sem 5 Web Security?',
                    category: 'Academics',
                  },
                  {
                    title: 'Hostel Curfew & Gate Rules',
                    query: 'What are the latest gate entry timings and leave approval rules for hostels?',
                    category: 'Hostel',
                  },
                  {
                    title: 'Semester Fee Deadlines',
                    query: 'When is the last date to pay the odd semester tuition fee without late penalty?',
                    category: 'Fees',
                  },
                  {
                    title: 'Continuous Assessment Tests',
                    query: 'What is the format and weightage for CAE 1 examinations?',
                    category: 'Exams',
                  },
                ].map((item, index) => (
                  <button
                    key={index}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => sendQuery(item.query, item.category)}
                    className="animate-liquid-row glass-card p-3.5 sm:p-4 rounded-3xl text-left border-slate-200/80 dark:border-white/[0.08] hover:border-sky-500/50 hover:bg-sky-500/[0.04] transition-all group active:scale-[0.98] shadow-liquid-sm cursor-pointer will-change-[transform,opacity]"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-sky-600 dark:text-sky-400 mb-1 font-mono">
                      <span>{item.category}</span>
                      <Sparkles className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {item.query}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                style={{ animationDelay: `${index * 35}ms` }}
                className="animate-liquid-row will-change-[transform,opacity]"
              >
                <MessageBubble message={message} />
              </div>
            ))
          )}

          {/* AI Generation State Indicator */}
          {isSendingQuery && (
            <div className="flex items-start gap-3.5 animate-slide-up">
              <GlassIcon icon={Bot} variant="cyan" size="sm" className="mt-1 shrink-0 animate-pulse" />
              <div className="glass-panel-elevated p-4 sm:p-5 rounded-4xl rounded-tl-lg space-y-3 max-w-xl border-sky-500/30 shadow-liquid-md dark:shadow-glow-blue">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 font-mono">
                    Searching institutional vector index & synthesizing response...
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 w-2/3 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Persistent Chat Input Dock */}
      <div className="px-3 sm:px-6 pb-3 sm:pb-5 pt-2 shrink-0 relative z-20">
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput />
        </div>
      </div>

      {/* Confirmation Modal for Active Header Chat Deletion */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDeleteChat}
        onConfirm={handleConfirmDeleteCurrentChat}
        title="Delete Active Conversation"
        itemName={currentConversation?.title || 'Official Academic Assistant'}
        itemType="conversation"
        description="Are you sure you want to permanently delete this active conversation? All responses and verified citations in this thread will be lost."
        confirmText="Delete Conversation"
      />
    </div>
  );
}
