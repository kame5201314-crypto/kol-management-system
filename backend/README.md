# KOL Management System - Backend API

完整的 KOL(網紅/意見領袖)管理系統後端 API,使用 Node.js、Express 和 PostgreSQL 構建。

## 📋 目錄

- [功能特色](#功能特色)
- [技術棧](#技術棧)
- [安裝步驟](#安裝步驟)
- [環境設定](#環境設定)
- [資料庫設定](#資料庫設定)
- [API 文檔](#api-文檔)
- [使用範例](#使用範例)

## 🌟 功能特色

- ✅ **KOL 管理** - 完整的 CRUD 操作
- ✅ **社群平台整合** - 支援 YouTube、Instagram、Facebook、TikTok、Twitter
- ✅ **合作專案管理** - 專案追蹤、狀態管理、預算控制
- ✅ **銷售追蹤** - 點擊、轉換、收益統計
- ✅ **用戶認證** - JWT 身份驗證
- ✅ **角色權限** - Admin、User、Viewer 三種角色
- ✅ **RESTful API** - 標準化的 API 設計
- ✅ **資料庫遷移** - 自動建立和初始化資料庫

## 🛠 技術棧

- **Runtime**: Node.js (建議 v18+)
- **框架**: Express.js 4.18
- **資料庫**: PostgreSQL 14+
- **認證**: JWT (jsonwebtoken)
- **密碼加密**: bcryptjs
- **CORS**: cors
- **環境變數**: dotenv

## 📦 安裝步驟

### 1. 安裝 PostgreSQL

**Windows:**
```bash
# 下載並安裝 PostgreSQL
# https://www.postgresql.org/download/windows/
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### 2. 建立資料庫

```bash
# 連接到 PostgreSQL
psql -U postgres

# 建立資料庫
CREATE DATABASE kol_management;

# 建立使用者 (可選)
CREATE USER kol_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kol_management TO kol_admin;

# 退出
\q
```

### 3. 安裝後端依賴

```bash
cd backend
npm install
```

## ⚙️ 環境設定

複製 `.env.example` 並建立 `.env` 檔案:

```bash
cp .env.example .env
```

編輯 `.env` 檔案:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kol_management
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## 🗄️ 資料庫設定

### 執行資料庫遷移

```bash
npm run migrate
```

這會自動:
1. 建立所有資料表
2. 建立索引
3. 插入測試資料
4. 建立預設管理員帳號

### 預設帳號

- **管理員帳號**: `admin` / `admin123`
- **一般用戶**: `user1` / `admin123`

## 🚀 啟動伺服器

### 開發模式 (熱重載)

```bash
npm run dev
```

### 生產模式

```bash
npm start
```

伺服器將在 `http://localhost:3000` 啟動

## 📚 API 文檔

### Base URL

```
http://localhost:3000/api
```

### 認證

大部分 API 需要在 Header 中包含 JWT Token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 認證 API

### 1. 用戶登入

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**回應:**
```json
{
  "success": true,
  "message": "登入成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@kolsystem.com",
      "fullName": "System Administrator",
      "role": "admin"
    }
  }
}
```

### 2. 用戶註冊

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "New User"
}
```

### 3. 獲取當前用戶

```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 👥 KOL API

### 1. 獲取所有 KOL

```http
GET /api/kols
Authorization: Bearer YOUR_JWT_TOKEN
```

**回應:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "王美麗",
      "nickname": "美麗姐",
      "email": "wangmeili@email.com",
      "phone": "0912-345-678",
      "region": "台北",
      "categories": ["美妝", "時尚", "生活"],
      "tags": ["美妝教學", "穿搭", "VLOG"],
      "languages": ["中文", "英文"],
      "rating": 4.8,
      "social_platforms": [
        {
          "platform": "youtube",
          "url": "https://youtube.com/@wangmeili",
          "followers": 280000,
          "engagementRate": 8.5,
          "averageViews": 45000
        }
      ]
    }
  ],
  "count": 5
}
```

### 2. 根據 ID 獲取單一 KOL

```http
GET /api/kols/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. 搜尋 KOL

```http
GET /api/kols/search?keyword=美妝&category=美妝&region=台北
Authorization: Bearer YOUR_JWT_TOKEN
```

**參數:**
- `keyword` - 關鍵字搜尋(名稱、暱稱、標籤)
- `category` - 內容類別
- `region` - 地區

### 4. 建立新 KOL

```http
POST /api/kols
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "新KOL名稱",
  "nickname": "暱稱",
  "email": "kol@example.com",
  "phone": "0912-345-678",
  "region": "台北",
  "categories": ["美妝", "時尚"],
  "tags": ["美妝教學", "穿搭"],
  "languages": ["中文"],
  "rating": 4.5,
  "notes": "備註資訊",
  "socialPlatforms": [
    {
      "platform": "youtube",
      "url": "https://youtube.com/@example",
      "followers": 100000,
      "engagementRate": 10.5,
      "averageViews": 25000
    }
  ]
}
```

### 5. 更新 KOL

```http
PUT /api/kols/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "更新後的名稱",
  "rating": 4.8
  // ... 其他欄位
}
```

### 6. 刪除 KOL

```http
DELETE /api/kols/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### 7. 獲取 KOL 統計數據

```http
GET /api/kols/statistics
Authorization: Bearer YOUR_JWT_TOKEN
```

**回應:**
```json
{
  "success": true,
  "data": {
    "total_kols": 5,
    "total_followers": 3680000,
    "avg_engagement_rate": 11.5,
    "avg_rating": 4.78
  }
}
```

---

## 🤝 合作專案 API

### 1. 獲取所有合作專案

```http
GET /api/collaborations
Authorization: Bearer YOUR_JWT_TOKEN
```

### 2. 根據 ID 獲取單一合作專案

```http
GET /api/collaborations/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. 根據 KOL ID 獲取合作專案

```http
GET /api/collaborations/kol/:kolId
Authorization: Bearer YOUR_JWT_TOKEN
```

### 4. 根據狀態獲取合作專案

```http
GET /api/collaborations/status/:status
Authorization: Bearer YOUR_JWT_TOKEN
```

**狀態值:**
- `pending` - 待確認
- `negotiating` - 洽談中
- `confirmed` - 已確認
- `in_progress` - 進行中
- `completed` - 已完成
- `cancelled` - 已取消

### 5. 搜尋合作專案

```http
GET /api/collaborations/search?keyword=美妝&status=in_progress&kolId=1
Authorization: Bearer YOUR_JWT_TOKEN
```

### 6. 建立新合作專案

```http
POST /api/collaborations
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "kolId": 1,
  "projectName": "春季美妝系列推廣",
  "brandName": "BeautyBrand",
  "status": "pending",
  "startDate": "2024-03-01",
  "endDate": "2024-05-31",
  "budget": 180000,
  "actualCost": 150000,
  "deliverables": ["3支YouTube影片", "10則Instagram貼文"],
  "platforms": ["youtube", "instagram"],
  "contractUrl": "https://contracts.example.com/contract1.pdf",
  "notes": "備註"
}
```

### 7. 更新合作專案

```http
PUT /api/collaborations/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### 8. 刪除合作專案

```http
DELETE /api/collaborations/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### 9. 獲取合作統計數據

```http
GET /api/collaborations/statistics
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 💰 銷售追蹤 API

### 1. 獲取所有銷售追蹤

```http
GET /api/sales-tracking
Authorization: Bearer YOUR_JWT_TOKEN
```

### 2. 根據 ID 獲取單一銷售追蹤

```http
GET /api/sales-tracking/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. 根據 KOL ID 獲取銷售追蹤

```http
GET /api/sales-tracking/kol/:kolId
Authorization: Bearer YOUR_JWT_TOKEN
```

### 4. 根據合作專案 ID 獲取銷售追蹤

```http
GET /api/sales-tracking/collaboration/:collaborationId
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. 建立新銷售追蹤

```http
POST /api/sales-tracking
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "kolId": 1,
  "collaborationId": 1,
  "discountCode": "MEILI20",
  "affiliateLink": "https://shop.example.com/ref=meili",
  "clicks": 15200,
  "conversions": 1850,
  "revenue": 925000,
  "commissionRate": 10,
  "commissionAmount": 92500,
  "trackingStartDate": "2024-03-01",
  "trackingEndDate": "2024-05-31"
}
```

### 6. 更新銷售追蹤

```http
PUT /api/sales-tracking/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### 7. 刪除銷售追蹤

```http
DELETE /api/sales-tracking/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### 8. 獲取銷售統計數據

```http
GET /api/sales-tracking/statistics
Authorization: Bearer YOUR_JWT_TOKEN
```

**回應:**
```json
{
  "success": true,
  "data": {
    "total_tracking_records": 4,
    "total_clicks": 82400,
    "total_conversions": 10580,
    "total_revenue": 4802000,
    "total_commission": 498700,
    "conversion_rate": 12.84
  }
}
```

### 9. 獲取銷售排名

```http
GET /api/sales-tracking/top-kols?limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📊 資料庫結構

### 資料表

1. **users** - 用戶認證
2. **kols** - KOL 基本資料
3. **social_platforms** - 社群平台資料
4. **collaborations** - 合作專案
5. **sales_tracking** - 銷售追蹤
6. **content_performance** - 內容表現(已建表,待實現)

### 關聯圖

```
users
  |
kols
  ├── social_platforms (1:N)
  ├── collaborations (1:N)
  └── sales_tracking (1:N)
      └── collaborations (N:1)
```

---

## 🔧 開發指南

### 新增 API 端點

1. 在 `src/models/` 建立或修改 Model
2. 在 `src/controllers/` 建立或修改 Controller
3. 在 `src/routes/` 建立或修改 Route
4. 在 `src/server.js` 註冊 Route

### 測試 API

使用 Postman、Thunder Client 或 curl:

```bash
# 測試健康檢查
curl http://localhost:3000/api/health

# 登入
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 獲取 KOL 列表 (需要 token)
curl http://localhost:3000/api/kols \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🐛 常見問題

### 1. 資料庫連接失敗

```
❌ Database connection failed: password authentication failed
```

**解決方法:**
- 檢查 `.env` 檔案中的資料庫密碼
- 確認 PostgreSQL 服務正在運行
- 檢查資料庫名稱是否正確

### 2. Port 已被佔用

```
Error: listen EADDRINUSE: address already in use :::3000
```

**解決方法:**
- 修改 `.env` 中的 `PORT` 設定
- 或停止佔用該 Port 的程式

### 3. JWT Secret 錯誤

確保 `.env` 中設定了安全的 `JWT_SECRET`:

```env
JWT_SECRET=your_very_secure_random_string_here
```

---

## 📝 授權

MIT License

---

## 👨‍💻 作者

KOL Management System Team

---

## 🙏 致謝

感謝使用 KOL Management System!

如有問題或建議,歡迎提交 Issue 或 Pull Request。
