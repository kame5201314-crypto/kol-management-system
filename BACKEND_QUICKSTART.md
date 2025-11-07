# KOL 管理系統 - 後端快速開始指南

## 🚀 5分鐘快速啟動

### 步驟 1: 安裝 PostgreSQL

#### Windows
1. 下載: https://www.postgresql.org/download/windows/
2. 安裝時記住設定的密碼(預設用戶: postgres)
3. 完成安裝

#### Mac
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Linux
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 步驟 2: 建立資料庫

```bash
# Windows: 開啟 SQL Shell (psql)
# Mac/Linux: 在終端機執行
psql -U postgres

# 在 psql 中執行:
CREATE DATABASE kol_management;
\q
```

### 步驟 3: 安裝後端依賴

```bash
cd backend
npm install
```

### 步驟 4: 設定環境變數

```bash
# 複製範例檔案
cp .env.example .env

# 用編輯器打開 .env 並修改密碼
# 至少要修改: DB_PASSWORD=你的PostgreSQL密碼
```

### 步驟 5: 執行資料庫遷移

```bash
npm run migrate
```

你應該會看到:
```
✅ Completed: 001_create_tables.sql
✅ Completed: 002_seed_data.sql
🎉 All migrations completed successfully!
```

### 步驟 6: 啟動後端伺服器

```bash
npm run dev
```

成功後會看到:
```
╔═══════════════════════════════════════════════════╗
║      🚀 KOL Management System API Server 🚀      ║
╚═══════════════════════════════════════════════════╝

🌐 Server is running on port 3000
📡 API Base URL: http://localhost:3000/api
✅ Database connected successfully
```

### 步驟 7: 測試 API

開啟瀏覽器訪問:
```
http://localhost:3000/api/health
```

應該會看到:
```json
{
  "success": true,
  "message": "KOL Management System API is running",
  "timestamp": "2024-03-20T12:00:00.000Z"
}
```

## 🎯 測試登入

### 使用 curl (終端機)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

### 使用 Postman 或瀏覽器擴充

1. 方法: POST
2. URL: `http://localhost:3000/api/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "username": "admin",
  "password": "admin123"
}
```

成功後會得到 token:
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
      "role": "admin"
    }
  }
}
```

## 🔑 預設帳號

- **管理員**:
  - 用戶名: `admin`
  - 密碼: `admin123`

- **一般用戶**:
  - 用戶名: `user1`
  - 密碼: `admin123`

## 📚 下一步

1. 查看完整 API 文檔: [backend/README.md](backend/README.md)
2. 測試其他 API 端點
3. 整合前端應用

## ❗ 常見問題

### Q: 資料庫連接失敗?
A: 檢查:
- PostgreSQL 是否正在運行
- `.env` 中的 `DB_PASSWORD` 是否正確
- 資料庫 `kol_management` 是否已建立

### Q: Port 3000 被佔用?
A: 修改 `.env` 中的 `PORT=3001` 改成其他 port

### Q: npm install 很慢?
A: 可以使用 cnpm 或修改 npm registry:
```bash
npm config set registry https://registry.npmmirror.com
```

## 🆘 需要幫助?

查看詳細文檔: [backend/README.md](backend/README.md)
