import React, { useState, useEffect, useRef } from 'react';
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
const MAX_SIDEBAR_WIDTH = 480;
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

  // Handle Drag-to-Resize with Min and Max Width Clamping (desktop only)
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
      const newConv = await createNewConversation();
      if (onCloseMobile) onCloseMobile();
      navigate(`/chat/${newConv.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (id) => {
    if (editingId === id) return;
    selectConversation(id);
    if (onCloseMobile) onCloseMobile();
    navigate(`/chat/${id}`);
  };

  const handleStartRename = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title || 'Untitled Conversation');
  };

  const handleSaveRename = async (e, id) => {
    if (e) e.stopPropagation();
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await renameConversation(id, editTitle.trim());
      setEditingId(null);
    } catch (err) {
      alert('Failed to rename conversation.');
    }
  };

  const handleCancelRename = (e) => {
    if (e) e.stopPropagation();
    setEditingId(null);
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      handleSaveRename(e, id);
    } else if (e.key === 'Escape') {
      handleCancelRename(e);
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(id);
      if (params.id === id) {
        navigate('/chat');
      }
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarContent = (
    <>
      {/* Draggable Resize Handle on Right Border (Desktop Only) */}
      {!isCollapsed && (
        <div
          onMouseDown={handleStartResize}
          title="Drag to resize sidebar width"
          className="hidden md:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:w-2 hover:bg-sky-500/50 active:bg-sky-400 transition-all z-40 group select-none"
        >
          <div className={`w-full h-full ${isResizing ? 'bg-sky-400 shadow-glow-blue' : 'group-hover:bg-sky-500/60'}`} />
        </div>
      )}

      {/* Sidebar Header: New Chat & Toggle */}
      <div className="p-3 border-b border-white/[0.08] flex items-center justify-between gap-2 bg-white/[0.02]">
        <button
          onClick={handleNewChat}
          className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-electric-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-glow-blue transition-all active:scale-95"
        >
          <MessageSquarePlus className="w-4 h-4 shrink-0" />
          <span>New Conversation</span>
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggle}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.1] transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            title="Close sidebar"
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-white/[0.06]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search chat history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 transition-all"
          />
        </div>
      </div>

      {/* Conversation Thread List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
        {isLoadingConversations ? (
          <div className="p-4 space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-11 glass-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          !isCollapsed && (
            <div className="text-center py-10 px-4 text-xs text-slate-400">
              <div className="w-10 h-10 rounded-2xl glass-icon-box flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-5 h-5 text-slate-500" />
              </div>
              <p className="font-medium text-slate-300">No conversations yet.</p>
              <p className="mt-1 text-[11px] text-slate-500">Ask any question to start a grounded RAG session.</p>
            </div>
          )
        ) : (
          filteredConversations.map((conv) => {
            const isActive = currentConversationId === conv.id || params.id === conv.id;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 shadow-glow-blue'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, conv.id)}
                      className="flex-1 glass-input rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={(e) => handleSaveRename(e, conv.id)}
                      title="Save title (Enter)"
                      className="p-1 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      title="Cancel (Esc)"
                      className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-sky-500/20 text-sky-400' : 'bg-white/[0.04] text-slate-500 group-hover:text-slate-300'} transition-colors`}>
                        <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      </div>
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{conv.title || 'Untitled Conversation'}</span>
                      )}
                    </div>

                    {(!isCollapsed || isMobileOpen) && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleStartRename(e, conv)}
                          title="Rename chat"
                          className="p-1 text-slate-400 hover:text-sky-400 hover:bg-white/[0.08] rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, conv.id)}
                          title="Delete chat"
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      {(!isCollapsed || isMobileOpen) && (
        <div className="p-3 border-t border-white/[0.08] bg-[#05070a]/60 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Grounded RAG Store</span>
          </span>
          <span className="glass-badge px-2 py-0.5 rounded-full text-[10px] font-mono">{conversations.length} threads</span>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside
        ref={sidebarRef}
        style={{
          width: isCollapsed ? '4rem' : `${sidebarWidth}px`,
          minWidth: isCollapsed ? '4rem' : `${MIN_SIDEBAR_WIDTH}px`,
          maxWidth: isCollapsed ? '4rem' : `${MAX_SIDEBAR_WIDTH}px`,
        }}
        className={`hidden md:flex relative border-r border-white/[0.08] glass-panel bg-[#05070a]/70 flex-col z-30 shrink-0 ${
          isResizing ? '' : 'transition-[width] duration-200'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile Slide-Over Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#05070a]/80 backdrop-blur-md animate-fade-in"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs h-full bg-[#090d16] border-r border-white/[0.1] shadow-2xl flex flex-col z-10 animate-slide-in-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

