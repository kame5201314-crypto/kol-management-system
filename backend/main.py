"""
Image Guardian Backend API
AI 智慧圖片版權保護系統 - 後端 API

Features:
- 圖片指紋計算與比對
- 電商平台爬蟲 (蝦皮、露天、Yahoo)
- 即時掃描進度 WebSocket
- 侵權偵測與記錄
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger
import os

from config import settings
from api.routes import assets, scans, violations


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Create upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Install playwright browsers if needed
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            # This will verify browsers are installed
            pass
        logger.info("Playwright browsers verified")
    except Exception as e:
        logger.warning(f"Playwright browser check failed: {e}")
        logger.info("Run 'playwright install chromium' to install browsers")

    yield

    # Shutdown
    logger.info("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered image copyright protection system",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])
app.include_router(scans.router, prefix="/api/scans", tags=["Scans"])
app.include_router(violations.router, prefix="/api/violations", tags=["Violations"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
        "message": "Image Guardian API is running"
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "api": True,
            "image_compare": True,
            "crawler": True
        }
    }


@app.get("/api/platforms")
async def get_platforms():
    """Get supported platforms"""
    return {
        "platforms": [
            {
                "id": "shopee",
                "name": "蝦皮購物",
                "url": "https://shopee.tw",
                "status": "active"
            },
            {
                "id": "ruten",
                "name": "露天拍賣",
                "url": "https://www.ruten.com.tw",
                "status": "active"
            },
            {
                "id": "yahoo",
                "name": "Yahoo購物中心",
                "url": "https://tw.buy.yahoo.com",
                "status": "active"
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
