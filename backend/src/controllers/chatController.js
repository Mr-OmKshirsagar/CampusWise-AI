import { ChatService } from '../services/chatService.js';
import { RagService } from '../services/ragService.js';
import { ConversationModel, MessageModel } from '../models/index.js';

export class ChatController {
  /**
   * POST /api/chat/conversations
   */
  static async createConversation(req, res, next) {
    try {
      const { title } = req.body;
      const conv = await ChatService.createConversation(req.user.id, title);
      return res.status(201).json({
        success: true,
        data: {
          conversation: conv,
        },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to create conversation.',
      });
    }
  }

  /**
   * GET /api/chat/conversations
   */
  static async listConversations(req, res, next) {
    try {
      const conversations = await ChatService.getUserConversations(req.user.id);
      return res.status(200).json({
        success: true,
        data: {
          conversations,
        },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch conversations.',
      });
    }
  }

  /**
   * GET /api/chat/conversations/:id
   */
  static async getConversation(req, res, next) {
    try {
      const data = await ChatService.getConversationMessages(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'Failed to load conversation history.',
      });
    }
  }

  /**
   * POST /api/chat/conversations/:id/query
   */
  static async query(req, res, next) {
    try {
      const conversationId = req.params.id;
      const userId = req.user.id;
      const { query, categoryFilter, stream } = req.body;

      const wantsStream = stream === true || req.headers.accept === 'text/event-stream';

      if (wantsStream) {
        // SSE Streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation || conversation.user_id !== userId) {
          res.write(`event: error\ndata: ${JSON.stringify({ error: 'Unauthorized or not found' })}\n\n`);
          return res.end();
        }

        const existingMessages = await MessageModel.findByConversationId(conversationId);

        // Save user message
        const userMessage = await MessageModel.create({
          conversationId,
          sender: 'user',
          content: query.trim(),
          sources: [],
        });

        // Send user message event
        res.write(`event: user_message\ndata: ${JSON.stringify(userMessage)}\n\n`);

        let fullAnswer = '';
        let finalSources = [];

        const streamGen = RagService.streamRagQuery({
          query,
          history: existingMessages,
          categoryFilter,
        });

        for await (const chunk of streamGen) {
          if (chunk.event === 'token') {
            fullAnswer += chunk.data.token;
          } else if (chunk.event === 'done') {
            finalSources = chunk.data.sources;
          }
          res.write(`event: ${chunk.event}\ndata: ${JSON.stringify(chunk.data)}\n\n`);
        }

        // Save assistant message in DB
        const assistantMessage = await MessageModel.create({
          conversationId,
          sender: 'assistant',
          content: fullAnswer,
          sources: finalSources,
        });

        // Update title with intelligent rephrasing if needed
        if (conversation.title === 'New Conversation' || existingMessages.length === 0) {
          const smartTitle = await RagService.generateSmartConversationTitle(query);
          await ConversationModel.updateTitle(conversationId, smartTitle);
        } else {
          await ConversationModel.touch(conversationId);
        }

        res.write(`event: complete\ndata: ${JSON.stringify({ assistantMessage })}\n\n`);
        return res.end();
      }

      // Standard JSON response
      const result = await ChatService.executeQuery({
        conversationId,
        userId,
        query,
        categoryFilter,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'Failed to process chat query.',
      });
    }
  }

  /**
   * PATCH /api/chat/conversations/:id
   */
  static async updateConversation(req, res, next) {
    try {
      const { title } = req.body;
      const updated = await ChatService.updateConversation(req.params.id, req.user.id, { title });
      return res.status(200).json({
        success: true,
        message: 'Conversation renamed successfully.',
        data: {
          conversation: updated,
        },
      });
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'Failed to rename conversation.',
      });
    }
  }

  /**
   * DELETE /api/chat/conversations/:id
   */
  static async deleteConversation(req, res, next) {
    try {
      const deleted = await ChatService.deleteConversation(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Conversation and message history deleted.',
        data: {
          conversation: deleted,
        },
      });
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'Failed to delete conversation.',
      });
    }
  }
}
