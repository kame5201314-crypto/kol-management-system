"""
Image Guardian 配置檔案
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Supabase 配置
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY", "")

# API 配置
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# CORS 配置
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# 圖片處理配置
IMAGE_CONFIG = {
    "max_file_size": 20 * 1024 * 1024,  # 20MB
    "allowed_formats": ["jpg", "jpeg", "png", "webp", "gif"],
    "thumbnail_size": (200, 200),
    "hash_size": 8,  # pHash 計算參數
    "orb_features": 500,  # ORB 特徵點數量
}

# 爬蟲配置
CRAWLER_CONFIG = {
    "default_timeout": 30000,  # 30 秒
    "max_retries": 3,
    "delay_min": 1.0,  # 最小延遲（秒）
    "delay_max": 3.0,  # 最大延遲（秒）
    "headless": True,
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
}

# 相似度配置
SIMILARITY_CONFIG = {
    "phash_weight": 0.50,  # pHash 權重
    "orb_weight": 0.35,    # ORB 權重
    "color_weight": 0.15,  # 顏色直方圖權重
    "thresholds": {
        "exact": 95,       # 完全相同
        "high": 80,        # 高度相似
        "medium": 50,      # 中度相似
    }
}

# 存儲配置
STORAGE_CONFIG = {
    "upload_dir": "uploads",
    "evidence_dir": "evidence",
    "temp_dir": "temp",
}
