import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar.jsx';
import ChatContainer from '../../components/Chat/ChatContainer.jsx';
import { useChatStore } from '../../store/chatStore.js';

export default function ChatPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { selectConversation } = useChatStore();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      selectConversation(id);
    }
  }, [id, selectConversation]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* Conversation Thread Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Chat Workspace */}
      <ChatContainer />
    </div>
  );
}
