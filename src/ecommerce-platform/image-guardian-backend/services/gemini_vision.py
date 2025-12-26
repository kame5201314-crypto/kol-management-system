"""
Gemini Vision 圖片比對服務

使用 Google Gemini API 進行智慧圖片相似度分析
比傳統 pHash 更準確，可識別：
- 修改過的圖片（裁切、加浮水印、調色）
- 合成圖片（拼接、P圖）
- 翻拍/截圖的圖片
"""

import os
import base64
import json
from typing import Optional, Tuple
from dataclasses import dataclass
import google.generativeai as genai
from PIL import Image
import io


@dataclass
class GeminiCompareResult:
    """Gemini 比對結果"""
    is_same_product: bool          # 是否為同一商品
    similarity_score: float        # 相似度分數 (0-100)
    confidence: float              # AI 信心度 (0-100)
    modification_detected: bool    # 是否偵測到修改
    modification_types: list       # 修改類型列表
    reasoning: str                 # AI 分析理由
    is_infringement: bool          # 是否判定為侵權

    def to_dict(self) -> dict:
        return {
            "is_same_product": self.is_same_product,
            "similarity_score": self.similarity_score,
            "confidence": self.confidence,
            "modification_detected": self.modification_detected,
            "modification_types": self.modification_types,
            "reasoning": self.reasoning,
            "is_infringement": self.is_infringement
        }


class GeminiVisionService:
    """
    Gemini Vision 圖片比對服務

    使用方式：
        service = GeminiVisionService(api_key="your-api-key")
        result = service.compare_images(original_image, suspect_image)
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        初始化 Gemini Vision 服務

        Args:
            api_key: Gemini API Key，若未提供則從環境變數讀取
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")

        if not self.api_key:
            raise ValueError(
                "Gemini API Key 未設定！請設定環境變數 GEMINI_API_KEY 或傳入 api_key 參數"
            )

        # 設定 Gemini
        genai.configure(api_key=self.api_key)

        # 使用 Gemini 2.0 Flash (最新且快速)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')

        # 比對提示詞
        self.compare_prompt = """你是一個專業的圖片版權鑑定專家。請比較這兩張圖片：

第一張圖片是「原創圖片」（版權所有者的原圖）
第二張圖片是「可疑圖片」（可能是盜用的圖片）

請分析並回答以下問題，以 JSON 格式回覆：

{
  "is_same_product": true/false,  // 兩張圖是否展示同一個商品/物品
  "similarity_score": 0-100,      // 整體相似度分數
  "confidence": 0-100,            // 你對這個判斷的信心度
  "modification_detected": true/false,  // 是否偵測到圖片被修改
  "modification_types": [],       // 偵測到的修改類型，可能包含：
                                  // "cropped" (裁切), "watermark_added" (加浮水印),
                                  // "color_adjusted" (調色), "rotated" (旋轉),
                                  // "text_overlay" (加文字), "border_added" (加邊框),
                                  // "screenshot" (截圖), "composite" (合成)
  "reasoning": "你的分析理由",
  "is_infringement": true/false   // 綜合判斷是否為侵權（盜圖）
}

判斷標準：
1. 如果是同一商品的照片，且可疑圖片明顯是從原創圖片修改而來 → 侵權
2. 如果是同一商品但明顯是不同角度拍攝的不同照片 → 不是侵權
3. 如果商品不同但構圖相似 → 不是侵權
4. 相似度 >= 85% 且偵測到修改 → 很可能侵權

請只回覆 JSON，不要有其他文字。"""

    def _load_image(self, image_source) -> Image.Image:
        """載入圖片"""
        if isinstance(image_source, bytes):
            return Image.open(io.BytesIO(image_source))
        elif isinstance(image_source, str):
            if os.path.exists(image_source):
                return Image.open(image_source)
            else:
                # 假設是 base64
                image_data = base64.b64decode(image_source)
                return Image.open(io.BytesIO(image_data))
        elif isinstance(image_source, Image.Image):
            return image_source
        else:
            raise ValueError(f"不支援的圖片格式: {type(image_source)}")

    def compare_images(
        self,
        original_image,
        suspect_image,
        context: Optional[str] = None
    ) -> GeminiCompareResult:
        """
        比較兩張圖片的相似度

        Args:
            original_image: 原創圖片 (bytes, 檔案路徑, base64, 或 PIL.Image)
            suspect_image: 可疑圖片
            context: 額外上下文資訊（如商品類別）

        Returns:
            GeminiCompareResult: 比對結果
        """
        try:
            # 載入圖片
            img1 = self._load_image(original_image)
            img2 = self._load_image(suspect_image)

            # 建立提示詞
            prompt = self.compare_prompt
            if context:
                prompt += f"\n\n額外資訊：{context}"

            # 呼叫 Gemini API
            response = self.model.generate_content([
                prompt,
                img1,
                img2
            ])

            # 解析回應
            result_text = response.text.strip()

            # 移除可能的 markdown 標記
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            result_json = json.loads(result_text.strip())

            return GeminiCompareResult(
                is_same_product=result_json.get("is_same_product", False),
                similarity_score=float(result_json.get("similarity_score", 0)),
                confidence=float(result_json.get("confidence", 0)),
                modification_detected=result_json.get("modification_detected", False),
                modification_types=result_json.get("modification_types", []),
                reasoning=result_json.get("reasoning", ""),
                is_infringement=result_json.get("is_infringement", False)
            )

        except json.JSONDecodeError as e:
            # JSON 解析失敗，回傳保守結果
            return GeminiCompareResult(
                is_same_product=False,
                similarity_score=0,
                confidence=0,
                modification_detected=False,
                modification_types=[],
                reasoning=f"AI 回應解析失敗: {str(e)}",
                is_infringement=False
            )
        except Exception as e:
            raise RuntimeError(f"Gemini API 呼叫失敗: {str(e)}")

    def analyze_single_image(self, image_source) -> dict:
        """
        分析單張圖片的特徵

        用於建立圖片的 AI 描述，以便後續搜尋
        """
        try:
            img = self._load_image(image_source)

            prompt = """請分析這張商品圖片，以 JSON 格式回覆：

{
  "product_type": "商品類型",
  "main_colors": ["主要顏色列表"],
  "features": ["商品特徵列表"],
  "text_detected": ["圖片中的文字"],
  "watermark_detected": true/false,
  "background_type": "背景類型（純色/場景/透明）",
  "image_quality": "high/medium/low",
  "description": "簡短描述這張圖片"
}

請只回覆 JSON。"""

            response = self.model.generate_content([prompt, img])
            result_text = response.text.strip()

            # 清理 markdown
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            return json.loads(result_text.strip())

        except Exception as e:
            return {
                "error": str(e),
                "product_type": "unknown",
                "description": "分析失敗"
            }

    def batch_compare(
        self,
        original_image,
        suspect_images: list,
        threshold: float = 80.0
    ) -> list:
        """
        批量比對：一張原圖對多張可疑圖

        Args:
            original_image: 原創圖片
            suspect_images: 可疑圖片列表
            threshold: 侵權判定閾值

        Returns:
            比對結果列表，按相似度降序排列
        """
        results = []

        for i, suspect in enumerate(suspect_images):
            try:
                result = self.compare_images(original_image, suspect)
                results.append({
                    "index": i,
                    "result": result.to_dict(),
                    "is_above_threshold": result.similarity_score >= threshold
                })
            except Exception as e:
                results.append({
                    "index": i,
                    "error": str(e),
                    "result": None,
                    "is_above_threshold": False
                })

        # 按相似度排序
        results.sort(
            key=lambda x: x["result"]["similarity_score"] if x["result"] else 0,
            reverse=True
        )

        return results


# 測試用
if __name__ == "__main__":
    # 確保有設定 API Key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("請設定 GEMINI_API_KEY 環境變數")
        exit(1)

    service = GeminiVisionService(api_key)
    print("Gemini Vision Service 初始化成功！")
    print(f"使用模型: {service.model.model_name}")
