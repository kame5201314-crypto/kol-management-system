"""
供應商學習整合模組
Vendor Learning Integration Module

整合 vendorRules.json 實現：
- 自動分類供應商
- 學習新供應商
- 匯出/匯入規則

作者：AI Invoice Automation Bot
"""

import os
import json
import re
from datetime import datetime
from typing import Optional, Dict, Any, List, Tuple
from dataclasses import dataclass


@dataclass
class VendorLookupResult:
    """供應商查詢結果"""
    found: bool
    vendor_name: str
    matched_by: str = ""  # exact, alias, fuzzy
    original_query: str = ""
    category: str = "other"
    category_label: str = "未分類"
    confidence: float = 0.0
    notes: str = ""


class VendorLearningService:
    """供應商學習服務（Python 版本）"""

    # 預設規則檔案路徑
    DEFAULT_RULES_PATH = os.path.join(
        os.path.dirname(__file__),
        "..", "data", "vendorRules.json"
    )

    # 本地規則檔案（可覆蓋預設）
    LOCAL_RULES_PATH = os.path.join(
        os.path.dirname(__file__),
        "vendor_rules_local.json"
    )

    # 類別標籤對照
    CATEGORY_LABELS = {
        "office_supplies": "辦公用品",
        "transportation": "交通費",
        "meals": "餐飲費",
        "utilities": "水電費",
        "rent": "租金",
        "marketing": "行銷費用",
        "professional": "專業服務",
        "equipment": "設備",
        "inventory": "進貨成本",
        "shipping": "運費",
        "insurance": "保險",
        "tax": "稅務",
        "other": "其他"
    }

    def __init__(self, rules_path: Optional[str] = None):
        """
        初始化服務

        Args:
            rules_path: 規則檔案路徑（可選）
        """
        self.rules_path = rules_path or self._get_rules_path()
        self.rules: Dict[str, Any] = {}
        self._load_rules()

    def _get_rules_path(self) -> str:
        """取得規則檔案路徑"""
        # 優先使用本地規則
        if os.path.exists(self.LOCAL_RULES_PATH):
            return self.LOCAL_RULES_PATH

        # 其次使用前端共用規則
        if os.path.exists(self.DEFAULT_RULES_PATH):
            return self.DEFAULT_RULES_PATH

        # 都沒有則建立新的
        return self.LOCAL_RULES_PATH

    def _load_rules(self) -> None:
        """載入規則"""
        if os.path.exists(self.rules_path):
            try:
                with open(self.rules_path, 'r', encoding='utf-8') as f:
                    self.rules = json.load(f)
                print(f"📖 已載入供應商規則：{len(self.rules.get('rules', {}))} 個")
            except Exception as e:
                print(f"⚠️ 載入規則失敗：{e}")
                self.rules = {"rules": {}}
        else:
            self.rules = {"rules": {}}
            print("📝 使用空白規則（將自動學習）")

    def _save_rules(self) -> None:
        """儲存規則"""
        self.rules["_lastUpdated"] = datetime.now().isoformat()

        try:
            os.makedirs(os.path.dirname(self.LOCAL_RULES_PATH), exist_ok=True)
            with open(self.LOCAL_RULES_PATH, 'w', encoding='utf-8') as f:
                json.dump(self.rules, f, ensure_ascii=False, indent=2)
            print(f"💾 已儲存規則到：{self.LOCAL_RULES_PATH}")
        except Exception as e:
            print(f"❌ 儲存規則失敗：{e}")

    def lookup_vendor(self, vendor_name: str) -> VendorLookupResult:
        """
        查詢供應商分類（核心功能）

        查詢順序：
        1. 精確匹配供應商名稱
        2. 精確匹配別名
        3. 模糊匹配（包含關係）
        4. 找不到則返回 "Uncategorized"

        Args:
            vendor_name: 供應商名稱

        Returns:
            VendorLookupResult: 查詢結果
        """
        if not vendor_name or not vendor_name.strip():
            return VendorLookupResult(
                found=False,
                vendor_name="",
                category="other",
                category_label="未分類 (Uncategorized)",
                confidence=0
            )

        query = vendor_name.strip()
        query_lower = query.lower()
        rules = self.rules.get("rules", {})

        # 1. 精確匹配供應商名稱
        if query in rules:
            rule = rules[query]
            self._record_usage(query)
            return VendorLookupResult(
                found=True,
                vendor_name=query,
                matched_by="exact",
                original_query=query,
                category=rule.get("category", "other"),
                category_label=rule.get("categoryLabel", "其他"),
                confidence=rule.get("confidence", 0.8),
                notes=rule.get("notes", "")
            )

        # 2. 精確匹配別名
        for vendor_key, rule in rules.items():
            aliases = rule.get("aliases", [])
            for alias in aliases:
                if alias.lower() == query_lower:
                    self._record_usage(vendor_key)
                    return VendorLookupResult(
                        found=True,
                        vendor_name=vendor_key,
                        matched_by="alias",
                        original_query=query,
                        category=rule.get("category", "other"),
                        category_label=rule.get("categoryLabel", "其他"),
                        confidence=rule.get("confidence", 0.8) * 0.95,
                        notes=rule.get("notes", "")
                    )

        # 3. 模糊匹配
        for vendor_key, rule in rules.items():
            vendor_lower = vendor_key.lower()

            # 供應商名稱包含查詢，或查詢包含供應商名稱
            if vendor_lower in query_lower or query_lower in vendor_lower:
                self._record_usage(vendor_key)
                return VendorLookupResult(
                    found=True,
                    vendor_name=vendor_key,
                    matched_by="fuzzy",
                    original_query=query,
                    category=rule.get("category", "other"),
                    category_label=rule.get("categoryLabel", "其他"),
                    confidence=rule.get("confidence", 0.8) * 0.8,
                    notes=rule.get("notes", "")
                )

            # 別名模糊匹配
            for alias in rule.get("aliases", []):
                alias_lower = alias.lower()
                if alias_lower in query_lower or query_lower in alias_lower:
                    self._record_usage(vendor_key)
                    return VendorLookupResult(
                        found=True,
                        vendor_name=vendor_key,
                        matched_by="fuzzy",
                        original_query=query,
                        category=rule.get("category", "other"),
                        category_label=rule.get("categoryLabel", "其他"),
                        confidence=rule.get("confidence", 0.8) * 0.7,
                        notes=rule.get("notes", "")
                    )

        # 4. 找不到
        return VendorLookupResult(
            found=False,
            vendor_name=query,
            original_query=query,
            category="other",
            category_label="未分類 (Uncategorized)",
            confidence=0
        )

    def _record_usage(self, vendor_name: str) -> None:
        """記錄使用次數"""
        rules = self.rules.get("rules", {})
        if vendor_name in rules:
            rules[vendor_name]["lastUsed"] = datetime.now().isoformat()
            rules[vendor_name]["usageCount"] = \
                rules[vendor_name].get("usageCount", 0) + 1
            # 不立即儲存，等批次處理完再儲存

    def learn_vendor(
        self,
        vendor_name: str,
        category: str = "other",
        aliases: Optional[List[str]] = None,
        notes: str = ""
    ) -> bool:
        """
        學習新供應商

        Args:
            vendor_name: 供應商名稱
            category: 分類代碼
            aliases: 別名列表
            notes: 備註

        Returns:
            bool: 是否成功
        """
        if not vendor_name:
            return False

        rules = self.rules.setdefault("rules", {})

        rules[vendor_name] = {
            "category": category,
            "categoryLabel": self.CATEGORY_LABELS.get(category, "其他"),
            "confidence": 0.75,  # 自動學習的初始信心度
            "aliases": aliases or [],
            "notes": notes or "由發票自動學習",
            "usageCount": 1,
            "lastUsed": datetime.now().isoformat()
        }

        self._save_rules()
        print(f"🎓 已學習新供應商：{vendor_name} -> {category}")
        return True

    def get_or_learn(
        self,
        vendor_name: str,
        default_category: str = "other"
    ) -> Tuple[VendorLookupResult, bool]:
        """
        查詢供應商，如果不存在則學習

        Args:
            vendor_name: 供應商名稱
            default_category: 預設分類

        Returns:
            Tuple[VendorLookupResult, bool]: (查詢結果, 是否為新學習)
        """
        result = self.lookup_vendor(vendor_name)

        if not result.found:
            # 自動學習
            self.learn_vendor(vendor_name, default_category)
            result = self.lookup_vendor(vendor_name)
            return result, True

        return result, False

    def save_changes(self) -> None:
        """儲存所有變更"""
        self._save_rules()

    def get_stats(self) -> Dict[str, Any]:
        """取得統計資訊"""
        rules = self.rules.get("rules", {})

        category_counts: Dict[str, int] = {}
        total_usage = 0

        for vendor, rule in rules.items():
            cat = rule.get("category", "other")
            category_counts[cat] = category_counts.get(cat, 0) + 1
            total_usage += rule.get("usageCount", 0)

        return {
            "total_vendors": len(rules),
            "total_usage": total_usage,
            "by_category": category_counts
        }

    def export_rules(self, output_path: str) -> bool:
        """匯出規則"""
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(self.rules, f, ensure_ascii=False, indent=2)
            print(f"📤 已匯出規則到：{output_path}")
            return True
        except Exception as e:
            print(f"❌ 匯出失敗：{e}")
            return False

    def import_rules(self, input_path: str, merge: bool = True) -> bool:
        """
        匯入規則

        Args:
            input_path: 規則檔案路徑
            merge: 是否合併（True）或覆蓋（False）

        Returns:
            bool: 是否成功
        """
        try:
            with open(input_path, 'r', encoding='utf-8') as f:
                new_rules = json.load(f)

            if merge:
                # 合併規則
                existing = self.rules.get("rules", {})
                incoming = new_rules.get("rules", {})
                existing.update(incoming)
                self.rules["rules"] = existing
            else:
                self.rules = new_rules

            self._save_rules()
            print(f"📥 已匯入規則：{len(new_rules.get('rules', {}))} 個")
            return True

        except Exception as e:
            print(f"❌ 匯入失敗：{e}")
            return False


# ============================================
# 單例模式
# ============================================

_vendor_service: Optional[VendorLearningService] = None


def get_vendor_service() -> VendorLearningService:
    """取得供應商學習服務實例"""
    global _vendor_service
    if _vendor_service is None:
        _vendor_service = VendorLearningService()
    return _vendor_service


# ============================================
# 便捷函數
# ============================================

def lookup_vendor(vendor_name: str) -> VendorLookupResult:
    """查詢供應商分類"""
    return get_vendor_service().lookup_vendor(vendor_name)


def learn_vendor(vendor_name: str, category: str = "other") -> bool:
    """學習新供應商"""
    return get_vendor_service().learn_vendor(vendor_name, category)


# ============================================
# 測試
# ============================================

if __name__ == "__main__":
    print("🧪 供應商學習服務測試")
    print("=" * 50)

    service = VendorLearningService()

    # 測試查詢
    test_vendors = ["PChome", "7-ELEVEN", "台灣電力", "Unknown Corp"]

    for vendor in test_vendors:
        result = service.lookup_vendor(vendor)
        status = "✅ 找到" if result.found else "❌ 未找到"
        print(f"\n{status} {vendor}")
        print(f"   分類：{result.category_label}")
        print(f"   信心度：{result.confidence:.0%}")
        if result.matched_by:
            print(f"   匹配方式：{result.matched_by}")

    # 顯示統計
    stats = service.get_stats()
    print(f"\n📊 統計資訊")
    print(f"   供應商總數：{stats['total_vendors']}")
    print(f"   總使用次數：{stats['total_usage']}")
