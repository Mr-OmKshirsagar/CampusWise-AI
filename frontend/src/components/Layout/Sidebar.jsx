import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MessageSquarePlus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';

const MIN_SIDEBAR_WIDTH = 260;
const MAX_SIDEBAR_WIDTH = 460;
const DEFAULT_SIDEBAR_WIDTH = 300;

export default function Sidebar({ isCollapsed, onToggle, isMobileOpen, onCloseMobile }) {
  const {
    conversations,
    currentConversationId,
    fetchConversations,
    selectConversation,
    createNewConversation,
    renameConversation,
    deleteConversation,
    isLoadingConversations,
  } = useChatStore();

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('campuswise_sidebar_width');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
        return parsed;
      }
    }
    return DEFAULT_SIDEBAR_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef(null);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // Drag-to-Resize handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.min(
        MAX_SIDEBAR_WIDTH,
        Math.max(MIN_SIDEBAR_WIDTH, e.clientX)
      );
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        localStorage.setItem('campuswise_sidebar_width', sidebarWidth.toString());
      }
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  const handleStartResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleNewChat = async () => {
    try {
      const conv = await createNewConversation();
      navigate(`/chat/${conv.id}`);
      if (isMobileOpen && onCloseMobile) onCloseMobile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (id) => {
    selectConversation(id);
    navigate(`/chat/${id}`);
    if (isMobileOpen && onCloseMobile) onCloseMobile();
  };

  const handleStartRename = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title || '');
  };

  const handleSaveRename = async (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm('Delete this conversation thread?')) {
      await deleteConversation(id);
      if (currentConversationId === id) {
        navigate('/chat');
      }
    }
  };

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const filtered = conversations.filter((c) =>
      (c.title || 'New Conversation').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 7 * 86400000;

    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    filtered.forEach((conv) => {
      const convTime = new Date(conv.created_at || conv.updated_at || Date.now()).getTime();
      if (convTime >= today) {
        groups.today.push(conv);
      } else if (convTime >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convTime >= sevenDaysAgo) {
        groups.lastWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [conversations, searchQuery]);

  const renderConvItem = (conv) => {
    const isSelected = currentConversationId === conv.id;
    const isEditing = editingId === conv.id;

    return (
      <div
        key={conv.id}
        onClick={() => !isEditing && handleSelect(conv.id)}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-xs ${
          isSelected
            ? 'bg-sky-500/20 text-sky-200 border border-sky-500/35 shadow-glow-cyan'
            : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MessageSquare
            className={`w-3.5 h-3.5 shrink-0 ${
              isSelected ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
            }`}
          />

          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(e, conv.id);
                if (e.key === 'Escape') handleCancelRename(e);
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/60 border border-sky-500/50 rounded px-2 py-0.5 text-xs text-white focus:outline-none w-full"
            />
          ) : (
            <span className="truncate font-medium">{conv.title || 'New Conversation'}</span>
          )}
        </div>

        {/* Action Buttons (Rename / Delete) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
          {isEditing ? (
            <>
              <button
                onClick={(e) => handleSaveRename(e, conv.id)}
                className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                title="Save title"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCancelRename}
                className="p-1 text-rose-400 hover:bg-rose-500/20 rounded"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => handleStartRename(e, conv)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.1] rounded transition-colors"
                title="Rename conversation"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded transition-colors"
                title="Delete conversation"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#070b12]/95 backdrop-blur-xl border-r border-white/[0.08] relative select-none">
      {/* Top Header & New Chat Button */}
      <div className="p-3.5 space-y-3 border-b border-white/[0.08] bg-white/[0.01]">
        <button
          onClick={handleNewChat}
          className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-electric-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-glow-blue flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>

        {/* Search Conversations Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation Thread List with Categorized Dates */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
        {isLoadingConversations ? (
          <div className="space-y-2 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 rounded-xl glass-badge animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-10 px-4 space-y-2">
            <div className="w-10 h-10 rounded-2xl glass-icon-box flex items-center justify-center mx-auto text-slate-400">
              <Bot className="w-5 h-5 text-sky-400" />
            </div>
            <p className="text-xs text-slate-300 font-medium">No conversations yet</p>
            <p className="text-[11px] text-slate-500">Ask a question to start your grounded RAG session.</p>
          </div>
        ) : (
          <>
            {groupedConversations.today.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-sky-400" /> Today
                </span>
                {groupedConversations.today.map(renderConvItem)}
              </div>
            )}

            {groupedConversations.yesterday.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-indigo-400" /> Yesterday
                </span>
                {groupedConversations.yesterday.map(renderConvItem)}
              </div>
            )}

            {groupedConversations.lastWeek.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-purple-400" /> Previous 7 Days
                </span>
                {groupedConversations.lastWeek.map(renderConvItem)}
              </div>
            )}

            {groupedConversations.older.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" /> Older
                </span>
                {groupedConversations.older.map(renderConvItem)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info Pill */}
      <div className="p-3 border-t border-white/[0.08] bg-white/[0.01]">
        <div className="px-3 py-2 rounded-xl glass-badge flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            pgvector Ready
          </span>
          <span className="font-mono">{conversations.length} threads</span>
        </div>
      </div>

      {/* Desktop Drag Handle for Resizing */}
      <div
        onMouseDown={handleStartResize}
        className={`hidden md:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-sky-500/50 transition-colors z-20 ${
          isResizing ? 'bg-sky-500 w-1.5' : ''
        }`}
        title="Drag to resize sidebar"
      />
    </div>
  );

  return (
    <>
      {/* Desktop Resizable Sidebar */}
      <aside
        ref={sidebarRef}
        style={{ width: `${sidebarWidth}px` }}
        className="hidden md:block shrink-0 relative transition-[width] duration-75 ease-linear h-[calc(100dvh-4rem)]"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-[85%] max-w-xs h-full z-10 animate-slide-in-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
