"""
Image Guardian Backend Configuration
"""
import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    # App
    APP_NAME: str = "Image Guardian API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 20 * 1024 * 1024  # 20MB

    # Image Comparison Settings
    PHASH_THRESHOLD: int = 10
    OVERALL_SIMILARITY_THRESHOLD: float = 0.70

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# CORS Origins (hardcoded to avoid pydantic parsing issues)
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://dealer-management-system-teal.vercel.app",
    "*"
]
