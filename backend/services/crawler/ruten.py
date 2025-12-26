"""
Ruten Crawler
露天拍賣爬蟲
"""
import re
import time
from typing import List, Optional
from urllib.parse import quote
from loguru import logger

from .base import BaseCrawler, ProductListing, CrawlerResult


class RutenCrawler(BaseCrawler):
    """
    Ruten Auction Crawler
    露天拍賣爬蟲
    """

    def __init__(self, **kwargs):
        super().__init__(
            platform_name='ruten',
            base_url='https://www.ruten.com.tw',
            **kwargs
        )

    async def search(
        self,
        keyword: str,
        max_pages: int = 5,
        max_results: int = 100
    ) -> CrawlerResult:
        """Search products on Ruten"""
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
                    # Ruten search URL
                    encoded_keyword = quote(keyword)
                    search_url = f"{self.base_url}/find/?q={encoded_keyword}&p={page}"

                    logger.info(f"Scraping Ruten page {page}: {search_url}")

                    await self.page.goto(search_url, wait_until='networkidle', timeout=self.timeout)
                    await self.random_delay()

                    # Wait for products to load
                    await self.page.wait_for_selector('.rt-goods-list-item, .product-item', timeout=10000)

                    # Extract product data
                    products = await self.page.query_selector_all('.rt-goods-list-item, .product-item')

                    for product in products:
                        if len(listings) >= max_results:
                            break

                        try:
                            listing = await self._parse_product_card(product)
                            if listing:
                                listings.append(listing)
                        except Exception as e:
                            logger.debug(f"Error parsing Ruten product: {e}")

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
            platform='ruten',
            keyword=keyword,
            total_found=len(listings),
            listings=listings,
            pages_scraped=pages_scraped,
            duration_ms=duration_ms,
            errors=errors,
            success=len(errors) == 0
        )

    async def _parse_product_card(self, element) -> Optional[ProductListing]:
        """Parse a Ruten product card element"""
        try:
            # Get link element
            link = await element.query_selector('a.rt-goods-list-item-image-link, a[href*="/item/"]')
            if not link:
                return None

            href = await link.get_attribute('href')
            product_url = href if href.startswith('http') else f"{self.base_url}{href}"

            # Extract product ID from URL
            product_id = ''
            match = re.search(r'/item/show\?(\d+)', href) or re.search(r'/(\d{10,})', href)
            if match:
                product_id = match.group(1)

            # Get image
            img = await element.query_selector('img')
            thumbnail_url = ''
            if img:
                thumbnail_url = await img.get_attribute('src') or await img.get_attribute('data-src') or ''

            # Get title
            title_elem = await element.query_selector('.rt-goods-list-item-name, .product-title, h3')
            title = ''
            if title_elem:
                title = await title_elem.inner_text()
            else:
                title = await img.get_attribute('alt') if img else ''

            # Get price
            price_elem = await element.query_selector('.rt-goods-list-item-price, .product-price, .price')
            price_text = await price_elem.inner_text() if price_elem else '0'
            price = self._clean_price(price_text)

            # Get seller info
            seller_elem = await element.query_selector('.rt-goods-list-item-info a, .seller-name')
            seller_name = await seller_elem.inner_text() if seller_elem else ''
            seller_url = ''
            if seller_elem:
                seller_href = await seller_elem.get_attribute('href')
                seller_url = seller_href if seller_href and seller_href.startswith('http') else f"{self.base_url}{seller_href}" if seller_href else ''

            return ProductListing(
                id=product_id,
                platform='ruten',
                title=title.strip(),
                url=product_url,
                thumbnail_url=thumbnail_url,
                price=price,
                seller_name=seller_name.strip(),
                seller_url=seller_url
            )

        except Exception as e:
            logger.debug(f"Error parsing Ruten product card: {e}")
            return None

    async def get_product_details(self, product_url: str) -> Optional[ProductListing]:
        """Get detailed product information from Ruten"""
        try:
            await self.init_browser()
            await self.page.goto(product_url, wait_until='networkidle', timeout=self.timeout)
            await self.random_delay()

            # Extract product ID
            product_id = ''
            match = re.search(r'/item/show\?(\d+)', product_url) or re.search(r'/(\d{10,})', product_url)
            if match:
                product_id = match.group(1)

            # Get title
            title_elem = await self.page.query_selector('h1.item-title, h1[class*="title"]')
            title = await title_elem.inner_text() if title_elem else ''

            # Get price
            price_elem = await self.page.query_selector('.item-price, .price-now')
            price_text = await price_elem.inner_text() if price_elem else '0'
            price = self._clean_price(price_text)

            # Get image
            img_elem = await self.page.query_selector('.item-img img, .product-image img')
            thumbnail_url = ''
            if img_elem:
                thumbnail_url = await img_elem.get_attribute('src') or ''

            # Get seller info
            seller_elem = await self.page.query_selector('.seller-name a, .shop-name a')
            seller_name = await seller_elem.inner_text() if seller_elem else ''
            seller_url = ''
            seller_id = ''
            if seller_elem:
                seller_href = await seller_elem.get_attribute('href')
                seller_url = seller_href if seller_href and seller_href.startswith('http') else f"{self.base_url}{seller_href}" if seller_href else ''
                if seller_href:
                    match = re.search(r'/user/(\w+)', seller_href)
                    seller_id = match.group(1) if match else ''

            # Get sales count
            sales_elem = await self.page.query_selector('.sold-count, .item-sold')
            sales_text = await sales_elem.inner_text() if sales_elem else '0'
            sales_count = self._clean_count(sales_text.replace('已售出', '').strip())

            # Get rating
            rating_elem = await self.page.query_selector('.seller-rating, .rating-score')
            rating = None
            if rating_elem:
                rating_text = await rating_elem.inner_text()
                try:
                    # Extract percentage or score
                    match = re.search(r'(\d+\.?\d*)', rating_text)
                    if match:
                        rating = float(match.group(1))
                        if rating > 5:  # Probably a percentage
                            rating = rating / 20  # Convert to 5-star scale
                except:
                    pass

            return ProductListing(
                id=product_id,
                platform='ruten',
                title=title.strip(),
                url=product_url,
                thumbnail_url=thumbnail_url,
                price=price,
                seller_id=seller_id,
                seller_name=seller_name.strip(),
                seller_url=seller_url,
                sales_count=sales_count,
                rating=rating
            )

        except Exception as e:
            logger.error(f"Error getting Ruten product details: {e}")
            return None

        finally:
            await self.close_browser()

    async def get_seller_products(
        self,
        seller_id: str,
        max_products: int = 50
    ) -> List[ProductListing]:
        """Get all products from a Ruten seller"""
        listings = []

        try:
            await self.init_browser()

            # Ruten seller page URL
            seller_url = f"{self.base_url}/user/{seller_id}/items"
            await self.page.goto(seller_url, wait_until='networkidle', timeout=self.timeout)
            await self.random_delay()

            page = 1
            while len(listings) < max_products:
                # Extract products
                products = await self.page.query_selector_all('.rt-goods-list-item, .product-item')

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
                        logger.debug(f"Error parsing seller product: {e}")

                # Try to go to next page
                next_btn = await self.page.query_selector('.pagination .next, a[rel="next"]')
                if not next_btn:
                    break

                page += 1
                next_url = f"{seller_url}?p={page}"
                await self.page.goto(next_url, wait_until='networkidle', timeout=self.timeout)
                await self.random_delay()

        except Exception as e:
            logger.error(f"Error getting Ruten seller products: {e}")

        finally:
            await self.close_browser()

        return listings
