-- Step 3: 建立索引
CREATE INDEX IF NOT EXISTS idx_kols_user_id ON kols(user_id);
CREATE INDEX IF NOT EXISTS idx_kols_rating ON kols(rating);
CREATE INDEX IF NOT EXISTS idx_social_platforms_kol_id ON social_platforms(kol_id);
CREATE INDEX IF NOT EXISTS idx_profit_shares_kol_id ON profit_shares(kol_id);
CREATE INDEX IF NOT EXISTS idx_profit_shares_period_end ON profit_shares(period_end);
CREATE INDEX IF NOT EXISTS idx_collaborations_kol_id ON collaborations(kol_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_user_id ON collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON collaborations(status);
CREATE INDEX IF NOT EXISTS idx_sales_tracking_collaboration_id ON sales_tracking(collaboration_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_collaboration_id ON content_performance(collaboration_id);
