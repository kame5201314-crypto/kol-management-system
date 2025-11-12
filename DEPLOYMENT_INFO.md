# 房產價格數據與估價分析平台 - 部署資訊

## 🌐 線上網址

### 正式環境 (Production)
**網址**: https://kol-management-system-j385aeciq-kaweis-projects.vercel.app

**部署時間**: 2025-01-12
**平台**: Vercel
**狀態**: ✅ Ready (已上線)

---

## 📊 部署詳情

### 部署資訊
- **專案名稱**: kol-management-system
- **部署 ID**: HApSFfN4Cw6gAd1DFQS7kPB7uMXm
- **區域**: Washington, D.C., USA (East) - iad1
- **建置時間**: 6 秒
- **建置大小**: 45.63 MB

### 建置結果
```
✓ 1668 modules transformed
✓ Built in 4.32s

Output:
- index.html: 0.40 kB (gzip: 0.29 kB)
- index.css: 22.91 kB (gzip: 4.58 kB)
- index.js: 424.16 kB (gzip: 115.63 kB)
```

---

## 🎯 可用功能

目前線上環境已部署以下功能:

### ✅ 前端頁面
- [x] 首頁 - https://kol-management-system-j385aeciq-kaweis-projects.vercel.app/
- [x] AI 估價頁面
- [x] 搜尋頁面
- [x] 地圖分析頁面
- [x] 房貸試算器
- [x] 投資報酬計算器
- [x] 登入/註冊頁面

### ⚠️ 需要設定的功能

以下功能需要環境變數才能正常運作:

#### 1. 後端 API (需要資料庫)
- [ ] 交易記錄查詢 API
- [ ] AI 估價 API
- [ ] 市場趨勢 API
- [ ] 社區資料 API

**所需環境變數**:
```
DATABASE_URL="postgresql://..."
```

#### 2. 用戶認證 (需要 Supabase)
- [ ] 登入功能
- [ ] 註冊功能
- [ ] OAuth 登入

**所需環境變數**:
```
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

#### 3. 地圖功能 (需要 API Key - 選用)
- [ ] Google Maps (如果使用)
- [ ] Mapbox (如果使用)

**所需環境變數** (選用):
```
NEXT_PUBLIC_MAPBOX_TOKEN="pk.ey..."
# 或
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."
```

---

## 🔧 設定環境變數

### 在 Vercel 上設定環境變數

1. **登入 Vercel Dashboard**
   https://vercel.com/kaweis-projects/kol-management-system

2. **進入 Settings → Environment Variables**

3. **新增以下變數**:

   **必要變數 (資料庫)**:
   ```
   DATABASE_URL
   ```
   值: 您的 PostgreSQL 連線字串

   **必要變數 (Supabase)**:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```

4. **重新部署**
   ```bash
   npx vercel --prod
   ```

---

## 📱 如何使用

### 目前可以測試的功能

1. **瀏覽首頁**
   - 查看平台介紹
   - 查看熱門區域 (靜態資料)
   - 查看功能特色

2. **房貸試算器**
   - 完全前端運算
   - 無需後端 API
   - 立即可用 ✅

3. **投資報酬計算器**
   - 完全前端運算
   - 無需後端 API
   - 立即可用 ✅

4. **AI 估價工具**
   - 需要資料庫和 API
   - 需設定環境變數 ⚠️

5. **搜尋功能**
   - 需要資料庫和 API
   - 需設定環境變數 ⚠️

6. **地圖分析**
   - 需要資料庫和 API
   - 需設定環境變數 ⚠️

---

## 🚀 完整啟用步驟

### Step 1: 建立 Supabase 專案

1. 前往 https://supabase.com/
2. 建立新專案
3. 取得以下資訊:
   - Project URL
   - Anon Key
   - Service Role Key

### Step 2: 設定資料庫

1. 在 Supabase SQL Editor 執行:
   ```sql
   -- 將 prisma/schema_property.prisma 轉換為 SQL
   -- 或使用 Prisma CLI: npx prisma db push
   ```

2. 取得 DATABASE_URL:
   ```
   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```

### Step 3: 在 Vercel 設定環境變數

前往 Vercel Dashboard → Settings → Environment Variables

新增:
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

### Step 4: 重新部署

```bash
npx vercel --prod
```

### Step 5: 匯入測試資料

```bash
# 使用 Prisma Studio 或 SQL
npx prisma studio

# 或執行資料導入腳本 (需自行建立)
npm run import-data
```

---

## 📊 監控與管理

### Vercel Dashboard
**網址**: https://vercel.com/kaweis-projects/kol-management-system

**功能**:
- 查看部署歷史
- 檢視建置日誌
- 設定環境變數
- 查看流量分析
- 設定自訂網域

### 檢視日誌
```bash
npx vercel logs kol-management-system
```

### 查看特定部署
```bash
npx vercel inspect [deployment-url] --logs
```

---

## 🌍 自訂網域 (選用)

### 綁定自己的網域

1. 前往 Vercel Dashboard → Settings → Domains
2. 新增您的網域 (例如: property.yourdomain.com)
3. 依照指示設定 DNS:
   - A Record 或 CNAME
   - 等待 DNS 傳播 (最多 48 小時)

### DNS 設定範例
```
Type: CNAME
Name: property
Value: cname.vercel-dns.com
```

---

## 🔐 安全性建議

### 環境變數
- ✅ 永遠不要將 API Key 提交到 Git
- ✅ 使用 Vercel Environment Variables
- ✅ 區分 Development 和 Production 環境

### API 安全
- [ ] 實作 Rate Limiting
- [ ] 實作 CORS 政策
- [ ] 實作 API Key 驗證
- [ ] 實作請求驗證

### 資料庫
- ✅ 使用 Supabase RLS (Row Level Security)
- ✅ 加密敏感資料
- ✅ 定期備份

---

## 📈 效能優化

### 已啟用
- ✅ Vercel Edge Network (全球 CDN)
- ✅ 自動圖片優化
- ✅ Gzip 壓縮
- ✅ Build Cache

### 建議優化
- [ ] 實作 React Query 快取
- [ ] 圖片使用 WebP 格式
- [ ] 實作 API Response 快取
- [ ] 使用 ISR (Incremental Static Regeneration)

---

## 🆘 常見問題

### Q1: 部署後看不到資料?
A: 需要設定 `DATABASE_URL` 環境變數並匯入資料

### Q2: 登入功能無法使用?
A: 需要設定 Supabase 環境變數

### Q3: 如何更新網站?
A: 推送到 GitHub main 分支會自動部署,或執行 `npx vercel --prod`

### Q4: 如何查看錯誤?
A: 使用 `npx vercel logs` 或在 Vercel Dashboard 查看

### Q5: 建置失敗怎麼辦?
A: 檢查:
- package.json 是否正確
- 環境變數是否設定
- 建置日誌中的錯誤訊息

---

## 📞 支援資源

### Vercel 文件
- https://vercel.com/docs

### Next.js 部署指南
- https://nextjs.org/docs/deployment

### Supabase 整合
- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

---

## 🎉 部署成功!

您的房產估價平台已成功部署到雲端!

**下一步**:
1. ✅ 設定環境變數 (資料庫、Supabase)
2. ✅ 匯入測試資料
3. ✅ 測試所有功能
4. ✅ (選用) 綁定自訂網域
5. ✅ 開始使用!

**部署日期**: 2025-01-12
**版本**: v1.0.0 (MVP)
