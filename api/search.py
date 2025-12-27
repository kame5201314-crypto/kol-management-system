from http.server import BaseHTTPRequestHandler
import json
import urllib.parse
import urllib.request
import time
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        try:
            # Parse query parameters
            parsed_url = urllib.parse.urlparse(self.path)
            query_params = urllib.parse.parse_qs(parsed_url.query)

            keyword = query_params.get('keyword', [''])[0]
            max_results = int(query_params.get('max_results', ['20'])[0])
            platforms = query_params.get('platforms', ['shopee'])

            if not keyword:
                self.send_error_response(400, "Missing keyword parameter")
                return

            # Search Shopee
            listings = self.search_shopee(keyword, max_results)

            response = {
                "keyword": keyword,
                "platforms": platforms if isinstance(platforms, list) else [platforms],
                "total_found": len(listings),
                "listings": listings
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

        except Exception as e:
            self.send_error_response(500, str(e))

    def do_POST(self):
        # Handle POST same as GET for compatibility
        self.do_GET()

    def send_error_response(self, code, message):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode())

    def search_shopee(self, keyword, max_results=20):
        """Search Shopee using their API"""
        listings = []

        try:
            api_url = "https://shopee.tw/api/v4/search/search_items"
            params = {
                "by": "relevancy",
                "keyword": keyword,
                "limit": min(max_results, 60),
                "newest": 0,
                "order": "desc",
                "page_type": "search",
                "scenario": "PAGE_GLOBAL_SEARCH",
                "version": 2
            }

            url = f"{api_url}?{urllib.parse.urlencode(params)}"

            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
                "Referer": "https://shopee.tw/",
                "X-Requested-With": "XMLHttpRequest",
                "X-API-SOURCE": "pc",
            }

            req = urllib.request.Request(url, headers=headers)

            with urllib.request.urlopen(req, timeout=30) as response:
                data = json.loads(response.read().decode('utf-8'))
                items = data.get("items", [])

                for item in items[:max_results]:
                    item_info = item.get("item_basic", {})

                    item_id = item_info.get("itemid", "")
                    shop_id = item_info.get("shopid", "")
                    name = item_info.get("name", "Unknown Product")

                    # Generate product URL
                    clean_name = name[:50].replace(" ", "-").replace("/", "-")
                    product_url = f"https://shopee.tw/{urllib.parse.quote(clean_name)}-i.{shop_id}.{item_id}"

                    # Get image URL
                    image = item_info.get("image", "")
                    if image:
                        thumbnail_url = f"https://cf.shopee.tw/file/{image}"
                    else:
                        images = item_info.get("images", [])
                        thumbnail_url = f"https://cf.shopee.tw/file/{images[0]}" if images else ""

                    # Get price (Shopee returns in cents)
                    price = item_info.get("price", 0) / 100000 if item_info.get("price") else 0
                    price_min = item_info.get("price_min", 0) / 100000 if item_info.get("price_min") else price

                    # Get other info
                    seller_name = item_info.get("shop_name", "") or f"Shop_{shop_id}"
                    sold = item_info.get("sold", 0) or item_info.get("historical_sold", 0)
                    location = item_info.get("shop_location", "") or "台灣"
                    rating = item_info.get("item_rating", {}).get("rating_star")

                    listings.append({
                        "id": f"shopee_{shop_id}_{item_id}",
                        "platform": "shopee",
                        "title": name,
                        "url": product_url,
                        "thumbnail_url": thumbnail_url,
                        "price": price_min if price_min > 0 else price,
                        "currency": "TWD",
                        "seller_id": str(shop_id),
                        "seller_name": seller_name,
                        "seller_url": f"https://shopee.tw/shop/{shop_id}",
                        "sales_count": sold,
                        "rating": rating,
                        "location": location,
                        "scraped_at": datetime.now().isoformat()
                    })

        except Exception as e:
            print(f"Shopee search error: {e}")

        return listings
