import pool from '../config/database.js';

class KOLModel {
  // 獲取所有 KOL (含社群平台資料)
  static async getAll() {
    const query = `
      SELECT
        k.*,
        json_agg(
          json_build_object(
            'platform', sp.platform,
            'url', sp.url,
            'followers', sp.followers,
            'engagementRate', sp.engagement_rate,
            'averageViews', sp.average_views
          ) ORDER BY sp.platform
        ) FILTER (WHERE sp.id IS NOT NULL) as social_platforms
      FROM kols k
      LEFT JOIN social_platforms sp ON k.id = sp.kol_id
      GROUP BY k.id
      ORDER BY k.created_at DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // 根據 ID 獲取單一 KOL
  static async getById(id) {
    const query = `
      SELECT
        k.*,
        json_agg(
          json_build_object(
            'platform', sp.platform,
            'url', sp.url,
            'followers', sp.followers,
            'engagementRate', sp.engagement_rate,
            'averageViews', sp.average_views
          ) ORDER BY sp.platform
        ) FILTER (WHERE sp.id IS NOT NULL) as social_platforms
      FROM kols k
      LEFT JOIN social_platforms sp ON k.id = sp.kol_id
      WHERE k.id = $1
      GROUP BY k.id
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 建立新 KOL
  static async create(kolData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 插入 KOL 基本資料
      const kolQuery = `
        INSERT INTO kols (name, nickname, email, phone, region, categories, tags, languages, rating, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const kolValues = [
        kolData.name,
        kolData.nickname,
        kolData.email,
        kolData.phone,
        kolData.region,
        kolData.categories,
        kolData.tags,
        kolData.languages,
        kolData.rating,
        kolData.notes
      ];

      const kolResult = await client.query(kolQuery, kolValues);
      const newKOL = kolResult.rows[0];

      // 插入社群平台資料
      if (kolData.socialPlatforms && kolData.socialPlatforms.length > 0) {
        for (const platform of kolData.socialPlatforms) {
          await client.query(
            `INSERT INTO social_platforms (kol_id, platform, url, followers, engagement_rate, average_views)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [newKOL.id, platform.platform, platform.url, platform.followers, platform.engagementRate, platform.averageViews]
          );
        }
      }

      await client.query('COMMIT');

      // 回傳完整資料
      return await this.getById(newKOL.id);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 更新 KOL
  static async update(id, kolData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 更新 KOL 基本資料
      const updateQuery = `
        UPDATE kols
        SET name = $1, nickname = $2, email = $3, phone = $4, region = $5,
            categories = $6, tags = $7, languages = $8, rating = $9, notes = $10
        WHERE id = $11
        RETURNING *
      `;

      const updateValues = [
        kolData.name,
        kolData.nickname,
        kolData.email,
        kolData.phone,
        kolData.region,
        kolData.categories,
        kolData.tags,
        kolData.languages,
        kolData.rating,
        kolData.notes,
        id
      ];

      await client.query(updateQuery, updateValues);

      // 刪除舊的社群平台資料
      await client.query('DELETE FROM social_platforms WHERE kol_id = $1', [id]);

      // 插入新的社群平台資料
      if (kolData.socialPlatforms && kolData.socialPlatforms.length > 0) {
        for (const platform of kolData.socialPlatforms) {
          await client.query(
            `INSERT INTO social_platforms (kol_id, platform, url, followers, engagement_rate, average_views)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, platform.platform, platform.url, platform.followers, platform.engagementRate, platform.averageViews]
          );
        }
      }

      await client.query('COMMIT');

      return await this.getById(id);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 刪除 KOL
  static async delete(id) {
    const result = await pool.query('DELETE FROM kols WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // 搜尋 KOL
  static async search(searchParams) {
    let query = `
      SELECT
        k.*,
        json_agg(
          json_build_object(
            'platform', sp.platform,
            'url', sp.url,
            'followers', sp.followers,
            'engagementRate', sp.engagement_rate,
            'averageViews', sp.average_views
          ) ORDER BY sp.platform
        ) FILTER (WHERE sp.id IS NOT NULL) as social_platforms
      FROM kols k
      LEFT JOIN social_platforms sp ON k.id = sp.kol_id
      WHERE 1=1
    `;

    const values = [];
    let valueIndex = 1;

    // 關鍵字搜尋
    if (searchParams.keyword) {
      query += ` AND (k.name ILIKE $${valueIndex} OR k.nickname ILIKE $${valueIndex} OR $${valueIndex} = ANY(k.tags))`;
      values.push(`%${searchParams.keyword}%`);
      valueIndex++;
    }

    // 類別篩選
    if (searchParams.category) {
      query += ` AND $${valueIndex} = ANY(k.categories)`;
      values.push(searchParams.category);
      valueIndex++;
    }

    // 地區篩選
    if (searchParams.region) {
      query += ` AND k.region = $${valueIndex}`;
      values.push(searchParams.region);
      valueIndex++;
    }

    query += ' GROUP BY k.id ORDER BY k.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // 獲取統計數據
  static async getStatistics() {
    const query = `
      SELECT
        COUNT(k.id) as total_kols,
        COALESCE(SUM(sp.followers), 0) as total_followers,
        COALESCE(AVG(sp.engagement_rate), 0) as avg_engagement_rate,
        COALESCE(AVG(k.rating), 0) as avg_rating
      FROM kols k
      LEFT JOIN social_platforms sp ON k.id = sp.kol_id
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }
}

export default KOLModel;
