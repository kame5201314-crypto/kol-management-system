-- =====================================================
-- KOL 管理系統 - Supabase Row Level Security 設定
-- =====================================================
-- 執行此 SQL 檔案以設定資料庫安全政策
-- 在 Supabase Dashboard > SQL Editor 中執行
-- =====================================================

-- 1. 啟用 Row Level Security (RLS)
-- =====================================================

ALTER TABLE kols ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_sharing ENABLE ROW LEVEL SECURITY;

-- 2. KOL 表格安全政策
-- =====================================================

-- 允許認證使用者讀取所有 KOL 資料
CREATE POLICY "允許認證使用者讀取 KOL 資料"
ON kols FOR SELECT
TO authenticated
USING (true);

-- 允許認證使用者新增 KOL
CREATE POLICY "允許認證使用者新增 KOL"
ON kols FOR INSERT
TO authenticated
WITH CHECK (true);

-- 允許認證使用者更新 KOL
CREATE POLICY "允許認證使用者更新 KOL"
ON kols FOR UPDATE
TO authenticated
USING (true);

-- 允許認證使用者刪除 KOL
CREATE POLICY "允許認證使用者刪除 KOL"
ON kols FOR DELETE
TO authenticated
USING (true);

-- 3. 合作專案表格安全政策
-- =====================================================

-- 允許認證使用者讀取所有合作專案
CREATE POLICY "允許認證使用者讀取合作專案"
ON collaborations FOR SELECT
TO authenticated
USING (true);

-- 允許認證使用者新增合作專案
CREATE POLICY "允許認證使用者新增合作專案"
ON collaborations FOR INSERT
TO authenticated
WITH CHECK (true);

-- 允許認證使用者更新合作專案
CREATE POLICY "允許認證使用者更新合作專案"
ON collaborations FOR UPDATE
TO authenticated
USING (true);

-- 允許認證使用者刪除合作專案
CREATE POLICY "允許認證使用者刪除合作專案"
ON collaborations FOR DELETE
TO authenticated
USING (true);

-- 4. 分潤記錄表格安全政策
-- =====================================================

-- 允許認證使用者讀取所有分潤記錄
CREATE POLICY "允許認證使用者讀取分潤記錄"
ON profit_sharing FOR SELECT
TO authenticated
USING (true);

-- 允許認證使用者新增分潤記錄
CREATE POLICY "允許認證使用者新增分潤記錄"
ON profit_sharing FOR INSERT
TO authenticated
WITH CHECK (true);

-- 允許認證使用者更新分潤記錄
CREATE POLICY "允許認證使用者更新分潤記錄"
ON profit_sharing FOR UPDATE
TO authenticated
USING (true);

-- 允許認證使用者刪除分潤記錄
CREATE POLICY "允許認證使用者刪除分潤記錄"
ON profit_sharing FOR DELETE
TO authenticated
USING (true);

-- 5. 建立使用者角色表格（選用）
-- =====================================================

-- 建立角色表格
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 啟用 RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 允許使用者查看自己的角色
CREATE POLICY "使用者可查看自己的角色"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 只有 admin 可以管理角色
CREATE POLICY "只有 admin 可以管理角色"
ON user_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 6. 建立稽核日誌表格（選用）
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 只允許 admin 查看日誌
CREATE POLICY "只有 admin 可以查看稽核日誌"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 7. 建立觸發器記錄資料變更（選用）
-- =====================================================

-- 建立觸發器函數
CREATE OR REPLACE FUNCTION log_kol_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    user_email,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  )
  VALUES (
    auth.uid(),
    auth.email(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 套用觸發器至 KOL 表格
DROP TRIGGER IF EXISTS kol_audit_trigger ON kols;
CREATE TRIGGER kol_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON kols
FOR EACH ROW EXECUTE FUNCTION log_kol_changes();

-- 套用觸發器至合作專案表格
DROP TRIGGER IF EXISTS collaboration_audit_trigger ON collaborations;
CREATE TRIGGER collaboration_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON collaborations
FOR EACH ROW EXECUTE FUNCTION log_kol_changes();

-- 套用觸發器至分潤記錄表格
DROP TRIGGER IF EXISTS profit_sharing_audit_trigger ON profit_sharing;
CREATE TRIGGER profit_sharing_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON profit_sharing
FOR EACH ROW EXECUTE FUNCTION log_kol_changes();

-- 8. 建立輔助函數
-- =====================================================

-- 檢查使用者是否為 admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 檢查使用者角色
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM user_roles
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 建立更新時間戳記觸發器
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 套用至 user_roles
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 設定完成！
-- =====================================================
-- 下一步:
-- 1. 在 Supabase Dashboard > Authentication 啟用 Email provider
-- 2. 建立第一個 admin 使用者
-- 3. 在 user_roles 表格中新增 admin 角色
-- 4. 測試登入與權限控制
-- =====================================================

-- 範例: 新增 admin 使用者角色（請替換為實際的 user_id）
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('your-user-id-here', 'admin');
