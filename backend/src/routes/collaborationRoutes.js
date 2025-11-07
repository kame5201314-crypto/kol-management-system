import express from 'express';
import CollaborationController from '../controllers/collaborationController.js';
import { authenticateToken, requireUser } from '../middleware/auth.js';

const router = express.Router();

// 所有合作路由需要認證
router.use(authenticateToken);
router.use(requireUser);

// 獲取統計數據
router.get('/statistics', CollaborationController.getStatistics);

// 搜尋合作專案
router.get('/search', CollaborationController.search);

// 根據狀態獲取合作專案
router.get('/status/:status', CollaborationController.getByStatus);

// 根據 KOL ID 獲取合作專案
router.get('/kol/:kolId', CollaborationController.getByKolId);

// 獲取所有合作專案
router.get('/', CollaborationController.getAll);

// 根據 ID 獲取單一合作專案
router.get('/:id', CollaborationController.getById);

// 建立新合作專案
router.post('/', CollaborationController.create);

// 更新合作專案
router.put('/:id', CollaborationController.update);

// 刪除合作專案
router.delete('/:id', CollaborationController.delete);

export default router;
