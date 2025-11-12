# Supabase 資料庫設定說明

## 重要：請按照以下步驟在 Supabase 建立資料庫

### 方法一：使用 SQL Editor（推薦）

1. 前往 https://supabase.com/dashboard
2. 登入並選擇您的專案（kames201314-KOL System）
3. 點擊左側選單的 **"SQL Editor"**
4. 點擊 **"New query"** 或在現有的 "Untitled query" 中
5. 複製 `supabase-schema.sql` 檔案的全部內容
6. 貼到 SQL Editor 中
7. 點擊右下角綠色的 **"Run"** 按鈕（或按 Ctrl+Enter）

### 方法二：使用 Table Editor（手動建立）

如果 SQL 執行有問題，可以在 Table Editor 中手動建立以下表格：

#### 必須建立的資料表：

1. **kols** - KOL 主表
2. **social_platforms** - 社群平台
3. **profit_shares** - 分潤記錄
4. **collaborations** - 合作專案
5. **sales_tracking** - 銷售追蹤
6. **content_performance** - 內容成效

### 驗證資料庫是否建立成功

執行後，請到左側選單的 **"Table Editor"** 檢查是否看到以下 6 個表格：
- ✅ kols
- ✅ social_platforms
- ✅ profit_shares
- ✅ collaborations
- ✅ sales_tracking
- ✅ content_performance

## 如果遇到問題

1. **權限錯誤**：確認您是專案的 Owner
2. **語法錯誤**：確認完整複製了 SQL 內容
3. **連線錯誤**：檢查網路連線

## 完成後

資料庫建立完成後，系統就可以開始使用了！所有資料都會儲存在雲端，團隊成員可以共同協作。
