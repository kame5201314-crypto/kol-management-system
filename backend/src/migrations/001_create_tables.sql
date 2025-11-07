-- KOL Management System Database Schema

-- Users Table (用戶認證)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KOLs Table (KOL基本資料)
CREATE TABLE IF NOT EXISTS kols (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  nickname VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  region VARCHAR(50),
  categories TEXT[], -- 內容類別陣列
  tags TEXT[], -- 標籤陣列
  languages TEXT[], -- 語言陣列
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social Platforms Table (社群平台資料)
CREATE TABLE IF NOT EXISTS social_platforms (
  id SERIAL PRIMARY KEY,
  kol_id INTEGER REFERENCES kols(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('youtube', 'instagram', 'facebook', 'tiktok', 'twitter')),
  url VARCHAR(255),
  followers INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  average_views INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(kol_id, platform)
);

-- Collaborations Table (合作專案)
CREATE TABLE IF NOT EXISTS collaborations (
  id SERIAL PRIMARY KEY,
  kol_id INTEGER REFERENCES kols(id) ON DELETE CASCADE,
  project_name VARCHAR(200) NOT NULL,
  brand_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'negotiating', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  deliverables TEXT[], -- 交付內容陣列
  platforms TEXT[], -- 使用平台陣列
  contract_url VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Tracking Table (銷售追蹤)
CREATE TABLE IF NOT EXISTS sales_tracking (
  id SERIAL PRIMARY KEY,
  kol_id INTEGER REFERENCES kols(id) ON DELETE CASCADE,
  collaboration_id INTEGER REFERENCES collaborations(id) ON DELETE CASCADE,
  discount_code VARCHAR(50),
  affiliate_link VARCHAR(255),
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(12,2),
  tracking_start_date DATE,
  tracking_end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Performance Table (內容表現追蹤)
CREATE TABLE IF NOT EXISTS content_performance (
  id SERIAL PRIMARY KEY,
  collaboration_id INTEGER REFERENCES collaborations(id) ON DELETE CASCADE,
  platform VARCHAR(20),
  content_type VARCHAR(50),
  post_url VARCHAR(255),
  post_date DATE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kols_name ON kols(name);
CREATE INDEX IF NOT EXISTS idx_kols_categories ON kols USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_kols_tags ON kols USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_social_platforms_kol_id ON social_platforms(kol_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_kol_id ON collaborations(kol_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON collaborations(status);
CREATE INDEX IF NOT EXISTS idx_sales_tracking_kol_id ON sales_tracking(kol_id);
CREATE INDEX IF NOT EXISTS idx_sales_tracking_collaboration_id ON sales_tracking(collaboration_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kols_updated_at BEFORE UPDATE ON kols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_platforms_updated_at BEFORE UPDATE ON social_platforms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaborations_updated_at BEFORE UPDATE ON collaborations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_tracking_updated_at BEFORE UPDATE ON sales_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_performance_updated_at BEFORE UPDATE ON content_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
