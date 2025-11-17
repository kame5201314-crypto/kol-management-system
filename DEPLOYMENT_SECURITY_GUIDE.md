# KOL 管理系統 - 雲端部署與資安規劃指南

## 📋 目錄
1. [雲端部署方案](#雲端部署方案)
2. [資料安全措施](#資料安全措施)
3. [使用者認證與授權](#使用者認證與授權)
4. [資料備份與復原](#資料備份與復原)
5. [部署步驟](#部署步驟)
6. [安全檢查清單](#安全檢查清單)

---

## 🚀 雲端部署方案

### 推薦架構
- **前端**: Vercel (自動 HTTPS、CDN、全球部署)
- **後端**: Supabase (PostgreSQL 資料庫、即時 API、內建認證)
- **檔案儲存**: Supabase Storage (安全的檔案上傳/下載)

### 優勢
✅ 自動 SSL/TLS 加密
✅ 全球 CDN 加速
✅ 自動備份與災難復原
✅ 無需管理伺服器
✅ 自動擴展能力

---

## 🔒 資料安全措施

### 1. 環境變數管理
**已完成**: 所有敏感資訊已移至環境變數

```bash
# .env 檔案 (已加入 .gitignore，不會上傳至 GitHub)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Vercel 環境變數設定**:
1. 登入 Vercel Dashboard
2. 選擇專案 > Settings > Environment Variables
3. 新增以下變數:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 適用於 Production, Preview, Development 環境

### 2. Row Level Security (RLS) 政策

**必須在 Supabase 啟用 RLS** 以防止未授權存取:

```sql
-- 啟用 RLS
ALTER TABLE kols ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_sharing ENABLE ROW LEVEL SECURITY;

-- 只有認證使用者可以讀取
CREATE POLICY "允許認證使用者讀取 KOL 資料"
ON kols FOR SELECT
TO authenticated
USING (true);

-- 只有認證使用者可以新增/修改
CREATE POLICY "允許認證使用者新增 KOL"
ON kols FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "允許認證使用者更新 KOL"
ON kols FOR UPDATE
TO authenticated
USING (true);

-- 同樣套用至其他表格
CREATE POLICY "允許認證使用者讀取合作專案"
ON collaborations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "允許認證使用者管理合作專案"
ON collaborations FOR ALL
TO authenticated
USING (true);

CREATE POLICY "允許認證使用者讀取分潤記錄"
ON profit_sharing FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "允許認證使用者管理分潤記錄"
ON profit_sharing FOR ALL
TO authenticated
USING (true);
```

### 3. 資料加密

**傳輸層加密**:
- ✅ Vercel 自動提供 HTTPS/TLS 1.3
- ✅ Supabase 所有連線使用 SSL

**靜態資料加密**:
- ✅ Supabase 自動加密資料庫 (AES-256)
- ✅ 備份檔案自動加密

### 4. 安全標頭配置

已在 `vercel.json` 設定以下安全標頭:

- `X-Content-Type-Options: nosniff` - 防止 MIME 類型嗅探
- `X-Frame-Options: DENY` - 防止點擊劫持
- `X-XSS-Protection: 1; mode=block` - 啟用 XSS 過濾
- `Referrer-Policy: strict-origin-when-cross-origin` - 控制 Referrer 資訊
- `Permissions-Policy` - 限制瀏覽器功能存取

---

## 👥 使用者認證與授權

### 推薦方案: Supabase Auth

#### 1. 啟用 Email/Password 認證

在 Supabase Dashboard:
1. Authentication > Providers
2. 啟用 Email provider
3. 設定 Email templates (歡迎信、重設密碼等)

#### 2. 新增登入元件

需要建立以下頁面:
- 登入頁面 (`/login`)
- 註冊頁面 (`/signup`)
- 密碼重設頁面 (`/reset-password`)

#### 3. 保護路由

```typescript
// 範例: Protected Route
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useNavigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate('/login');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) return <div>載入中...</div>;
  if (!user) return null;

  return children;
}
```

#### 4. 角色權限管理

在 Supabase 建立 `user_roles` 表格:

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS 政策
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "使用者可查看自己的角色"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

**權限定義**:
- `admin`: 完整存取權限（新增、修改、刪除）
- `manager`: 可管理 KOL 和合作專案（不能刪除）
- `viewer`: 僅查看權限

---

## 💾 資料備份與復原

### Supabase 自動備份

**每日自動備份** (Pro plan 以上):
- 保留 7 天備份
- 可隨時還原至任何時間點

**手動備份**:
```bash
# 使用 Supabase CLI 匯出資料
supabase db dump -f backup.sql

# 匯出特定表格
supabase db dump --data-only -t kols -t collaborations -f data_backup.sql
```

### 備份策略建議

1. **每日自動備份**: 由 Supabase 處理
2. **每週手動備份**: 匯出重要資料至本地
3. **重要操作前備份**: 大量修改前先備份
4. **測試復原程序**: 定期測試備份還原流程

### 復原步驟

```bash
# 還原整個資料庫
supabase db reset --db-url "your_database_url"

# 還原特定備份檔
psql -h your_host -U postgres -d postgres -f backup.sql
```

---

## 📦 部署步驟

### 步驟 1: 準備 Supabase 專案

1. 登入 [Supabase](https://supabase.com)
2. 確認專案已建立 (URL: `https://rfrffizseufnhqusrpdg.supabase.co`)
3. 前往 SQL Editor，執行上述 RLS 政策
4. 設定 Authentication providers

### 步驟 2: 部署至 Vercel

#### 方式一: 透過 Vercel CLI (推薦)

```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登入 Vercel
vercel login

# 3. 部署專案
vercel

# 4. 設定環境變數 (第一次部署時)
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 5. 重新部署以套用環境變數
vercel --prod
```

#### 方式二: 透過 GitHub 整合

1. 將專案推送至 GitHub (已完成)
2. 登入 [Vercel Dashboard](https://vercel.com)
3. 點選 "Import Project"
4. 選擇 GitHub repository: `kame5201314-crypto/kol-management-system`
5. 設定環境變數:
   - `VITE_SUPABASE_URL`: `https://rfrffizseufnhqusrpdg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: (從 Supabase Settings > API 複製)
6. 點選 "Deploy"

### 步驟 3: 驗證部署

部署完成後檢查:
- ✅ 網站可正常開啟
- ✅ 可以讀取 KOL 資料
- ✅ 可以新增/編輯資料
- ✅ HTTPS 正常運作
- ✅ 環境變數正確載入

### 步驟 4: 設定自訂網域 (選用)

1. Vercel Dashboard > Settings > Domains
2. 新增網域 (例如: `kol.your-company.com`)
3. 依照指示設定 DNS 記錄
4. 等待 SSL 憑證自動配置

---

## ✅ 安全檢查清單

### 部署前檢查

- [x] API 金鑰已移至環境變數
- [x] `.env` 已加入 `.gitignore`
- [x] 安全標頭已配置 (`vercel.json`)
- [ ] Supabase RLS 已啟用
- [ ] 使用者認證已設定
- [ ] 角色權限已定義

### 部署後檢查

- [ ] HTTPS 正常運作
- [ ] 環境變數正確載入
- [ ] RLS 政策生效 (未登入無法存取資料)
- [ ] 登入功能正常
- [ ] 備份機制已設定
- [ ] 監控與日誌已啟用

### 定期檢查 (每月)

- [ ] 檢查 Supabase 備份狀態
- [ ] 檢查使用者權限設定
- [ ] 檢查異常登入記錄
- [ ] 更新套件相依性
- [ ] 檢查 Vercel 使用量

---

## 🔐 額外安全建議

### 1. IP 白名單 (進階)

若只限公司內部存取，可在 Supabase 設定 IP 白名單:
- Settings > Network Restrictions
- 新增公司固定 IP

### 2. 稽核日誌

```sql
-- 建立操作日誌表
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立觸發器記錄修改
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    row_to_json(OLD),
    row_to_json(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. 速率限制

Supabase 內建速率限制，建議設定:
- 每分鐘最多 60 次 API 請求
- 登入失敗 5 次鎖定 15 分鐘

### 4. 資料遮罩

對敏感欄位（如手機號碼、Email）在前端顯示時遮罩:

```typescript
// 範例: 手機號碼遮罩
function maskPhone(phone: string) {
  return phone.replace(/(\d{4})\d{4}(\d{2})/, '$1****$2');
}

// 0912345678 -> 0912****78
```

### 5. 密碼政策

在 Supabase Authentication 設定:
- 最小長度: 8 字元
- 必須包含: 大小寫字母、數字
- 定期更換密碼提醒

---

## 📞 技術支援

### Vercel
- 文件: https://vercel.com/docs
- 支援: https://vercel.com/support

### Supabase
- 文件: https://supabase.com/docs
- 社群: https://github.com/supabase/supabase/discussions

---

## 📝 更新記錄

- 2025-11-17: 初始版本
  - 完成環境變數配置
  - 建立 Vercel 部署設定
  - 撰寫完整安全規劃

---

**重要提醒**:
1. 請務必在部署後立即設定使用者認證
2. 啟用 Supabase RLS 是最重要的安全措施
3. 定期檢查備份與日誌
4. 保持套件更新以修補安全漏洞
