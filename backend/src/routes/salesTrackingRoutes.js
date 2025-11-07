import express from 'express';
import SalesTrackingController from '../controllers/salesTrackingController.js';
import { authenticateToken, requireUser } from '../middleware/auth.js';

const router = express.Router();

// 所有銷售追蹤路由需要認證
router.use(authenticateToken);
router.use(requireUser);

// 獲取統計數據
router.get('/statistics', SalesTrackingController.getStatistics);

// 獲取銷售排名
router.get('/top-kols', SalesTrackingController.getTopKOLs);

// 根據 KOL ID 獲取銷售追蹤
router.get('/kol/:kolId', SalesTrackingController.getByKolId);

// 根據合作專案 ID 獲取銷售追蹤
router.get('/collaboration/:collaborationId', SalesTrackingController.getByCollaborationId);

// 獲取所有銷售追蹤
router.get('/', SalesTrackingController.getAll);

// 根據 ID 獲取單一銷售追蹤
router.get('/:id', SalesTrackingController.getById);

// 建立新銷售追蹤
router.post('/', SalesTrackingController.create);

// 更新銷售追蹤
router.put('/:id', SalesTrackingController.update);

// 刪除銷售追蹤
router.delete('/:id', SalesTrackingController.delete);

export default router;
