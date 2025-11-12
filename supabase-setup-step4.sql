-- Step 4: 啟用 Row Level Security
ALTER TABLE kols ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;

-- KOLs 表的 RLS 政策
DROP POLICY IF EXISTS "所有登入用戶可以查看 KOL" ON kols;
CREATE POLICY "所有登入用戶可以查看 KOL" ON kols FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以新增 KOL" ON kols;
CREATE POLICY "所有登入用戶可以新增 KOL" ON kols FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以更新 KOL" ON kols;
CREATE POLICY "所有登入用戶可以更新 KOL" ON kols FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以刪除 KOL" ON kols;
CREATE POLICY "所有登入用戶可以刪除 KOL" ON kols FOR DELETE USING (auth.role() = 'authenticated');

-- Social Platforms 表的 RLS 政策
DROP POLICY IF EXISTS "所有登入用戶可以查看社群平台" ON social_platforms;
CREATE POLICY "所有登入用戶可以查看社群平台" ON social_platforms FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以新增社群平台" ON social_platforms;
CREATE POLICY "所有登入用戶可以新增社群平台" ON social_platforms FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以更新社群平台" ON social_platforms;
CREATE POLICY "所有登入用戶可以更新社群平台" ON social_platforms FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以刪除社群平台" ON social_platforms;
CREATE POLICY "所有登入用戶可以刪除社群平台" ON social_platforms FOR DELETE USING (auth.role() = 'authenticated');

-- Profit Shares 表的 RLS 政策
DROP POLICY IF EXISTS "所有登入用戶可以查看分潤記錄" ON profit_shares;
CREATE POLICY "所有登入用戶可以查看分潤記錄" ON profit_shares FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以新增分潤記錄" ON profit_shares;
CREATE POLICY "所有登入用戶可以新增分潤記錄" ON profit_shares FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以更新分潤記錄" ON profit_shares;
CREATE POLICY "所有登入用戶可以更新分潤記錄" ON profit_shares FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以刪除分潤記錄" ON profit_shares;
CREATE POLICY "所有登入用戶可以刪除分潤記錄" ON profit_shares FOR DELETE USING (auth.role() = 'authenticated');

-- Collaborations 表的 RLS 政策
DROP POLICY IF EXISTS "所有登入用戶可以查看合作專案" ON collaborations;
CREATE POLICY "所有登入用戶可以查看合作專案" ON collaborations FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以新增合作專案" ON collaborations;
CREATE POLICY "所有登入用戶可以新增合作專案" ON collaborations FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以更新合作專案" ON collaborations;
CREATE POLICY "所有登入用戶可以更新合作專案" ON collaborations FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以刪除合作專案" ON collaborations;
CREATE POLICY "所有登入用戶可以刪除合作專案" ON collaborations FOR DELETE USING (auth.role() = 'authenticated');

-- Sales Tracking 表的 RLS 政策
DROP POLICY IF EXISTS "所有登入用戶可以查看銷售追蹤" ON sales_tracking;
CREATE POLICY "所有登入用戶可以查看銷售追蹤" ON sales_tracking FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以新增銷售追蹤" ON sales_tracking;
CREATE POLICY "所有登入用戶可以新增銷售追蹤" ON sales_tracking FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以更新銷售追蹤" ON sales_tracking;
CREATE POLICY "所有登入用戶可以更新銷售追蹤" ON sales_tracking FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以刪除銷售追蹤" ON sales_tracking;
CREATE POLICY "所有登入用戶可以刪除銷售追蹤" ON sales_tracking FOR DELETE USING (auth.role() = 'authenticated');

-- Content Performance 表的 RLS 政策
DROP POLICY IF EXISTS "所有登入用戶可以查看內容成效" ON content_performance;
CREATE POLICY "所有登入用戶可以查看內容成效" ON content_performance FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以新增內容成效" ON content_performance;
CREATE POLICY "所有登入用戶可以新增內容成效" ON content_performance FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以更新內容成效" ON content_performance;
CREATE POLICY "所有登入用戶可以更新內容成效" ON content_performance FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "所有登入用戶可以刪除內容成效" ON content_performance;
CREATE POLICY "所有登入用戶可以刪除內容成效" ON content_performance FOR DELETE USING (auth.role() = 'authenticated');
