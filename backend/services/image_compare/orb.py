"""
ORB (Oriented FAST and Rotated BRIEF) Feature Matching
ORB 特徵點比對 - 對旋轉、縮放具有不變性
"""
import cv2
import numpy as np
from PIL import Image
from io import BytesIO
import httpx
from typing import Optional, Tuple, List
from loguru import logger


class ORBCompare:
    """
    ORB feature matching for images
    提取圖片關鍵特徵點並進行匹配，適合檢測局部相似
    """

    def __init__(
        self,
        n_features: int = 1000,
        scale_factor: float = 1.2,
        n_levels: int = 8
    ):
        """
        Initialize ORB comparator

        Args:
            n_features: Maximum number of features to detect
            scale_factor: Pyramid decimation ratio
            n_levels: Number of pyramid levels
        """
        self.orb = cv2.ORB_create(
            nfeatures=n_features,
            scaleFactor=scale_factor,
            nlevels=n_levels
        )
        # Use BFMatcher with Hamming distance for binary descriptors
        self.bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)

    async def extract_features(
        self,
        image_source: str | bytes | Image.Image
    ) -> Tuple[Optional[np.ndarray], Optional[np.ndarray], int]:
        """
        Extract ORB features from an image

        Returns:
            Tuple of (keypoints, descriptors, feature_count)
        """
        try:
            # Load and convert to grayscale
            image = await self._load_image(image_source)
            if image is None:
                return None, None, 0

            # Convert to grayscale for ORB
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

            # Detect and compute
            keypoints, descriptors = self.orb.detectAndCompute(gray, None)

            if descriptors is None:
                return None, None, 0

            # Convert keypoints to serializable format
            kp_array = np.array([[kp.pt[0], kp.pt[1], kp.size, kp.angle] for kp in keypoints])

            return kp_array, descriptors, len(keypoints)

        except Exception as e:
            logger.error(f"Error extracting ORB features: {e}")
            return None, None, 0

    async def _load_image(self, source: str | bytes | Image.Image) -> Optional[np.ndarray]:
        """Load image and convert to numpy array"""
        try:
            if isinstance(source, np.ndarray):
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
            logger.error(f"Error loading image for ORB: {e}")
            return None

    def match_features(
        self,
        desc1: np.ndarray,
        desc2: np.ndarray,
        ratio_threshold: float = 0.75
    ) -> Tuple[int, int, float]:
        """
        Match features between two sets of descriptors using Lowe's ratio test

        Returns:
            Tuple of (good_matches, total_matches, match_ratio)
        """
        try:
            if desc1 is None or desc2 is None:
                return 0, 0, 0.0

            # KNN match
            matches = self.bf.knnMatch(desc1, desc2, k=2)

            # Apply Lowe's ratio test
            good_matches = []
            for match in matches:
                if len(match) == 2:
                    m, n = match
                    if m.distance < ratio_threshold * n.distance:
                        good_matches.append(m)

            total_matches = len(matches)
            good_count = len(good_matches)

            # Calculate match ratio
            match_ratio = good_count / min(len(desc1), len(desc2)) if min(len(desc1), len(desc2)) > 0 else 0

            return good_count, total_matches, match_ratio

        except Exception as e:
            logger.error(f"Error matching features: {e}")
            return 0, 0, 0.0

    def compute_similarity(
        self,
        desc1: np.ndarray,
        desc2: np.ndarray,
        min_matches: int = 10
    ) -> float:
        """
        Compute similarity score based on ORB feature matching

        Returns:
            Similarity score 0-100
        """
        good_matches, total_matches, match_ratio = self.match_features(desc1, desc2)

        if good_matches < min_matches:
            # Not enough matches for reliable comparison
            return max(0, good_matches / min_matches * 50)  # Scale to 0-50

        # Calculate similarity based on match ratio
        # Good match ratio typically ranges from 0 to 0.5 for similar images
        similarity = min(100, match_ratio * 200)

        return round(similarity, 2)

    async def compare_images(
        self,
        image1: str | bytes | Image.Image,
        image2: str | bytes | Image.Image
    ) -> Tuple[float, int, int]:
        """
        Compare two images using ORB features

        Returns:
            Tuple of (similarity_score, features1_count, features2_count)
        """
        _, desc1, count1 = await self.extract_features(image1)
        _, desc2, count2 = await self.extract_features(image2)

        if desc1 is None or desc2 is None:
            return 0.0, count1, count2

        similarity = self.compute_similarity(desc1, desc2)
        return similarity, count1, count2


class SIFTCompare:
    """
    SIFT-like feature matching (using ORB as SIFT requires opencv-contrib)
    適用於需要更高精度的場景
    """

    def __init__(self):
        # Use ORB with more features for SIFT-like behavior
        self.orb_compare = ORBCompare(n_features=2000, scale_factor=1.1, n_levels=12)

    async def compare_images(
        self,
        image1: str | bytes | Image.Image,
        image2: str | bytes | Image.Image
    ) -> float:
        similarity, _, _ = await self.orb_compare.compare_images(image1, image2)
        return similarity
