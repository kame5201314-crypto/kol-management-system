# RentSync 好住管家 - 快速開始指南

## 🚀 快速啟動

### 步驟 1: 安裝依賴
```bash
npm install
```

### 步驟 2: 設定 Supabase

#### 2.1 建立 Supabase 專案
1. 前往 [Supabase](https://supabase.com)
2. 建立新專案
3. 等待專案初始化完成

#### 2.2 執行資料庫 SQL
1. 在 Supabase Dashboard 中，點擊左側選單的 "SQL Editor"
2. 開啟 `RENTSYNC_DATABASE_SCHEMA.sql` 檔案
3. 複製所有 SQL 內容
4. 貼到 SQL Editor 並執行

#### 2.3 取得 API 金鑰
1. 點擊左側選單的 "Settings" → "API"
2. 複製 `Project URL` 和 `anon/public` key

#### 2.4 建立環境變數檔案
在專案根目錄建立 `.env` 檔案：
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 步驟 3: 啟動開發伺服器
```bash
npm run dev
```

開啟瀏覽器訪問 `http://localhost:5173`

## 📱 系統使用

### 首次登入
1. 點擊「註冊」按鈕
2. 選擇身份：房東 / 租客
3. 輸入 Email 和密碼
4. 驗證 Email（檢查收件匣）
5. 使用註冊的帳號登入

### 進入 RentSync 系統
1. 登入後在主選單點擊「RentSync 好住管家」
2. 進入 RentSync 管理平台

## 🏠 房東操作流程

### 1. 新增房源（建議先完成）
雖然目前 UI 沒有獨立的房源管理頁面，但建議直接在資料庫中新增：
```sql
INSERT INTO properties (owner_id, name, address, monthly_rent, deposit, status)
VALUES (
  'your_user_id',  -- 從 auth.users 取得
  '台北市大安區公寓 3F',
  '台北市大安區XX路XX號3樓',
  25000,
  50000,
  'vacant'
);
```

### 2. 建立租約
1. 點擊左側選單「租約管理」
2. 點擊「新增租約」
3. 填寫租約資訊：
   - 房源名稱
   - 租客姓名、Email、電話
   - 租約起始日和到期日
   - 月租金和押金
4. 點擊「儲存租約」

### 3. 管理收租
1. 點擊「收租模組」
2. 查看租金繳納狀況
3. 使用篩選器：全部 / 已繳 / 待繳 / 逾期
4. 點擊「標記已繳」確認收款
5. 點擊「發送提醒」催繳租金
6. 點擊「匯出報表」下載收租明細

### 4. 處理報修
1. 點擊「報修管理」
2. 查看待處理的報修單
3. 點擊「開始處理」接手案件
4. 點擊「新增處理記錄」留言給租客
5. 完工後點擊「標記完工」

### 5. 發送公告
1. 點擊「通知公告」
2. 點擊「發送通知」
3. 填寫標題和內容
4. 選擇類型：一般公告 / 提醒 / 緊急
5. 選擇對象：所有住戶 / 指定住戶
6. 點擊「發送通知」

## 👤 租客操作流程

### 1. 查看租約
1. 點擊「租約管理」
2. 查看自己的租約資訊
3. 查看租約到期日

### 2. 查看繳租狀況
1. 點擊「收租模組」
2. 查看本月應繳金額
3. 查看繳款期限
4. 確認已繳納的記錄

### 3. 提交報修
1. 點擊「報修管理」
2. 點擊「新增報修」
3. 填寫報修資訊：
   - 房源名稱
   - 報修類別（水電/家電/門窗等）
   - 問題描述
   - 優先等級
4. 點擊「提交報修」
5. 等待房東處理並追蹤進度

### 4. 預約服務
1. 點擊「服務市集」
2. 瀏覽可用服務（清潔、搬家、水電維修等）
3. 使用搜尋或分類篩選
4. 點擊「預約服務」
5. 填寫預約資訊並送出
6. 切換到「我的預約」查看預約記錄

### 5. 查看通知
1. 點擊「通知公告」
2. 查看社區公告
3. 查看個人提醒訊息

## 🎨 UI 功能說明

### 側邊導航欄
- 可摺疊設計（點擊選單圖標）
- 返回主選單按鈕
- 六大功能模組快速入口

### 儀表板
- 顯示即時統計數據
- 租金收繳率視覺化
- 房源入住率圓餅圖
- 快速操作按鈕

### 篩選與搜尋
- 多種篩選條件
- 即時搜尋功能
- 狀態標籤分類

## 🔧 開發提示

### 模擬數據
目前所有頁面都使用模擬數據（mockData），實際數據需要：
1. 完成 Supabase 資料庫設定
2. 將各頁面的 `TODO` 註解部分替換為實際 API 調用
3. 使用 `supabase.from('table_name')` 進行 CRUD 操作

### Supabase 客戶端
已在 `src/lib/supabaseClient.ts` 建立客戶端：
```typescript
import { supabase } from '../../lib/supabaseClient'

// 查詢資料
const { data, error } = await supabase
  .from('rent_contracts')
  .select('*')

// 新增資料
const { data, error } = await supabase
  .from('rent_contracts')
  .insert([{ ... }])

// 更新資料
const { data, error } = await supabase
  .from('rent_contracts')
  .update({ status: 'completed' })
  .eq('id', contractId)

// 刪除資料
const { data, error } = await supabase
  .from('rent_contracts')
  .delete()
  .eq('id', contractId)
```

## 📊 測試資料

### 建議測試流程
1. 建立 3-5 個房源
2. 建立 3-5 個租客資料
3. 簽訂 2-3 份租約
4. 新增幾筆租金繳納記錄
5. 提交 2-3 個報修單
6. 預約 1-2 個服務
7. 發送 2-3 則通知公告

### SQL 插入測試資料
```sql
-- 插入測試房源
INSERT INTO properties (owner_id, name, address, type, monthly_rent, deposit, status)
VALUES
  (auth.uid(), '台北市大安區公寓 3F', '台北市大安區XX路XX號3樓', '公寓', 25000, 50000, 'occupied'),
  (auth.uid(), '新北市板橋區套房 5F', '新北市板橋區XX路XX號5樓', '套房', 18000, 36000, 'occupied');

-- 插入測試租客
INSERT INTO tenants (user_id, name, email, phone)
VALUES
  (null, '王小明', 'wang@example.com', '0912-345-678'),
  (null, '李小華', 'lee@example.com', '0923-456-789');
```

## 🐛 常見問題

### Q1: 登入後看不到 RentSync 選項？
A: 確認 `App.tsx` 已正確導入 `RentSyncMain` 組件並設定路由。

### Q2: Supabase 連線錯誤？
A: 檢查 `.env` 檔案是否正確設定 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。

### Q3: RLS 政策導致無法存取資料？
A: 暫時可以在 Supabase Dashboard 中停用 RLS 進行測試，但正式環境建議啟用。

### Q4: 頁面顯示空白？
A: 開啟瀏覽器開發者工具（F12）查看 Console 錯誤訊息。

## 📞 技術支援

如遇到問題，請檢查：
1. Console 錯誤訊息
2. Network 請求是否正常
3. Supabase Dashboard 中的日誌
4. 資料庫資料是否正確建立

---

祝您使用愉快！🎉
