# 部署前檢查清單

## 專案資訊
- **Project Name**: multi-platform-sync
- **Supabase Project ID**: `[YOUR_PROJECT_ID]`
- **Vercel Project**: multi-platform-sync
- **Region**: Northeast Asia (Tokyo)

## 部署前確認
- [ ] 確認 .env.local 存在且包含正確的 Project ID
- [ ] 執行 `npm run verify-env` 通過
- [ ] 確認 Vercel 環境變數與本地一致（vercel env pull）
- [ ] 資料庫遷移已執行
- [ ] Storage bucket 已建立
- [ ] npm run build 本地測試通過

## 部署後驗證
- [ ] 網站可正常訪問
- [ ] 登入功能正常
- [ ] 資料讀取正確（非其他專案資料）
- [ ] 主要功能測試通過
  - [ ] 商品列表正常顯示
  - [ ] 平台連接頁面正常
  - [ ] 庫存管理正常
  - [ ] 訂單管理正常
  - [ ] 儀表板數據正確

## 環境變數清單
```
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
```

## 資料庫 Schema
Schema 名稱: `sync`

### 資料表
- products - 商品資料
- platform_connections - 平台連接設定
- product_listings - 商品上架紀錄
- inventory - 庫存資料
- inventory_logs - 庫存異動紀錄
- orders - 訂單資料
- order_items - 訂單商品明細
- sync_jobs - 同步任務紀錄
- categories - 商品分類

## 緊急回滾步驟
1. 在 Vercel 儀表板中選擇上一個成功的部署
2. 點擊 "Promote to Production"
3. 確認回滾成功後檢查網站功能

## 聯絡資訊
- 技術支援: support@example.com
- 緊急聯絡: +886-2-1234-5678
