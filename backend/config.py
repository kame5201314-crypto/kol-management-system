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
    DEBUG: bool = True

    # Database (Supabase)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # Redis (for Celery)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Image Comparison Settings
    PHASH_THRESHOLD: int = 10  # Hamming distance threshold (0-64, lower = more similar)
    ORB_MIN_MATCHES: int = 20  # Minimum ORB feature matches
    COLOR_SIMILARITY_THRESHOLD: float = 0.85  # 0-1, higher = more similar
    OVERALL_SIMILARITY_THRESHOLD: float = 0.70  # 70% overall similarity

    # Crawler Settings
    CRAWLER_TIMEOUT: int = 30000  # ms
    CRAWLER_MAX_PAGES: int = 20
    CRAWLER_DELAY_MIN: float = 1.0  # seconds between requests
    CRAWLER_DELAY_MAX: float = 3.0
    CRAWLER_USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

    # Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 20 * 1024 * 1024  # 20MB

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
