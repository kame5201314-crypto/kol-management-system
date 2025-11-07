import pool from '../config/database.js';

class CollaborationModel {
  // 獲取所有合作專案
  static async getAll() {
    const query = `
      SELECT
        c.*,
        json_build_object(
          'id', k.id,
          'name', k.name,
          'nickname', k.nickname
        ) as kol_info
      FROM collaborations c
      LEFT JOIN kols k ON c.kol_id = k.id
      ORDER BY c.created_at DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // 根據 ID 獲取單一合作專案
  static async getById(id) {
    const query = `
      SELECT
        c.*,
        json_build_object(
          'id', k.id,
          'name', k.name,
          'nickname', k.nickname,
          'email', k.email,
          'phone', k.phone
        ) as kol_info
      FROM collaborations c
      LEFT JOIN kols k ON c.kol_id = k.id
      WHERE c.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 根據 KOL ID 獲取合作專案
  static async getByKolId(kolId) {
    const query = `
      SELECT * FROM collaborations
      WHERE kol_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [kolId]);
    return result.rows;
  }

  // 建立新合作專案
  static async create(collaborationData) {
    const query = `
      INSERT INTO collaborations
      (kol_id, project_name, brand_name, status, start_date, end_date, budget, actual_cost, deliverables, platforms, contract_url, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      collaborationData.kolId,
      collaborationData.projectName,
      collaborationData.brandName,
      collaborationData.status || 'pending',
      collaborationData.startDate,
      collaborationData.endDate,
      collaborationData.budget,
      collaborationData.actualCost,
      collaborationData.deliverables,
      collaborationData.platforms,
      collaborationData.contractUrl,
      collaborationData.notes
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 更新合作專案
  static async update(id, collaborationData) {
    const query = `
      UPDATE collaborations
      SET kol_id = $1, project_name = $2, brand_name = $3, status = $4,
          start_date = $5, end_date = $6, budget = $7, actual_cost = $8,
          deliverables = $9, platforms = $10, contract_url = $11, notes = $12
      WHERE id = $13
      RETURNING *
    `;

    const values = [
      collaborationData.kolId,
      collaborationData.projectName,
      collaborationData.brandName,
      collaborationData.status,
      collaborationData.startDate,
      collaborationData.endDate,
      collaborationData.budget,
      collaborationData.actualCost,
      collaborationData.deliverables,
      collaborationData.platforms,
      collaborationData.contractUrl,
      collaborationData.notes,
      id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 刪除合作專案
  static async delete(id) {
    const result = await pool.query('DELETE FROM collaborations WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // 根據狀態篩選
  static async getByStatus(status) {
    const query = `
      SELECT
        c.*,
        json_build_object(
          'id', k.id,
          'name', k.name,
          'nickname', k.nickname
        ) as kol_info
      FROM collaborations c
      LEFT JOIN kols k ON c.kol_id = k.id
      WHERE c.status = $1
      ORDER BY c.created_at DESC
    `;

    const result = await pool.query(query, [status]);
    return result.rows;
  }

  // 獲取合作統計數據
  static async getStatistics() {
    const query = `
      SELECT
        COUNT(*) as total_collaborations,
        COUNT(*) FILTER (WHERE status = 'in_progress') as active_collaborations,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_collaborations,
        COALESCE(SUM(budget), 0) as total_budget,
        COALESCE(SUM(actual_cost), 0) as total_actual_cost
      FROM collaborations
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }

  // 搜尋合作專案
  static async search(searchParams) {
    let query = `
      SELECT
        c.*,
        json_build_object(
          'id', k.id,
          'name', k.name,
          'nickname', k.nickname
        ) as kol_info
      FROM collaborations c
      LEFT JOIN kols k ON c.kol_id = k.id
      WHERE 1=1
    `;

    const values = [];
    let valueIndex = 1;

    if (searchParams.keyword) {
      query += ` AND (c.project_name ILIKE $${valueIndex} OR c.brand_name ILIKE $${valueIndex})`;
      values.push(`%${searchParams.keyword}%`);
      valueIndex++;
    }

    if (searchParams.status) {
      query += ` AND c.status = $${valueIndex}`;
      values.push(searchParams.status);
      valueIndex++;
    }

    if (searchParams.kolId) {
      query += ` AND c.kol_id = $${valueIndex}`;
      values.push(searchParams.kolId);
      valueIndex++;
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }
}

export default CollaborationModel;
