import SalesTrackingModel from '../models/salesTrackingModel.js';

class SalesTrackingController {
  // 獲取所有銷售追蹤
  static async getAll(req, res) {
    try {
      const salesTracking = await SalesTrackingModel.getAll();
      res.json({
        success: true,
        data: salesTracking,
        count: salesTracking.length
      });
    } catch (error) {
      console.error('Error fetching sales tracking:', error);
      res.status(500).json({
        success: false,
        message: '獲取銷售追蹤列表失敗',
        error: error.message
      });
    }
  }

  // 根據 ID 獲取單一銷售追蹤
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const salesTracking = await SalesTrackingModel.getById(id);

      if (!salesTracking) {
        return res.status(404).json({
          success: false,
          message: '找不到該銷售追蹤記錄'
        });
      }

      res.json({
        success: true,
        data: salesTracking
      });
    } catch (error) {
      console.error('Error fetching sales tracking:', error);
      res.status(500).json({
        success: false,
        message: '獲取銷售追蹤資料失敗',
        error: error.message
      });
    }
  }

  // 根據 KOL ID 獲取銷售追蹤
  static async getByKolId(req, res) {
    try {
      const { kolId } = req.params;
      const salesTracking = await SalesTrackingModel.getByKolId(kolId);

      res.json({
        success: true,
        data: salesTracking,
        count: salesTracking.length
      });
    } catch (error) {
      console.error('Error fetching sales tracking by KOL:', error);
      res.status(500).json({
        success: false,
        message: '獲取 KOL 銷售追蹤失敗',
        error: error.message
      });
    }
  }

  // 根據合作專案 ID 獲取銷售追蹤
  static async getByCollaborationId(req, res) {
    try {
      const { collaborationId } = req.params;
      const salesTracking = await SalesTrackingModel.getByCollaborationId(collaborationId);

      res.json({
        success: true,
        data: salesTracking,
        count: salesTracking.length
      });
    } catch (error) {
      console.error('Error fetching sales tracking by collaboration:', error);
      res.status(500).json({
        success: false,
        message: '獲取合作專案銷售追蹤失敗',
        error: error.message
      });
    }
  }

  // 建立新銷售追蹤
  static async create(req, res) {
    try {
      const salesData = req.body;
      const newSalesTracking = await SalesTrackingModel.create(salesData);

      res.status(201).json({
        success: true,
        message: '銷售追蹤建立成功',
        data: newSalesTracking
      });
    } catch (error) {
      console.error('Error creating sales tracking:', error);
      res.status(500).json({
        success: false,
        message: '建立銷售追蹤失敗',
        error: error.message
      });
    }
  }

  // 更新銷售追蹤
  static async update(req, res) {
    try {
      const { id } = req.params;
      const salesData = req.body;

      const updatedSalesTracking = await SalesTrackingModel.update(id, salesData);

      if (!updatedSalesTracking) {
        return res.status(404).json({
          success: false,
          message: '找不到該銷售追蹤記錄'
        });
      }

      res.json({
        success: true,
        message: '銷售追蹤更新成功',
        data: updatedSalesTracking
      });
    } catch (error) {
      console.error('Error updating sales tracking:', error);
      res.status(500).json({
        success: false,
        message: '更新銷售追蹤失敗',
        error: error.message
      });
    }
  }

  // 刪除銷售追蹤
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedSalesTracking = await SalesTrackingModel.delete(id);

      if (!deletedSalesTracking) {
        return res.status(404).json({
          success: false,
          message: '找不到該銷售追蹤記錄'
        });
      }

      res.json({
        success: true,
        message: '銷售追蹤刪除成功',
        data: deletedSalesTracking
      });
    } catch (error) {
      console.error('Error deleting sales tracking:', error);
      res.status(500).json({
        success: false,
        message: '刪除銷售追蹤失敗',
        error: error.message
      });
    }
  }

  // 獲取統計數據
  static async getStatistics(req, res) {
    try {
      const stats = await SalesTrackingModel.getStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        message: '獲取統計數據失敗',
        error: error.message
      });
    }
  }

  // 獲取銷售排名
  static async getTopKOLs(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const topKOLs = await SalesTrackingModel.getTopKOLsBySales(limit);

      res.json({
        success: true,
        data: topKOLs,
        count: topKOLs.length
      });
    } catch (error) {
      console.error('Error fetching top KOLs:', error);
      res.status(500).json({
        success: false,
        message: '獲取銷售排名失敗',
        error: error.message
      });
    }
  }
}

export default SalesTrackingController;
