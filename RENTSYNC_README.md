# RentSync 好住管家 - 租賃管理平台

一個全方位的租賃管理系統，為房東和租客提供便捷的租賃服務。

## 功能模組

### 1. 儀表板 (Dashboard)
- 📊 租金收繳狀況總覽（本月應收、已收、待收、逾期）
- 🏠 房源入住率與空置狀況
- 🔧 報修單進度追蹤
- 📈 數據視覺化呈現
- ⚡ 快速操作入口

### 2. 租約管理 (Rent Contracts)
- ✍️ 創建新租約（房源、租客、期間、金額）
- 📄 自動生成租約 PDF
- 📧 Email 發送租約給租客
- 🔔 到期提醒功能
- 📜 歷史租約記錄管理
- 🏷️ 租約狀態標籤（有效中、即將到期、已到期）

### 3. 收租模組 (Rent Collection)
- 💰 租金繳納狀況追蹤
- 📅 自動產生每月繳租記錄
- 📧 提醒通知（Email / LINE / SMS）
- 💳 多元收款方式（轉帳、信用卡、超商條碼）
- 📊 帳務報表匯出（CSV / PDF）
- 🔍 篩選功能（全部、已繳、待繳、逾期）

### 4. 報修管理 (Repair Requests)
- 📝 報修單建立與追蹤
- 📸 上傳照片說明問題
- 🔧 指派維修廠商
- 💬 雙邊留言溝通功能
- 📊 維修進度狀態（待處理、處理中、已完工）
- ⭐ 維修服務評價系統
- 🏷️ 優先等級標記（一般、普通、緊急）

### 5. 生活服務市集 (Service Marketplace)
- 🛍️ 服務廠商列表（清潔、搬家、水電、園藝等）
- ⭐ 評分與評價系統
- 🔍 搜尋與分類篩選
- 📅 線上預約服務
- 📋 預約記錄管理
- 💬 服務廠商聯絡資訊

### 6. 通知公告 (Notifications)
- 📢 社區公告發布（停水停電、活動通知等）
- 👤 個人訊息推播（租金提醒、租約通知）
- 🎯 目標受眾選擇（所有住戶 / 指定住戶）
- 🚨 通知類型分級（一般公告、提醒通知、緊急通知）
- 📊 閱讀狀態追蹤

## 技術架構

### 前端技術
- **框架**: React 18 + TypeScript
- **路由**: React Router DOM v7
- **樣式**: Tailwind CSS
- **圖標**: Lucide React
- **建構工具**: Vite

### 後端服務
- **數據庫**: Supabase (PostgreSQL)
- **認證**: Supabase Auth
- **儲存**: Supabase Storage
- **即時更新**: Supabase Realtime

### 資料庫結構
詳見 `RENTSYNC_DATABASE_SCHEMA.sql` 文件

主要資料表：
- `properties` - 房源管理
- `tenants` - 租客資料
- `rent_contracts` - 租約記錄
- `rent_payments` - 租金繳納
- `repair_requests` - 報修記錄
- `repair_comments` - 報修留言
- `service_providers` - 服務廠商
- `service_orders` - 服務預約
- `notifications` - 通知公告
- `notification_recipients` - 通知接收記錄

## 安裝與設定

### 1. 安裝依賴
```bash
npm install
```

### 2. 設定 Supabase
1. 在 Supabase 建立新專案
2. 執行 `RENTSYNC_DATABASE_SCHEMA.sql` 建立資料表
3. 建立 `.env` 文件並設定：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 啟動開發伺服器
```bash
npm run dev
```

### 4. 建構生產版本
```bash
npm run build
```

## 使用流程

### 房東端
1. **登入系統** - 使用 Email/密碼登入
2. **建立房源** - 新增房源資訊（地址、坪數、租金等）
3. **新增租客** - 建立租客資料
4. **簽訂租約** - 創建租約並生成 PDF
5. **收租管理** - 追蹤租金繳納狀況，發送提醒
6. **處理報修** - 接收報修單，指派廠商處理
7. **發送公告** - 向住戶發布重要通知

### 租客端
1. **登入系統** - 使用 Email/密碼登入
2. **查看租約** - 檢視租約內容與到期日
3. **繳納租金** - 查看應繳金額與繳款方式
4. **提交報修** - 拍照說明問題，提交報修單
5. **預約服務** - 瀏覽服務市集，預約清潔、搬家等服務
6. **接收通知** - 查看社區公告與個人訊息

## 進階功能（待實作）

### 即將推出
- [ ] PDF 租約自動生成
- [ ] Email / LINE / SMS 通知整合
- [ ] 超商條碼收款整合
- [ ] 圖片上傳功能
- [ ] 數據分析報表
- [ ] 租客評價系統
- [ ] 多語言支援
- [ ] 行動 APP

### 未來規劃
- [ ] AI 智能客服
- [ ] 自動化租金催繳
- [ ] 智能維修調度
- [ ] 區塊鏈租約存證
- [ ] IoT 智能家居整合

## 資料安全

### Row Level Security (RLS)
- 所有資料表啟用 RLS 保護
- 房東只能存取自己的房源資料
- 租客只能查看自己的租約和繳租記錄
- 報修資料僅限房東與相關租客存取

### 資料備份
- Supabase 自動每日備份
- 支援時間點恢復 (PITR)

## 系統需求

### 瀏覽器支援
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 伺服器需求
- Node.js 18+
- PostgreSQL 14+ (透過 Supabase)

## 授權

© 2025 RentSync Platform. All rights reserved.

## 聯絡我們

如有任何問題或建議，請聯繫：
- Email: support@rentsync.com
- 電話: 0800-123-456

## 更新日誌

### Version 1.0.0 (2025-01-18)
- ✨ 初版發布
- ✅ 完成六大核心功能模組
- 🗄️ 建立完整資料庫結構
- 🔒 實作 RLS 安全政策
- 📱 響應式設計支援各種裝置

---

**RentSync 好住管家** - 讓租賃管理更簡單！
