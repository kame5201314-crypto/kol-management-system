-- RentSync 好住管家 - Supabase 資料庫結構
-- 建立日期: 2025-01-18

-- ============================================
-- 1. 房源管理表 (properties)
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  type VARCHAR(50), -- 公寓/套房/電梯大樓等
  floor INTEGER,
  size DECIMAL(10, 2), -- 坪數
  rooms INTEGER,
  bathrooms INTEGER,
  monthly_rent DECIMAL(10, 2),
  deposit DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'vacant', -- vacant/occupied/maintenance
  description TEXT,
  amenities JSONB, -- 設備清單 JSON
  images JSONB, -- 圖片 URLs JSON array
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. 租客管理表 (tenants)
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  id_number VARCHAR(20), -- 身分證字號
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  occupation VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. 租約管理表 (rent_contracts)
-- ============================================
CREATE TABLE IF NOT EXISTS rent_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10, 2) NOT NULL,
  deposit DECIMAL(10, 2) NOT NULL,
  payment_day INTEGER DEFAULT 5, -- 每月繳租日
  payment_method VARCHAR(50), -- 轉帳/信用卡/超商條碼
  status VARCHAR(20) DEFAULT 'active', -- active/expiring_soon/expired/terminated
  contract_file_url TEXT, -- PDF 合約檔案 URL
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. 租金繳納記錄表 (rent_payments)
-- ============================================
CREATE TABLE IF NOT EXISTS rent_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES rent_contracts(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- paid/pending/overdue
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  receipt_url TEXT,
  notes TEXT,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. 報修管理表 (repair_requests)
-- ============================================
CREATE TABLE IF NOT EXISTS repair_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- 水電/家電/門窗/漏水/其他
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending/in_progress/completed/cancelled
  priority VARCHAR(20) DEFAULT 'medium', -- low/medium/high
  assigned_to VARCHAR(100), -- 維修廠商名稱
  assigned_contact VARCHAR(50),
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  scheduled_date DATE,
  completed_date DATE,
  images JSONB, -- 照片 URLs JSON array
  rating INTEGER, -- 1-5 星評價
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. 報修留言記錄表 (repair_comments)
-- ============================================
CREATE TABLE IF NOT EXISTS repair_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id UUID REFERENCES repair_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name VARCHAR(100) NOT NULL,
  user_role VARCHAR(20), -- landlord/tenant/vendor
  message TEXT NOT NULL,
  images JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. 服務廠商表 (service_providers)
-- ============================================
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 清潔服務/搬家服務/水電維修/園藝服務/其他
  description TEXT,
  price_range VARCHAR(100),
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  location TEXT,
  services_offered JSONB, -- 服務項目 JSON array
  rating DECIMAL(3, 2) DEFAULT 0.0,
  reviews_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  images JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. 服務預約表 (service_orders)
-- ============================================
CREATE TABLE IF NOT EXISTS service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending', -- pending/confirmed/completed/cancelled
  amount DECIMAL(10, 2),
  notes TEXT,
  rating INTEGER, -- 1-5 星評價
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. 通知公告表 (notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'announcement', -- announcement/reminder/alert
  target VARCHAR(20) DEFAULT 'all', -- all/individual
  priority VARCHAR(20) DEFAULT 'normal', -- low/normal/high
  scheduled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. 通知接收記錄表 (notification_recipients)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 建立索引以提升查詢效能
-- ============================================

-- Properties 索引
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);

-- Tenants 索引
CREATE INDEX idx_tenants_email ON tenants(email);
CREATE INDEX idx_tenants_user ON tenants(user_id);

-- Contracts 索引
CREATE INDEX idx_contracts_property ON rent_contracts(property_id);
CREATE INDEX idx_contracts_tenant ON rent_contracts(tenant_id);
CREATE INDEX idx_contracts_status ON rent_contracts(status);
CREATE INDEX idx_contracts_dates ON rent_contracts(start_date, end_date);

-- Payments 索引
CREATE INDEX idx_payments_contract ON rent_payments(contract_id);
CREATE INDEX idx_payments_status ON rent_payments(status);
CREATE INDEX idx_payments_due_date ON rent_payments(due_date);

-- Repairs 索引
CREATE INDEX idx_repairs_property ON repair_requests(property_id);
CREATE INDEX idx_repairs_tenant ON repair_requests(tenant_id);
CREATE INDEX idx_repairs_status ON repair_requests(status);
CREATE INDEX idx_repairs_priority ON repair_requests(priority);

-- Services 索引
CREATE INDEX idx_service_providers_category ON service_providers(category);
CREATE INDEX idx_service_providers_active ON service_providers(active);

-- Orders 索引
CREATE INDEX idx_service_orders_service ON service_orders(service_id);
CREATE INDEX idx_service_orders_status ON service_orders(status);

-- Notifications 索引
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- 啟用 Row Level Security (RLS)
-- ============================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 政策設定
-- ============================================

-- Properties 政策：房東可以看到自己的房源
CREATE POLICY "Landlords can view own properties"
  ON properties FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Landlords can insert own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Landlords can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Landlords can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = owner_id);

-- Tenants 政策：租客可以看到自己的資料
CREATE POLICY "Tenants can view own profile"
  ON tenants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert tenant profiles"
  ON tenants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tenants can update own profile"
  ON tenants FOR UPDATE
  USING (auth.uid() = user_id);

-- Contracts 政策：房東和租客都可以看到相關租約
CREATE POLICY "Landlords can view contracts for own properties"
  ON rent_contracts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = rent_contracts.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view own contracts"
  ON rent_contracts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenants
      WHERE tenants.id = rent_contracts.tenant_id
      AND tenants.user_id = auth.uid()
    )
  );

-- Payments 政策
CREATE POLICY "Landlords can manage payments"
  ON rent_payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = rent_payments.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view own payments"
  ON rent_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenants
      WHERE tenants.id = rent_payments.tenant_id
      AND tenants.user_id = auth.uid()
    )
  );

-- Repairs 政策
CREATE POLICY "Property owners can manage repairs"
  ON repair_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = repair_requests.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can manage own repair requests"
  ON repair_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tenants
      WHERE tenants.id = repair_requests.tenant_id
      AND tenants.user_id = auth.uid()
    )
  );

-- Service Providers 政策：所有人都可以查看
CREATE POLICY "Anyone can view active service providers"
  ON service_providers FOR SELECT
  USING (active = TRUE);

-- Service Orders 政策
CREATE POLICY "Users can view own service orders"
  ON service_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenants
      WHERE tenants.id = service_orders.tenant_id
      AND tenants.user_id = auth.uid()
    )
  );

-- Notifications 政策：所有用戶都可以查看公告
CREATE POLICY "Users can view notifications"
  ON notifications FOR SELECT
  USING (TRUE);

CREATE POLICY "Landlords can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ============================================
-- 建立觸發器：自動更新 updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON rent_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON rent_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repair_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON service_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 建立函數：自動生成每月租金繳納記錄
-- ============================================

CREATE OR REPLACE FUNCTION generate_monthly_rent_payments()
RETURNS void AS $$
DECLARE
  contract_record RECORD;
  payment_date DATE;
BEGIN
  FOR contract_record IN
    SELECT * FROM rent_contracts WHERE status = 'active'
  LOOP
    payment_date := DATE_TRUNC('month', CURRENT_DATE) + (contract_record.payment_day - 1) * INTERVAL '1 day';

    -- 檢查本月是否已有繳租記錄
    IF NOT EXISTS (
      SELECT 1 FROM rent_payments
      WHERE contract_id = contract_record.id
      AND DATE_TRUNC('month', due_date) = DATE_TRUNC('month', payment_date)
    ) THEN
      INSERT INTO rent_payments (
        contract_id,
        property_id,
        tenant_id,
        amount,
        due_date,
        status
      ) VALUES (
        contract_record.id,
        contract_record.property_id,
        contract_record.tenant_id,
        contract_record.monthly_rent,
        payment_date,
        CASE
          WHEN payment_date < CURRENT_DATE THEN 'overdue'
          ELSE 'pending'
        END
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 建立函數：更新租約狀態
-- ============================================

CREATE OR REPLACE FUNCTION update_contract_status()
RETURNS void AS $$
BEGIN
  -- 標記即將到期的租約 (30天內)
  UPDATE rent_contracts
  SET status = 'expiring_soon'
  WHERE status = 'active'
  AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days';

  -- 標記已到期的租約
  UPDATE rent_contracts
  SET status = 'expired'
  WHERE status IN ('active', 'expiring_soon')
  AND end_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 插入示範數據 (可選)
-- ============================================

-- 插入示範服務廠商
INSERT INTO service_providers (name, category, description, price_range, contact_person, phone, email, location, services_offered, rating, reviews_count, verified, active)
VALUES
  ('清潔達人專業清潔', '清潔服務', '提供居家深度清潔、定期清潔、搬家清潔等服務', 'NT$ 1,500 - 5,000', '陳小姐', '0912-345-678', 'cleaning@example.com', '台北市、新北市', '["居家清潔", "辦公室清潔", "搬家清潔", "裝潢後清潔"]', 4.8, 156, TRUE, TRUE),
  ('搬家大師物流', '搬家服務', '專業搬家團隊，提供包裝、搬運、定位服務', 'NT$ 3,000 - 15,000', '王先生', '0923-456-789', 'moving@example.com', '全台服務', '["家庭搬家", "辦公室搬遷", "鋼琴搬運", "包裝服務"]', 4.6, 89, TRUE, TRUE),
  ('水電快修', '水電維修', '24小時緊急維修，經驗豐富技術團隊', 'NT$ 800 起', '張師傅', '0934-567-890', 'plumbing@example.com', '台北市、新北市', '["水管維修", "電路檢修", "馬桶維修", "燈具安裝"]', 4.9, 234, TRUE, TRUE),
  ('綠意園藝造景', '園藝服務', '專業園藝師提供植栽設計與養護服務', 'NT$ 2,000 - 10,000', '林先生', '0945-678-901', 'garden@example.com', '台北市、新北市、桃園市', '["庭院造景", "植栽養護", "除草修剪", "盆栽設計"]', 4.7, 67, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- 完成
COMMENT ON DATABASE postgres IS 'RentSync 好住管家資料庫 - 租賃管理系統';
