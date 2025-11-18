# Vercel 部署操作指南（GitHub 整合方式）

## 📋 部署步驟

### 步驟 1：登入 Vercel

1. 開啟瀏覽器，前往 [https://vercel.com](https://vercel.com)
2. 點選右上角 **Sign Up** 或 **Login**
3. 選擇 **Continue with GitHub** （使用 GitHub 帳號登入）
4. 授權 Vercel 存取您的 GitHub 帳號

---

### 步驟 2：匯入 GitHub 專案

1. 登入後，點選右上角 **Add New...** → **Project**
2. 在 "Import Git Repository" 頁面中：
   - 找到您的專案：`kame5201314-crypto/kol-management-system`
   - 點選該專案旁的 **Import** 按鈕

---

### 步驟 3：配置專案設定

在 "Configure Project" 頁面：

#### 3.1 專案名稱
- **Project Name**: `kol-management-system`（可自訂）
- 這將成為您的網址：`kol-management-system.vercel.app`

#### 3.2 Framework Preset
- 確認已自動偵測為 **Vite**
- 如果沒有，請手動選擇 **Vite**

#### 3.3 Root Directory
- 保持預設：`./` （不需修改）

#### 3.4 Build 設定（通常自動偵測，不需修改）
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

### 步驟 4：設定環境變數 ⚠️ **重要**

在同一頁面，找到 **Environment Variables** 區塊：

#### 4.1 新增第一個環境變數
1. **Name**: `VITE_SUPABASE_URL`
2. **Value**: `https://rfrffizseufnhqusrpdg.supabase.co`
3. 確保勾選所有環境：
   - ✅ Production
   - ✅ Preview
   - ✅ Development

#### 4.2 新增第二個環境變數
1. 點選 **Add Another**
2. **Name**: `VITE_SUPABASE_ANON_KEY`
3. **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcmZmaXpzZXVmbmhxdXNycGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDU1MzgsImV4cCI6MjA3ODUyMTUzOH0.cCPID8j-io11M1hn1_vuUe-O5WQcOza0_kewW_XEpA8`
4. 確保勾選所有環境：
   - ✅ Production
   - ✅ Preview
   - ✅ Development

**完成後應該有 2 個環境變數**

---

### 步驟 5：開始部署

1. 確認所有設定正確
2. 點選頁面下方藍色按鈕 **Deploy**
3. 等待部署完成（約 1-3 分鐘）

---

### 步驟 6：查看部署結果

部署完成後，您會看到：

1. **🎉 成功畫面**：顯示 "Congratulations!"
2. **部署網址**：例如 `https://kol-management-system.vercel.app`
3. 點選 **Visit** 按鈕查看您的線上系統

---

## ✅ 驗證部署成功

開啟部署網址後，檢查：

- [ ] 網站可以正常開啟
- [ ] 可以看到 KOL 列表（如果資料庫有資料）
- [ ] Dashboard 頁面正常顯示
- [ ] 無 Console 錯誤（按 F12 查看）

---

## 🔄 之後如何更新系統？

**超級簡單！** 只需要：

```bash
# 1. 修改程式碼
# 2. 提交變更
git add .
git commit -m "更新功能說明"

# 3. 推送到 GitHub
git push origin main

# 4. 等待 1-2 分鐘
# → Vercel 會自動偵測並部署新版本 ✨
```

---

## 📧 部署通知設定（選用）

### 設定 Email 通知

1. 前往 Vercel Dashboard
2. 點選專案 → **Settings** → **Notifications**
3. 開啟以下通知：
   - ✅ Deployment Started
   - ✅ Deployment Ready
   - ✅ Deployment Failed

這樣每次部署都會收到 Email 通知！

---

## 🌐 自訂網域設定（選用）

如果想使用公司網域（例如：`kol.your-company.com`）：

### 步驟：

1. 前往專案 → **Settings** → **Domains**
2. 點選 **Add**
3. 輸入網域名稱（例如：`kol.yourcompany.com`）
4. 依照指示設定 DNS 記錄：

   **在您的網域服務商（例如 Cloudflare, GoDaddy）新增：**
   - Type: `CNAME`
   - Name: `kol`
   - Value: `cname.vercel-dns.com`

5. 等待 DNS 生效（約 5-60 分鐘）
6. Vercel 會自動配置 SSL 憑證

---

## 🔍 查看部署記錄

1. 前往 Vercel Dashboard
2. 選擇專案
3. 點選 **Deployments** 標籤
4. 可以看到：
   - 所有部署歷史
   - 每次部署的 Git commit
   - 部署時間和狀態
   - 可以回滾到任何版本

---

## ⚙️ 進階設定

### 查看部署日誌

如果部署失敗：
1. 進入失敗的 Deployment
2. 查看 **Build Logs**
3. 找出錯誤訊息

### 環境變數管理

之後如果要修改環境變數：
1. 專案 → **Settings** → **Environment Variables**
2. 點選變數旁的 **Edit** 或 **Delete**
3. 修改後需要 **Redeploy** 才會生效

---

## 🚨 常見問題排解

### Q1: 部署成功但網站顯示空白
**解決方式**：
- 檢查環境變數是否正確設定
- 查看瀏覽器 Console 是否有錯誤（F12）
- 確認 Supabase 資料庫連線正常

### Q2: 環境變數設定錯誤
**解決方式**：
1. Settings → Environment Variables
2. 刪除錯誤的變數
3. 重新新增正確的變數
4. 點選 Deployments → 最新部署 → 右上角 "..." → **Redeploy**

### Q3: 想要切換到不同的分支部署
**解決方式**：
1. Settings → Git
2. 修改 **Production Branch** 為其他分支名稱

### Q4: GitHub push 後沒有自動部署
**解決方式**：
1. 檢查 Settings → Git → **Connected Git Repository**
2. 確認 **Auto Deploy** 已開啟
3. 檢查 GitHub webhook 設定是否正確

---

## 📊 部署後的監控

### 查看使用統計

1. 專案 Dashboard 可以看到：
   - 每日訪問量
   - 頻寬使用量
   - 函數執行次數
   - 錯誤率

### 效能監控

- 前往 **Analytics** 標籤
- 查看頁面載入速度
- Core Web Vitals 指標

---

## ✨ 完成！

恭喜您成功部署 KOL 管理系統！

**您的系統現在：**
- ✅ 已部署到全球 CDN
- ✅ 自動 HTTPS 加密
- ✅ 支援自動更新
- ✅ 公司內部夥伴可以透過網址存取

**下一步建議：**
1. 📧 分享網址給團隊成員
2. 🔒 設定 Supabase 使用者認證（參考 DEPLOYMENT_SECURITY_GUIDE.md）
3. 🛡️ 執行 SUPABASE_RLS_SETUP.sql 啟用資料庫安全政策
4. 📝 建立第一個 admin 帳號

---

**需要協助？**
- Vercel 文件：https://vercel.com/docs
- Vercel 支援：https://vercel.com/support

祝您使用愉快！🎉
