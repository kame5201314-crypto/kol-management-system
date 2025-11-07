import KOLModel from '../models/kolModel.js';

class KOLController {
  // 獲取所有 KOL
  static async getAll(req, res) {
    try {
      const kols = await KOLModel.getAll();
      res.json({
        success: true,
        data: kols,
        count: kols.length
      });
    } catch (error) {
      console.error('Error fetching KOLs:', error);
      res.status(500).json({
        success: false,
        message: '獲取 KOL 列表失敗',
        error: error.message
      });
    }
  }

  // 根據 ID 獲取單一 KOL
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const kol = await KOLModel.getById(id);

      if (!kol) {
        return res.status(404).json({
          success: false,
          message: '找不到該 KOL'
        });
      }

      res.json({
        success: true,
        data: kol
      });
    } catch (error) {
      console.error('Error fetching KOL:', error);
      res.status(500).json({
        success: false,
        message: '獲取 KOL 資料失敗',
        error: error.message
      });
    }
  }

  // 建立新 KOL
  static async create(req, res) {
    try {
      const kolData = req.body;
      const newKOL = await KOLModel.create(kolData);

      res.status(201).json({
        success: true,
        message: 'KOL 建立成功',
        data: newKOL
      });
    } catch (error) {
      console.error('Error creating KOL:', error);
      res.status(500).json({
        success: false,
        message: '建立 KOL 失敗',
        error: error.message
      });
    }
  }

  // 更新 KOL
  static async update(req, res) {
    try {
      const { id } = req.params;
      const kolData = req.body;

      const updatedKOL = await KOLModel.update(id, kolData);

      if (!updatedKOL) {
        return res.status(404).json({
          success: false,
          message: '找不到該 KOL'
        });
      }

      res.json({
        success: true,
        message: 'KOL 更新成功',
        data: updatedKOL
      });
    } catch (error) {
      console.error('Error updating KOL:', error);
      res.status(500).json({
        success: false,
        message: '更新 KOL 失敗',
        error: error.message
      });
    }
  }

  // 刪除 KOL
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedKOL = await KOLModel.delete(id);

      if (!deletedKOL) {
        return res.status(404).json({
          success: false,
          message: '找不到該 KOL'
        });
      }

      res.json({
        success: true,
        message: 'KOL 刪除成功',
        data: deletedKOL
      });
    } catch (error) {
      console.error('Error deleting KOL:', error);
      res.status(500).json({
        success: false,
        message: '刪除 KOL 失敗',
        error: error.message
      });
    }
  }

  // 搜尋 KOL
  static async search(req, res) {
    try {
      const searchParams = {
        keyword: req.query.keyword,
        category: req.query.category,
        region: req.query.region
      };

      const kols = await KOLModel.search(searchParams);

      res.json({
        success: true,
        data: kols,
        count: kols.length
      });
    } catch (error) {
      console.error('Error searching KOLs:', error);
      res.status(500).json({
        success: false,
        message: '搜尋 KOL 失敗',
        error: error.message
      });
    }
  }

  // 獲取統計數據
  static async getStatistics(req, res) {
    try {
      const stats = await KOLModel.getStatistics();

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
}

export default KOLController;
