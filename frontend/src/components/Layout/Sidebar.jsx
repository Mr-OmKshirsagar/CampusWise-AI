import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Bot,
  Search,
  BookOpen,
  Activity,
  Database,
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';
import GlassIcon from '../Common/GlassIcon.jsx';
import ConfirmModal from '../Common/ConfirmModal.jsx';
import { toast } from '../../store/toastStore.js';

export default function Sidebar({
  isCollapsed = false,
  onToggle,
  isMobileOpen = false,
  onCloseMobile,
}) {
  const {
    conversations = [],
    currentConversationId,
    fetchConversations,
    startNewChatDraft,
    selectConversation,
    deleteConversation,
    renameConversation,
    lastAutoRenamedId,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const isResizing = useRef(false);

  // Inline rename state with tracking of original title
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingOldTitle, setEditingOldTitle] = useState('');
  const [justRenamedId, setJustRenamedId] = useState(null);

  // Delete & Add animation state tracking
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [deletingChatId, setDeletingChatId] = useState(null);
  const [newlyAddedChatId, setNewlyAddedChatId] = useState(null);

  const prevConversationsCount = useRef(conversations.length);

  useEffect(() => {
    if (fetchConversations) {
      fetchConversations();
    }
  }, [fetchConversations]);

  // Detect newly added conversation automatically when user sends query
  useEffect(() => {
    if (conversations.length > prevConversationsCount.current && conversations[0]) {
      setNewlyAddedChatId(conversations[0].id);
      const timer = setTimeout(() => setNewlyAddedChatId(null), 3500);
      prevConversationsCount.current = conversations.length;
      return () => clearTimeout(timer);
    }
    prevConversationsCount.current = conversations.length;
  }, [conversations]);

  // Mouse drag handlers for fluid resizing
  const startResizing = (e) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const newWidth = Math.min(Math.max(e.clientX, 220), 420);
    setSidebarWidth(newWidth);
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  const filteredConversations = (conversations || []).filter((t) =>
    (t.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group conversations by date
  const groupConversations = (list) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = { Today: [], Yesterday: [], Earlier: [] };

    list.forEach((t) => {
      const d = new Date(t.created_at || t.updated_at || Date.now());
      d.setHours(0, 0, 0, 0);

      if (d.getTime() === today.getTime()) {
        groups.Today.push(t);
      } else if (d.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(t);
      } else {
        groups.Earlier.push(t);
      }
    });

    return groups;
  };

  const grouped = groupConversations(filteredConversations);

  const handleSelect = (id) => {
    selectConversation(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleNewChat = () => {
    startNewChatDraft();
    if (onCloseMobile) onCloseMobile();
  };

  const startEditing = (e, thread) => {
    e.stopPropagation();
    setEditingId(thread.id);
    const origTitle = thread.title || 'New Query';
    setEditingTitle(origTitle);
    setEditingOldTitle(origTitle);
  };

  const saveEditing = async (e) => {
    e?.stopPropagation();
    const oldTitle = editingOldTitle || 'New Query';
    const newTitle = editingTitle.trim();

    if (editingId && newTitle) {
      if (newTitle !== oldTitle) {
        try {
          await renameConversation(editingId, newTitle);
          setJustRenamedId(editingId);
          setTimeout(() => setJustRenamedId(null), 1800);
          toast.success(`Renamed "${oldTitle}" → "${newTitle}"`, 'Chat Renamed');
        } catch (err) {
          toast.error(`Failed to rename "${oldTitle}": ${err.message}`, 'Rename Failed');
        }
      }
    }
    setEditingId(null);
    setEditingTitle('');
    setEditingOldTitle('');
  };

  const cancelEditing = (e) => {
    e?.stopPropagation();
    if (editingOldTitle) {
      toast.cancel(`Rename cancelled for "${editingOldTitle}"`, 'Action Cancelled');
    }
    setEditingId(null);
    setEditingTitle('');
    setEditingOldTitle('');
  };

  const handleCancelDelete = () => {
    if (threadToDelete) {
      const chatTitle = threadToDelete.title || 'New Query';
      toast.cancel(`Deletion cancelled for "${chatTitle}"`, 'Action Cancelled');
      setThreadToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (threadToDelete) {
      const chat = threadToDelete;
      const chatTitle = chat.title || 'New Query';
      setThreadToDelete(null);
      setDeletingChatId(chat.id);

      setTimeout(async () => {
        try {
          await deleteConversation(chat.id);
          toast.success(`Successfully deleted chat "${chatTitle}"`, 'Chat Deleted');
        } catch (err) {
          toast.error(`Failed to delete chat "${chatTitle}": ${err.message || 'Error occurred'}`, 'Deletion Failed');
        } finally {
          setDeletingChatId(null);
        }
      }, 260);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside
        style={{ width: isCollapsed ? '0px' : `${sidebarWidth}px` }}
        className={`fixed md:static top-16 bottom-0 left-0 z-40 md:z-30 flex flex-col glass-panel-elevated border-r border-slate-200/90 dark:border-white/[0.08] transition-transform md:transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden shrink-0 shadow-2xl md:shadow-none bg-white/95 dark:bg-[#070b12]/95 backdrop-blur-2xl h-[calc(100dvh-4rem)] ${
          isMobileOpen
            ? 'translate-x-0 !w-[280px] sm:!w-[300px]'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Action Header: New Query */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-white/[0.08] space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleNewChat}
              className="flex-1 py-2.5 px-4 rounded-full bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-liquid-sm dark:shadow-glow-blue flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat Session</span>
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-full glass-badge md:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-full pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Thread History List with Liquid Stagger, Slide & AI Auto-Rename Pulse */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
          {Object.entries(grouped).map(([label, groupItems]) => {
            if (groupItems.length === 0) return null;
            return (
              <div key={label} className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 px-3 block">
                  {label}
                </span>

                <div className="space-y-1">
                  {groupItems.map((thread, index) => {
                    const isActive = currentConversationId === thread.id;
                    const isEditing = editingId === thread.id;
                    const isNew = newlyAddedChatId === thread.id;
                    const isDeleting = deletingChatId === thread.id;
                    const isAutoRenamed = lastAutoRenamedId === thread.id;
                    const isRenamed = justRenamedId === thread.id || isAutoRenamed;

                    return (
                      <div
                        key={thread.id}
                        onClick={() => handleSelect(thread.id)}
                        style={{ animationDelay: isNew || isRenamed ? '0ms' : `${index * 30}ms` }}
                        className={`group relative flex items-center justify-between px-3 py-2 rounded-2xl text-xs cursor-pointer transition-all will-change-[transform,opacity] ${
                          isDeleting
                            ? 'animate-liquid-toast-out opacity-0 pointer-events-none'
                            : isRenamed
                            ? 'animate-liquid-renamed bg-purple-500/20 text-purple-700 dark:text-purple-200 ring-1 ring-purple-500/60 shadow-[0_0_25px_-3px_rgba(168,85,247,0.4)] font-bold'
                            : isNew
                            ? 'animate-liquid-new-row bg-sky-500/20 text-sky-700 dark:text-sky-200 ring-1 ring-sky-500/50 shadow-[0_0_20px_-3px_rgba(56,189,248,0.35)] font-bold'
                            : newlyAddedChatId
                            ? 'animate-liquid-slide-down'
                            : 'animate-liquid-row'
                        } ${
                          isActive && !isNew && !isRenamed
                            ? 'bg-sky-500/20 text-sky-700 dark:text-sky-200 border border-sky-500/40 shadow-liquid-sm font-bold'
                            : !isNew && !isRenamed
                            ? 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/[0.06] border border-transparent'
                            : ''
                        }`}
                      >
                        {isEditing ? (
                          <div
                            className="flex items-center gap-1.5 w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              autoFocus
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditing(e);
                                if (e.key === 'Escape') cancelEditing(e);
                              }}
                              className="flex-1 glass-input rounded-xl px-2 py-1 text-xs text-slate-900 dark:text-white border border-sky-500/50"
                            />
                            <button
                              type="button"
                              onClick={saveEditing}
                              className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                              title="Save Title"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
                              <div className="relative shrink-0">
                                <MessageSquare
                                  className={`w-3.5 h-3.5 ${
                                    isRenamed
                                      ? 'text-purple-500 dark:text-purple-400'
                                      : isActive || isNew
                                      ? 'text-sky-500 dark:text-sky-400'
                                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                  }`}
                                />
                                {isNew && (
                                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                                )}
                                {isRenamed && (
                                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                                )}
                              </div>
                              <span className="truncate">{thread.title || 'New Query'}</span>
                            </div>

                            {/* Actions: Rename & Delete (Accessible on mobile touch & desktop hover) */}
                            <div className="flex items-center gap-0.5 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                type="button"
                                onClick={(e) => startEditing(e, thread)}
                                className="p-1.5 rounded-xl hover:bg-sky-500/10 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-all cursor-pointer"
                                title="Rename conversation"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setThreadToDelete(thread);
                                }}
                                className="p-1.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-all cursor-pointer"
                                title="Delete conversation"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs px-4 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto opacity-40 text-sky-500" />
              <p>No chat history yet.</p>
              <p className="text-[10px] text-slate-500">Ask a question to begin a verified session.</p>
            </div>
          )}
        </div>

        {/* Bottom Sidebar Footer: pgvector Status & Thread Count (Liquid Glass Styled) */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
          <div className="glass-panel-elevated px-3 py-2 rounded-2xl border border-slate-200/90 dark:border-white/[0.1] flex items-center justify-between gap-2 shadow-liquid-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981] shrink-0" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                pgvector Ready
              </span>
            </div>

            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 glass-badge px-2 py-0.5 rounded-full shrink-0">
              {conversations.length} {conversations.length === 1 ? 'thread' : 'threads'}
            </span>
          </div>
        </div>

        {/* Resizer Handle */}
        <div
          onMouseDown={startResizing}
          className="hidden md:block absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 bg-transparent hover:bg-sky-500/50 cursor-ew-resize transition-all"
        />
      </aside>

      {/* Confirmation Modal for Thread Deletion */}
      <ConfirmModal
        isOpen={!!threadToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Chat Conversation"
        itemName={threadToDelete?.title || 'New Query'}
        itemType="chat"
        description="Are you sure you want to permanently delete this chat session? All answers, verified source citations, and query history will be removed."
        confirmText="Delete Chat"
      />
    </>
  );
}
