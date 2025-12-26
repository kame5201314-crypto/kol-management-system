"""
Shopee Crawler
蝦皮購物爬蟲
"""
import re
import time
import json
from typing import List, Optional
from loguru import logger

from .base import BaseCrawler, ProductListing, CrawlerResult


class ShopeeCrawler(BaseCrawler):
    """
    Shopee Taiwan Crawler
    蝦皮購物台灣站爬蟲
    """

    def __init__(self, **kwargs):
        super().__init__(
            platform_name='shopee',
            base_url='https://shopee.tw',
            **kwargs
        )
        self.api_base = 'https://shopee.tw/api/v4'

    async def search(
        self,
        keyword: str,
        max_pages: int = 5,
        max_results: int = 100
    ) -> CrawlerResult:
        """Search products on Shopee"""
        start_time = time.time()
        listings = []
        errors = []
        pages_scraped = 0

        try:
            await self.init_browser()

            for page in range(max_pages):
                if len(listings) >= max_results:
                    break

                try:
                    # Use API endpoint for better reliability
                    offset = page * 60
                    search_url = f"{self.base_url}/search?keyword={keyword}&page={page}"

                    logger.info(f"Scraping Shopee page {page + 1}: {search_url}")

                    await self.page.goto(search_url, wait_until='networkidle', timeout=self.timeout)
                    await self.random_delay()

                    # Wait for products to load
                    await self.page.wait_for_selector('.shopee-search-item-result__item', timeout=10000)

                    # Extract product data
                    products = await self.page.query_selector_all('.shopee-search-item-result__item')

                    for product in products:
                        if len(listings) >= max_results:
                            break

                        try:
                            listing = await self._parse_product_card(product)
                            if listing:
                                listings.append(listing)
                        except Exception as e:
                            logger.debug(f"Error parsing product: {e}")

                    pages_scraped += 1

                except Exception as e:
                    error_msg = f"Error on page {page + 1}: {str(e)}"
                    logger.error(error_msg)
                    errors.append(error_msg)

                await self.random_delay()

        except Exception as e:
            error_msg = f"Search failed: {str(e)}"
            logger.error(error_msg)
            errors.append(error_msg)

        finally:
            await self.close_browser()

        duration_ms = int((time.time() - start_time) * 1000)

        return CrawlerResult(
            platform='shopee',
            keyword=keyword,
            total_found=len(listings),
            listings=listings,
            pages_scraped=pages_scraped,
            duration_ms=duration_ms,
            errors=errors,
            success=len(errors) == 0
        )

    async def _parse_product_card(self, element) -> Optional[ProductListing]:
        """Parse a product card element"""
        try:
            # Get link element
            link = await element.query_selector('a')
            if not link:
                return None

            href = await link.get_attribute('href')
            product_url = f"{self.base_url}{href}" if href else ''

            # Extract product ID from URL
            product_id = ''
            if href:
                match = re.search(r'i\.(\d+)\.(\d+)', href)
                if match:
                    product_id = f"{match.group(1)}_{match.group(2)}"

            # Get image
            img = await element.query_selector('img')
            thumbnail_url = ''
            if img:
                thumbnail_url = await img.get_attribute('src') or ''

            # Get title
            title_elem = await element.query_selector('[data-sqe="name"]')
            title = await title_elem.inner_text() if title_elem else ''

            # Get price
            price_elem = await element.query_selector('.IZPeQz, .k9JZlv')
            price_text = await price_elem.inner_text() if price_elem else '0'
            price = self._clean_price(price_text)

            # Get sales count
            sales_elem = await element.query_selector('.r6HknA, .OwmBnn')
            sales_text = await sales_elem.inner_text() if sales_elem else '0'
            sales_count = self._parse_sales(sales_text)

            # Get seller info
            seller_elem = await element.query_selector('.zGGwiV')
            seller_name = await seller_elem.inner_text() if seller_elem else ''

            # Get location
            location_elem = await element.query_selector('.zGGwiV:last-child')
            location = await location_elem.inner_text() if location_elem else ''

            return ProductListing(
                id=product_id,
                platform='shopee',
                title=title,
                url=product_url,
                thumbnail_url=thumbnail_url,
                price=price,
                seller_name=seller_name,
                sales_count=sales_count,
                location=location
            )

        except Exception as e:
            logger.debug(f"Error parsing product card: {e}")
            return None

    def _parse_sales(self, sales_text: str) -> int:
        """Parse sales count text"""
        try:
            # "已售出 1.2萬" -> 12000
            cleaned = sales_text.replace('已售出', '').replace('已售', '').strip()
            return self._clean_count(cleaned)
        except:
            return 0

    async def get_product_details(self, product_url: str) -> Optional[ProductListing]:
        """Get detailed product information"""
        try:
            await self.init_browser()
            await self.page.goto(product_url, wait_until='networkidle', timeout=self.timeout)
            await self.random_delay()

            # Extract detailed info
            title_elem = await self.page.query_selector('.VCNVHn, h1[class*="product"]')
            title = await title_elem.inner_text() if title_elem else ''

            price_elem = await self.page.query_selector('.pqTWkA, .IZPeQz')
            price_text = await price_elem.inner_text() if price_elem else '0'
            price = self._clean_price(price_text)

            img_elem = await self.page.query_selector('.ZPN9uD img, .product-image img')
            thumbnail_url = await img_elem.get_attribute('src') if img_elem else ''

            # Get seller info
            seller_elem = await self.page.query_selector('.kIo6pj a, .shop-name a')
            seller_name = ''
            seller_url = ''
            seller_id = ''
            if seller_elem:
                seller_name = await seller_elem.inner_text()
                seller_href = await seller_elem.get_attribute('href')
                seller_url = f"{self.base_url}{seller_href}" if seller_href else ''
                if seller_href:
                    seller_id = seller_href.split('/')[-1]

            # Get sales and rating
            sales_elem = await self.page.query_selector('.flex.items-center span:has-text("已售出")')
            sales_text = await sales_elem.inner_text() if sales_elem else '0'
            sales_count = self._parse_sales(sales_text)

            rating_elem = await self.page.query_selector('[class*="rating"] span')
            rating = None
            if rating_elem:
                rating_text = await rating_elem.inner_text()
                try:
                    rating = float(rating_text)
                except:
                    pass

            # Extract product ID from URL
            product_id = ''
            match = re.search(r'i\.(\d+)\.(\d+)', product_url)
            if match:
                product_id = f"{match.group(1)}_{match.group(2)}"

            return ProductListing(
                id=product_id,
                platform='shopee',
                title=title,
                url=product_url,
                thumbnail_url=thumbnail_url,
                price=price,
                seller_id=seller_id,
                seller_name=seller_name,
                seller_url=seller_url,
                sales_count=sales_count,
                rating=rating
            )

        except Exception as e:
            logger.error(f"Error getting product details: {e}")
            return None

        finally:
            await self.close_browser()

    async def get_seller_products(
        self,
        seller_id: str,
        max_products: int = 50
    ) -> List[ProductListing]:
        """Get all products from a Shopee seller"""
        listings = []

        try:
            await self.init_browser()

            shop_url = f"{self.base_url}/{seller_id}#product_list"
            await self.page.goto(shop_url, wait_until='networkidle', timeout=self.timeout)
            await self.random_delay()

            # Scroll to load more products
            for _ in range(max_products // 30):
                await self.page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                await self.random_delay()

                if len(listings) >= max_products:
                    break

            # Extract products
            products = await self.page.query_selector_all('.shop-search-result-view__item')

            for product in products[:max_products]:
                try:
                    listing = await self._parse_product_card(product)
                    if listing:
                        listings.append(listing)
                except Exception as e:
                    logger.debug(f"Error parsing seller product: {e}")

        except Exception as e:
            logger.error(f"Error getting seller products: {e}")

        finally:
            await self.close_browser()

        return listings
