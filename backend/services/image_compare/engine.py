"""
Image Comparison Engine
整合多種演算法的圖片比對引擎
"""
from typing import Dict, Optional, Tuple, List
from dataclasses import dataclass
from loguru import logger
import asyncio

from .phash import PHashCompare, MultiHashCompare
from .orb import ORBCompare
from .color import ColorHistogramCompare, DominantColorCompare


@dataclass
class ComparisonResult:
    """圖片比對結果"""
    overall_similarity: float
    phash_score: float
    orb_score: float
    color_score: float
    similarity_level: str  # exact, high, medium, low
    is_match: bool
    details: Dict


class ImageCompareEngine:
    """
    Multi-algorithm image comparison engine
    使用多種演算法進行圖片比對，綜合評估相似度
    """

    def __init__(
        self,
        phash_weight: float = 0.4,
        orb_weight: float = 0.35,
        color_weight: float = 0.25,
        similarity_threshold: float = 70.0
    ):
        """
        Initialize the comparison engine

        Args:
            phash_weight: Weight for pHash similarity (0-1)
            orb_weight: Weight for ORB feature similarity (0-1)
            color_weight: Weight for color histogram similarity (0-1)
            similarity_threshold: Minimum similarity to be considered a match
        """
        self.phash = MultiHashCompare(hash_size=16)
        self.orb = ORBCompare(n_features=1000)
        self.color = ColorHistogramCompare(bins=(16, 16, 16), color_space='HSV')
        self.dominant_color = DominantColorCompare(n_colors=5)

        self.weights = {
            'phash': phash_weight,
            'orb': orb_weight,
            'color': color_weight
        }
        self.threshold = similarity_threshold

    async def compute_fingerprint(
        self,
        image_source: str | bytes
    ) -> Optional[Dict]:
        """
        Compute complete fingerprint for an image

        Returns:
            Dictionary containing all hashes and features
        """
        try:
            # Run all fingerprint computations in parallel
            phash_task = self.phash.compute_all_hashes(image_source)
            orb_task = self.orb.extract_features(image_source)
            color_task = self.color.compute_histogram(image_source)
            dominant_task = self.dominant_color.extract_dominant_colors(image_source)

            results = await asyncio.gather(
                phash_task,
                orb_task,
                color_task,
                dominant_task,
                return_exceptions=True
            )

            hashes = results[0] if not isinstance(results[0], Exception) else {}
            orb_kp, orb_desc, orb_count = results[1] if not isinstance(results[1], Exception) else (None, None, 0)
            color_hist = results[2] if not isinstance(results[2], Exception) else None
            dominant_colors = results[3] if not isinstance(results[3], Exception) else None

            return {
                'hashes': hashes,
                'orb': {
                    'keypoints': orb_kp.tolist() if orb_kp is not None else None,
                    'descriptors': orb_desc.tolist() if orb_desc is not None else None,
                    'feature_count': orb_count
                },
                'color': {
                    'histogram': color_hist.tolist() if color_hist is not None else None,
                    'dominant_colors': dominant_colors.tolist() if dominant_colors is not None else None
                }
            }

        except Exception as e:
            logger.error(f"Error computing fingerprint: {e}")
            return None

    async def compare(
        self,
        image1: str | bytes,
        image2: str | bytes,
        fast_mode: bool = False
    ) -> ComparisonResult:
        """
        Compare two images using multiple algorithms

        Args:
            image1: First image (URL, path, or bytes)
            image2: Second image (URL, path, or bytes)
            fast_mode: Use only pHash for faster comparison

        Returns:
            ComparisonResult with detailed scores
        """
        try:
            if fast_mode:
                # Only use pHash for quick comparison
                similarity, hash1, hash2 = await self.phash.compare_images(image1, image2)
                return ComparisonResult(
                    overall_similarity=similarity,
                    phash_score=similarity,
                    orb_score=0,
                    color_score=0,
                    similarity_level=self._get_similarity_level(similarity),
                    is_match=similarity >= self.threshold,
                    details={'phash1': hash1, 'phash2': hash2}
                )

            # Run all comparisons in parallel
            phash_task = self._compare_phash(image1, image2)
            orb_task = self._compare_orb(image1, image2)
            color_task = self._compare_color(image1, image2)

            results = await asyncio.gather(
                phash_task,
                orb_task,
                color_task,
                return_exceptions=True
            )

            # Extract results
            phash_score, phash_details = results[0] if not isinstance(results[0], Exception) else (0, {})
            orb_score, orb_details = results[1] if not isinstance(results[1], Exception) else (0, {})
            color_score, color_details = results[2] if not isinstance(results[2], Exception) else (0, {})

            # Compute weighted average
            overall = (
                phash_score * self.weights['phash'] +
                orb_score * self.weights['orb'] +
                color_score * self.weights['color']
            )

            return ComparisonResult(
                overall_similarity=round(overall, 2),
                phash_score=round(phash_score, 2),
                orb_score=round(orb_score, 2),
                color_score=round(color_score, 2),
                similarity_level=self._get_similarity_level(overall),
                is_match=overall >= self.threshold,
                details={
                    'phash': phash_details,
                    'orb': orb_details,
                    'color': color_details
                }
            )

        except Exception as e:
            logger.error(f"Error comparing images: {e}")
            return ComparisonResult(
                overall_similarity=0,
                phash_score=0,
                orb_score=0,
                color_score=0,
                similarity_level='error',
                is_match=False,
                details={'error': str(e)}
            )

    async def _compare_phash(
        self,
        image1: str | bytes,
        image2: str | bytes
    ) -> Tuple[float, Dict]:
        """Compare using pHash"""
        hashes1 = await self.phash.compute_all_hashes(image1)
        hashes2 = await self.phash.compute_all_hashes(image2)

        if not hashes1 or not hashes2:
            return 0, {}

        result = self.phash.compute_multi_similarity(hashes1, hashes2)
        return result['overall'], {'hashes1': hashes1, 'hashes2': hashes2, 'scores': result['scores']}

    async def _compare_orb(
        self,
        image1: str | bytes,
        image2: str | bytes
    ) -> Tuple[float, Dict]:
        """Compare using ORB features"""
        similarity, count1, count2 = await self.orb.compare_images(image1, image2)
        return similarity, {'features1': count1, 'features2': count2}

    async def _compare_color(
        self,
        image1: str | bytes,
        image2: str | bytes
    ) -> Tuple[float, Dict]:
        """Compare using color histogram"""
        results = await self.color.compare_images(image1, image2)
        return results.get('average', 0), results

    def _get_similarity_level(self, score: float) -> str:
        """Get similarity level based on score"""
        if score >= 95:
            return 'exact'
        elif score >= 80:
            return 'high'
        elif score >= 60:
            return 'medium'
        else:
            return 'low'

    async def batch_compare(
        self,
        source_image: str | bytes,
        target_images: List[str | bytes],
        fast_mode: bool = True,
        min_similarity: float = 50.0
    ) -> List[Tuple[int, ComparisonResult]]:
        """
        Compare one source image against multiple targets

        Args:
            source_image: The original image to protect
            target_images: List of images to compare against
            fast_mode: Use fast comparison (pHash only)
            min_similarity: Minimum similarity to include in results

        Returns:
            List of (index, ComparisonResult) tuples, sorted by similarity
        """
        results = []

        # Run comparisons in batches to avoid overwhelming
        batch_size = 10
        for i in range(0, len(target_images), batch_size):
            batch = target_images[i:i + batch_size]
            tasks = [
                self.compare(source_image, target, fast_mode=fast_mode)
                for target in batch
            ]
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)

            for j, result in enumerate(batch_results):
                if not isinstance(result, Exception) and result.overall_similarity >= min_similarity:
                    results.append((i + j, result))

        # Sort by similarity (highest first)
        results.sort(key=lambda x: x[1].overall_similarity, reverse=True)

        return results
