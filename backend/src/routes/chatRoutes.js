import { Router } from 'express';
import { ChatController } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { chatQueryValidator, createConversationValidator } from '../middleware/validatorMiddleware.js';

const router = Router();

// Protect all chat endpoints with JWT auth
router.use(authMiddleware);

// Chat session endpoints
router.post('/conversations', createConversationValidator, ChatController.createConversation);
router.get('/conversations', ChatController.listConversations);
router.get('/conversations/:id', ChatController.getConversation);
router.patch('/conversations/:id', ChatController.updateConversation);
router.post('/conversations/:id/query', chatQueryValidator, ChatController.query);
router.delete('/conversations/:id', ChatController.deleteConversation);

export default router;
