"""
Scans API Routes
掃描任務 API
"""
import asyncio
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from loguru import logger

from services.crawler import CrawlerManager

router = APIRouter()

# In-memory storage
scans_db = {}
scan_progress = {}


class ScanConfig(BaseModel):
    """掃描設定"""
    asset_ids: List[str]
    platforms: List[str]
    keywords: List[str]
    similarity_threshold: float = 70
    max_results: int = 100
    scan_depth: int = 5


class ScanTaskResponse(BaseModel):
    """掃描任務回應"""
    id: str
    user_id: str
    type: str
    status: str
    config: dict
    progress: int
    total_scanned: int
    violations_found: int
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class ScanProgressUpdate(BaseModel):
    """掃描進度更新"""
    task_id: str
    progress: int
    message: str
    scanned: int
    violations: int


# WebSocket connections for real-time progress
active_connections: dict = {}


async def send_progress_update(task_id: str, progress: int, message: str, scanned: int, violations: int):
    """Send progress update to WebSocket clients"""
    if task_id in active_connections:
        try:
            await active_connections[task_id].send_json({
                "task_id": task_id,
                "progress": progress,
                "message": message,
                "scanned": scanned,
                "violations": violations
            })
        except Exception as e:
            logger.debug(f"WebSocket send error: {e}")


async def run_scan(task_id: str, config: ScanConfig, asset_images: List[str]):
    """Background task to run scan"""
    try:
        # Update status to running
        scans_db[task_id]["status"] = "running"
        scans_db[task_id]["started_at"] = datetime.now().isoformat()

        crawler_manager = CrawlerManager()

        async def on_progress(progress: int, message: str):
            scans_db[task_id]["progress"] = progress
            scan_progress[task_id] = {
                "progress": progress,
                "message": message,
                "scanned": scans_db[task_id]["total_scanned"],
                "violations": scans_db[task_id]["violations_found"]
            }
            await send_progress_update(
                task_id, progress, message,
                scans_db[task_id]["total_scanned"],
                scans_db[task_id]["violations_found"]
            )

        # Run scan
        result = await crawler_manager.scan_with_comparison(
            asset_images=asset_images,
            keywords=config.keywords,
            platforms=config.platforms,
            similarity_threshold=config.similarity_threshold,
            max_pages=config.scan_depth,
            max_results_per_platform=config.max_results // len(config.platforms),
            on_progress=on_progress
        )

        # Update scan record
        scans_db[task_id]["status"] = "completed"
        scans_db[task_id]["completed_at"] = datetime.now().isoformat()
        scans_db[task_id]["total_scanned"] = result["total_scanned"]
        scans_db[task_id]["violations_found"] = result["violations_found"]
        scans_db[task_id]["progress"] = 100
        scans_db[task_id]["results"] = result

        logger.info(f"Scan {task_id} completed: {result['violations_found']} violations found")

    except Exception as e:
        logger.error(f"Scan {task_id} failed: {e}")
        scans_db[task_id]["status"] = "failed"
        scans_db[task_id]["error"] = str(e)


@router.post("/create", response_model=ScanTaskResponse)
async def create_scan(config: ScanConfig, background_tasks: BackgroundTasks):
    """
    Create a new scan task
    建立新的掃描任務
    """
    try:
        # Validate config
        if not config.asset_ids:
            raise HTTPException(status_code=400, detail="請選擇至少一個資產")
        if not config.platforms:
            raise HTTPException(status_code=400, detail="請選擇至少一個平台")
        if not config.keywords:
            raise HTTPException(status_code=400, detail="請輸入搜尋關鍵字")

        # Create task
        task_id = f"scan-{uuid.uuid4().hex[:8]}"
        now = datetime.now().isoformat()

        task = {
            "id": task_id,
            "user_id": "user-001",
            "type": "hybrid",
            "status": "queued",
            "config": config.dict(),
            "progress": 0,
            "total_scanned": 0,
            "violations_found": 0,
            "created_at": now,
            "started_at": None,
            "completed_at": None
        }

        scans_db[task_id] = task

        # Get asset images (from assets_db)
        from .assets import assets_db
        asset_images = []
        for asset_id in config.asset_ids:
            asset = assets_db.get(asset_id)
            if asset:
                # Use the stored file
                asset_images.append(asset["original_url"])

        if not asset_images:
            # For testing, allow without real assets
            logger.warning(f"No asset images found for task {task_id}")

        # Start background scan
        background_tasks.add_task(run_scan, task_id, config, asset_images)

        logger.info(f"Scan task created: {task_id}")

        return ScanTaskResponse(**task)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create scan error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[ScanTaskResponse])
async def get_scans(status: Optional[str] = None):
    """
    Get all scan tasks
    取得所有掃描任務
    """
    tasks = list(scans_db.values())

    if status:
        tasks = [t for t in tasks if t.get('status') == status]

    return [ScanTaskResponse(**t) for t in tasks]


@router.get("/{task_id}", response_model=ScanTaskResponse)
async def get_scan(task_id: str):
    """
    Get scan task by ID
    根據 ID 取得掃描任務
    """
    task = scans_db.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="掃描任務不存在")

    return ScanTaskResponse(**task)


@router.get("/{task_id}/progress")
async def get_scan_progress(task_id: str):
    """
    Get scan progress
    取得掃描進度
    """
    task = scans_db.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="掃描任務不存在")

    progress = scan_progress.get(task_id, {
        "progress": task["progress"],
        "message": "等待中...",
        "scanned": task["total_scanned"],
        "violations": task["violations_found"]
    })

    return progress


@router.get("/{task_id}/results")
async def get_scan_results(task_id: str):
    """
    Get scan results
    取得掃描結果
    """
    task = scans_db.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="掃描任務不存在")

    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="掃描尚未完成")

    return task.get("results", {})


@router.delete("/{task_id}")
async def cancel_scan(task_id: str):
    """
    Cancel a scan task
    取消掃描任務
    """
    task = scans_db.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="掃描任務不存在")

    if task["status"] == "completed":
        raise HTTPException(status_code=400, detail="已完成的任務無法取消")

    scans_db[task_id]["status"] = "cancelled"

    return {"message": "掃描任務已取消", "id": task_id}


@router.websocket("/{task_id}/ws")
async def websocket_progress(websocket: WebSocket, task_id: str):
    """
    WebSocket for real-time scan progress
    即時掃描進度 WebSocket
    """
    await websocket.accept()
    active_connections[task_id] = websocket

    try:
        while True:
            # Keep connection alive and wait for disconnect
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")

    except WebSocketDisconnect:
        if task_id in active_connections:
            del active_connections[task_id]
        logger.debug(f"WebSocket disconnected for task {task_id}")


@router.post("/quick-search")
async def quick_search(
    keyword: str,
    platforms: List[str] = ["shopee"],
    max_results: int = 20
):
    """
    Quick search without comparison (for testing)
    快速搜尋（不進行比對）
    """
    try:
        crawler_manager = CrawlerManager()
        results = await crawler_manager.search_all_platforms(
            keyword=keyword,
            platforms=platforms,
            max_pages=2,
            max_results_per_platform=max_results
        )

        all_listings = []
        for platform, result in results.items():
            for listing in result.listings:
                all_listings.append({
                    **listing.__dict__,
                    "platform": platform
                })

        return {
            "keyword": keyword,
            "platforms": platforms,
            "total_found": len(all_listings),
            "listings": all_listings[:max_results]
        }

    except Exception as e:
        logger.error(f"Quick search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
