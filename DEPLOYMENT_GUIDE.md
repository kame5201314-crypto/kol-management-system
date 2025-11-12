# KOL 管理系統 - 完整部署指南

## 📋 目前進度

✅ 已完成：
- Supabase 客戶端套件安裝
- 認證系統整合（支援註冊/登入）
- KOL 資料 CRUD 操作整合
- 自動降級至 mock 資料（當資料庫未建立時）

⏳ 待完成：
- **在 Supabase 建立資料庫表格**（重要！）
- 關閉 Email 確認（開發階段）
- 測試系統功能
- 部署到 Vercel

---

## 🚀 Step 1: 建立 Supabase 資料庫表格

### 方法一：使用 SQL Editor（推薦）

1. **前往 Supabase 控制台**
   - 網址：https://supabase.com/dashboard
   - 登入您的帳號

2. **選擇專案**
   - 找到 "kames201314-KOL System" 專案
   - 點擊進入

3. **執行 SQL**
   - 點擊左側選單的 **"SQL Editor"**
   - 在編輯器中貼上 `supabase-schema.sql` 的完整內容
   - 點擊右下角綠色的 **"Run"** 按鈕
   - 等待執行完成（約 5-10 秒）

4. **驗證**
   - 點擊左側選單的 **"Table Editor"**
   - 確認看到以下 6 個表格：
     - ✅ kols
     - ✅ social_platforms
     - ✅ profit_shares
     - ✅ collaborations
     - ✅ sales_tracking
     - ✅ content_performance

### 方法二：手動複製 SQL（備用）

如果上述方法不行，請：
1. 打開專案資料夾中的 `supabase-schema.sql`
2. 全選並複製（Ctrl+A → Ctrl+C）
3. 回到 Supabase SQL Editor
4. 貼上（Ctrl+V）
5. 點擊 Run

---

## 🔧 Step 2: 關閉 Email 確認（開發階段）

1. **前往 Authentication 設定**
   - Supabase 控制台 → 左側選單 **"Authentication"**
   - 點擊 **"Providers"**

2. **設定 Email Provider**
   - 找到 **"Email"** provider
   - **關閉** "Confirm email" 選項
   - 點擊 **"Save"**

這樣註冊後就可以直接登入，不需要等待確認信！

---

## 🧪 Step 3: 測試系統功能

### 本地測試

1. **啟動開發伺服器**（如果還沒啟動）
   ```bash
   npm run dev
   ```

2. **前往瀏覽器**
   - 開啟 http://localhost:5173

3. **測試註冊/登入**
   - 點擊 "還沒有帳號？點此註冊"
   - 輸入電子郵件和密碼（至少 6 個字元）
   - 註冊成功後會自動登入

4. **測試 KOL 管理功能**
   - 新增 KOL
   - 編輯 KOL
   - 刪除 KOL
   - 查看儀表板

### 預期行為

- **如果資料庫已建立**：所有資料會儲存在 Supabase
- **如果資料庫未建立**：系統會顯示黃色提示，使用 mock 資料

---

## 🌐 Step 4: 部署到 Vercel

### 4.1 更新 GitHub

```bash
git add .
git commit -m "整合 Supabase 認證與資料庫"
git push origin main
```

### 4.2 設定 Vercel 環境變數

1. **前往 Vercel 專案設定**
   - https://vercel.com/dashboard
   - 選擇 "kol-management-system" 專案
   - 點擊 **"Settings"** → **"Environment Variables"**

2. **新增環境變數**（目前不需要，因為已經在程式碼中）
   - ✅ Supabase URL 和 Key 已經直接寫在程式碼中
   - ⚠️ 注意：生產環境應該使用環境變數，但目前為了快速部署先這樣

3. **重新部署**
   - Vercel 會自動偵測 GitHub 的更新並重新部署
   - 或手動觸發：**"Deployments"** → **"Redeploy"**

### 4.3 測試生產環境

1. **前往部署 URL**
   - https://kol-management-system.vercel.app

2. **測試功能**
   - 註冊新帳號
   - 登入
   - 新增 KOL
   - 確認資料是否儲存

---

## ✅ 完成檢查清單

部署完成後，確認以下項目：

- [ ] Supabase 資料庫表格已建立（6 個表格）
- [ ] Email 確認已關閉
- [ ] 本地可以成功註冊和登入
- [ ] 本地可以新增/編輯/刪除 KOL
- [ ] 資料會儲存到 Supabase（重新載入頁面後資料還在）
- [ ] 程式碼已推送到 GitHub
- [ ] Vercel 已重新部署
- [ ] 生產環境可以正常使用

---

## 🔒 安全性注意事項

### 當前狀態（開發階段）
- ✅ 使用 Supabase 認證（安全）
- ✅ Row Level Security 已啟用
- ⚠️ Supabase Keys 寫在程式碼中（anon key 是公開的，所以安全）
- ⚠️ Email 確認已關閉（方便測試）

### 生產環境建議
- 🔒 重新開啟 Email 確認
- 🔒 檢查 RLS 政策是否正確
- 🔒 定期備份資料庫
- 🔒 監控使用情況

---

## 🆘 故障排除

### 問題 1：登入後顯示「資料庫尚未建立，目前使用測試資料」

**原因**：Supabase 資料庫表格尚未建立

**解決方法**：
1. 確認已執行 `supabase-schema.sql`
2. 到 Table Editor 檢查表格是否存在
3. 重新載入頁面

### 問題 2：註冊後無法登入

**原因**：Email 確認未關閉

**解決方法**：
1. 到 Supabase → Authentication → Providers
2. 關閉 Email 的 "Confirm email"
3. 刪除測試帳號後重新註冊

### 問題 3：資料無法儲存

**原因**：RLS 政策未正確設定

**解決方法**：
1. 確認 SQL 腳本完整執行
2. 檢查瀏覽器 Console 是否有錯誤訊息
3. 到 Supabase → Authentication → Policies 檢查政策

---

## 📞 支援

如有問題，請檢查：
1. 瀏覽器 Console（F12）的錯誤訊息
2. Supabase Dashboard 的 Logs
3. `SUPABASE_SETUP_INSTRUCTIONS.md` 詳細說明

---

**最後更新**：2025-11-12
**版本**：v1.0 with Supabase Integration
