"""
Base Crawler Class
爬蟲基礎類別
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio
import random
from loguru import logger


@dataclass
class ProductListing:
    """商品列表資料結構"""
    id: str
    platform: str
    title: str
    url: str
    thumbnail_url: str
    price: float
    currency: str = 'TWD'
    seller_id: str = ''
    seller_name: str = ''
    seller_url: str = ''
    sales_count: int = 0
    rating: Optional[float] = None
    review_count: int = 0
    location: str = ''
    shipping_info: str = ''
    scraped_at: str = field(default_factory=lambda: datetime.now().isoformat())
    raw_data: Dict = field(default_factory=dict)


@dataclass
class CrawlerResult:
    """爬蟲結果"""
    platform: str
    keyword: str
    total_found: int
    listings: List[ProductListing]
    pages_scraped: int
    duration_ms: int
    errors: List[str] = field(default_factory=list)
    success: bool = True


class BaseCrawler(ABC):
    """
    Base class for e-commerce crawlers
    電商爬蟲基礎類別
    """

    def __init__(
        self,
        platform_name: str,
        base_url: str,
        delay_min: float = 1.0,
        delay_max: float = 3.0,
        timeout: int = 30000,
        max_retries: int = 3
    ):
        self.platform_name = platform_name
        self.base_url = base_url
        self.delay_min = delay_min
        self.delay_max = delay_max
        self.timeout = timeout
        self.max_retries = max_retries
        self.browser = None
        self.context = None
        self.page = None

    async def init_browser(self):
        """Initialize Playwright browser"""
        try:
            from playwright.async_api import async_playwright

            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            )
            self.context = await self.browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                locale='zh-TW'
            )
            self.page = await self.context.new_page()
            logger.info(f"Browser initialized for {self.platform_name}")

        except Exception as e:
            logger.error(f"Failed to initialize browser: {e}")
            raise

    async def close_browser(self):
        """Close browser and cleanup"""
        try:
            if self.page:
                await self.page.close()
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if hasattr(self, 'playwright') and self.playwright:
                await self.playwright.stop()
            logger.info(f"Browser closed for {self.platform_name}")
        except Exception as e:
            logger.error(f"Error closing browser: {e}")

    async def random_delay(self):
        """Add random delay between requests"""
        delay = random.uniform(self.delay_min, self.delay_max)
        await asyncio.sleep(delay)

    @abstractmethod
    async def search(
        self,
        keyword: str,
        max_pages: int = 5,
        max_results: int = 100
    ) -> CrawlerResult:
        """
        Search for products

        Args:
            keyword: Search keyword
            max_pages: Maximum pages to scrape
            max_results: Maximum results to return

        Returns:
            CrawlerResult with listings
        """
        pass

    @abstractmethod
    async def get_product_details(self, product_url: str) -> Optional[ProductListing]:
        """
        Get detailed information for a single product

        Args:
            product_url: URL of the product page

        Returns:
            ProductListing with full details
        """
        pass

    @abstractmethod
    async def get_seller_products(
        self,
        seller_id: str,
        max_products: int = 50
    ) -> List[ProductListing]:
        """
        Get all products from a seller

        Args:
            seller_id: Seller ID or shop URL
            max_products: Maximum products to fetch

        Returns:
            List of ProductListing
        """
        pass

    async def download_image(self, image_url: str) -> Optional[bytes]:
        """Download image from URL"""
        try:
            import httpx

            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(image_url)
                response.raise_for_status()
                return response.content

        except Exception as e:
            logger.error(f"Failed to download image {image_url}: {e}")
            return None

    def _clean_price(self, price_str: str) -> float:
        """Clean price string and convert to float"""
        try:
            # Remove currency symbols and commas
            cleaned = price_str.replace('$', '').replace('NT', '').replace(',', '').replace(' ', '')
            # Handle range prices (take the lower price)
            if '-' in cleaned:
                cleaned = cleaned.split('-')[0]
            return float(cleaned)
        except:
            return 0.0

    def _clean_count(self, count_str: str) -> int:
        """Clean count string and convert to int"""
        try:
            # Handle "萬" (10,000) and "千" (1,000)
            cleaned = count_str.replace(',', '').replace(' ', '')
            if '萬' in cleaned:
                return int(float(cleaned.replace('萬', '')) * 10000)
            if 'k' in cleaned.lower():
                return int(float(cleaned.lower().replace('k', '')) * 1000)
            if '千' in cleaned:
                return int(float(cleaned.replace('千', '')) * 1000)
            return int(float(cleaned))
        except:
            return 0
