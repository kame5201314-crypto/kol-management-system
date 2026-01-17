# 部署前檢查清單

## 專案資訊
- **Project Name**: dealer-management-platform
- **Supabase Project ID**: `[待填入]`
- **Vercel Project**: dealer-management-platform
- **Region**: Northeast Asia (Tokyo)
- **Framework**: Next.js 14+ (App Router)

## 環境變數設定

### 必要的環境變數
```bash
# Supabase 公開金鑰
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Supabase Service Role（僅伺服器端）
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 環境變數設定步驟
1. 複製 `.env.example` 為 `.env.local`
2. 填入正確的 Supabase 專案資訊
3. 在 `.env.local` 開頭加上專案資訊註解
4. 更新 `scripts/verify-env.ts` 中的 `EXPECTED_PROJECT_ID`

## 部署前確認

### 環境設定
- [ ] 確認 `.env.local` 存在且包含正確的 Project ID
- [ ] 執行 `npm run verify-env` 通過
- [ ] 確認 Vercel 環境變數與本地一致（`vercel env pull`）

### 資料庫設定
- [ ] 資料庫遷移已執行（`supabase/schema.sql`）
- [ ] RLS 政策已正確設定
- [ ] 必要的索引已建立

### 程式碼檢查
- [ ] `npm run lint` 無錯誤
- [ ] `npm run type-check` 無錯誤
- [ ] `npm run build` 本地測試通過

### 安全性檢查
- [ ] 所有 API 操作都有 org_id 過濾
- [ ] 敏感資訊未硬編碼在程式碼中
- [ ] `.gitignore` 包含所有敏感檔案

## 部署步驟

```bash
# 1. 連結 Vercel 專案
cd src/dealer-platform
vercel link

# 2. 拉取環境變數
vercel env pull .env.local

# 3. 本地測試
npm run build
npm run start

# 4. 部署到 Vercel
git add .
git commit -m "Deploy dealer-management-platform"
git push origin main
```

## 部署後驗證

### 功能測試
- [ ] 網站可正常訪問
- [ ] 首頁正確顯示
- [ ] 供應商管理模組正常運作
- [ ] 採購單管理模組正常運作
- [ ] 交貨追蹤模組正常運作
- [ ] 報價單管理模組正常運作
- [ ] 儀表板數據正確顯示

### 資料隔離驗證
- [ ] 資料讀取正確（非其他專案資料）
- [ ] org_id 過濾正常運作
- [ ] 軟刪除功能正常

### 效能測試
- [ ] 頁面載入時間 < 3 秒
- [ ] 無明顯的 UI 延遲

## 回滾計畫

如果部署後發現問題：

1. **快速回滾**: 在 Vercel Dashboard 中選擇上一個成功的部署
2. **資料庫回滾**: 使用 Supabase 的時間點還原功能
3. **通知相關人員**: 更新團隊關於問題狀態

## 聯絡資訊

- **技術負責人**: [待填入]
- **緊急聯絡**: [待填入]

---

最後更新: 2026-01-17
