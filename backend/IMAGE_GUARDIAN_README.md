# Image Guardian - AI 圖片侵權偵測後端

Image Guardian 的 Python 後端服務，提供電商平台爬蟲和 AI 圖片比對功能。

## 功能特色

- **AI 圖片比對引擎**
  - pHash (Perceptual Hash) - 感知哈希比對
  - ORB (Oriented FAST and Rotated BRIEF) - 特徵點比對
  - 顏色直方圖比對
  - 加權綜合相似度計算

- **電商平台爬蟲**
  - 蝦皮 (Shopee)
  - 露天拍賣 (Ruten)
  - Yahoo 拍賣

- **即時掃描**
  - WebSocket 即時進度更新
  - 背景任務處理
  - 侵權記錄管理

## 技術棧

- **框架**: FastAPI
- **圖片處理**: OpenCV, Pillow, imagehash
- **爬蟲**: Playwright (無頭瀏覽器)
- **非同步**: asyncio, httpx
- **日誌**: loguru

## 安裝步驟

### 1. 安裝 Python 依賴

```bash
cd backend
pip install -r requirements.txt
```

### 2. 安裝 Playwright 瀏覽器

```bash
playwright install chromium
```

### 3. 設定環境變數

複製 `.env.example` 為 `.env` 並設定：

```env
# Supabase (可選，用於持久化)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# Redis (可選，用於背景任務)
REDIS_URL=redis://localhost:6379/0

# 除錯模式
DEBUG=true
```

## 啟動服務

### 開發模式

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 生產模式

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

服務將在 `http://localhost:8000` 啟動。

## API 端點

### 健康檢查

```
GET /api/health
```

### 資產管理

| 方法 | 端點 | 說明 |
|------|------|------|
| POST | /api/assets/upload | 上傳圖片資產 |
| GET | /api/assets | 獲取所有資產 |
| GET | /api/assets/{id} | 獲取單一資產 |
| DELETE | /api/assets/{id} | 刪除資產 |
| POST | /api/assets/{id}/fingerprint | 重新計算指紋 |
| POST | /api/assets/compare | 比對兩張圖片 |

### 掃描任務

| 方法 | 端點 | 說明 |
|------|------|------|
| POST | /api/scans/create | 建立掃描任務 |
| GET | /api/scans | 獲取所有任務 |
| GET | /api/scans/{id} | 獲取任務詳情 |
| GET | /api/scans/{id}/progress | 獲取掃描進度 |
| GET | /api/scans/{id}/results | 獲取掃描結果 |
| DELETE | /api/scans/{id} | 取消掃描任務 |
| WS | /api/scans/{id}/ws | WebSocket 即時進度 |
| POST | /api/scans/quick-search | 快速搜尋 (不比對) |

### 侵權記錄

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | /api/violations | 獲取所有侵權記錄 |
| GET | /api/violations/{id} | 獲取單一記錄 |
| PATCH | /api/violations/{id}/whitelist | 切換白名單狀態 |
| PATCH | /api/violations/{id}/case | 關聯到案件 |
| GET | /api/violations/stats/summary | 侵權統計 |

## 使用範例

### 1. 上傳圖片資產

```bash
curl -X POST http://localhost:8000/api/assets/upload \
  -F "file=@my_image.jpg" \
  -F "tags=產品,Logo" \
  -F "description=我的產品圖片" \
  -F "brand_name=MyBrand"
```

### 2. 建立掃描任務

```bash
curl -X POST http://localhost:8000/api/scans/create \
  -H "Content-Type: application/json" \
  -d '{
    "asset_ids": ["asset-12345678"],
    "platforms": ["shopee", "ruten"],
    "keywords": ["產品名稱", "品牌"],
    "similarity_threshold": 70,
    "max_results": 100,
    "scan_depth": 5
  }'
```

### 3. 監聽掃描進度 (WebSocket)

```javascript
const ws = new WebSocket('ws://localhost:8000/api/scans/scan-12345678/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`進度: ${data.progress}% - ${data.message}`);
};
```

## 前端整合

在前端 `.env` 中設定後端 URL：

```env
VITE_IMAGE_GUARDIAN_API_URL=http://localhost:8000
```

前端會自動偵測後端狀態，如果後端不可用會降級為本地模擬模式。

## 目錄結構

```
backend/
├── main.py                  # FastAPI 應用入口
├── config.py                # 設定檔
├── requirements.txt         # Python 依賴
├── api/
│   └── routes/
│       ├── assets.py        # 資產 API
│       ├── scans.py         # 掃描 API
│       └── violations.py    # 侵權 API
└── services/
    ├── image_compare/
    │   ├── engine.py        # 比對引擎
    │   ├── phash.py         # pHash 演算法
    │   ├── orb.py           # ORB 演算法
    │   └── color.py         # 顏色比對
    └── crawler/
        ├── manager.py       # 爬蟲管理器
        ├── base.py          # 爬蟲基礎類別
        ├── shopee.py        # 蝦皮爬蟲
        ├── ruten.py         # 露天爬蟲
        └── yahoo.py         # Yahoo 爬蟲
```

## 相似度演算法說明

### pHash (權重: 40%)
感知哈希，對圖片進行 DCT 變換後計算哈希值，對縮放、壓縮等變換有較好的魯棒性。

### ORB (權重: 35%)
特徵點匹配，檢測圖片的關鍵特徵點並進行匹配，對旋轉和部分遮擋有較好的魯棒性。

### 顏色直方圖 (權重: 25%)
比對圖片的顏色分布，對於主色調相似的圖片有較好的識別效果。

### 相似度等級

| 等級 | 相似度範圍 | 說明 |
|------|-----------|------|
| exact | 90%+ | 幾乎完全相同 |
| high | 80-90% | 高度相似 |
| medium | 70-80% | 中度相似 |
| low | 60-70% | 低度相似 |

## 常見問題

### 1. Playwright 安裝失敗

```bash
# Windows 可能需要以管理員身份執行
playwright install chromium --with-deps
```

### 2. OpenCV 安裝問題

```bash
# 如果遇到問題，嘗試安裝精簡版
pip install opencv-python-headless
```

### 3. 爬蟲被封鎖

電商平台可能會封鎖自動化請求，建議：
- 降低爬取速度
- 使用代理 IP
- 添加隨機延遲
