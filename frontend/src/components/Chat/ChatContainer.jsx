import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Loader2,
  Edit2,
  Trash2,
  Check,
  X,
  Zap,
  ArrowDown,
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';
import MessageBubble from './MessageBubble.jsx';
import SuggestedQuestions from './SuggestedQuestions.jsx';
import ChatInput from './ChatInput.jsx';
import SourceDrawer from './SourceDrawer.jsx';
import CampusWiseLogo from '../Common/CampusWiseLogo.jsx';
import GlassIcon from '../Common/GlassIcon.jsx';

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
    suggestedQuestions,
  } = useChatStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const titleInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isSendingQuery, scrollToBottom]);

  // Track scroll position to display floating scroll-to-bottom button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isUp);
  };

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
    <div className="flex-1 flex flex-col h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] overflow-hidden bg-slate-50/50 dark:bg-[#030508]/60 relative bg-ambient-mesh selection:bg-sky-500 selection:text-white">
      {/* Active Conversation Title Top Bar */}
      <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-slate-200/80 dark:border-white/[0.08] glass-panel flex items-center justify-between z-10 bg-white/80 dark:bg-[#070b12]/80 backdrop-blur-xl gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              title="Open Chat History"
              className="md:hidden p-2 rounded-xl glass-badge text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shrink-0 active:scale-95 transition-transform"
            >
              <MessageSquare className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            </button>
          )}

          <GlassIcon icon={Bot} variant="cyan" size="xs" className="hidden sm:flex shrink-0" />

          <div className="min-w-0 flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5 max-w-full">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="bg-white dark:bg-black/60 border border-sky-500 rounded-lg px-2 py-0.5 text-xs text-slate-900 dark:text-white focus:outline-none w-full max-w-xs"
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[150px] xs:max-w-[220px] sm:max-w-md">
                  {currentConversation?.title || 'Campus Assistant'}
                </h2>
                {currentConversationId && (
                  <button
                    onClick={handleStartRename}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 hover:bg-black/5 dark:hover:bg-white/[0.08] rounded transition-colors shrink-0"
                    title="Rename thread"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              Retrieval-Augmented Generation • Cosine Vector Matching Active
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {currentConversationId && (
            <button
              onClick={handleDeleteConversation}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete this conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Stream Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 xs:p-4 sm:p-6 space-y-4 sm:space-y-5 no-scrollbar relative"
      >
        {isLoadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500 dark:text-sky-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Loading conversation history...</p>
          </div>
        ) : messages.length === 0 ? (
          /* Empty State Showcase */
          <div className="flex flex-col items-center justify-center min-h-[75%] max-w-2xl mx-auto text-center space-y-5 sm:space-y-8 py-6 sm:py-8 animate-fade-in px-2">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex justify-center">
                <CampusWiseLogo size="xl" showText={false} />
              </div>
              <h3 className="font-display text-lg xs:text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                How can CampusWise assist you today?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Ask any question about examination schedules, refund policies, hostel curfews, or academic condonation. All answers cite official records.
              </p>
            </div>

            {/* Suggested Starter Chips */}
            <SuggestedQuestions
              questions={suggestedQuestions}
              onSelect={handleSendMessage}
            />
          </div>
        ) : (
          /* Active Messages Stream */
          <div className="max-w-4xl mx-auto space-y-3.5 sm:space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Generating Query Spinner */}
            {isSendingQuery && (
              <div className="flex gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl glass-panel-elevated border border-slate-200 dark:border-white/[0.1] animate-pulse max-w-md mr-auto">
                <GlassIcon icon={Bot} variant="cyan" size="sm" />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200">CampusWise AI</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                      Searching Vector Index
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-sky-500 dark:text-sky-400" />
                    Retrieving institutional context and generating grounded answer...
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Scroll-to-Bottom Pill */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-28 sm:bottom-24 right-4 sm:right-6 p-2.5 rounded-full glass-panel-elevated border border-sky-500/40 text-sky-600 dark:text-sky-300 hover:text-sky-700 dark:hover:text-white shadow-md dark:shadow-glow-cyan transition-all hover:scale-110 active:scale-95 z-20"
          title="Scroll to latest message"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Bottom Fixed Chat Input Bar */}
      <div className="p-2.5 sm:p-4 border-t border-slate-200/80 dark:border-white/[0.08] glass-panel bg-white/80 dark:bg-[#070b12]/80 backdrop-blur-xl transition-colors duration-300">
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoadingMessages} />
      </div>

      {/* Source Citation Slide-Over Drawer */}
      <SourceDrawer />
    </div>
  );
}
