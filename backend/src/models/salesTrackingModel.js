import pool from '../config/database.js';

class SalesTrackingModel {
  // 獲取所有銷售追蹤
  static async getAll() {
    const query = `
      SELECT
        st.*,
        json_build_object(
          'id', k.id,
          'name', k.name,
          'nickname', k.nickname
        ) as kol_info,
        json_build_object(
          'id', c.id,
          'project_name', c.project_name,
          'brand_name', c.brand_name
        ) as collaboration_info
      FROM sales_tracking st
      LEFT JOIN kols k ON st.kol_id = k.id
      LEFT JOIN collaborations c ON st.collaboration_id = c.id
      ORDER BY st.created_at DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // 根據 ID 獲取單一銷售追蹤
  static async getById(id) {
    const query = `
      SELECT
        st.*,
        json_build_object(
          'id', k.id,
          'name', k.name,
          'nickname', k.nickname
        ) as kol_info,
        json_build_object(
          'id', c.id,
          'project_name', c.project_name,
          'brand_name', c.brand_name
        ) as collaboration_info
      FROM sales_tracking st
      LEFT JOIN kols k ON st.kol_id = k.id
      LEFT JOIN collaborations c ON st.collaboration_id = c.id
      WHERE st.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 根據 KOL ID 獲取銷售追蹤
  static async getByKolId(kolId) {
    const query = `
      SELECT
        st.*,
        json_build_object(
          'id', c.id,
          'project_name', c.project_name,
          'brand_name', c.brand_name
        ) as collaboration_info
      FROM sales_tracking st
      LEFT JOIN collaborations c ON st.collaboration_id = c.id
      WHERE st.kol_id = $1
      ORDER BY st.created_at DESC
    `;

    const result = await pool.query(query, [kolId]);
    return result.rows;
  }

  // 根據合作專案 ID 獲取銷售追蹤
  static async getByCollaborationId(collaborationId) {
    const query = `
      SELECT * FROM sales_tracking
      WHERE collaboration_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [collaborationId]);
    return result.rows;
  }

  // 建立新銷售追蹤
  static async create(salesData) {
    const query = `
      INSERT INTO sales_tracking
      (kol_id, collaboration_id, discount_code, affiliate_link, clicks, conversions, revenue, commission_rate, commission_amount, tracking_start_date, tracking_end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      salesData.kolId,
      salesData.collaborationId,
      salesData.discountCode,
      salesData.affiliateLink,
      salesData.clicks || 0,
      salesData.conversions || 0,
      salesData.revenue || 0,
      salesData.commissionRate,
      salesData.commissionAmount || 0,
      salesData.trackingStartDate,
      salesData.trackingEndDate
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 更新銷售追蹤
  static async update(id, salesData) {
    const query = `
      UPDATE sales_tracking
      SET kol_id = $1, collaboration_id = $2, discount_code = $3, affiliate_link = $4,
          clicks = $5, conversions = $6, revenue = $7, commission_rate = $8,
          commission_amount = $9, tracking_start_date = $10, tracking_end_date = $11
      WHERE id = $12
      RETURNING *
    `;

    const values = [
      salesData.kolId,
      salesData.collaborationId,
      salesData.discountCode,
      salesData.affiliateLink,
      salesData.clicks,
      salesData.conversions,
      salesData.revenue,
      salesData.commissionRate,
      salesData.commissionAmount,
      salesData.trackingStartDate,
      salesData.trackingEndDate,
      id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 刪除銷售追蹤
  static async delete(id) {
    const result = await pool.query('DELETE FROM sales_tracking WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // 獲取銷售統計數據
  static async getStatistics() {
    const query = `
      SELECT
        COUNT(*) as total_tracking_records,
        COALESCE(SUM(clicks), 0) as total_clicks,
        COALESCE(SUM(conversions), 0) as total_conversions,
        COALESCE(SUM(revenue), 0) as total_revenue,
        COALESCE(SUM(commission_amount), 0) as total_commission,
        CASE
          WHEN SUM(clicks) > 0 THEN (SUM(conversions)::FLOAT / SUM(clicks) * 100)
          ELSE 0
        END as conversion_rate
      FROM sales_tracking
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }

  // 獲取 KOL 銷售排名
  static async getTopKOLsBySales(limit = 10) {
    const query = `
      SELECT
        k.id,
        k.name,
        k.nickname,
        COUNT(st.id) as total_campaigns,
        COALESCE(SUM(st.clicks), 0) as total_clicks,
        COALESCE(SUM(st.conversions), 0) as total_conversions,
        COALESCE(SUM(st.revenue), 0) as total_revenue,
        COALESCE(SUM(st.commission_amount), 0) as total_commission
      FROM kols k
      LEFT JOIN sales_tracking st ON k.id = st.kol_id
      GROUP BY k.id, k.name, k.nickname
      ORDER BY total_revenue DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

export default SalesTrackingModel;
