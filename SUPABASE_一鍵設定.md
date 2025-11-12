# 🚀 Supabase 一鍵設定指南

## 📝 只需要 3 個步驟！

---

## Step 1: 開啟 Supabase 專案 (30秒)

### 方法 A - 使用專案網址（推薦）

1. **複製這個網址**：
   ```
   https://supabase.com/dashboard/project/rfrffizseufnhqusrpdg
   ```

2. **在瀏覽器中開啟**

3. **登入您的 Supabase 帳號**

### 方法 B - 從首頁進入

1. 前往 https://supabase.com
2. 點擊右上角「Sign in」
3. 選擇您的專案

---

## Step 2: 開啟 SQL Editor (10秒)

1. **看到左側選單**
2. **找到並點擊「SQL Editor」** （看起來像 `</>`  的圖示）
3. **點擊右上角「+ New query」或直接在編輯區輸入**

**❌ 如果看到錯誤訊息**：
- 不用理會！
- 直接點擊左側「SQL Editor」再試一次
- 或按 F5 重新整理頁面

---

## Step 3: 執行 SQL (1分鐘)

### 📁 使用檔案：`supabase-init-simple.sql`

1. **打開專案資料夾中的 `supabase-init-simple.sql` 檔案**

2. **全選並複製** (Ctrl+A → Ctrl+C)

3. **貼到 Supabase SQL Editor** (Ctrl+V)

4. **點擊右下角綠色「Run」按鈕** 或按 Ctrl+Enter

5. **等待 5-10 秒**

6. **看到「Success」** ✅

---

## ✅ 驗證是否成功

### 檢查表格是否建立：

1. **點擊左側「Table Editor」** （看起來像表格的圖示）

2. **應該看到 6 個表格**：
   - ✅ kols
   - ✅ social_platforms
   - ✅ profit_shares
   - ✅ collaborations
   - ✅ sales_tracking
   - ✅ content_performance

3. **如果看到這 6 個表格 = 成功！** 🎉

---

## 🔧 Step 4: 關閉 Email 確認 (30秒)

**為什麼**：方便測試，註冊後立即可登入

1. **點擊左側「Authentication」**

2. **點擊「Providers」**

3. **找到「Email」**

4. **關閉「Confirm email」選項**

5. **點擊「Save」**

---

## 🎉 完成！開始測試

### 本地測試：

```
開啟 http://localhost:5173
```

### 測試步驟：

1. ✅ 點擊「還沒有帳號？點此註冊」
2. ✅ 輸入電子郵件和密碼（至少 6 個字元）
3. ✅ 註冊成功後自動登入
4. ✅ 點擊「KOL 列表」→「新增 KOL」
5. ✅ 填寫資料並儲存
6. ✅ **重新整理頁面（F5）**
7. ✅ **確認資料還在** ← 這代表資料已存到 Supabase！

---

## 🆘 遇到問題？

### 問題 1: SQL Editor 顯示錯誤

**看到**：「找不到 ID 為 xxx 的程式碼片段」

**解決**：
1. 按 F5 重新整理頁面
2. 再次點擊「SQL Editor」
3. 直接在編輯區貼上 SQL

---

### 問題 2: 執行 SQL 後看到錯誤

**可能的錯誤訊息**：

#### 錯誤 A：「relation already exists」
- **意思**：表格已經存在
- **解決**：這是好消息！表格已經建立了
- **動作**：直接跳到「驗證」步驟

#### 錯誤 B：「permission denied」
- **意思**：權限不足
- **解決**：確認您是專案的 Owner
- **動作**：檢查專案設定

#### 錯誤 C：其他錯誤
- **解決**：
  1. 複製錯誤訊息
  2. 截圖傳給我
  3. 我會幫您解決

---

### 問題 3: 看不到 SQL Editor

**解決**：
1. 確認您已登入
2. 確認選擇了正確的專案
3. 嘗試重新整理頁面（F5）
4. 或使用直接網址：
   ```
   https://supabase.com/dashboard/project/rfrffizseufnhqusrpdg/sql/new
   ```

---

## 📊 設定後的系統狀態

### ✅ 已啟用的功能：

- 🔐 使用者認證（註冊/登入/登出）
- 💾 雲端資料儲存
- 👥 多人協作
- 🔒 資料安全（Row Level Security）
- ⚡ 即時同步

### 📈 可以使用的功能：

- ✅ KOL 管理（新增/編輯/刪除）
- ✅ 社群平台管理
- ✅ 分潤記錄管理
- ✅ 自動分潤提醒
- ✅ 統計儀表板

---

## 🌐 部署到 Vercel

設定完 Supabase 後，您的 Vercel 部署會自動更新：

**網址**：https://kol-management-system.vercel.app

**分享給團隊**：
- 每個人都需要註冊自己的帳號
- 所有人可以看到和編輯相同的資料
- 資料即時同步

---

## 📞 需要協助

如果按照步驟還是有問題：

1. **截圖錯誤訊息**
2. **告訴我在哪一步卡住了**
3. **我會立即幫您解決**

---

**建立日期**：2025-11-12
**預計時間**：2-3 分鐘
**難度**：⭐ 簡單

---

## 💡 小提示

- SQL 檔案很長沒關係，全部複製貼上就對了
- 執行時間可能需要 5-10 秒，耐心等待
- 成功後不會有明顯的訊息，去 Table Editor 檢查即可
- 如果真的不行，可以先用 Mock 資料測試系統
