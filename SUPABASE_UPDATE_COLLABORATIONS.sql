-- =====================================================
-- 更新 collaborations 表格 - 新增缺少的欄位
-- =====================================================
-- 新增 contract_status 和 collaboration_process 欄位
-- =====================================================

-- 1. 新增 contract_status 欄位
ALTER TABLE collaborations
ADD COLUMN IF NOT EXISTS contract_status VARCHAR(20)
CHECK (contract_status IN ('none', 'draft', 'pending_signature', 'signed', 'expired'))
DEFAULT 'none';

-- 2. 新增 collaboration_process 欄位（使用 JSONB 儲存結構化資料）
ALTER TABLE collaborations
ADD COLUMN IF NOT EXISTS collaboration_process JSONB DEFAULT '{}'::jsonb;

-- 3. 為現有資料設定預設值
UPDATE collaborations
SET contract_status = 'none'
WHERE contract_status IS NULL;

UPDATE collaborations
SET collaboration_process = '{}'::jsonb
WHERE collaboration_process IS NULL;

-- =====================================================
-- 設定完成！
-- =====================================================
-- 現在 collaborations 表格包含：
-- - contract_status: 合約狀態
-- - collaboration_process: 合作流程資訊（JSON格式）
-- =====================================================
