import { ConversationModel, MessageModel } from '../models/index.js';
import { RagService } from './ragService.js';

export class ChatService {
  /**
   * Creates a new conversation thread
   */
  static async createConversation(userId, title = 'New Conversation') {
    return ConversationModel.create({
      userId,
      title: title.trim() || 'New Conversation',
    });
  }

  /**
   * Retrieves all conversations belonging to a user
   */
  static async getUserConversations(userId) {
    return ConversationModel.findByUserId(userId);
  }

  /**
   * Retrieves message history for a specific conversation
   */
  static async getConversationMessages(conversationId, userId) {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      const error = new Error('Conversation not found.');
      error.statusCode = 404;
      throw error;
    }

    if (conversation.user_id !== userId) {
      const error = new Error('Unauthorized access to this conversation.');
      error.statusCode = 403;
      throw error;
    }

    const messages = await MessageModel.findByConversationId(conversationId);

    return {
      conversation,
      messages,
    };
  }

  /**
   * Deletes a conversation and its messages
   */
  static async deleteConversation(conversationId, userId) {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      const error = new Error('Conversation not found.');
      error.statusCode = 404;
      throw error;
    }

    if (conversation.user_id !== userId) {
      const error = new Error('Unauthorized to delete this conversation.');
      error.statusCode = 403;
      throw error;
    }

    return ConversationModel.deleteById(conversationId);
  }

  /**
   * Updates and renames a conversation title
   */
  static async updateConversation(conversationId, userId, { title }) {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      const error = new Error('Conversation not found.');
      error.statusCode = 404;
      throw error;
    }

    if (conversation.user_id !== userId) {
      const error = new Error('Unauthorized to update this conversation.');
      error.statusCode = 403;
      throw error;
    }

    const cleanTitle = (title || '').trim() || 'Untitled Chat';
    return ConversationModel.updateTitle(conversationId, cleanTitle);
  }

  /**
   * Executes a RAG query, records messages, and returns grounded answer
   */
  static async executeQuery({ conversationId, userId, query, categoryFilter = null }) {
    // 1. Verify conversation ownership
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      const error = new Error('Conversation not found.');
      error.statusCode = 404;
      throw error;
    }

    if (conversation.user_id !== userId) {
      const error = new Error('Unauthorized access to this conversation.');
      error.statusCode = 403;
      throw error;
    }

    // 2. Fetch existing message history for multi-turn context
    const existingMessages = await MessageModel.findByConversationId(conversationId);

    // 3. Save student's user message
    const userMessage = await MessageModel.create({
      conversationId,
      sender: 'user',
      content: query.trim(),
      sources: [],
    });

    // 4. If conversation title is default or first message, generate an intelligent rephrased title
    let updatedTitle = conversation.title;
    if (conversation.title === 'New Conversation' || existingMessages.length === 0) {
      updatedTitle = await RagService.generateSmartConversationTitle(query);
      await ConversationModel.updateTitle(conversationId, updatedTitle);
    } else {
      await ConversationModel.touch(conversationId);
    }

    // 5. Execute RAG retrieval and synthesis
    const ragResult = await RagService.queryRag({
      query: query.trim(),
      history: existingMessages,
      categoryFilter,
    });

    // 6. Save assistant's grounded response
    const assistantMessage = await MessageModel.create({
      conversationId,
      sender: 'assistant',
      content: ragResult.answer,
      sources: ragResult.sources,
    });

    return {
      userMessage,
      assistantMessage,
      sources: ragResult.sources,
      isGrounded: ragResult.isGrounded,
      conversationTitle: updatedTitle,
    };
  }
}
