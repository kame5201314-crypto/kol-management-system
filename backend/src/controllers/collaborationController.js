import CollaborationModel from '../models/collaborationModel.js';

class CollaborationController {
  // 獲取所有合作專案
  static async getAll(req, res) {
    try {
      const collaborations = await CollaborationModel.getAll();
      res.json({
        success: true,
        data: collaborations,
        count: collaborations.length
      });
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      res.status(500).json({
        success: false,
        message: '獲取合作專案列表失敗',
        error: error.message
      });
    }
  }

  // 根據 ID 獲取單一合作專案
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const collaboration = await CollaborationModel.getById(id);

      if (!collaboration) {
        return res.status(404).json({
          success: false,
          message: '找不到該合作專案'
        });
      }

      res.json({
        success: true,
        data: collaboration
      });
    } catch (error) {
      console.error('Error fetching collaboration:', error);
      res.status(500).json({
        success: false,
        message: '獲取合作專案資料失敗',
        error: error.message
      });
    }
  }

  // 根據 KOL ID 獲取合作專案
  static async getByKolId(req, res) {
    try {
      const { kolId } = req.params;
      const collaborations = await CollaborationModel.getByKolId(kolId);

      res.json({
        success: true,
        data: collaborations,
        count: collaborations.length
      });
    } catch (error) {
      console.error('Error fetching collaborations by KOL:', error);
      res.status(500).json({
        success: false,
        message: '獲取 KOL 合作專案失敗',
        error: error.message
      });
    }
  }

  // 建立新合作專案
  static async create(req, res) {
    try {
      const collaborationData = req.body;
      const newCollaboration = await CollaborationModel.create(collaborationData);

      res.status(201).json({
        success: true,
        message: '合作專案建立成功',
        data: newCollaboration
      });
    } catch (error) {
      console.error('Error creating collaboration:', error);
      res.status(500).json({
        success: false,
        message: '建立合作專案失敗',
        error: error.message
      });
    }
  }

  // 更新合作專案
  static async update(req, res) {
    try {
      const { id } = req.params;
      const collaborationData = req.body;

      const updatedCollaboration = await CollaborationModel.update(id, collaborationData);

      if (!updatedCollaboration) {
        return res.status(404).json({
          success: false,
          message: '找不到該合作專案'
        });
      }

      res.json({
        success: true,
        message: '合作專案更新成功',
        data: updatedCollaboration
      });
    } catch (error) {
      console.error('Error updating collaboration:', error);
      res.status(500).json({
        success: false,
        message: '更新合作專案失敗',
        error: error.message
      });
    }
  }

  // 刪除合作專案
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedCollaboration = await CollaborationModel.delete(id);

      if (!deletedCollaboration) {
        return res.status(404).json({
          success: false,
          message: '找不到該合作專案'
        });
      }

      res.json({
        success: true,
        message: '合作專案刪除成功',
        data: deletedCollaboration
      });
    } catch (error) {
      console.error('Error deleting collaboration:', error);
      res.status(500).json({
        success: false,
        message: '刪除合作專案失敗',
        error: error.message
      });
    }
  }

  // 搜尋合作專案
  static async search(req, res) {
    try {
      const searchParams = {
        keyword: req.query.keyword,
        status: req.query.status,
        kolId: req.query.kolId
      };

      const collaborations = await CollaborationModel.search(searchParams);

      res.json({
        success: true,
        data: collaborations,
        count: collaborations.length
      });
    } catch (error) {
      console.error('Error searching collaborations:', error);
      res.status(500).json({
        success: false,
        message: '搜尋合作專案失敗',
        error: error.message
      });
    }
  }

  // 獲取統計數據
  static async getStatistics(req, res) {
    try {
      const stats = await CollaborationModel.getStatistics();

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

  // 根據狀態獲取合作專案
  static async getByStatus(req, res) {
    try {
      const { status } = req.params;
      const collaborations = await CollaborationModel.getByStatus(status);

      res.json({
        success: true,
        data: collaborations,
        count: collaborations.length
      });
    } catch (error) {
      console.error('Error fetching collaborations by status:', error);
      res.status(500).json({
        success: false,
        message: '獲取合作專案失敗',
        error: error.message
      });
    }
  }
}

export default CollaborationController;
