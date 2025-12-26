"""
附件處理模組
Attachment Processor Module

功能：
- 下載 Gmail 附件
- 使用 PDF 抽取器讀取內容
- 智能重命名檔案
- 儲存到指定目錄

作者：AI Invoice Automation Bot
"""

import os
import shutil
from datetime import datetime
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field

# 導入 PDF 抽取器
from pdf_extractor import PDFInvoiceExtractor, InvoiceInfo, extract_from_pdf


@dataclass
class ProcessedAttachment:
    """已處理的附件資訊"""
    original_filename: str
    new_filename: str
    saved_path: str
    invoice_info: InvoiceInfo
    email_subject: str
    sender: str
    email_date: str
    success: bool = True
    error_message: Optional[str] = None


@dataclass
class ProcessingResult:
    """處理結果摘要"""
    total_emails: int = 0
    total_attachments: int = 0
    processed_count: int = 0
    success_count: int = 0
    failed_count: int = 0
    skipped_count: int = 0
    processed_files: List[ProcessedAttachment] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


class AttachmentProcessor:
    """附件處理器"""

    # 支援的附件格式
    SUPPORTED_EXTENSIONS = ['.pdf', '.PDF']

    # 圖片格式（未來支援）
    IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.tif', '.tiff']

    def __init__(
        self,
        output_dir: str = "downloaded_invoices",
        organize_by_month: bool = True
    ):
        """
        初始化處理器

        Args:
            output_dir: 輸出目錄
            organize_by_month: 是否按月份建立子資料夾
        """
        self.output_dir = output_dir
        self.organize_by_month = organize_by_month
        self.extractor = PDFInvoiceExtractor()

        # 建立輸出目錄
        self._ensure_output_dir()

    def _ensure_output_dir(self) -> None:
        """確保輸出目錄存在"""
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            print(f"📁 已建立目錄：{self.output_dir}")

    def _get_save_path(self, filename: str, date_str: Optional[str] = None) -> str:
        """
        取得儲存路徑

        Args:
            filename: 檔案名稱
            date_str: 日期字串 (YYYYMMDD)

        Returns:
            str: 完整儲存路徑
        """
        if self.organize_by_month and date_str and len(date_str) >= 6:
            # 按月份建立子資料夾 (YYYY-MM)
            month_folder = f"{date_str[:4]}-{date_str[4:6]}"
            folder_path = os.path.join(self.output_dir, month_folder)

            if not os.path.exists(folder_path):
                os.makedirs(folder_path)

            return os.path.join(folder_path, filename)
        else:
            return os.path.join(self.output_dir, filename)

    def _is_supported_file(self, filename: str) -> bool:
        """檢查是否為支援的檔案格式"""
        ext = os.path.splitext(filename)[1].lower()
        return ext in [e.lower() for e in self.SUPPORTED_EXTENSIONS]

    def _clean_sender_name(self, sender: str) -> str:
        """
        清理寄件人名稱以提取供應商

        例如：
        - "PChome Online <service@pchome.com.tw>" -> "PChome"
        - "台灣電力公司 <noreply@taipower.com.tw>" -> "台灣電力公司"
        """
        import re

        # 移除 email 部分
        name_part = re.sub(r'<[^>]+>', '', sender).strip()

        # 如果為空，從 email 抽取
        if not name_part or '@' in name_part:
            email_match = re.search(r'@([^.]+)', sender)
            if email_match:
                return email_match.group(1).capitalize()

        # 清理特殊字元
        name_part = re.sub(r'["\']', '', name_part).strip()

        return name_part[:30] if name_part else "Unknown"

    def process_attachment(
        self,
        attachment,
        sender: str,
        email_subject: str,
        email_date: str
    ) -> ProcessedAttachment:
        """
        處理單一附件

        Args:
            attachment: simplegmail 的 Attachment 物件
            sender: 寄件人
            email_subject: 郵件標題
            email_date: 郵件日期

        Returns:
            ProcessedAttachment: 處理結果
        """
        original_filename = attachment.filename
        print(f"\n   📄 處理附件：{original_filename}")

        # 檢查格式
        if not self._is_supported_file(original_filename):
            print(f"   ⏭️  跳過（不支援的格式）")
            return ProcessedAttachment(
                original_filename=original_filename,
                new_filename="",
                saved_path="",
                invoice_info=InvoiceInfo(),
                email_subject=email_subject,
                sender=sender,
                email_date=email_date,
                success=False,
                error_message="不支援的檔案格式"
            )

        try:
            # 建立暫存目錄
            temp_dir = os.path.join(self.output_dir, ".temp")
            if not os.path.exists(temp_dir):
                os.makedirs(temp_dir)

            # 下載到暫存目錄
            temp_path = os.path.join(temp_dir, original_filename)
            attachment.save(filepath=temp_path)
            print(f"   ✅ 已下載到暫存")

            # 從 PDF 抽取資訊
            clean_sender = self._clean_sender_name(sender)
            invoice_info = extract_from_pdf(temp_path, clean_sender)

            print(f"   📊 抽取結果：")
            print(f"      日期：{invoice_info.date_display or '未識別'}")
            print(f"      金額：{invoice_info.amount or '未識別'}")
            print(f"      供應商：{invoice_info.vendor or clean_sender}")

            # 產生新檔名
            new_filename = invoice_info.to_filename()
            print(f"   📝 新檔名：{new_filename}")

            # 決定儲存路徑
            save_path = self._get_save_path(new_filename, invoice_info.date)

            # 處理檔名衝突
            save_path = self._handle_duplicate_filename(save_path)

            # 移動檔案
            shutil.move(temp_path, save_path)
            print(f"   💾 已儲存：{save_path}")

            return ProcessedAttachment(
                original_filename=original_filename,
                new_filename=os.path.basename(save_path),
                saved_path=save_path,
                invoice_info=invoice_info,
                email_subject=email_subject,
                sender=sender,
                email_date=email_date,
                success=True
            )

        except Exception as e:
            error_msg = f"處理失敗：{str(e)}"
            print(f"   ❌ {error_msg}")

            return ProcessedAttachment(
                original_filename=original_filename,
                new_filename="",
                saved_path="",
                invoice_info=InvoiceInfo(),
                email_subject=email_subject,
                sender=sender,
                email_date=email_date,
                success=False,
                error_message=error_msg
            )

    def _handle_duplicate_filename(self, filepath: str) -> str:
        """
        處理重複檔名

        如果檔案已存在，加上序號
        """
        if not os.path.exists(filepath):
            return filepath

        base, ext = os.path.splitext(filepath)
        counter = 1

        while os.path.exists(filepath):
            filepath = f"{base}_{counter}{ext}"
            counter += 1

        return filepath

    def process_emails(self, messages: List) -> ProcessingResult:
        """
        處理多封郵件的附件

        Args:
            messages: simplegmail Message 物件列表

        Returns:
            ProcessingResult: 處理結果摘要
        """
        result = ProcessingResult()
        result.total_emails = len(messages)

        print("\n" + "=" * 60)
        print("📦 開始處理郵件附件")
        print("=" * 60)

        for i, msg in enumerate(messages, 1):
            print(f"\n📧 [{i}/{len(messages)}] {msg.subject[:50]}...")
            print(f"   👤 寄件人：{msg.sender}")

            if not msg.attachments:
                print(f"   ⚠️ 無附件")
                continue

            result.total_attachments += len(msg.attachments)

            for attachment in msg.attachments:
                processed = self.process_attachment(
                    attachment=attachment,
                    sender=msg.sender,
                    email_subject=msg.subject,
                    email_date=str(msg.date)
                )

                result.processed_files.append(processed)
                result.processed_count += 1

                if processed.success:
                    result.success_count += 1
                elif "不支援" in (processed.error_message or ""):
                    result.skipped_count += 1
                else:
                    result.failed_count += 1
                    result.errors.append(
                        f"{processed.original_filename}: {processed.error_message}"
                    )

        return result

    def print_summary(self, result: ProcessingResult) -> None:
        """列印處理摘要"""
        print("\n" + "=" * 60)
        print("📊 處理結果摘要")
        print("=" * 60)
        print(f"   📧 處理郵件：{result.total_emails} 封")
        print(f"   📎 發現附件：{result.total_attachments} 個")
        print(f"   ✅ 成功處理：{result.success_count} 個")
        print(f"   ⏭️  跳過：{result.skipped_count} 個")
        print(f"   ❌ 處理失敗：{result.failed_count} 個")
        print(f"   📁 輸出目錄：{os.path.abspath(self.output_dir)}")

        if result.success_count > 0:
            print("\n✅ 成功處理的發票：")
            print("-" * 50)
            for pf in result.processed_files:
                if pf.success:
                    print(f"   📄 {pf.new_filename}")
                    print(f"      金額：{pf.invoice_info.amount or 'N/A'}")
                    print(f"      供應商：{pf.invoice_info.vendor or 'N/A'}")

        if result.errors:
            print("\n❌ 錯誤清單：")
            print("-" * 50)
            for error in result.errors:
                print(f"   • {error}")

        print("=" * 60)


# ============================================
# 測試
# ============================================

if __name__ == "__main__":
    print("🧪 附件處理器測試模式")
    print("=" * 50)
    print("這個模組需要搭配 gmail_invoice_fetcher.py 使用")
    print("請執行主程式：python gmail_invoice_fetcher.py")
