-- Step 1: 啟用 UUID 擴充功能和建立基礎表格
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 建立 KOL 主表
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 建立社群平台資料表
CREATE TABLE IF NOT EXISTS social_platforms (
  id SERIAL PRIMARY KEY,
  kol_id INTEGER REFERENCES kols(id) ON DELETE CASCADE,
  platform VARCHAR(50) CHECK (platform IN ('youtube', 'facebook', 'instagram', 'tiktok', 'twitter')),
  handle VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 建立分潤記錄表
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
