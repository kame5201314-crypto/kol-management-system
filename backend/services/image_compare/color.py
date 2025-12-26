"""
Color Histogram Comparison
顏色直方圖比對 - 比較圖片的顏色分布
"""
import cv2
import numpy as np
from PIL import Image
from io import BytesIO
import httpx
from typing import Optional, Tuple, Dict
from loguru import logger


class ColorHistogramCompare:
    """
    Color histogram comparison for images
    通過比較顏色分布來檢測相似圖片
    """

    def __init__(
        self,
        bins: Tuple[int, int, int] = (8, 8, 8),
        color_space: str = 'HSV'
    ):
        """
        Initialize color histogram comparator

        Args:
            bins: Number of bins for each channel (H, S, V or B, G, R)
            color_space: 'HSV' or 'RGB'
        """
        self.bins = bins
        self.color_space = color_space

    async def compute_histogram(
        self,
        image_source: str | bytes | Image.Image
    ) -> Optional[np.ndarray]:
        """
        Compute color histogram for an image

        Returns:
            Normalized histogram array
        """
        try:
            image = await self._load_image(image_source)
            if image is None:
                return None

            # Convert color space if needed
            if self.color_space == 'HSV':
                image = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            elif self.color_space == 'LAB':
                image = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)

            # Compute histogram
            hist = cv2.calcHist(
                [image],
                [0, 1, 2],  # All channels
                None,
                list(self.bins),
                [0, 256, 0, 256, 0, 256] if self.color_space != 'HSV'
                else [0, 180, 0, 256, 0, 256]  # HSV has different ranges
            )

            # Normalize
            hist = cv2.normalize(hist, hist).flatten()

            return hist

        except Exception as e:
            logger.error(f"Error computing histogram: {e}")
            return None

    async def _load_image(self, source: str | bytes | Image.Image) -> Optional[np.ndarray]:
        """Load image and convert to numpy array"""
        try:
            if isinstance(source, np.ndarray):
                if len(source.shape) == 2:
                    source = cv2.cvtColor(source, cv2.COLOR_GRAY2RGB)
                return source

            if isinstance(source, Image.Image):
                return np.array(source.convert('RGB'))

            if isinstance(source, bytes):
                pil_image = Image.open(BytesIO(source)).convert('RGB')
                return np.array(pil_image)

            if isinstance(source, str):
                if source.startswith(('http://', 'https://')):
                    async with httpx.AsyncClient(timeout=30) as client:
                        response = await client.get(source)
                        response.raise_for_status()
                        pil_image = Image.open(BytesIO(response.content)).convert('RGB')
                        return np.array(pil_image)
                elif source.startswith('data:image'):
                    import base64
                    header, data = source.split(',', 1)
                    image_data = base64.b64decode(data)
                    pil_image = Image.open(BytesIO(image_data)).convert('RGB')
                    return np.array(pil_image)
                else:
                    pil_image = Image.open(source).convert('RGB')
                    return np.array(pil_image)

            return None

        except Exception as e:
            logger.error(f"Error loading image for histogram: {e}")
            return None

    def compute_similarity(
        self,
        hist1: np.ndarray,
        hist2: np.ndarray,
        method: str = 'correlation'
    ) -> float:
        """
        Compute similarity between two histograms

        Args:
            hist1, hist2: Histogram arrays
            method: Comparison method ('correlation', 'chi-square', 'intersection', 'bhattacharyya')

        Returns:
            Similarity score 0-100
        """
        try:
            if hist1 is None or hist2 is None:
                return 0.0

            method_map = {
                'correlation': cv2.HISTCMP_CORREL,
                'chi-square': cv2.HISTCMP_CHISQR,
                'intersection': cv2.HISTCMP_INTERSECT,
                'bhattacharyya': cv2.HISTCMP_BHATTACHARYYA
            }

            cv_method = method_map.get(method, cv2.HISTCMP_CORREL)
            result = cv2.compareHist(hist1, hist2, cv_method)

            # Normalize result to 0-100 based on method
            if method == 'correlation':
                # Result ranges from -1 to 1
                similarity = (result + 1) / 2 * 100
            elif method == 'chi-square':
                # Lower is better, normalize inversely
                similarity = max(0, 100 - result * 10)
            elif method == 'intersection':
                # Result is sum of minimum values, normalize by max possible
                similarity = result * 100
            elif method == 'bhattacharyya':
                # Result ranges from 0 (identical) to 1 (completely different)
                similarity = (1 - result) * 100
            else:
                similarity = result * 100

            return round(max(0, min(100, similarity)), 2)

        except Exception as e:
            logger.error(f"Error computing histogram similarity: {e}")
            return 0.0

    async def compare_images(
        self,
        image1: str | bytes | Image.Image,
        image2: str | bytes | Image.Image,
        methods: list = None
    ) -> Dict[str, float]:
        """
        Compare two images using color histograms

        Returns:
            Dict with similarity scores for different methods
        """
        if methods is None:
            methods = ['correlation', 'bhattacharyya']

        hist1 = await self.compute_histogram(image1)
        hist2 = await self.compute_histogram(image2)

        if hist1 is None or hist2 is None:
            return {m: 0.0 for m in methods}

        results = {}
        for method in methods:
            results[method] = self.compute_similarity(hist1, hist2, method)

        # Compute average
        results['average'] = round(sum(results.values()) / len(results), 2)

        return results


class DominantColorCompare:
    """
    Dominant color extraction and comparison
    提取主色調並比較
    """

    def __init__(self, n_colors: int = 5):
        self.n_colors = n_colors

    async def extract_dominant_colors(
        self,
        image_source: str | bytes | Image.Image
    ) -> Optional[np.ndarray]:
        """
        Extract dominant colors using K-means clustering

        Returns:
            Array of dominant colors (RGB)
        """
        try:
            # Load image
            if isinstance(image_source, str):
                if image_source.startswith(('http://', 'https://')):
                    async with httpx.AsyncClient(timeout=30) as client:
                        response = await client.get(image_source)
                        image = Image.open(BytesIO(response.content)).convert('RGB')
                elif image_source.startswith('data:image'):
                    import base64
                    header, data = image_source.split(',', 1)
                    image_data = base64.b64decode(data)
                    image = Image.open(BytesIO(image_data)).convert('RGB')
                else:
                    image = Image.open(image_source).convert('RGB')
            elif isinstance(image_source, bytes):
                image = Image.open(BytesIO(image_source)).convert('RGB')
            else:
                image = image_source.convert('RGB')

            # Resize for faster processing
            image = image.resize((100, 100))
            pixels = np.array(image).reshape(-1, 3).astype(np.float32)

            # K-means clustering
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
            _, labels, centers = cv2.kmeans(
                pixels, self.n_colors, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS
            )

            # Sort by frequency
            unique, counts = np.unique(labels, return_counts=True)
            sorted_indices = np.argsort(-counts)
            sorted_centers = centers[sorted_indices]

            return sorted_centers.astype(np.uint8)

        except Exception as e:
            logger.error(f"Error extracting dominant colors: {e}")
            return None

    def compare_dominant_colors(
        self,
        colors1: np.ndarray,
        colors2: np.ndarray
    ) -> float:
        """
        Compare dominant colors between two images

        Returns:
            Similarity score 0-100
        """
        try:
            if colors1 is None or colors2 is None:
                return 0.0

            # Compute color distance for each dominant color
            total_similarity = 0
            for c1 in colors1:
                min_dist = float('inf')
                for c2 in colors2:
                    dist = np.linalg.norm(c1.astype(float) - c2.astype(float))
                    min_dist = min(min_dist, dist)
                # Max distance in RGB space is sqrt(3 * 255^2) ≈ 441.67
                similarity = (1 - min_dist / 441.67) * 100
                total_similarity += similarity

            return round(total_similarity / len(colors1), 2)

        except Exception as e:
            logger.error(f"Error comparing dominant colors: {e}")
            return 0.0
