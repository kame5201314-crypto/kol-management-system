-- KOL 管理系統資料庫結構

-- 啟用 UUID 擴充功能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 建立 KOL 主表
CREATE TABLE kols (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  nickname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  facebook_url TEXT,
  line_url TEXT,
  category TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  rating VARCHAR(1) CHECK (rating IN ('S', 'A', 'B', 'C', 'D')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 建立社群平台資料表
CREATE TABLE social_platforms (
  id SERIAL PRIMARY KEY,
  kol_id INTEGER REFERENCES kols(id) ON DELETE CASCADE,
  platform VARCHAR(50) CHECK (platform IN ('youtube', 'facebook', 'instagram', 'tiktok', 'twitter')),
  handle VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 建立分潤記錄表
CREATE TABLE profit_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kol_id INTEGER REFERENCES kols(id) ON DELETE CASCADE,
  settlement_date DATE NOT NULL,
  period VARCHAR(20) CHECK (period IN ('monthly', 'quarterly', 'semi-annual', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  month VARCHAR(7),
  sales_amount DECIMAL(15, 2) DEFAULT 0,
  profit_share_rate DECIMAL(5, 2) DEFAULT 0,
  profit_amount DECIMAL(15, 2) DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 建立合作專案表
CREATE TABLE collaborations (
  id SERIAL PRIMARY KEY,
  kol_id INTEGER REFERENCES kols(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(100),
  status VARCHAR(20) CHECK (status IN ('pending', 'negotiating', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(15, 2) DEFAULT 0,
  actual_cost DECIMAL(15, 2) DEFAULT 0,
  deliverables TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  contract_url TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 建立銷售追蹤表
CREATE TABLE sales_tracking (
  id SERIAL PRIMARY KEY,
  collaboration_id INTEGER REFERENCES collaborations(id) ON DELETE CASCADE,
  kol_id INTEGER REFERENCES kols(id) ON DELETE CASCADE,
  discount_code VARCHAR(100),
  affiliate_link TEXT,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(15, 2) DEFAULT 0,
  commission DECIMAL(15, 2) DEFAULT 0,
  commission_rate DECIMAL(5, 2) DEFAULT 0,
  tracking_start_date DATE NOT NULL,
  tracking_end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 建立內容成效表
CREATE TABLE content_performance (
  id SERIAL PRIMARY KEY,
  collaboration_id INTEGER REFERENCES collaborations(id) ON DELETE CASCADE,
  platform VARCHAR(50) CHECK (platform IN ('youtube', 'facebook', 'instagram', 'tiktok', 'twitter')),
  content_url TEXT NOT NULL,
  content_type VARCHAR(20) CHECK (content_type IN ('post', 'video', 'story', 'reel', 'short')),
  publish_date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement DECIMAL(5, 2) DEFAULT 0,
  reach INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 建立索引以提升查詢效能
CREATE INDEX idx_kols_user_id ON kols(user_id);
CREATE INDEX idx_kols_rating ON kols(rating);
CREATE INDEX idx_social_platforms_kol_id ON social_platforms(kol_id);
CREATE INDEX idx_profit_shares_kol_id ON profit_shares(kol_id);
CREATE INDEX idx_profit_shares_period_end ON profit_shares(period_end);
CREATE INDEX idx_collaborations_kol_id ON collaborations(kol_id);
CREATE INDEX idx_collaborations_user_id ON collaborations(user_id);
CREATE INDEX idx_collaborations_status ON collaborations(status);
CREATE INDEX idx_sales_tracking_collaboration_id ON sales_tracking(collaboration_id);
CREATE INDEX idx_content_performance_collaboration_id ON content_performance(collaboration_id);

-- 建立 Row Level Security (RLS) 政策
ALTER TABLE kols ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;

-- KOLs 表的 RLS 政策（所有登入用戶都可以讀取和修改）
CREATE POLICY "所有登入用戶可以查看 KOL" ON kols
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以新增 KOL" ON kols
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以更新 KOL" ON kols
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以刪除 KOL" ON kols
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Social Platforms 表的 RLS 政策
CREATE POLICY "所有登入用戶可以查看社群平台" ON social_platforms
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以新增社群平台" ON social_platforms
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以更新社群平台" ON social_platforms
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以刪除社群平台" ON social_platforms
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Profit Shares 表的 RLS 政策
CREATE POLICY "所有登入用戶可以查看分潤記錄" ON profit_shares
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以新增分潤記錄" ON profit_shares
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以更新分潤記錄" ON profit_shares
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以刪除分潤記錄" ON profit_shares
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Collaborations 表的 RLS 政策
CREATE POLICY "所有登入用戶可以查看合作專案" ON collaborations
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以新增合作專案" ON collaborations
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以更新合作專案" ON collaborations
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以刪除合作專案" ON collaborations
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Sales Tracking 表的 RLS 政策
CREATE POLICY "所有登入用戶可以查看銷售追蹤" ON sales_tracking
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以新增銷售追蹤" ON sales_tracking
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以更新銷售追蹤" ON sales_tracking
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以刪除銷售追蹤" ON sales_tracking
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Content Performance 表的 RLS 政策
CREATE POLICY "所有登入用戶可以查看內容成效" ON content_performance
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以新增內容成效" ON content_performance
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以更新內容成效" ON content_performance
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "所有登入用戶可以刪除內容成效" ON content_performance
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 建立自動更新 updated_at 的函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為需要的表建立觸發器
CREATE TRIGGER update_kols_updated_at
  BEFORE UPDATE ON kols
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaborations_updated_at
  BEFORE UPDATE ON collaborations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_tracking_updated_at
  BEFORE UPDATE ON sales_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
