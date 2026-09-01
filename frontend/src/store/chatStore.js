import { create } from 'zustand';
import { chatApi } from '../services/api.js';

export const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversationId: null,
  currentConversation: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingQuery: false,
  selectedSource: null,
  isSourceDrawerOpen: false,
  categoryFilter: null,
  lastAutoRenamedId: null,
  suggestedQuestions: [
    { text: "What is the minimum attendance required to appear for examinations?", category: "Academics" },
    { text: "What is the refund policy if I cancel my B.Tech admission?", category: "Admissions" },
    { text: "What are the hostel curfew timings on weekdays and weekends?", category: "Hostel" },
    { text: "What are the eligibility criteria and fees for M.Tech programs?", category: "Admissions" },
    { text: "When do the spring semester end-term practical and theory exams start?", category: "Academics" },
  ],

  // Load all user conversations
  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const res = await chatApi.listConversations();
      set({
        conversations: res.data.conversations,
        isLoadingConversations: false,
      });
      return res.data.conversations;
    } catch (err) {
      console.error('[ChatStore] Error loading conversations:', err);
      set({ isLoadingConversations: false });
      return [];
    }
  },

  // Select active conversation and load messages
  selectConversation: async (id) => {
    if (!id) {
      set({ currentConversationId: null, currentConversation: null, messages: [] });
      return;
    }

    set({ currentConversationId: id, isLoadingMessages: true });
    try {
      const res = await chatApi.getConversation(id);
      set({
        currentConversation: res.data.conversation,
        messages: res.data.messages,
        isLoadingMessages: false,
      });
    } catch (err) {
      console.error('[ChatStore] Error loading conversation messages:', err);
      set({ isLoadingMessages: false });
    }
  },

  // Switch to a new blank draft session without creating a conversation in DB yet
  startNewChatDraft: () => {
    set({
      currentConversationId: null,
      currentConversation: null,
      messages: [],
    });
  },

  // Initialize a new blank conversation (called only when query is sent or explicitly requested)
  createNewConversation: async (title = 'New Query') => {
    try {
      const res = await chatApi.createConversation(title);
      const newConv = res.data.conversation;
      set((state) => ({
        conversations: [newConv, ...state.conversations],
        currentConversationId: newConv.id,
        currentConversation: newConv,
        messages: [],
      }));
      return newConv;
    } catch (err) {
      console.error('[ChatStore] Error creating conversation:', err);
      return null;
    }
  },

  // Send a message and handle AI retrieval response
  sendQuery: async (queryText, category = null) => {
    if (!queryText || !queryText.trim()) return;

    const finalCategory = category !== undefined && category !== null ? category : get().categoryFilter;
    const cleanCategory = finalCategory === 'All' ? null : finalCategory;

    let convId = get().currentConversationId;

    // Only create the conversation in DB and add to sidebar when the user sends a query
    if (!convId) {
      const initialTitle = queryText.slice(0, 40) || 'New Query';
      const newConv = await get().createNewConversation(initialTitle);
      if (!newConv) return;
      convId = newConv.id;
    }

    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: convId,
      sender: 'user',
      content: queryText,
      created_at: new Date().toISOString(),
    };

    // Optimistically update UI
    set((state) => ({
      messages: [...state.messages, tempUserMessage],
      isSendingQuery: true,
    }));

    try {
      const res = await chatApi.sendQuery(convId, {
        query: queryText,
        categoryFilter: cleanCategory,
      });

      const { assistantMessage, conversationTitle } = res.data;
      const prevTitle = get().currentConversation?.title;
      const isAutoRenamed =
        Boolean(conversationTitle) &&
        (!prevTitle || prevTitle === 'New Query' || prevTitle !== conversationTitle);

      // Replace optimistic message and append assistant response
      set((state) => ({
        messages: [
          ...state.messages.filter((m) => m.id !== tempUserMessage.id),
          res.data.userMessage,
          assistantMessage,
        ],
        currentConversation:
          conversationTitle && state.currentConversation
            ? { ...state.currentConversation, title: conversationTitle }
            : state.currentConversation,
        conversations:
          conversationTitle
            ? state.conversations.map((c) =>
                c.id === convId ? { ...c, title: conversationTitle } : c
              )
            : state.conversations,
        lastAutoRenamedId: isAutoRenamed ? convId : state.lastAutoRenamedId,
        isSendingQuery: false,
      }));

      if (isAutoRenamed) {
        setTimeout(() => {
          set((state) => ({
            lastAutoRenamedId: state.lastAutoRenamedId === convId ? null : state.lastAutoRenamedId,
          }));
        }, 2800);
      }

      // Refresh conversations list to update titles/timestamps
      get().fetchConversations();
    } catch (err) {
      console.error('[ChatStore] Error sending query:', err);
      const errorAssistantMsg = {
        id: `err-${Date.now()}`,
        conversation_id: convId,
        sender: 'assistant',
        content: 'I encountered an error while processing your request. Please ensure the backend server is running and try again.',
        sources: [],
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, errorAssistantMsg],
        isSendingQuery: false,
      }));
    }
  },

  // Alias for sendQuery
  sendMessage: async (queryText, category = null) => {
    return get().sendQuery(queryText, category);
  },

  // Delete a conversation
  deleteConversation: async (id) => {
    try {
      await chatApi.deleteConversation(id);
      set((state) => {
        const remaining = state.conversations.filter((c) => c.id !== id);
        const isCurrent = state.currentConversationId === id;
        return {
          conversations: remaining,
          currentConversationId: isCurrent ? (remaining[0]?.id || null) : state.currentConversationId,
          currentConversation: isCurrent ? (remaining[0] || null) : state.currentConversation,
          messages: isCurrent ? [] : state.messages,
        };
      });
      if (get().currentConversationId) {
        get().selectConversation(get().currentConversationId);
      }
    } catch (err) {
      console.error('[ChatStore] Error deleting conversation:', err);
      throw err;
    }
  },

  // Rename a conversation
  renameConversation: async (id, title) => {
    try {
      const res = await chatApi.renameConversation(id, title);
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, title: res.data.conversation.title } : c
        ),
        currentConversation:
          state.currentConversationId === id
            ? { ...state.currentConversation, title: res.data.conversation.title }
            : state.currentConversation,
      }));
      return res.data.conversation;
    } catch (err) {
      console.error('[ChatStore] Error renaming conversation:', err);
      throw err;
    }
  },

  // Set selected citation for sliding drawer
  openSourceDrawer: (source) => {
    set({ selectedSource: source, isSourceDrawerOpen: true });
  },

  closeSourceDrawer: () => {
    set({ selectedSource: null, isSourceDrawerOpen: false });
  },

  setCategoryFilter: (category) => {
    set({ categoryFilter: category });
  },

  // Synchronize conversation threads and active conversation when backend reconnects
  syncOnServerOnline: async () => {
    try {
      const token = localStorage.getItem('campuswise_token');
      if (!token) return;
      await get().fetchConversations();
      const activeId = get().currentConversationId;
      if (activeId) {
        await get().selectConversation(activeId);
      }
    } catch (err) {
      console.warn('[ChatStore] Sync on reconnect failed:', err);
    }
  },
}));

// Automatically sync conversations when backend server comes back online
if (typeof window !== 'undefined') {
  window.addEventListener('campuswise:server-online', () => {
    useChatStore.getState().syncOnServerOnline?.();
  });
}

