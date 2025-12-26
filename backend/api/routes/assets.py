"""
Assets API Routes
數位資產管理 API
"""
import os
import uuid
import base64
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from loguru import logger

from config import settings
from services.image_compare import ImageCompareEngine

router = APIRouter()

# In-memory storage (replace with database in production)
assets_db = {}


class AssetMetadata(BaseModel):
    """資產元數據"""
    tags: List[str] = []
    description: str = ""
    product_sku: Optional[str] = None
    brand_name: Optional[str] = None


class AssetResponse(BaseModel):
    """資產回應"""
    id: str
    user_id: str
    file_name: str
    original_url: str
    thumbnail_url: str
    file_size: int
    dimensions: dict
    fingerprint: dict
    metadata: dict
    status: str
    scan_stats: dict
    created_at: str
    updated_at: str


class FingerprintResponse(BaseModel):
    """指紋回應"""
    id: str
    hashes: dict
    orb_features: int
    dominant_colors: List[List[int]]


@router.post("/upload", response_model=AssetResponse)
async def upload_asset(
    file: UploadFile = File(...),
    tags: str = Form(""),
    description: str = Form(""),
    product_sku: str = Form(""),
    brand_name: str = Form("")
):
    """
    Upload a digital asset and compute its fingerprint
    上傳數位資產並計算指紋
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="只接受圖片檔案")

        # Read file
        contents = await file.read()
        file_size = len(contents)

        if file_size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="檔案大小超過限制 (20MB)")

        # Generate ID
        asset_id = f"asset-{uuid.uuid4().hex[:8]}"

        # Save file
        file_ext = os.path.splitext(file.filename)[1] or '.jpg'
        saved_filename = f"{asset_id}{file_ext}"
        saved_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

        with open(saved_path, 'wb') as f:
            f.write(contents)

        # Compute fingerprint
        compare_engine = ImageCompareEngine()
        fingerprint_data = await compare_engine.compute_fingerprint(contents)

        # Get image dimensions
        from PIL import Image
        from io import BytesIO
        img = Image.open(BytesIO(contents))
        dimensions = {"width": img.width, "height": img.height}

        # Create asset record
        now = datetime.now().isoformat()
        asset = {
            "id": asset_id,
            "user_id": "user-001",  # TODO: Get from auth
            "file_name": file.filename,
            "original_url": f"/uploads/{saved_filename}",
            "thumbnail_url": f"/uploads/{saved_filename}",
            "file_size": file_size,
            "dimensions": dimensions,
            "fingerprint": {
                "pHash": fingerprint_data['hashes'].get('phash', '') if fingerprint_data else '',
                "orbDescriptors": str(fingerprint_data['orb']['feature_count']) if fingerprint_data else '0',
                "colorHistogram": 'computed',
                "featureCount": fingerprint_data['orb']['feature_count'] if fingerprint_data else 0
            },
            "metadata": {
                "uploadedBy": "admin",
                "uploadedAt": now,
                "tags": [t.strip() for t in tags.split(',') if t.strip()],
                "description": description,
                "productSku": product_sku or None,
                "brandName": brand_name or None
            },
            "status": "indexed",
            "scan_stats": {
                "totalScans": 0,
                "violationsFound": 0
            },
            "created_at": now,
            "updated_at": now,
            "_fingerprint_raw": fingerprint_data  # Store raw for comparison
        }

        assets_db[asset_id] = asset

        logger.info(f"Asset uploaded: {asset_id}")

        return AssetResponse(
            id=asset["id"],
            user_id=asset["user_id"],
            file_name=asset["file_name"],
            original_url=asset["original_url"],
            thumbnail_url=asset["thumbnail_url"],
            file_size=asset["file_size"],
            dimensions=asset["dimensions"],
            fingerprint=asset["fingerprint"],
            metadata=asset["metadata"],
            status=asset["status"],
            scan_stats=asset["scan_stats"],
            created_at=asset["created_at"],
            updated_at=asset["updated_at"]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[AssetResponse])
async def get_assets(status: Optional[str] = None):
    """
    Get all assets
    取得所有資產
    """
    assets = list(assets_db.values())

    if status:
        assets = [a for a in assets if a.get('status') == status]

    return [
        AssetResponse(
            id=a["id"],
            user_id=a["user_id"],
            file_name=a["file_name"],
            original_url=a["original_url"],
            thumbnail_url=a["thumbnail_url"],
            file_size=a["file_size"],
            dimensions=a["dimensions"],
            fingerprint=a["fingerprint"],
            metadata=a["metadata"],
            status=a["status"],
            scan_stats=a["scan_stats"],
            created_at=a["created_at"],
            updated_at=a["updated_at"]
        )
        for a in assets
    ]


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(asset_id: str):
    """
    Get asset by ID
    根據 ID 取得資產
    """
    asset = assets_db.get(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="資產不存在")

    return AssetResponse(
        id=asset["id"],
        user_id=asset["user_id"],
        file_name=asset["file_name"],
        original_url=asset["original_url"],
        thumbnail_url=asset["thumbnail_url"],
        file_size=asset["file_size"],
        dimensions=asset["dimensions"],
        fingerprint=asset["fingerprint"],
        metadata=asset["metadata"],
        status=asset["status"],
        scan_stats=asset["scan_stats"],
        created_at=asset["created_at"],
        updated_at=asset["updated_at"]
    )


@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    """
    Delete an asset
    刪除資產
    """
    if asset_id not in assets_db:
        raise HTTPException(status_code=404, detail="資產不存在")

    asset = assets_db.pop(asset_id)

    # Delete file
    try:
        file_path = os.path.join(settings.UPLOAD_DIR, os.path.basename(asset["original_url"]))
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        logger.warning(f"Failed to delete file: {e}")

    return {"message": "資產已刪除", "id": asset_id}


@router.post("/{asset_id}/fingerprint", response_model=FingerprintResponse)
async def recompute_fingerprint(asset_id: str):
    """
    Recompute fingerprint for an asset
    重新計算資產指紋
    """
    asset = assets_db.get(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="資產不存在")

    try:
        # Read file
        file_path = os.path.join(settings.UPLOAD_DIR, os.path.basename(asset["original_url"]))
        with open(file_path, 'rb') as f:
            contents = f.read()

        # Recompute
        compare_engine = ImageCompareEngine()
        fingerprint_data = await compare_engine.compute_fingerprint(contents)

        # Update asset
        asset["fingerprint"] = {
            "pHash": fingerprint_data['hashes'].get('phash', ''),
            "orbDescriptors": str(fingerprint_data['orb']['feature_count']),
            "colorHistogram": 'computed',
            "featureCount": fingerprint_data['orb']['feature_count']
        }
        asset["_fingerprint_raw"] = fingerprint_data
        asset["updated_at"] = datetime.now().isoformat()

        return FingerprintResponse(
            id=asset_id,
            hashes=fingerprint_data['hashes'],
            orb_features=fingerprint_data['orb']['feature_count'],
            dominant_colors=fingerprint_data['color']['dominant_colors'] or []
        )

    except Exception as e:
        logger.error(f"Fingerprint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare")
async def compare_images(
    image1_url: str = Form(None),
    image1_base64: str = Form(None),
    image2_url: str = Form(None),
    image2_base64: str = Form(None)
):
    """
    Compare two images
    比對兩張圖片
    """
    try:
        # Get image sources
        image1 = image1_url or image1_base64
        image2 = image2_url or image2_base64

        if not image1 or not image2:
            raise HTTPException(status_code=400, detail="需要提供兩張圖片")

        compare_engine = ImageCompareEngine()
        result = await compare_engine.compare(image1, image2)

        return {
            "overall_similarity": result.overall_similarity,
            "phash_score": result.phash_score,
            "orb_score": result.orb_score,
            "color_score": result.color_score,
            "similarity_level": result.similarity_level,
            "is_match": result.is_match
        }

    except Exception as e:
        logger.error(f"Compare error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
