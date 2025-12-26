"""
Perceptual Hash (pHash) Image Comparison
感知哈希圖片比對 - 對裁剪、縮放、輕微修改具有容錯性
"""
import imagehash
from PIL import Image
import numpy as np
from io import BytesIO
import httpx
from typing import Optional, Tuple
from loguru import logger


class PHashCompare:
    """
    Perceptual Hash comparison for images
    pHash 對圖片進行 DCT 轉換，提取視覺特徵生成 64-bit hash
    """

    def __init__(self, hash_size: int = 16):
        """
        Initialize pHash comparator

        Args:
            hash_size: Hash size (larger = more precise, default 16 = 256-bit hash)
        """
        self.hash_size = hash_size

    async def compute_hash(self, image_source: str | bytes | Image.Image) -> Optional[str]:
        """
        Compute perceptual hash for an image

        Args:
            image_source: URL, bytes, or PIL Image

        Returns:
            Hex string of the perceptual hash, or None on error
        """
        try:
            image = await self._load_image(image_source)
            if image is None:
                return None

            # Compute pHash using DCT
            phash = imagehash.phash(image, hash_size=self.hash_size)
            return str(phash)

        except Exception as e:
            logger.error(f"Error computing pHash: {e}")
            return None

    async def _load_image(self, source: str | bytes | Image.Image) -> Optional[Image.Image]:
        """Load image from various sources"""
        try:
            if isinstance(source, Image.Image):
                return source.convert('RGB')

            if isinstance(source, bytes):
                return Image.open(BytesIO(source)).convert('RGB')

            if isinstance(source, str):
                if source.startswith(('http://', 'https://')):
                    # Download from URL
                    async with httpx.AsyncClient(timeout=30) as client:
                        response = await client.get(source)
                        response.raise_for_status()
                        return Image.open(BytesIO(response.content)).convert('RGB')
                elif source.startswith('data:image'):
                    # Base64 data URL
                    import base64
                    header, data = source.split(',', 1)
                    image_data = base64.b64decode(data)
                    return Image.open(BytesIO(image_data)).convert('RGB')
                else:
                    # File path
                    return Image.open(source).convert('RGB')

            return None

        except Exception as e:
            logger.error(f"Error loading image: {e}")
            return None

    def compute_similarity(self, hash1: str, hash2: str) -> float:
        """
        Compute similarity between two pHash values

        Args:
            hash1: First hash (hex string)
            hash2: Second hash (hex string)

        Returns:
            Similarity score 0-100 (100 = identical)
        """
        try:
            h1 = imagehash.hex_to_hash(hash1)
            h2 = imagehash.hex_to_hash(hash2)

            # Hamming distance (number of different bits)
            hamming_distance = h1 - h2

            # Convert to similarity percentage
            # Max distance for 256-bit hash is 256
            max_distance = self.hash_size * self.hash_size
            similarity = (1 - (hamming_distance / max_distance)) * 100

            return round(similarity, 2)

        except Exception as e:
            logger.error(f"Error computing similarity: {e}")
            return 0.0

    async def compare_images(
        self,
        image1: str | bytes | Image.Image,
        image2: str | bytes | Image.Image
    ) -> Tuple[float, Optional[str], Optional[str]]:
        """
        Compare two images using pHash

        Returns:
            Tuple of (similarity_score, hash1, hash2)
        """
        hash1 = await self.compute_hash(image1)
        hash2 = await self.compute_hash(image2)

        if hash1 is None or hash2 is None:
            return 0.0, hash1, hash2

        similarity = self.compute_similarity(hash1, hash2)
        return similarity, hash1, hash2


# Also compute aHash and dHash for more robust matching
class MultiHashCompare(PHashCompare):
    """
    Multi-algorithm hash comparison
    使用多種哈希算法提高準確度
    """

    async def compute_all_hashes(self, image_source: str | bytes | Image.Image) -> dict:
        """Compute multiple hash types"""
        try:
            image = await self._load_image(image_source)
            if image is None:
                return {}

            return {
                'phash': str(imagehash.phash(image, hash_size=self.hash_size)),
                'ahash': str(imagehash.average_hash(image, hash_size=self.hash_size)),
                'dhash': str(imagehash.dhash(image, hash_size=self.hash_size)),
                'whash': str(imagehash.whash(image, hash_size=self.hash_size))
            }

        except Exception as e:
            logger.error(f"Error computing hashes: {e}")
            return {}

    def compute_multi_similarity(self, hashes1: dict, hashes2: dict) -> dict:
        """Compare multiple hash types and return weighted average"""
        scores = {}
        weights = {'phash': 0.4, 'ahash': 0.2, 'dhash': 0.2, 'whash': 0.2}

        for hash_type in ['phash', 'ahash', 'dhash', 'whash']:
            if hash_type in hashes1 and hash_type in hashes2:
                scores[hash_type] = self.compute_similarity(
                    hashes1[hash_type],
                    hashes2[hash_type]
                )

        if not scores:
            return {'overall': 0.0, 'scores': {}}

        weighted_sum = sum(scores.get(k, 0) * weights[k] for k in weights)
        total_weight = sum(weights[k] for k in scores.keys())

        return {
            'overall': round(weighted_sum / total_weight, 2) if total_weight > 0 else 0.0,
            'scores': scores
        }
