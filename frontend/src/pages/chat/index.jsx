import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar.jsx';
import ChatContainer from '../../components/Chat/ChatContainer.jsx';
import { useChatStore } from '../../store/chatStore.js';

export default function ChatPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { selectConversation } = useChatStore();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      selectConversation(id);
    }
  }, [id, selectConversation]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 relative">
      {/* Conversation Thread Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Chat Workspace */}
      <ChatContainer onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
    </div>
  );
}
