import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../middleware/validatorMiddleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/register', registerValidator, AuthController.register);
router.post('/login', loginValidator, AuthController.login);

// Protected routes
router.get('/me', authMiddleware, AuthController.getMe);

export default router;
