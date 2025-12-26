"""
Violations API Routes
侵權記錄 API
"""
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from loguru import logger

router = APIRouter()

# In-memory storage
violations_db = {}


class ViolationCreate(BaseModel):
    """建立侵權記錄"""
    task_id: str
    asset_id: str
    platform: str
    listing: dict
    similarity: dict


class ViolationResponse(BaseModel):
    """侵權記錄回應"""
    id: str
    task_id: str
    asset_id: str
    platform: str
    listing: dict
    similarity: dict
    detected_at: str
    is_whitelisted: bool
    case_id: Optional[str] = None
    created_at: str


@router.post("/", response_model=ViolationResponse)
async def create_violation(violation: ViolationCreate):
    """
    Create a violation record
    建立侵權記錄
    """
    try:
        violation_id = f"vio-{uuid.uuid4().hex[:8]}"
        now = datetime.now().isoformat()

        record = {
            "id": violation_id,
            "task_id": violation.task_id,
            "asset_id": violation.asset_id,
            "platform": violation.platform,
            "listing": violation.listing,
            "similarity": violation.similarity,
            "detected_at": now,
            "is_whitelisted": False,
            "case_id": None,
            "created_at": now
        }

        violations_db[violation_id] = record

        logger.info(f"Violation created: {violation_id}")

        return ViolationResponse(**record)

    except Exception as e:
        logger.error(f"Create violation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[ViolationResponse])
async def get_violations(
    task_id: Optional[str] = None,
    asset_id: Optional[str] = None,
    platform: Optional[str] = None,
    has_case: Optional[bool] = None
):
    """
    Get violations with optional filters
    取得侵權記錄（可篩選）
    """
    violations = list(violations_db.values())

    if task_id:
        violations = [v for v in violations if v["task_id"] == task_id]
    if asset_id:
        violations = [v for v in violations if v["asset_id"] == asset_id]
    if platform:
        violations = [v for v in violations if v["platform"] == platform]
    if has_case is not None:
        if has_case:
            violations = [v for v in violations if v.get("case_id")]
        else:
            violations = [v for v in violations if not v.get("case_id")]

    return [ViolationResponse(**v) for v in violations]


@router.get("/{violation_id}", response_model=ViolationResponse)
async def get_violation(violation_id: str):
    """
    Get violation by ID
    根據 ID 取得侵權記錄
    """
    violation = violations_db.get(violation_id)
    if not violation:
        raise HTTPException(status_code=404, detail="侵權記錄不存在")

    return ViolationResponse(**violation)


@router.patch("/{violation_id}/whitelist")
async def toggle_whitelist(violation_id: str, is_whitelisted: bool):
    """
    Toggle whitelist status
    切換白名單狀態
    """
    violation = violations_db.get(violation_id)
    if not violation:
        raise HTTPException(status_code=404, detail="侵權記錄不存在")

    violations_db[violation_id]["is_whitelisted"] = is_whitelisted

    return {"message": "已更新白名單狀態", "is_whitelisted": is_whitelisted}


@router.patch("/{violation_id}/case")
async def link_to_case(violation_id: str, case_id: str):
    """
    Link violation to a case
    將侵權記錄連結到案件
    """
    violation = violations_db.get(violation_id)
    if not violation:
        raise HTTPException(status_code=404, detail="侵權記錄不存在")

    violations_db[violation_id]["case_id"] = case_id

    return {"message": "已連結到案件", "case_id": case_id}


@router.delete("/{violation_id}")
async def delete_violation(violation_id: str):
    """
    Delete a violation record
    刪除侵權記錄
    """
    if violation_id not in violations_db:
        raise HTTPException(status_code=404, detail="侵權記錄不存在")

    del violations_db[violation_id]

    return {"message": "侵權記錄已刪除", "id": violation_id}


@router.get("/stats/summary")
async def get_violation_stats():
    """
    Get violation statistics
    取得侵權統計
    """
    violations = list(violations_db.values())

    # Count by platform
    by_platform = {}
    for v in violations:
        platform = v["platform"]
        by_platform[platform] = by_platform.get(platform, 0) + 1

    # Count by similarity level
    by_similarity = {"exact": 0, "high": 0, "medium": 0, "low": 0}
    for v in violations:
        level = v["similarity"].get("level", "low")
        by_similarity[level] = by_similarity.get(level, 0) + 1

    # Pending (no case)
    pending = len([v for v in violations if not v.get("case_id")])

    return {
        "total": len(violations),
        "pending": pending,
        "by_platform": by_platform,
        "by_similarity": by_similarity
    }


@router.post("/batch-create")
async def batch_create_violations(violations: List[ViolationCreate]):
    """
    Create multiple violation records at once
    批次建立侵權記錄
    """
    created = []
    for v in violations:
        violation_id = f"vio-{uuid.uuid4().hex[:8]}"
        now = datetime.now().isoformat()

        record = {
            "id": violation_id,
            "task_id": v.task_id,
            "asset_id": v.asset_id,
            "platform": v.platform,
            "listing": v.listing,
            "similarity": v.similarity,
            "detected_at": now,
            "is_whitelisted": False,
            "case_id": None,
            "created_at": now
        }

        violations_db[violation_id] = record
        created.append(ViolationResponse(**record))

    logger.info(f"Batch created {len(created)} violations")

    return {"created": len(created), "violations": created}
