import express from 'express';
import AuthController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 公開路由（不需要認證）
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// 需要認證的路由
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;
