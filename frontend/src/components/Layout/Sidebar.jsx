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
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';

const MIN_SIDEBAR_WIDTH = 260; // Minimum fixed width in expanded mode
const MAX_SIDEBAR_WIDTH = 480; // Maximum allowed length/width in expanded mode
const DEFAULT_SIDEBAR_WIDTH = 300;

export default function Sidebar({ isCollapsed, onToggle }) {
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

  // Handle Drag-to-Resize with Min and Max Width Clamping
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
      navigate(`/chat/${newConv.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (id) => {
    if (editingId === id) return;
    selectConversation(id);
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

  return (
    <aside
      ref={sidebarRef}
      style={{
        width: isCollapsed ? '4rem' : `${sidebarWidth}px`,
        minWidth: isCollapsed ? '4rem' : `${MIN_SIDEBAR_WIDTH}px`,
        maxWidth: isCollapsed ? '4rem' : `${MAX_SIDEBAR_WIDTH}px`,
      }}
      className={`relative border-r border-slate-800/80 bg-slate-950/70 flex flex-col z-30 shrink-0 ${
        isResizing ? '' : 'transition-[width] duration-200'
      }`}
    >
      {/* Draggable Resize Handle on Right Border */}
      {!isCollapsed && (
        <div
          onMouseDown={handleStartResize}
          title="Drag to resize sidebar width (Min: 260px, Max: 480px)"
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:w-2 hover:bg-sky-500/50 active:bg-sky-400 transition-all z-40 group select-none"
        >
          <div className={`w-full h-full ${isResizing ? 'bg-sky-400' : 'group-hover:bg-sky-500/60'}`} />
        </div>
      )}
      {/* Sidebar Header: New Chat & Toggle */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-2">
        {!isCollapsed ? (
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-campus-600 hover:from-sky-500 hover:to-campus-500 text-white font-medium text-xs shadow-md shadow-sky-600/20 transition-all"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        ) : (
          <button
            onClick={handleNewChat}
            title="New Chat"
            className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-all"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={onToggle}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Search Bar (When Expanded) */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Conversation Thread List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoadingConversations ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-900/60 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          !isCollapsed && (
            <div className="text-center py-8 px-4 text-xs text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
              <p>No conversations yet.</p>
              <p className="mt-1 text-[11px]">Start a new chat to ask about college policies.</p>
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
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
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
                      className="flex-1 bg-slate-900 border border-sky-500 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={(e) => handleSaveRename(e, conv.id)}
                      title="Save title (Enter)"
                      className="p-1 rounded bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      title="Cancel (Esc)"
                      className="p-1 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                      {!isCollapsed && (
                        <span className="truncate">{conv.title || 'Untitled Conversation'}</span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleStartRename(e, conv)}
                          title="Rename chat"
                          className="p-1 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, conv.id)}
                          title="Delete chat"
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
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
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Grounded RAG Store
          </span>
          <span>{conversations.length} threads</span>
        </div>
      )}
    </aside>
  );
}
