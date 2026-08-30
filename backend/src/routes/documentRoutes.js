import { Router } from 'express';
import { DocumentController } from '../controllers/documentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { handleUpload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Apply auth and admin check to all admin document routes
router.use(authMiddleware, adminMiddleware);

// Admin Document routes
router.get('/documents', DocumentController.listAll);
router.post('/documents/upload', handleUpload, DocumentController.upload);
router.get('/documents/:id', DocumentController.getById);
router.delete('/documents/:id', DocumentController.delete);
router.get('/stats', DocumentController.getStats);

export default router;
