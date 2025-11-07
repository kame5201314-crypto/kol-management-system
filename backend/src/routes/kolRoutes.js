import express from 'express';
import KOLController from '../controllers/kolController.js';
import { authenticateToken, requireUser } from '../middleware/auth.js';

const router = express.Router();

// 所有 KOL 路由需要認證
router.use(authenticateToken);
router.use(requireUser);

// 獲取統計數據
router.get('/statistics', KOLController.getStatistics);

// 搜尋 KOL
router.get('/search', KOLController.search);

// 獲取所有 KOL
router.get('/', KOLController.getAll);

// 根據 ID 獲取單一 KOL
router.get('/:id', KOLController.getById);

// 建立新 KOL
router.post('/', KOLController.create);

// 更新 KOL
router.put('/:id', KOLController.update);

// 刪除 KOL
router.delete('/:id', KOLController.delete);

export default router;
