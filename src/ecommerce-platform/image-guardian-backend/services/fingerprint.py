"""
圖片指紋服務 - pHash + ORB 雙重檢測

核心功能：
1. pHash (感知雜湊) - 計算圖片的感知指紋，抵抗縮放、壓縮、調色
2. ORB (Oriented FAST and Rotated BRIEF) - 特徵點比對，抵抗裁切、旋轉
3. 顏色直方圖 - 輔助顏色相似度比對

使用方式：
    from services.fingerprint import FingerprintService

    service = FingerprintService()
    fp1 = service.compute_fingerprint("image1.jpg")
    fp2 = service.compute_fingerprint("image2.jpg")
    result = service.compare(fp1, fp2)
    print(f"相似度: {result['overall']}%")
"""

import cv2
import imagehash
import numpy as np
from PIL import Image
from typing import Optional, Tuple
from dataclasses import dataclass, asdict
import base64
import io


@dataclass
class ImageFingerprint:
    """圖片指紋數據結構"""
    phash: str                           # 感知雜湊 (64 bit hex)
    orb_descriptors: Optional[bytes]     # ORB 特徵描述符 (二進制)
    color_histogram: Optional[bytes]     # 顏色直方圖 (二進制)
    feature_count: int                   # ORB 特徵點數量
    width: int                           # 圖片寬度
    height: int                          # 圖片高度

    def to_dict(self) -> dict:
        """轉換為字典格式"""
        return {
            "phash": self.phash,
            "orb_descriptors": base64.b64encode(self.orb_descriptors).decode() if self.orb_descriptors else None,
            "color_histogram": base64.b64encode(self.color_histogram).decode() if self.color_histogram else None,
            "feature_count": self.feature_count,
            "width": self.width,
            "height": self.height,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "ImageFingerprint":
        """從字典格式還原"""
        return cls(
            phash=data["phash"],
            orb_descriptors=base64.b64decode(data["orb_descriptors"]) if data.get("orb_descriptors") else None,
            color_histogram=base64.b64decode(data["color_histogram"]) if data.get("color_histogram") else None,
            feature_count=data.get("feature_count", 0),
            width=data.get("width", 0),
            height=data.get("height", 0),
        )


@dataclass
class SimilarityResult:
    """相似度比對結果"""
    overall: float           # 綜合相似度 (0-100)
    phash_score: float       # pHash 分數 (0-100)
    phash_distance: int      # pHash 漢明距離 (0-64)
    orb_score: float         # ORB 分數 (0-100)
    orb_matches: int         # ORB 匹配點數
    color_score: float       # 顏色直方圖分數 (0-100)
    level: str               # 相似度等級

    def to_dict(self) -> dict:
        return asdict(self)


class FingerprintService:
    """圖片指紋服務"""

    def __init__(
        self,
        hash_size: int = 8,
        orb_features: int = 500,
        phash_weight: float = 0.50,
        orb_weight: float = 0.35,
        color_weight: float = 0.15
    ):
        """
        初始化指紋服務

        Args:
            hash_size: pHash 計算大小 (默認 8，生成 64 bit 指紋)
            orb_features: ORB 特徵點數量
            phash_weight: pHash 在綜合評分中的權重
            orb_weight: ORB 在綜合評分中的權重
            color_weight: 顏色直方圖在綜合評分中的權重
        """
        self.hash_size = hash_size
        self.orb = cv2.ORB_create(nfeatures=orb_features)
        self.phash_weight = phash_weight
        self.orb_weight = orb_weight
        self.color_weight = color_weight

        # 特徵匹配器
        self.bf_matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    def compute_fingerprint(self, image_source) -> ImageFingerprint:
        """
        計算圖片指紋

        Args:
            image_source: 圖片路徑 (str) 或 PIL Image 或 bytes

        Returns:
            ImageFingerprint 對象
        """
        # 載入圖片
        if isinstance(image_source, str):
            pil_image = Image.open(image_source)
            cv_image = cv2.imread(image_source)
        elif isinstance(image_source, bytes):
            pil_image = Image.open(io.BytesIO(image_source))
            nparr = np.frombuffer(image_source, np.uint8)
            cv_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        elif isinstance(image_source, Image.Image):
            pil_image = image_source
            cv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        else:
            raise ValueError(f"Unsupported image source type: {type(image_source)}")

        # 1. 計算 pHash
        phash = str(imagehash.phash(pil_image, hash_size=self.hash_size))

        # 2. 計算 ORB 特徵
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        keypoints, descriptors = self.orb.detectAndCompute(gray, None)

        orb_bytes = None
        feature_count = 0
        if descriptors is not None:
            orb_bytes = descriptors.tobytes()
            feature_count = len(keypoints)

        # 3. 計算顏色直方圖
        color_hist = self._compute_color_histogram(cv_image)
        color_bytes = color_hist.tobytes()

        # 獲取尺寸
        height, width = cv_image.shape[:2]

        return ImageFingerprint(
            phash=phash,
            orb_descriptors=orb_bytes,
            color_histogram=color_bytes,
            feature_count=feature_count,
            width=width,
            height=height
        )

    def compare(self, fp1: ImageFingerprint, fp2: ImageFingerprint) -> SimilarityResult:
        """
        比對兩個圖片指紋的相似度

        Args:
            fp1: 第一個圖片指紋
            fp2: 第二個圖片指紋

        Returns:
            SimilarityResult 相似度結果
        """
        # 1. pHash 比對 (漢明距離)
        phash_distance = self._hamming_distance(fp1.phash, fp2.phash)
        phash_score = max(0, 100 - (phash_distance * 100 / 64))

        # 2. ORB 比對 (特徵點匹配)
        orb_score = 0.0
        orb_matches = 0
        if fp1.orb_descriptors and fp2.orb_descriptors:
            orb_score, orb_matches = self._compare_orb(
                fp1.orb_descriptors,
                fp2.orb_descriptors
            )

        # 3. 顏色直方圖比對
        color_score = 0.0
        if fp1.color_histogram and fp2.color_histogram:
            color_score = self._compare_color_histogram(
                fp1.color_histogram,
                fp2.color_histogram
            )

        # 4. 綜合評分 (加權平均)
        overall = (
            phash_score * self.phash_weight +
            orb_score * self.orb_weight +
            color_score * self.color_weight
        )

        # 5. 判定相似度等級
        level = self._get_similarity_level(overall)

        return SimilarityResult(
            overall=round(overall, 2),
            phash_score=round(phash_score, 2),
            phash_distance=phash_distance,
            orb_score=round(orb_score, 2),
            orb_matches=orb_matches,
            color_score=round(color_score, 2),
            level=level
        )

    def _hamming_distance(self, hash1: str, hash2: str) -> int:
        """計算兩個 hex 字串的漢明距離"""
        return bin(int(hash1, 16) ^ int(hash2, 16)).count('1')

    def _compare_orb(self, desc1_bytes: bytes, desc2_bytes: bytes) -> Tuple[float, int]:
        """
        ORB 特徵比對

        Returns:
            (分數, 匹配點數)
        """
        try:
            # 還原描述符
            desc1 = np.frombuffer(desc1_bytes, dtype=np.uint8).reshape(-1, 32)
            desc2 = np.frombuffer(desc2_bytes, dtype=np.uint8).reshape(-1, 32)

            if len(desc1) == 0 or len(desc2) == 0:
                return 0.0, 0

            # 特徵匹配
            matches = self.bf_matcher.match(desc1, desc2)

            if len(matches) == 0:
                return 0.0, 0

            # 計算匹配品質
            # 距離越小表示匹配越好，最大距離約 256
            distances = [m.distance for m in matches]
            avg_distance = np.mean(distances)

            # 轉換為 0-100 分數
            # 距離 0 = 100分，距離 256 = 0分
            score = max(0, 100 - (avg_distance / 2.56))

            # 根據匹配點數量調整分數
            # 匹配點越多越可靠
            match_ratio = min(len(matches) / 50, 1.0)  # 50 個匹配點視為完美
            adjusted_score = score * (0.5 + 0.5 * match_ratio)

            return adjusted_score, len(matches)

        except Exception as e:
            print(f"ORB comparison error: {e}")
            return 0.0, 0

    def _compute_color_histogram(self, image: np.ndarray) -> np.ndarray:
        """
        計算顏色直方圖

        使用 HSV 色彩空間，對 H 和 S 通道計算 2D 直方圖
        """
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        hist = cv2.calcHist(
            [hsv],
            [0, 1],      # H 和 S 通道
            None,
            [50, 60],    # bin 數量
            [0, 180, 0, 256]  # 值範圍
        )
        return cv2.normalize(hist, hist).flatten()

    def _compare_color_histogram(self, hist1_bytes: bytes, hist2_bytes: bytes) -> float:
        """
        比對顏色直方圖

        使用相關係數方法
        """
        try:
            hist1 = np.frombuffer(hist1_bytes, dtype=np.float32)
            hist2 = np.frombuffer(hist2_bytes, dtype=np.float32)

            # 使用相關係數比對，結果範圍 -1 到 1
            correlation = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)

            # 轉換為 0-100 分數
            score = (correlation + 1) * 50  # -1 -> 0, 0 -> 50, 1 -> 100
            return max(0, min(100, score))

        except Exception as e:
            print(f"Color histogram comparison error: {e}")
            return 0.0

    def _get_similarity_level(self, score: float) -> str:
        """根據分數判定相似度等級"""
        if score >= 95:
            return "exact"
        elif score >= 80:
            return "high"
        elif score >= 50:
            return "medium"
        else:
            return "low"


# ========== 使用範例 ==========

if __name__ == "__main__":
    # 簡單測試
    service = FingerprintService()

    # 假設有兩張測試圖片
    # fp1 = service.compute_fingerprint("original.jpg")
    # fp2 = service.compute_fingerprint("suspect.jpg")
    # result = service.compare(fp1, fp2)
    # print(f"相似度: {result.overall}% ({result.level})")
    # print(f"pHash: {result.phash_score}% (距離: {result.phash_distance})")
    # print(f"ORB: {result.orb_score}% ({result.orb_matches} 匹配點)")
    # print(f"顏色: {result.color_score}%")

    print("FingerprintService 已初始化")
    print(f"pHash 權重: {service.phash_weight}")
    print(f"ORB 權重: {service.orb_weight}")
    print(f"顏色權重: {service.color_weight}")
