"""
PDF 發票資訊抽取模組
PDF Invoice Info Extractor Module

使用 Regex 從 PDF 文字中抽取：
- 日期
- 金額
- 統編（或供應商名稱）

作者：AI Invoice Automation Bot
"""

import re
import os
from datetime import datetime
from typing import Optional, Dict, Any, List
from dataclasses import dataclass

# 嘗試導入 pdfplumber
try:
    import pdfplumber
except ImportError:
    print("❌ 錯誤：找不到 pdfplumber 庫")
    print("請執行：pip install pdfplumber")
    pdfplumber = None


@dataclass
class InvoiceInfo:
    """發票資訊結構"""
    date: Optional[str] = None           # 日期 (YYYYMMDD)
    date_display: Optional[str] = None   # 日期顯示格式
    amount: Optional[float] = None       # 金額
    amount_str: Optional[str] = None     # 金額字串（用於檔名）
    tax_id: Optional[str] = None         # 統編
    vendor: Optional[str] = None         # 供應商名稱
    invoice_number: Optional[str] = None # 發票號碼
    raw_text: Optional[str] = None       # 原始文字
    confidence: float = 0.0              # 抽取信心度

    def to_filename(self) -> str:
        """
        產生智能檔名：YYYYMMDD_供應商_金額.pdf

        Returns:
            str: 檔案名稱
        """
        # 日期部分
        date_part = self.date or datetime.now().strftime("%Y%m%d")

        # 供應商部分（清理特殊字元）
        vendor_part = self.vendor or "Unknown"
        vendor_part = re.sub(r'[\\/:*?"<>|]', '', vendor_part)  # 移除不合法字元
        vendor_part = vendor_part.strip()[:20]  # 限制長度

        # 金額部分
        if self.amount:
            amount_part = str(int(self.amount))
        else:
            amount_part = "0"

        return f"{date_part}_{vendor_part}_{amount_part}.pdf"

    def to_dict(self) -> Dict[str, Any]:
        """轉換為字典"""
        return {
            "date": self.date,
            "date_display": self.date_display,
            "amount": self.amount,
            "tax_id": self.tax_id,
            "vendor": self.vendor,
            "invoice_number": self.invoice_number,
            "confidence": self.confidence
        }


class PDFInvoiceExtractor:
    """PDF 發票資訊抽取器"""

    # ============================================
    # 正則表達式模式
    # ============================================

    # 日期模式（支援多種格式）
    DATE_PATTERNS = [
        # 2024-05-20, 2024/05/20
        r'(\d{4})[-/](\d{1,2})[-/](\d{1,2})',
        # 2024年5月20日
        r'(\d{4})年(\d{1,2})月(\d{1,2})日',
        # 民國113年5月20日
        r'民國\s*(\d{2,3})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日',
        # 113/05/20 (民國)
        r'(\d{2,3})/(\d{1,2})/(\d{1,2})',
        # 20240520
        r'(\d{4})(\d{2})(\d{2})',
        # May 20, 2024
        r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})',
    ]

    # 金額模式
    AMOUNT_PATTERNS = [
        # NT$ 1,234 或 NT$1234
        r'NT\$\s*([\d,]+(?:\.\d{2})?)',
        # $ 1,234
        r'\$\s*([\d,]+(?:\.\d{2})?)',
        # 合計: 1,234 或 總計: 1234
        r'(?:合計|總計|Total|TOTAL|Amount|金額|應付金額|實付金額)[：:\s]*(?:NT\$|＄|\$)?\s*([\d,]+(?:\.\d{2})?)',
        # 1,234 元
        r'([\d,]+)\s*元',
        # TWD 1,234
        r'TWD\s*([\d,]+(?:\.\d{2})?)',
    ]

    # 統編模式（台灣統一編號：8位數）
    TAX_ID_PATTERNS = [
        # 統一編號: 12345678
        r'(?:統一編號|統編|Tax\s*ID|營利事業統一編號)[：:\s]*(\d{8})',
        # 獨立的8位數字（作為備用）
        r'\b(\d{8})\b',
    ]

    # 發票號碼模式
    INVOICE_NUMBER_PATTERNS = [
        # AB-12345678
        r'([A-Z]{2})[-\s]?(\d{8})',
        # 發票號碼: AB12345678
        r'(?:發票號碼|Invoice\s*(?:No\.?|Number)?)[：:\s]*([A-Z]{2}[-\s]?\d{8})',
    ]

    # 常見供應商名稱關鍵字（用於抽取）
    VENDOR_KEYWORDS = [
        '公司', '企業', '股份有限公司', '有限公司',
        'Inc', 'Corp', 'LLC', 'Ltd', 'Co.',
        'Corporation', 'Company',
    ]

    # 月份英文對照
    MONTH_MAP = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4,
        'may': 5, 'jun': 6, 'jul': 7, 'aug': 8,
        'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }

    def __init__(self):
        """初始化抽取器"""
        pass

    def read_pdf_text(self, pdf_path: str) -> Optional[str]:
        """
        讀取 PDF 文字內容

        Args:
            pdf_path: PDF 檔案路徑

        Returns:
            str: PDF 內容文字
        """
        if not pdfplumber:
            print("❌ pdfplumber 未安裝")
            return None

        if not os.path.exists(pdf_path):
            print(f"❌ 檔案不存在：{pdf_path}")
            return None

        try:
            text_content = []
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)

            return "\n".join(text_content)

        except Exception as e:
            print(f"❌ 讀取 PDF 失敗：{e}")
            return None

    def extract_info(self, text: str, sender_name: Optional[str] = None) -> InvoiceInfo:
        """
        從文字中抽取發票資訊（核心函數）

        Args:
            text: PDF 內容文字
            sender_name: 寄件人名稱（備用供應商名）

        Returns:
            InvoiceInfo: 抽取的發票資訊
        """
        info = InvoiceInfo(raw_text=text[:500] if text else None)
        confidence_scores = []

        # 1. 抽取日期
        date_result = self._extract_date(text)
        if date_result:
            info.date = date_result['formatted']
            info.date_display = date_result['display']
            confidence_scores.append(1.0)
        else:
            confidence_scores.append(0.0)

        # 2. 抽取金額
        amount_result = self._extract_amount(text)
        if amount_result:
            info.amount = amount_result['value']
            info.amount_str = amount_result['str']
            confidence_scores.append(1.0)
        else:
            confidence_scores.append(0.0)

        # 3. 抽取統編
        tax_id = self._extract_tax_id(text)
        if tax_id:
            info.tax_id = tax_id
            confidence_scores.append(1.0)
        else:
            confidence_scores.append(0.0)

        # 4. 抽取發票號碼
        invoice_number = self._extract_invoice_number(text)
        if invoice_number:
            info.invoice_number = invoice_number
            confidence_scores.append(0.5)  # 權重較低

        # 5. 決定供應商名稱
        info.vendor = self._determine_vendor(text, sender_name, tax_id)

        # 計算整體信心度
        info.confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0

        return info

    def _extract_date(self, text: str) -> Optional[Dict[str, str]]:
        """
        抽取日期

        Returns:
            dict: {'formatted': 'YYYYMMDD', 'display': 'YYYY-MM-DD'}
        """
        for pattern in self.DATE_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                groups = match.groups()

                try:
                    # 處理英文月份格式
                    if pattern.startswith('(Jan'):
                        month_str = groups[0].lower()[:3]
                        month = self.MONTH_MAP.get(month_str, 1)
                        day = int(groups[1])
                        year = int(groups[2])

                    # 處理民國年
                    elif '民國' in pattern or (len(groups[0]) <= 3 and int(groups[0]) < 200):
                        roc_year = int(groups[0])
                        year = roc_year + 1911
                        month = int(groups[1])
                        day = int(groups[2])

                    # 一般格式
                    else:
                        year = int(groups[0])
                        month = int(groups[1])
                        day = int(groups[2])

                    # 驗證日期合理性
                    if 2020 <= year <= 2030 and 1 <= month <= 12 and 1 <= day <= 31:
                        formatted = f"{year:04d}{month:02d}{day:02d}"
                        display = f"{year:04d}-{month:02d}-{day:02d}"
                        return {'formatted': formatted, 'display': display}

                except (ValueError, TypeError):
                    continue

        return None

    def _extract_amount(self, text: str) -> Optional[Dict[str, Any]]:
        """
        抽取金額

        Returns:
            dict: {'value': float, 'str': str}
        """
        amounts = []

        for pattern in self.AMOUNT_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    # 移除逗號並轉換為數字
                    amount_str = match.replace(',', '').strip()
                    amount_value = float(amount_str)

                    # 過濾不合理的金額（太小或太大）
                    if 1 <= amount_value <= 10000000:
                        amounts.append({
                            'value': amount_value,
                            'str': str(int(amount_value))
                        })
                except (ValueError, TypeError):
                    continue

        # 如果找到多個金額，選擇最大的（通常是總計）
        if amounts:
            return max(amounts, key=lambda x: x['value'])

        return None

    def _extract_tax_id(self, text: str) -> Optional[str]:
        """
        抽取統一編號

        Returns:
            str: 8位數統編
        """
        # 優先使用明確標記的統編
        for pattern in self.TAX_ID_PATTERNS[:-1]:  # 排除最後一個通用模式
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                tax_id = match.group(1)
                if self._validate_tax_id(tax_id):
                    return tax_id

        # 備用：尋找獨立的8位數字
        all_8digits = re.findall(r'\b(\d{8})\b', text)
        for candidate in all_8digits:
            if self._validate_tax_id(candidate):
                return candidate

        return None

    def _validate_tax_id(self, tax_id: str) -> bool:
        """
        驗證台灣統一編號

        台灣統編驗證規則：
        - 8位數字
        - 加權驗證（簡化版：排除明顯不合理的）
        """
        if not tax_id or len(tax_id) != 8:
            return False

        # 排除全為相同數字
        if len(set(tax_id)) == 1:
            return False

        # 排除連續數字
        if tax_id in ['12345678', '87654321']:
            return False

        # 排除以 0 開頭的（不太常見）
        if tax_id.startswith('00'):
            return False

        return True

    def _extract_invoice_number(self, text: str) -> Optional[str]:
        """
        抽取發票號碼

        Returns:
            str: 發票號碼 (如 AB-12345678)
        """
        for pattern in self.INVOICE_NUMBER_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                groups = match.groups()
                if len(groups) == 2:
                    return f"{groups[0]}-{groups[1]}"
                elif len(groups) == 1:
                    return groups[0]

        return None

    def _determine_vendor(
        self,
        text: str,
        sender_name: Optional[str],
        tax_id: Optional[str]
    ) -> str:
        """
        決定供應商名稱

        優先順序：
        1. 從文字中抽取公司名稱
        2. 使用寄件人名稱
        3. 使用統編
        4. 使用 "Unknown"
        """
        # 嘗試從文字中抽取公司名稱
        vendor_from_text = self._extract_vendor_from_text(text)
        if vendor_from_text:
            return vendor_from_text

        # 使用寄件人名稱
        if sender_name:
            # 清理寄件人名稱
            clean_sender = self._clean_sender_name(sender_name)
            if clean_sender:
                return clean_sender

        # 使用統編作為識別
        if tax_id:
            return f"TaxID_{tax_id}"

        return "Unknown"

    def _extract_vendor_from_text(self, text: str) -> Optional[str]:
        """從文字中嘗試抽取供應商名稱"""
        # 尋找包含公司關鍵字的文字
        patterns = [
            r'([\u4e00-\u9fa5]+(?:股份有限公司|有限公司|公司|企業))',
            r'([\u4e00-\u9fa5]+(?:商行|行號|工作室))',
            r'([A-Za-z\s]+(?:Inc|Corp|LLC|Ltd|Co\.))',
        ]

        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                vendor = match.group(1).strip()
                # 過濾太短的結果
                if len(vendor) >= 3:
                    return vendor[:30]  # 限制長度

        return None

    def _clean_sender_name(self, sender: str) -> Optional[str]:
        """
        清理寄件人名稱

        例如：
        - "PChome <noreply@pchome.com.tw>" -> "PChome"
        - "noreply@amazon.com" -> "amazon"
        """
        # 移除 email 地址部分
        name_part = re.sub(r'<[^>]+>', '', sender).strip()

        # 如果只剩 email
        if '@' in name_part or not name_part:
            # 從 email 抽取域名
            email_match = re.search(r'@([^.]+)', sender)
            if email_match:
                return email_match.group(1).capitalize()

        # 清理特殊字元
        name_part = re.sub(r'[^\w\u4e00-\u9fa5\s]', '', name_part)
        name_part = name_part.strip()

        if name_part:
            return name_part[:20]

        return None

    def extract_from_pdf(
        self,
        pdf_path: str,
        sender_name: Optional[str] = None
    ) -> InvoiceInfo:
        """
        從 PDF 檔案抽取發票資訊（便捷方法）

        Args:
            pdf_path: PDF 檔案路徑
            sender_name: 寄件人名稱

        Returns:
            InvoiceInfo: 抽取的資訊
        """
        text = self.read_pdf_text(pdf_path)

        if not text:
            # 返回基本資訊，使用寄件人名稱
            info = InvoiceInfo()
            info.vendor = self._clean_sender_name(sender_name) if sender_name else "Unknown"
            info.date = datetime.now().strftime("%Y%m%d")
            info.confidence = 0.1
            return info

        return self.extract_info(text, sender_name)


# ============================================
# 便捷函數
# ============================================

def extract_info(text: str, sender_name: Optional[str] = None) -> InvoiceInfo:
    """
    從文字中抽取發票資訊（便捷函數）

    這是主要對外接口，符合需求中的 extract_info(text) 規範。

    Args:
        text: PDF 內容文字
        sender_name: 寄件人名稱（當抓不到統編時使用）

    Returns:
        InvoiceInfo: 抽取的發票資訊
    """
    extractor = PDFInvoiceExtractor()
    return extractor.extract_info(text, sender_name)


def extract_from_pdf(pdf_path: str, sender_name: Optional[str] = None) -> InvoiceInfo:
    """
    從 PDF 檔案抽取發票資訊（便捷函數）

    Args:
        pdf_path: PDF 檔案路徑
        sender_name: 寄件人名稱

    Returns:
        InvoiceInfo: 抽取的資訊
    """
    extractor = PDFInvoiceExtractor()
    return extractor.extract_from_pdf(pdf_path, sender_name)


# ============================================
# 測試
# ============================================

if __name__ == "__main__":
    # 測試文字
    test_text = """
    統一發票
    發票號碼：AB-12345678
    統一編號：12345678
    日期：2024/05/20

    品名          數量    單價      金額
    商品A          1      $500      $500
    商品B          2      $250      $500

    合計：NT$ 1,000

    台灣電力股份有限公司
    """

    print("🧪 測試 PDF 資訊抽取器")
    print("=" * 50)

    info = extract_info(test_text, "service@taipower.com.tw")

    print(f"📅 日期：{info.date_display}")
    print(f"💰 金額：{info.amount}")
    print(f"🏢 統編：{info.tax_id}")
    print(f"🏪 供應商：{info.vendor}")
    print(f"📋 發票號碼：{info.invoice_number}")
    print(f"📊 信心度：{info.confidence:.0%}")
    print(f"📁 建議檔名：{info.to_filename()}")
