"""
Yahoo Shopping Crawler
Yahoo 購物中心爬蟲
"""
import re
import time
from typing import List, Optional
from urllib.parse import quote
from loguru import logger

from .base import BaseCrawler, ProductListing, CrawlerResult


class YahooCrawler(BaseCrawler):
    """
    Yahoo Shopping Taiwan Crawler
    Yahoo 購物中心台灣站爬蟲
    """

    def __init__(self, **kwargs):
        super().__init__(
            platform_name='yahoo',
            base_url='https://tw.buy.yahoo.com',
            **kwargs
        )

    async def search(
        self,
        keyword: str,
        max_pages: int = 5,
        max_results: int = 100
    ) -> CrawlerResult:
        """Search products on Yahoo Shopping"""
        start_time = time.time()
        listings = []
        errors = []
        pages_scraped = 0

        try:
            await self.init_browser()

            for page in range(1, max_pages + 1):
                if len(listings) >= max_results:
                    break

                try:
                    # Yahoo search URL
                    encoded_keyword = quote(keyword)
                    search_url = f"{self.base_url}/search/product?p={encoded_keyword}&pg={page}"

                    logger.info(f"Scraping Yahoo page {page}: {search_url}")

                    await self.page.goto(search_url, wait_until='networkidle', timeout=self.timeout)
                    await self.random_delay()

                    # Wait for products to load
                    await self.page.wait_for_selector('[class*="ProductCard"], [class*="product-item"]', timeout=10000)

                    # Extract product data
                    products = await self.page.query_selector_all('[class*="ProductCard"], [class*="product-item"]')

                    for product in products:
                        if len(listings) >= max_results:
                            break

                        try:
                            listing = await self._parse_product_card(product)
                            if listing:
                                listings.append(listing)
                        except Exception as e:
                            logger.debug(f"Error parsing Yahoo product: {e}")

                    pages_scraped += 1

                except Exception as e:
                    error_msg = f"Error on page {page}: {str(e)}"
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
            platform='yahoo',
            keyword=keyword,
            total_found=len(listings),
            listings=listings,
            pages_scraped=pages_scraped,
            duration_ms=duration_ms,
            errors=errors,
            success=len(errors) == 0
        )

    async def _parse_product_card(self, element) -> Optional[ProductListing]:
        """Parse a Yahoo product card element"""
        try:
            # Get link element
            link = await element.query_selector('a[href*="/gdsale/"], a[href*="/item/"]')
            if not link:
                return None

            href = await link.get_attribute('href')
            product_url = href if href.startswith('http') else f"{self.base_url}{href}"

            # Extract product ID from URL
            product_id = ''
            match = re.search(r'/gdsale/gdsale\.asp\?gdid=(\d+)', href) or re.search(r'/(\d{6,})', href)
            if match:
                product_id = match.group(1)

            # Get image
            img = await element.query_selector('img')
            thumbnail_url = ''
            if img:
                thumbnail_url = await img.get_attribute('src') or await img.get_attribute('data-src') or ''

            # Get title
            title_elem = await element.query_selector('[class*="title"], [class*="name"], h3, h2')
            title = ''
            if title_elem:
                title = await title_elem.inner_text()
            else:
                title = await img.get_attribute('alt') if img else ''

            # Get price
            price_elem = await element.query_selector('[class*="price"], [class*="Price"]')
            price_text = await price_elem.inner_text() if price_elem else '0'
            price = self._clean_price(price_text)

            # Get seller/store info
            seller_elem = await element.query_selector('[class*="store"], [class*="shop"], [class*="seller"]')
            seller_name = await seller_elem.inner_text() if seller_elem else 'Yahoo購物中心'

            # Get rating
            rating_elem = await element.query_selector('[class*="rating"], [class*="star"]')
            rating = None
            if rating_elem:
                rating_text = await rating_elem.get_attribute('data-rating') or await rating_elem.inner_text()
                try:
                    rating = float(rating_text)
                except:
                    pass

            return ProductListing(
                id=product_id,
                platform='yahoo',
                title=title.strip(),
                url=product_url,
                thumbnail_url=thumbnail_url,
                price=price,
                seller_name=seller_name.strip() if seller_name else 'Yahoo購物中心',
                rating=rating
            )

        except Exception as e:
            logger.debug(f"Error parsing Yahoo product card: {e}")
            return None

    async def get_product_details(self, product_url: str) -> Optional[ProductListing]:
        """Get detailed product information from Yahoo"""
        try:
            await self.init_browser()
            await self.page.goto(product_url, wait_until='networkidle', timeout=self.timeout)
            await self.random_delay()

            # Extract product ID
            product_id = ''
            match = re.search(r'gdid=(\d+)', product_url) or re.search(r'/(\d{6,})', product_url)
            if match:
                product_id = match.group(1)

            # Get title
            title_elem = await self.page.query_selector('h1[class*="title"], h1[class*="name"], .product-title')
            title = await title_elem.inner_text() if title_elem else ''

            # Get price
            price_elem = await self.page.query_selector('[class*="price"]:not([class*="origin"]), .sale-price')
            price_text = await price_elem.inner_text() if price_elem else '0'
            price = self._clean_price(price_text)

            # Get image
            img_elem = await self.page.query_selector('[class*="product-image"] img, .main-image img')
            thumbnail_url = ''
            if img_elem:
                thumbnail_url = await img_elem.get_attribute('src') or ''

            # Get seller info
            seller_elem = await self.page.query_selector('[class*="store"] a, [class*="shop"] a')
            seller_name = 'Yahoo購物中心'
            seller_url = ''
            seller_id = ''
            if seller_elem:
                seller_name = await seller_elem.inner_text()
                seller_href = await seller_elem.get_attribute('href')
                seller_url = seller_href if seller_href and seller_href.startswith('http') else f"{self.base_url}{seller_href}" if seller_href else ''
                if seller_href:
                    match = re.search(r'/store/(\w+)', seller_href)
                    seller_id = match.group(1) if match else ''

            # Get rating
            rating_elem = await self.page.query_selector('[class*="rating-score"], .rating')
            rating = None
            if rating_elem:
                rating_text = await rating_elem.inner_text()
                try:
                    match = re.search(r'(\d+\.?\d*)', rating_text)
                    if match:
                        rating = float(match.group(1))
                except:
                    pass

            # Get review count
            review_elem = await self.page.query_selector('[class*="review-count"], .reviews')
            review_count = 0
            if review_elem:
                review_text = await review_elem.inner_text()
                review_count = self._clean_count(review_text)

            return ProductListing(
                id=product_id,
                platform='yahoo',
                title=title.strip(),
                url=product_url,
                thumbnail_url=thumbnail_url,
                price=price,
                seller_id=seller_id,
                seller_name=seller_name.strip(),
                seller_url=seller_url,
                rating=rating,
                review_count=review_count
            )

        except Exception as e:
            logger.error(f"Error getting Yahoo product details: {e}")
            return None

        finally:
            await self.close_browser()

    async def get_seller_products(
        self,
        seller_id: str,
        max_products: int = 50
    ) -> List[ProductListing]:
        """Get all products from a Yahoo store"""
        listings = []

        try:
            await self.init_browser()

            # Yahoo store page URL
            store_url = f"{self.base_url}/store/{seller_id}"
            await self.page.goto(store_url, wait_until='networkidle', timeout=self.timeout)
            await self.random_delay()

            page = 1
            while len(listings) < max_products:
                # Extract products
                products = await self.page.query_selector_all('[class*="ProductCard"], [class*="product-item"]')

                if not products:
                    break

                for product in products:
                    if len(listings) >= max_products:
                        break

                    try:
                        listing = await self._parse_product_card(product)
                        if listing:
                            listing.seller_id = seller_id
                            listings.append(listing)
                    except Exception as e:
                        logger.debug(f"Error parsing store product: {e}")

                # Try to go to next page
                next_btn = await self.page.query_selector('[class*="pagination"] [class*="next"], a[rel="next"]')
                if not next_btn:
                    break

                page += 1
                await next_btn.click()
                await self.page.wait_for_load_state('networkidle')
                await self.random_delay()

        except Exception as e:
            logger.error(f"Error getting Yahoo store products: {e}")

        finally:
            await self.close_browser()

        return listings
