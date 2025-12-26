"""
Crawler Manager
爬蟲管理器 - 統一管理多平台爬蟲
"""
import asyncio
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime
from loguru import logger

from .base import ProductListing, CrawlerResult
from .shopee import ShopeeCrawler
from .ruten import RutenCrawler
from .yahoo import YahooCrawler


@dataclass
class ScanProgress:
    """掃描進度"""
    task_id: str
    status: str  # 'queued', 'running', 'completed', 'failed'
    progress: int  # 0-100
    message: str
    platforms_completed: List[str] = field(default_factory=list)
    total_scanned: int = 0
    violations_found: int = 0
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class CrawlerManager:
    """
    Crawler Manager for Image Guardian
    統一管理蝦皮、露天、Yahoo 爬蟲
    """

    def __init__(self):
        self.crawlers = {
            'shopee': ShopeeCrawler(),
            'ruten': RutenCrawler(),
            'yahoo': YahooCrawler()
        }
        self._progress_callbacks: Dict[str, callable] = {}

    def get_crawler(self, platform: str):
        """Get crawler for specific platform"""
        return self.crawlers.get(platform)

    async def search_all_platforms(
        self,
        keyword: str,
        platforms: List[str] = None,
        max_pages: int = 5,
        max_results_per_platform: int = 50,
        on_progress: callable = None
    ) -> Dict[str, CrawlerResult]:
        """
        Search across multiple platforms

        Args:
            keyword: Search keyword
            platforms: List of platforms to search (default: all)
            max_pages: Max pages per platform
            max_results_per_platform: Max results per platform
            on_progress: Progress callback function

        Returns:
            Dict of platform -> CrawlerResult
        """
        if platforms is None:
            platforms = list(self.crawlers.keys())

        results = {}
        total_platforms = len(platforms)

        for i, platform in enumerate(platforms):
            if on_progress:
                progress = int((i / total_platforms) * 100)
                on_progress(progress, f"正在搜尋 {self._get_platform_name(platform)}...")

            crawler = self.crawlers.get(platform)
            if crawler:
                try:
                    result = await crawler.search(
                        keyword=keyword,
                        max_pages=max_pages,
                        max_results=max_results_per_platform
                    )
                    results[platform] = result
                except Exception as e:
                    logger.error(f"Error searching {platform}: {e}")
                    results[platform] = CrawlerResult(
                        platform=platform,
                        keyword=keyword,
                        total_found=0,
                        listings=[],
                        pages_scraped=0,
                        duration_ms=0,
                        errors=[str(e)],
                        success=False
                    )

        if on_progress:
            on_progress(100, "搜尋完成")

        return results

    async def scan_with_comparison(
        self,
        asset_images: List[str],  # List of image URLs or base64
        keywords: List[str],
        platforms: List[str],
        similarity_threshold: float = 70.0,
        max_pages: int = 5,
        max_results_per_platform: int = 50,
        on_progress: callable = None
    ) -> Dict:
        """
        Scan platforms and compare images

        Args:
            asset_images: Original images to protect
            keywords: Search keywords
            platforms: Platforms to scan
            similarity_threshold: Minimum similarity to flag
            max_pages: Max pages per platform
            max_results_per_platform: Max results per platform
            on_progress: Progress callback

        Returns:
            Dict with scan results and violations
        """
        from ..image_compare import ImageCompareEngine

        compare_engine = ImageCompareEngine(similarity_threshold=similarity_threshold)

        all_violations = []
        all_listings = []
        total_steps = len(keywords) * len(platforms) + len(asset_images)
        current_step = 0

        # Step 1: Search for products
        for keyword in keywords:
            search_results = await self.search_all_platforms(
                keyword=keyword,
                platforms=platforms,
                max_pages=max_pages,
                max_results_per_platform=max_results_per_platform,
                on_progress=None  # We'll handle progress ourselves
            )

            for platform, result in search_results.items():
                all_listings.extend(result.listings)
                current_step += 1

                if on_progress:
                    progress = int((current_step / total_steps) * 60)  # 0-60% for search
                    on_progress(progress, f"已搜尋 {len(all_listings)} 個商品...")

        # Step 2: Compare images
        if on_progress:
            on_progress(60, "開始 AI 圖片比對...")

        for i, asset_image in enumerate(asset_images):
            current_step += 1

            if on_progress:
                progress = 60 + int((i / len(asset_images)) * 35)  # 60-95% for comparison
                on_progress(progress, f"正在比對資產 {i + 1}/{len(asset_images)}...")

            # Compare against all listings
            for listing in all_listings:
                if not listing.thumbnail_url:
                    continue

                try:
                    result = await compare_engine.compare(
                        asset_image,
                        listing.thumbnail_url,
                        fast_mode=True  # Use fast mode for initial scan
                    )

                    if result.is_match:
                        # Do full comparison for potential matches
                        full_result = await compare_engine.compare(
                            asset_image,
                            listing.thumbnail_url,
                            fast_mode=False
                        )

                        if full_result.is_match:
                            all_violations.append({
                                'listing': listing.__dict__,
                                'similarity': {
                                    'overall': full_result.overall_similarity,
                                    'phash_score': full_result.phash_score,
                                    'orb_score': full_result.orb_score,
                                    'color_score': full_result.color_score,
                                    'level': full_result.similarity_level
                                },
                                'asset_image': asset_image if not asset_image.startswith('data:') else '[base64]'
                            })

                except Exception as e:
                    logger.debug(f"Error comparing with {listing.url}: {e}")

        if on_progress:
            on_progress(100, f"掃描完成！發現 {len(all_violations)} 個可疑侵權")

        return {
            'total_scanned': len(all_listings),
            'violations_found': len(all_violations),
            'violations': all_violations,
            'platforms_searched': platforms,
            'keywords_used': keywords
        }

    def _get_platform_name(self, platform: str) -> str:
        """Get Chinese name for platform"""
        names = {
            'shopee': '蝦皮購物',
            'ruten': '露天拍賣',
            'yahoo': 'Yahoo購物中心'
        }
        return names.get(platform, platform)


# Singleton instance
crawler_manager = CrawlerManager()
