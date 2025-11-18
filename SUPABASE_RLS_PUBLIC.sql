-- =====================================================
-- KOL 管理系統 - 公開存取 RLS 設定
-- =====================================================
-- 因為系統已有前端登入保護，所以允許所有請求存取資料庫
-- 這樣就不需要 Supabase 帳號登入
-- =====================================================

-- 1. 刪除現有的認證政策
-- =====================================================

-- kols 表格
DROP POLICY IF EXISTS "允許認證使用者讀取 KOL 資料" ON kols;
DROP POLICY IF EXISTS "允許認證使用者新增 KOL" ON kols;
DROP POLICY IF EXISTS "允許認證使用者更新 KOL" ON kols;
DROP POLICY IF EXISTS "允許認證使用者刪除 KOL" ON kols;

-- collaborations 表格
DROP POLICY IF EXISTS "允許認證使用者讀取合作專案" ON collaborations;
DROP POLICY IF EXISTS "允許認證使用者新增合作專案" ON collaborations;
DROP POLICY IF EXISTS "允許認證使用者更新合作專案" ON collaborations;
DROP POLICY IF EXISTS "允許認證使用者刪除合作專案" ON collaborations;

-- profit_shares 表格
DROP POLICY IF EXISTS "允許認證使用者讀取分潤記錄" ON profit_shares;
DROP POLICY IF EXISTS "允許認證使用者新增分潤記錄" ON profit_shares;
DROP POLICY IF EXISTS "允許認證使用者更新分潤記錄" ON profit_shares;
DROP POLICY IF EXISTS "允許認證使用者刪除分潤記錄" ON profit_shares;

-- social_platforms 表格
DROP POLICY IF EXISTS "允許認證使用者讀取社群平台" ON social_platforms;
DROP POLICY IF EXISTS "允許認證使用者新增社群平台" ON social_platforms;
DROP POLICY IF EXISTS "允許認證使用者更新社群平台" ON social_platforms;
DROP POLICY IF EXISTS "允許認證使用者刪除社群平台" ON social_platforms;

-- 2. 建立新的公開存取政策
-- =====================================================

-- kols 表格 - 允許所有人存取
CREATE POLICY "公開讀取 KOL 資料"
ON kols FOR SELECT
USING (true);

CREATE POLICY "公開新增 KOL"
ON kols FOR INSERT
WITH CHECK (true);

CREATE POLICY "公開更新 KOL"
ON kols FOR UPDATE
USING (true);

CREATE POLICY "公開刪除 KOL"
ON kols FOR DELETE
USING (true);

-- collaborations 表格 - 允許所有人存取
CREATE POLICY "公開讀取合作專案"
ON collaborations FOR SELECT
USING (true);

CREATE POLICY "公開新增合作專案"
ON collaborations FOR INSERT
WITH CHECK (true);

CREATE POLICY "公開更新合作專案"
ON collaborations FOR UPDATE
USING (true);

CREATE POLICY "公開刪除合作專案"
ON collaborations FOR DELETE
USING (true);

-- profit_shares 表格 - 允許所有人存取
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'profit_shares') THEN
    EXECUTE 'CREATE POLICY "公開讀取分潤記錄" ON profit_shares FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "公開新增分潤記錄" ON profit_shares FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "公開更新分潤記錄" ON profit_shares FOR UPDATE USING (true)';
    EXECUTE 'CREATE POLICY "公開刪除分潤記錄" ON profit_shares FOR DELETE USING (true)';
  END IF;
END $$;

-- social_platforms 表格 - 允許所有人存取
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'social_platforms') THEN
    EXECUTE 'CREATE POLICY "公開讀取社群平台" ON social_platforms FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "公開新增社群平台" ON social_platforms FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "公開更新社群平台" ON social_platforms FOR UPDATE USING (true)';
    EXECUTE 'CREATE POLICY "公開刪除社群平台" ON social_platforms FOR DELETE USING (true)';
  END IF;
END $$;

-- =====================================================
-- 設定完成！
-- =====================================================
-- 現在資料庫允許所有請求存取
-- 安全性由前端登入系統（admin/密碼）保護
-- =====================================================
