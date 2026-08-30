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

  // Create new conversation
  createNewConversation: async (title = 'New Conversation') => {
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
      throw err;
    }
  },

  // Send message and get grounded RAG response
  sendMessage: async (queryText) => {
    let convId = get().currentConversationId;
    const category = get().categoryFilter;

    // If no active conversation, create one automatically
    if (!convId) {
      const cleanTitle = queryText.slice(0, 35) + (queryText.length > 35 ? '...' : '');
      const newConv = await get().createNewConversation(cleanTitle);
      convId = newConv.id;
    }

    // Optimistically add student's message
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: convId,
      sender: 'user',
      content: queryText,
      sources: [],
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, tempUserMessage],
      isSendingQuery: true,
    }));

    try {
      const res = await chatApi.sendQuery(convId, {
        query: queryText,
        categoryFilter: category,
      });

      const { assistantMessage, conversationTitle } = res.data;

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
        isSendingQuery: false,
      }));

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

  // Rename conversation
  renameConversation: async (id, newTitle) => {
    try {
      const res = await chatApi.renameConversation(id, newTitle);
      const updated = res.data.conversation;
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, title: updated.title } : c
        ),
        currentConversation:
          state.currentConversationId === id
            ? { ...state.currentConversation, title: updated.title }
            : state.currentConversation,
      }));
      return updated;
    } catch (err) {
      console.error('[ChatStore] Error renaming conversation:', err);
      throw err;
    }
  },

  // Delete conversation
  deleteConversation: async (id) => {
    try {
      await chatApi.deleteConversation(id);
      set((state) => {
        const remaining = state.conversations.filter((c) => c.id !== id);
        const isCurrent = state.currentConversationId === id;
        return {
          conversations: remaining,
          currentConversationId: isCurrent ? null : state.currentConversationId,
          currentConversation: isCurrent ? null : state.currentConversation,
          messages: isCurrent ? [] : state.messages,
        };
      });
    } catch (err) {
      console.error('[ChatStore] Error deleting conversation:', err);
    }
  },

  // Citation Drawer Controls
  openSourceDrawer: (source) => {
    set({ selectedSource: source, isSourceDrawerOpen: true });
  },

  closeSourceDrawer: () => {
    set({ isSourceDrawerOpen: false, selectedSource: null });
  },

  // Category Filter
  setCategoryFilter: (category) => {
    set({ categoryFilter: category });
  },
}));
