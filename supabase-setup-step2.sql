-- Step 2: 建立其他表格
-- 建立合作專案表
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 建立銷售追蹤表
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 建立內容成效表
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
