# 🚀 KOL 管理系統 - 快速設定指南

## ⚡ 5 分鐘快速設定

### 步驟 1：建立資料庫（2 分鐘）

1. 前往 https://supabase.com/dashboard
2. 選擇您的專案
3. 點擊 **SQL Editor**
4. 複製貼上 `supabase-schema.sql` 的內容
5. 點擊 **Run**

### 步驟 2：關閉 Email 確認（1 分鐘）

1. 點擊 **Authentication** → **Providers**
2. 找到 **Email**，關閉 "Confirm email"
3. 點擊 **Save**

### 步驟 3：測試系統（2 分鐘）

1. 開啟 http://localhost:5173（開發伺服器應該正在運行）
2. 點擊「還沒有帳號？點此註冊」
3. 註冊並登入
4. 測試新增 KOL

---

## 🎯 目前系統狀態

### ✅ 已完成的功能

1. **認證系統**
   - ✅ 使用者註冊
   - ✅ 使用者登入
   - ✅ 使用者登出
   - ✅ 會話管理

2. **KOL 管理**
   - ✅ 查看 KOL 列表
   - ✅ 新增 KOL
   - ✅ 編輯 KOL
   - ✅ 刪除 KOL
   - ✅ 社群平台管理
   - ✅ 分潤記錄管理

3. **儀表板**
   - ✅ 統計數據展示
   - ✅ 表現最佳 KOL
   - ✅ 分潤提醒（15天前通知）

4. **資料儲存**
   - ✅ Supabase 雲端資料庫
   - ✅ 自動降級至 mock 資料（當資料庫未建立時）
   - ✅ Row Level Security 安全政策

### ⏳ 待完成的功能

1. **合作管理整合 Supabase**（目前使用 mock 資料）
2. **銷售追蹤整合 Supabase**（目前使用 mock 資料）

---

## 📂 專案結構

```
dealer-management-system/
├── src/
│   ├── components/          # React 組件
│   │   ├── Login.tsx       # 登入/註冊頁面（已整合 Supabase）
│   │   ├── KOLManagementSystem.tsx  # 主系統（已整合 Supabase）
│   │   ├── KOLList.tsx     # KOL 列表
│   │   ├── KOLForm.tsx     # KOL 表單
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx  # 認證上下文（Supabase Auth）
│   ├── services/
│   │   └── kolService.ts    # KOL 資料服務（Supabase 操作）
│   ├── lib/
│   │   └── supabase.ts      # Supabase 客戶端配置
│   └── types/
│       └── kol.ts           # TypeScript 類型定義
├── supabase-schema.sql      # 資料庫結構 SQL
├── DEPLOYMENT_GUIDE.md      # 完整部署指南
└── README_SETUP.md          # 本檔案

```

---

## 🔑 重要檔案說明

### `supabase-schema.sql`
- 包含所有資料庫表格的建立腳本
- 包含 Row Level Security 政策
- 包含索引和觸發器

### `src/lib/supabase.ts`
- Supabase 客戶端配置
- 包含您的專案 URL 和 Anon Key

### `src/contexts/AuthContext.tsx`
- 認證狀態管理
- 提供 signIn、signUp、signOut 函數

### `src/services/kolService.ts`
- 所有 KOL 相關的資料庫操作
- getAllKOLs、createKOL、updateKOL、deleteKOL

---

## 🌐 部署資訊

### 當前部署
- **平台**：Vercel
- **URL**：https://kol-management-system.vercel.app
- **資料庫**：Supabase PostgreSQL
- **認證**：Supabase Auth

### 更新部署

```bash
git add .
git commit -m "你的提交訊息"
git push origin main
```

Vercel 會自動偵測更新並重新部署！

---

## 💡 使用提示

### 首次使用

1. **註冊帳號**
   - 使用真實的電子郵件
   - 密碼至少 6 個字元
   - 註冊後立即可登入（已關閉 Email 確認）

2. **新增 KOL**
   - 點擊「KOL 列表」
   - 點擊「新增 KOL」
   - 填寫資料後儲存

3. **分潤管理**
   - 在 KOL 編輯頁面可新增分潤記錄
   - 系統會自動計算結束日期
   - 結束日期前 15 天會顯示提醒鈴鐺

### 多人協作

- ✅ 每個使用者需要註冊自己的帳號
- ✅ 所有使用者可以看到和編輯所有資料（共享資料）
- ✅ 資料即時同步（重新載入頁面即可看到最新資料）

---

## 🐛 常見問題

**Q: 顯示「資料庫尚未建立」怎麼辦？**
A: 請完成步驟 1 - 執行 `supabase-schema.sql`

**Q: 註冊後無法登入？**
A: 請完成步驟 2 - 關閉 Email 確認

**Q: 資料沒有儲存？**
A: 檢查瀏覽器 Console (F12) 是否有錯誤訊息

**Q: 想要重置資料？**
A: 到 Supabase → Table Editor → 選擇表格 → 刪除所有資料

---

## 📱 聯絡方式

如有問題，請查看 `DEPLOYMENT_GUIDE.md` 獲取更詳細的說明！

---

**建立日期**：2025-11-12
**系統版本**：1.0.0 with Supabase
**作者**：Claude Code
