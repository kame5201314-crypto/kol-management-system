"""
Image Guardian API 服務

AI 自動檢舉系統後端 API
提供圖片指紋計算、比對和管理功能

使用方式：
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import os
import io
import uuid
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from config import (
    API_HOST, API_PORT, DEBUG, CORS_ORIGINS,
    IMAGE_CONFIG, SIMILARITY_CONFIG
)
from services.fingerprint import FingerprintService, ImageFingerprint, SimilarityResult
from services.crawler import PlatformCrawler, ProductListing

# Gemini Vision 服務（可選）
gemini_service = None
GEMINI_AVAILABLE = False

try:
    from services.gemini_vision import GeminiVisionService
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if gemini_api_key:
        gemini_service = GeminiVisionService(gemini_api_key)
        GEMINI_AVAILABLE = True
        print("✅ Gemini Vision 服務已啟用")
    else:
        print("⚠️ GEMINI_API_KEY 未設定，Gemini 功能停用")
except ImportError as e:
    print(f"⚠️ Gemini Vision 模組載入失敗: {e}")
except Exception as e:
    print(f"⚠️ Gemini Vision 初始化失敗: {e}")

# ========== 初始化 ==========

app = FastAPI(
    title="Image Guardian API",
    description="AI 自動檢舉系統 - 圖片指紋與侵權偵測 API",
    version="1.0.0",
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None,
)

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 指紋服務實例
fingerprint_service = FingerprintService(
    hash_size=IMAGE_CONFIG.get("hash_size", 8),
    orb_features=IMAGE_CONFIG.get("orb_features", 500),
    phash_weight=SIMILARITY_CONFIG.get("phash_weight", 0.50),
    orb_weight=SIMILARITY_CONFIG.get("orb_weight", 0.35),
    color_weight=SIMILARITY_CONFIG.get("color_weight", 0.15),
)

# 爬蟲服務實例
platform_crawler = PlatformCrawler()

# 內存存儲（生產環境應使用 Supabase）
fingerprints_db: dict = {}


# ========== 數據模型 ==========

class FingerprintResponse(BaseModel):
    """指紋計算響應"""
    id: str
    phash: str
    feature_count: int
    width: int
    height: int
    created_at: str


class CompareRequest(BaseModel):
    """比對請求"""
    fingerprint_id_1: str
    fingerprint_id_2: str


class CompareResponse(BaseModel):
    """比對響應"""
    overall: float
    phash_score: float
    phash_distance: int
    orb_score: float
    orb_matches: int
    color_score: float
    level: str


class BatchCompareRequest(BaseModel):
    """批量比對請求"""
    source_fingerprint_id: str
    target_fingerprint_ids: List[str]
    threshold: float = 70.0


class BatchCompareResult(BaseModel):
    """批量比對結果"""
    target_id: str
    similarity: CompareResponse
    is_match: bool


class HealthResponse(BaseModel):
    """健康檢查響應"""
    status: str
    service: str
    version: str
    timestamp: str


# ========== API 端點 ==========

@app.get("/", response_model=HealthResponse)
async def root():
    """API 根路徑"""
    return HealthResponse(
        status="healthy",
        service="image-guardian",
        version="1.0.0",
        timestamp=datetime.now().isoformat()
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """健康檢查"""
    return HealthResponse(
        status="healthy",
        service="image-guardian",
        version="1.0.0",
        timestamp=datetime.now().isoformat()
    )


@app.post("/api/fingerprint/compute", response_model=FingerprintResponse)
async def compute_fingerprint(
    file: UploadFile = File(...),
    asset_id: Optional[str] = Form(None)
):
    """
    計算圖片指紋

    上傳圖片並計算 pHash + ORB 指紋
    """
    # 驗證文件類型
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # 驗證文件大小
    contents = await file.read()
    if len(contents) > IMAGE_CONFIG["max_file_size"]:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {IMAGE_CONFIG['max_file_size'] / 1024 / 1024}MB limit"
        )

    try:
        # 計算指紋
        fingerprint = fingerprint_service.compute_fingerprint(contents)

        # 生成 ID
        fp_id = asset_id or str(uuid.uuid4())

        # 存儲指紋（包含原圖供 AI 複查使用）
        fingerprints_db[fp_id] = {
            "fingerprint": fingerprint,
            "filename": file.filename,
            "image_bytes": contents,  # 保存原圖供 AI 比對
            "created_at": datetime.now().isoformat()
        }

        return FingerprintResponse(
            id=fp_id,
            phash=fingerprint.phash,
            feature_count=fingerprint.feature_count,
            width=fingerprint.width,
            height=fingerprint.height,
            created_at=fingerprints_db[fp_id]["created_at"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute fingerprint: {str(e)}")


@app.get("/api/fingerprint/{fingerprint_id}", response_model=FingerprintResponse)
async def get_fingerprint(fingerprint_id: str):
    """
    獲取指紋資訊
    """
    if fingerprint_id not in fingerprints_db:
        raise HTTPException(status_code=404, detail="Fingerprint not found")

    data = fingerprints_db[fingerprint_id]
    fp = data["fingerprint"]

    return FingerprintResponse(
        id=fingerprint_id,
        phash=fp.phash,
        feature_count=fp.feature_count,
        width=fp.width,
        height=fp.height,
        created_at=data["created_at"]
    )


@app.delete("/api/fingerprint/{fingerprint_id}")
async def delete_fingerprint(fingerprint_id: str):
    """
    刪除指紋
    """
    if fingerprint_id not in fingerprints_db:
        raise HTTPException(status_code=404, detail="Fingerprint not found")

    del fingerprints_db[fingerprint_id]
    return {"message": "Fingerprint deleted successfully"}


@app.post("/api/fingerprint/compare", response_model=CompareResponse)
async def compare_fingerprints(request: CompareRequest):
    """
    比對兩個指紋的相似度
    """
    if request.fingerprint_id_1 not in fingerprints_db:
        raise HTTPException(status_code=404, detail=f"Fingerprint {request.fingerprint_id_1} not found")

    if request.fingerprint_id_2 not in fingerprints_db:
        raise HTTPException(status_code=404, detail=f"Fingerprint {request.fingerprint_id_2} not found")

    fp1 = fingerprints_db[request.fingerprint_id_1]["fingerprint"]
    fp2 = fingerprints_db[request.fingerprint_id_2]["fingerprint"]

    result = fingerprint_service.compare(fp1, fp2)

    return CompareResponse(**result.to_dict())


@app.post("/api/fingerprint/compare-image", response_model=CompareResponse)
async def compare_with_image(
    fingerprint_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    將上傳的圖片與已存儲的指紋比對
    """
    if fingerprint_id not in fingerprints_db:
        raise HTTPException(status_code=404, detail=f"Fingerprint {fingerprint_id} not found")

    # 驗證文件
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()

    try:
        # 計算上傳圖片的指紋
        fp_uploaded = fingerprint_service.compute_fingerprint(contents)

        # 與存儲的指紋比對
        fp_stored = fingerprints_db[fingerprint_id]["fingerprint"]
        result = fingerprint_service.compare(fp_stored, fp_uploaded)

        return CompareResponse(**result.to_dict())

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")


@app.post("/api/fingerprint/batch-compare", response_model=List[BatchCompareResult])
async def batch_compare(request: BatchCompareRequest):
    """
    批量比對：一個源指紋對多個目標指紋
    """
    if request.source_fingerprint_id not in fingerprints_db:
        raise HTTPException(
            status_code=404,
            detail=f"Source fingerprint {request.source_fingerprint_id} not found"
        )

    source_fp = fingerprints_db[request.source_fingerprint_id]["fingerprint"]
    results = []

    for target_id in request.target_fingerprint_ids:
        if target_id not in fingerprints_db:
            continue

        target_fp = fingerprints_db[target_id]["fingerprint"]
        comparison = fingerprint_service.compare(source_fp, target_fp)

        results.append(BatchCompareResult(
            target_id=target_id,
            similarity=CompareResponse(**comparison.to_dict()),
            is_match=comparison.overall >= request.threshold
        ))

    # 按相似度降序排列
    results.sort(key=lambda x: x.similarity.overall, reverse=True)

    return results


@app.post("/api/fingerprint/find-similar")
async def find_similar(
    file: UploadFile = File(...),
    threshold: float = Query(70.0, ge=0, le=100)
):
    """
    上傳圖片並在數據庫中查找相似圖片
    """
    # 驗證文件
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()

    try:
        # 計算上傳圖片的指紋
        uploaded_fp = fingerprint_service.compute_fingerprint(contents)

        # 與所有存儲的指紋比對
        matches = []
        for fp_id, data in fingerprints_db.items():
            stored_fp = data["fingerprint"]
            result = fingerprint_service.compare(uploaded_fp, stored_fp)

            if result.overall >= threshold:
                matches.append({
                    "fingerprint_id": fp_id,
                    "filename": data.get("filename"),
                    "similarity": result.to_dict(),
                    "is_match": True
                })

        # 按相似度降序排列
        matches.sort(key=lambda x: x["similarity"]["overall"], reverse=True)

        return {
            "uploaded_fingerprint": uploaded_fp.to_dict(),
            "threshold": threshold,
            "matches_found": len(matches),
            "matches": matches
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/api/fingerprints")
async def list_fingerprints(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    列出所有指紋
    """
    all_ids = list(fingerprints_db.keys())
    paginated_ids = all_ids[skip:skip + limit]

    fingerprints = []
    for fp_id in paginated_ids:
        data = fingerprints_db[fp_id]
        fp = data["fingerprint"]
        fingerprints.append({
            "id": fp_id,
            "phash": fp.phash,
            "feature_count": fp.feature_count,
            "width": fp.width,
            "height": fp.height,
            "filename": data.get("filename"),
            "created_at": data["created_at"]
        })

    return {
        "total": len(all_ids),
        "skip": skip,
        "limit": limit,
        "fingerprints": fingerprints
    }


# ========== Gemini AI 端點 ==========

@app.get("/api/gemini/status")
async def gemini_status():
    """
    檢查 Gemini AI 服務狀態
    """
    return {
        "available": GEMINI_AVAILABLE,
        "model": "gemini-2.0-flash-exp" if GEMINI_AVAILABLE else None,
        "message": "Gemini Vision 服務已就緒" if GEMINI_AVAILABLE else "請設定 GEMINI_API_KEY 環境變數"
    }


@app.post("/api/gemini/compare")
async def gemini_compare_images(
    original: UploadFile = File(..., description="原創圖片"),
    suspect: UploadFile = File(..., description="可疑圖片"),
    context: Optional[str] = Form(None, description="額外上下文資訊")
):
    """
    使用 Gemini AI 比對兩張圖片

    這是最準確的比對方式，可識別：
    - 裁切、加浮水印、調色的圖片
    - 合成、拼接的圖片
    - 翻拍、截圖的圖片

    需要設定 GEMINI_API_KEY 環境變數
    """
    if not GEMINI_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Gemini AI 服務未啟用，請設定 GEMINI_API_KEY 環境變數"
        )

    # 驗證文件類型
    for f, name in [(original, "original"), (suspect, "suspect")]:
        if not f.content_type or not f.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"{name} 必須是圖片檔案")

    try:
        original_bytes = await original.read()
        suspect_bytes = await suspect.read()

        result = gemini_service.compare_images(
            original_bytes,
            suspect_bytes,
            context=context
        )

        return {
            "success": True,
            "ai_model": "gemini-2.0-flash-exp",
            "result": result.to_dict()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini 比對失敗: {str(e)}")


@app.post("/api/gemini/analyze")
async def gemini_analyze_image(
    file: UploadFile = File(..., description="要分析的圖片")
):
    """
    使用 Gemini AI 分析單張圖片

    回傳圖片的 AI 描述，包含：
    - 商品類型
    - 主要顏色
    - 特徵
    - 是否有浮水印
    """
    if not GEMINI_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Gemini AI 服務未啟用，請設定 GEMINI_API_KEY 環境變數"
        )

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="必須是圖片檔案")

    try:
        contents = await file.read()
        result = gemini_service.analyze_single_image(contents)

        return {
            "success": True,
            "ai_model": "gemini-2.0-flash-exp",
            "analysis": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini 分析失敗: {str(e)}")


@app.post("/api/gemini/hybrid-compare")
async def hybrid_compare(
    original: UploadFile = File(..., description="原創圖片"),
    suspect: UploadFile = File(..., description="可疑圖片"),
    use_ai_verification: bool = Query(True, description="是否使用 AI 複查")
):
    """
    混合比對模式（推薦）

    1. 先用 pHash + ORB 快速初篩
    2. 如果相似度 >= 70%，再用 Gemini AI 複查確認

    這樣可以：
    - 節省 API 成本（只對可疑案例呼叫 AI）
    - 提高準確度（AI 確認減少誤判）
    """
    # 驗證文件
    for f, name in [(original, "original"), (suspect, "suspect")]:
        if not f.content_type or not f.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"{name} 必須是圖片檔案")

    try:
        original_bytes = await original.read()
        suspect_bytes = await suspect.read()

        # Step 1: pHash + ORB 初篩
        fp_original = fingerprint_service.compute_fingerprint(original_bytes)
        fp_suspect = fingerprint_service.compute_fingerprint(suspect_bytes)
        fingerprint_result = fingerprint_service.compare(fp_original, fp_suspect)

        response = {
            "fingerprint_comparison": fingerprint_result.to_dict(),
            "ai_verification": None,
            "final_verdict": {
                "is_infringement": False,
                "confidence": 0,
                "method": "fingerprint_only"
            }
        }

        # Step 2: 如果初篩相似度 >= 70% 且啟用 AI，進行複查
        if use_ai_verification and GEMINI_AVAILABLE and fingerprint_result.overall >= 70:
            ai_result = gemini_service.compare_images(original_bytes, suspect_bytes)
            response["ai_verification"] = ai_result.to_dict()

            # 綜合判斷
            response["final_verdict"] = {
                "is_infringement": ai_result.is_infringement,
                "confidence": ai_result.confidence,
                "similarity_score": (fingerprint_result.overall * 0.4 + ai_result.similarity_score * 0.6),
                "method": "hybrid_fingerprint_ai"
            }
        elif fingerprint_result.overall >= 85:
            # 如果 AI 不可用但指紋相似度很高
            response["final_verdict"] = {
                "is_infringement": True,
                "confidence": fingerprint_result.overall,
                "similarity_score": fingerprint_result.overall,
                "method": "fingerprint_high_confidence"
            }

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"混合比對失敗: {str(e)}")


# ========== 爬蟲端點 ==========

class CrawlSearchRequest(BaseModel):
    """爬蟲搜尋請求"""
    keyword: str
    platforms: List[str] = ["shopee", "ruten"]
    max_pages: int = 3


class CrawlUrlRequest(BaseModel):
    """爬蟲網址請求"""
    url: str
    max_items: int = 100


class FullScanRequest(BaseModel):
    """完整掃描請求"""
    original_fingerprint_id: str
    search_keyword: Optional[str] = None
    crawl_urls: List[str] = []
    platforms: List[str] = ["shopee"]
    max_pages: int = 2
    similarity_threshold: float = 70.0
    use_ai_verification: bool = True


@app.post("/api/crawler/search")
async def crawler_search(request: CrawlSearchRequest):
    """
    多平台關鍵字搜尋

    搜尋蝦皮、露天等平台的商品列表
    回傳商品資訊包含圖片網址
    """
    try:
        results = await platform_crawler.search(
            keyword=request.keyword,
            platforms=request.platforms,
            max_pages=request.max_pages
        )

        # 轉換為 JSON 可序列化格式
        response = {}
        for platform, listings in results.items():
            response[platform] = [listing.to_dict() for listing in listings]

        total_count = sum(len(v) for v in response.values())

        return {
            "success": True,
            "keyword": request.keyword,
            "platforms": request.platforms,
            "total_count": total_count,
            "results": response
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"搜尋失敗: {str(e)}")


@app.post("/api/crawler/crawl-url")
async def crawler_crawl_url(request: CrawlUrlRequest):
    """
    爬取指定網址

    支援：
    - 蝦皮店舖: https://shopee.tw/shop/123456
    - 蝦皮商品: https://shopee.tw/xxx-i.123.456
    - 露天店舖: https://class.ruten.com.tw/user/xxx
    """
    try:
        listings = await platform_crawler.crawl_url(request.url)

        return {
            "success": True,
            "url": request.url,
            "count": len(listings),
            "listings": [listing.to_dict() for listing in listings[:request.max_items]]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"爬取失敗: {str(e)}")


@app.get("/api/crawler/platforms")
async def get_supported_platforms():
    """
    取得支援的平台列表
    """
    return {
        "platforms": [
            {
                "id": "shopee",
                "name": "蝦皮購物",
                "domain": "shopee.tw",
                "features": ["關鍵字搜尋", "店舖爬取", "單一商品爬取"]
            },
            {
                "id": "ruten",
                "name": "露天拍賣",
                "domain": "ruten.com.tw",
                "features": ["關鍵字搜尋", "店舖爬取"]
            }
        ]
    }


@app.post("/api/scan/full")
async def full_scan(request: FullScanRequest):
    """
    完整掃描流程（推薦）

    1. 使用關鍵字搜尋或爬取指定網址
    2. 下載商品圖片
    3. 計算指紋並與原創圖片比對
    4. 可疑案例 (>=70%) 使用 AI 複查
    5. 回傳侵權商品列表（含購買網址）

    這是一站式掃描，適合快速找出侵權商品
    """
    import httpx

    # 驗證原創指紋存在
    if request.original_fingerprint_id not in fingerprints_db:
        raise HTTPException(
            status_code=404,
            detail=f"原創指紋 {request.original_fingerprint_id} 不存在"
        )

    original_fp = fingerprints_db[request.original_fingerprint_id]["fingerprint"]

    # 收集商品列表
    all_listings = []

    try:
        # 方式 1: 關鍵字搜尋
        if request.search_keyword:
            search_results = await platform_crawler.search(
                keyword=request.search_keyword,
                platforms=request.platforms,
                max_pages=request.max_pages
            )
            for listings in search_results.values():
                all_listings.extend(listings)

        # 方式 2: 指定網址爬取
        for url in request.crawl_urls:
            listings = await platform_crawler.crawl_url(url)
            all_listings.extend(listings)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"爬取失敗: {str(e)}")

    # 比對每個商品圖片
    infringement_results = []
    scan_summary = {
        "total_scanned": 0,
        "fingerprint_matches": 0,
        "ai_verified": 0,
        "confirmed_infringements": 0
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        for listing in all_listings:
            if not listing.image_url:
                continue

            scan_summary["total_scanned"] += 1

            try:
                # 下載圖片
                img_response = await client.get(listing.image_url)
                if img_response.status_code != 200:
                    continue

                image_bytes = img_response.content

                # 計算指紋並比對
                suspect_fp = fingerprint_service.compute_fingerprint(image_bytes)
                comparison = fingerprint_service.compare(original_fp, suspect_fp)

                # 如果相似度達標
                if comparison.overall >= request.similarity_threshold:
                    scan_summary["fingerprint_matches"] += 1

                    result = {
                        "listing": listing.to_dict(),
                        "fingerprint_similarity": comparison.to_dict(),
                        "ai_verification": None,
                        "is_confirmed_infringement": False
                    }

                    # AI 複查
                    if request.use_ai_verification and GEMINI_AVAILABLE:
                        try:
                            original_bytes = fingerprints_db[request.original_fingerprint_id].get("image_bytes")
                            if original_bytes:
                                ai_result = gemini_service.compare_images(original_bytes, image_bytes)
                                result["ai_verification"] = ai_result.to_dict()
                                result["is_confirmed_infringement"] = ai_result.is_infringement
                                scan_summary["ai_verified"] += 1

                                if ai_result.is_infringement:
                                    scan_summary["confirmed_infringements"] += 1
                        except Exception:
                            # AI 失敗時以指紋為準
                            if comparison.overall >= 85:
                                result["is_confirmed_infringement"] = True
                                scan_summary["confirmed_infringements"] += 1
                    elif comparison.overall >= 85:
                        result["is_confirmed_infringement"] = True
                        scan_summary["confirmed_infringements"] += 1

                    infringement_results.append(result)

            except Exception as e:
                continue  # 跳過無法處理的圖片

    # 按相似度排序
    infringement_results.sort(
        key=lambda x: x["fingerprint_similarity"]["overall"],
        reverse=True
    )

    return {
        "success": True,
        "scan_summary": scan_summary,
        "threshold": request.similarity_threshold,
        "ai_enabled": request.use_ai_verification and GEMINI_AVAILABLE,
        "infringement_results": infringement_results
    }


# ========== 啟動 ==========

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=API_HOST,
        port=API_PORT,
        reload=DEBUG
    )
