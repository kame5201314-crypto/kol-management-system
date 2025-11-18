-- =====================================================
-- KOL 管理系統 - 簡化版 RLS 設定
-- =====================================================
-- 只針對現有表格啟用 Row Level Security
-- =====================================================

-- 1. 檢查並啟用現有表格的 RLS
-- =====================================================

-- 啟用 kols 表格的 RLS（如果存在）
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'kols') THEN
    ALTER TABLE kols ENABLE ROW LEVEL SECURITY;

    -- 刪除舊政策（如果存在）
    DROP POLICY IF EXISTS "允許認證使用者讀取 KOL 資料" ON kols;
    DROP POLICY IF EXISTS "允許認證使用者新增 KOL" ON kols;
    DROP POLICY IF EXISTS "允許認證使用者更新 KOL" ON kols;
    DROP POLICY IF EXISTS "允許認證使用者刪除 KOL" ON kols;

    -- 建立新政策
    CREATE POLICY "允許認證使用者讀取 KOL 資料"
    ON kols FOR SELECT
    TO authenticated
    USING (true);

    CREATE POLICY "允許認證使用者新增 KOL"
    ON kols FOR INSERT
    TO authenticated
    WITH CHECK (true);

    CREATE POLICY "允許認證使用者更新 KOL"
    ON kols FOR UPDATE
    TO authenticated
    USING (true);

    CREATE POLICY "允許認證使用者刪除 KOL"
    ON kols FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;

-- 啟用 collaborations 表格的 RLS（如果存在）
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'collaborations') THEN
    ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "允許認證使用者讀取合作專案" ON collaborations;
    DROP POLICY IF EXISTS "允許認證使用者新增合作專案" ON collaborations;
    DROP POLICY IF EXISTS "允許認證使用者更新合作專案" ON collaborations;
    DROP POLICY IF EXISTS "允許認證使用者刪除合作專案" ON collaborations;

    CREATE POLICY "允許認證使用者讀取合作專案"
    ON collaborations FOR SELECT
    TO authenticated
    USING (true);

    CREATE POLICY "允許認證使用者新增合作專案"
    ON collaborations FOR INSERT
    TO authenticated
    WITH CHECK (true);

    CREATE POLICY "允許認證使用者更新合作專案"
    ON collaborations FOR UPDATE
    TO authenticated
    USING (true);

    CREATE POLICY "允許認證使用者刪除合作專案"
    ON collaborations FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;

-- 啟用 profit_shares 表格的 RLS（如果存在）
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'profit_shares') THEN
    ALTER TABLE profit_shares ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "允許認證使用者讀取分潤記錄" ON profit_shares;
    DROP POLICY IF EXISTS "允許認證使用者新增分潤記錄" ON profit_shares;
    DROP POLICY IF EXISTS "允許認證使用者更新分潤記錄" ON profit_shares;
    DROP POLICY IF EXISTS "允許認證使用者刪除分潤記錄" ON profit_shares;

    CREATE POLICY "允許認證使用者讀取分潤記錄"
    ON profit_shares FOR SELECT
    TO authenticated
    USING (true);

    CREATE POLICY "允許認證使用者新增分潤記錄"
    ON profit_shares FOR INSERT
    TO authenticated
    WITH CHECK (true);

    CREATE POLICY "允許認證使用者更新分潤記錄"
    ON profit_shares FOR UPDATE
    TO authenticated
    USING (true);

    CREATE POLICY "允許認證使用者刪除分潤記錄"
    ON profit_shares FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;

-- 啟用 social_platforms 表格的 RLS（如果存在）
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'social_platforms') THEN
    ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "允許認證使用者讀取社群平台" ON social_platforms;
    DROP POLICY IF EXISTS "允許認證使用者新增社群平台" ON social_platforms;
    DROP POLICY IF EXISTS "允許認證使用者更新社群平台" ON social_platforms;
    DROP POLICY IF EXISTS "允許認證使用者刪除社群平台" ON social_platforms;

    CREATE POLICY "允許認證使用者讀取社群平台"
    ON social_platforms FOR SELECT
    TO authenticated
    USING (true);

    CREATE POLICY "允許認證使用者新增社群平台"
    ON social_platforms FOR INSERT
    TO authenticated
    WITH CHECK (true);

    CREATE POLICY "允許認證使用者更新社群平台"
    ON social_platforms FOR UPDATE
    TO authenticated
    USING (true);

    CREATE POLICY "允許認證使用者刪除社群平台"
    ON social_platforms FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;

-- =====================================================
-- 設定完成！
-- =====================================================
-- 此 SQL 會自動檢測哪些表格存在，並只對存在的表格啟用 RLS
-- =====================================================
