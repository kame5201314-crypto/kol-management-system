-- ========================================
-- KOL 管理系統 - 完整資料庫初始化
-- 複製全部內容，一次執行即可
-- ========================================

-- 1. 啟用 UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 建立所有表格
CREATE TABLE IF NOT EXISTS kols (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_platforms (
  id SERIAL PRIMARY KEY,
  kol_id INTEGER REFERENCES kols(id) ON DELETE CASCADE,
  platform VARCHAR(50) CHECK (platform IN ('youtube', 'facebook', 'instagram', 'tiktok', 'twitter')),
  handle VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profit_shares (
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collaborations (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_tracking (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_performance (
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 建立索引
CREATE INDEX IF NOT EXISTS idx_kols_user_id ON kols(user_id);
CREATE INDEX IF NOT EXISTS idx_social_platforms_kol_id ON social_platforms(kol_id);
CREATE INDEX IF NOT EXISTS idx_profit_shares_kol_id ON profit_shares(kol_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_kol_id ON collaborations(kol_id);

-- 4. 啟用 RLS
ALTER TABLE kols ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;

-- 5. 建立 RLS 政策
CREATE POLICY IF NOT EXISTS "允許登入用戶操作" ON kols FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "允許登入用戶操作" ON social_platforms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "允許登入用戶操作" ON profit_shares FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "允許登入用戶操作" ON collaborations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "允許登入用戶操作" ON sales_tracking FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "允許登入用戶操作" ON content_performance FOR ALL USING (auth.role() = 'authenticated');

-- 6. 建立觸發器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON kols;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON kols FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON collaborations;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON collaborations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON sales_tracking;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON sales_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at();
