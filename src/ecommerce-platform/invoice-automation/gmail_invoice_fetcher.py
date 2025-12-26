"""
Gmail 發票自動下載工具 - 第二階段
Gmail Invoice Auto-Fetcher - Phase 2: The Logic

功能：
1. 連接 Gmail API
2. 搜尋未讀發票郵件
3. 下載 PDF 附件
4. 使用 Regex 抽取發票資訊
5. 智能重命名檔案
6. 整合供應商學習

作者：AI Invoice Automation Bot
"""

import os
import sys
import argparse
from datetime import datetime
from typing import List, Optional

# 嘗試導入 simplegmail
try:
    from simplegmail import Gmail
    from simplegmail.message import Message
except ImportError:
    print("❌ 錯誤：找不到 simplegmail 庫")
    print("請執行：pip install simplegmail")
    sys.exit(1)

# 導入附件處理器
try:
    from attachment_processor import AttachmentProcessor, ProcessingResult
except ImportError:
    AttachmentProcessor = None
    print("⚠️ 附件處理器未載入（可能缺少依賴）")

# 導入供應商學習
try:
    from vendor_learning import get_vendor_service, VendorLearningService
except ImportError:
    get_vendor_service = None
    print("⚠️ 供應商學習模組未載入")


class GmailInvoiceFetcher:
    """Gmail 發票抓取器"""

    # 發票關鍵字（中英文）
    INVOICE_KEYWORDS = [
        "invoice",
        "receipt",
        "發票",
        "電子發票",
        "統一發票",
        "收據",
        "帳單",
        "繳費通知",
        "訂單確認",
        "付款確認",
        "payment confirmation",
        "order confirmation",
        "billing",
    ]

    def __init__(self, client_secret_path: str = "client_secret.json"):
        """
        初始化 Gmail 連接

        Args:
            client_secret_path: Google OAuth 憑證檔案路徑
        """
        self.client_secret_path = client_secret_path
        self.gmail: Optional[Gmail] = None
        self._validate_credentials()

    def _validate_credentials(self) -> None:
        """驗證憑證檔案是否存在"""
        if not os.path.exists(self.client_secret_path):
            print(f"❌ 錯誤：找不到憑證檔案 '{self.client_secret_path}'")
            print("\n請按照以下步驟獲取憑證：")
            print("1. 前往 https://console.cloud.google.com/")
            print("2. 建立專案並啟用 Gmail API")
            print("3. 建立 OAuth 2.0 用戶端 ID（桌面應用程式）")
            print("4. 下載 JSON 並命名為 'client_secret.json'")
            print(f"5. 將檔案放在：{os.path.abspath('.')}")
            sys.exit(1)

    def connect(self) -> bool:
        """
        連接到 Gmail

        Returns:
            bool: 連接是否成功
        """
        print("\n🔗 正在連接 Gmail...")
        print("=" * 50)

        try:
            # 建立 Gmail 連接
            self.gmail = Gmail(client_secret_file=self.client_secret_path)

            # 獲取使用者資訊
            user_email = self.gmail.get_user_email()
            print(f"✅ 成功連接！")
            print(f"📧 登入帳號：{user_email}")
            print("=" * 50)

            return True

        except Exception as e:
            print(f"❌ 連接失敗：{e}")
            return False

    def build_search_query(self) -> str:
        """
        建立 Gmail 搜尋查詢字串

        Returns:
            str: Gmail 搜尋查詢語法
        """
        # 組合關鍵字查詢（使用 OR）
        keyword_query = " OR ".join([f'"{kw}"' for kw in self.INVOICE_KEYWORDS])

        # 完整查詢：未讀 + 有附件 + 關鍵字
        query = f"is:unread has:attachment ({keyword_query})"

        return query

    def search_invoice_emails(self, max_results: int = 50) -> List[Message]:
        """
        搜尋發票相關郵件

        Args:
            max_results: 最多返回的郵件數量

        Returns:
            List[Message]: 找到的郵件列表
        """
        if not self.gmail:
            print("❌ 請先呼叫 connect() 連接 Gmail")
            return []

        query = self.build_search_query()

        print(f"\n🔍 正在搜尋發票郵件...")
        print(f"📝 搜尋條件：未讀 + 有附件 + 發票關鍵字")
        print("-" * 50)

        try:
            # 執行搜尋
            messages = self.gmail.get_messages(query=query)

            # 限制結果數量
            if messages and len(messages) > max_results:
                messages = messages[:max_results]

            print(f"📬 找到 {len(messages) if messages else 0} 封符合條件的郵件")

            return messages if messages else []

        except Exception as e:
            print(f"❌ 搜尋失敗：{e}")
            return []

    def print_email_info(self, messages: List[Message]) -> None:
        """
        列印郵件資訊

        Args:
            messages: 郵件列表
        """
        if not messages:
            print("\n📭 沒有找到符合條件的郵件")
            print("\n💡 提示：")
            print("   - 確認信箱中有未讀的發票郵件")
            print("   - 確認郵件標題/內容包含發票關鍵字")
            print("   - 確認郵件有附件")
            return

        print(f"\n📬 找到 {len(messages)} 封發票相關郵件：")
        print("=" * 70)

        for i, msg in enumerate(messages, 1):
            print(f"\n📧 [{i}] 郵件資訊")
            print("-" * 50)
            print(f"   📌 標題：{msg.subject}")
            print(f"   👤 寄件人：{msg.sender}")
            print(f"   📅 日期：{msg.date}")

            # 顯示附件資訊
            if msg.attachments:
                print(f"   📎 附件數量：{len(msg.attachments)}")
                for att in msg.attachments:
                    print(f"      - {att.filename}")
            else:
                print(f"   📎 附件：無法讀取")

        print("\n" + "=" * 70)
        print(f"✅ 共列出 {len(messages)} 封郵件")

    def get_attachment_summary(self, messages: List[Message]) -> dict:
        """
        獲取附件統計摘要

        Args:
            messages: 郵件列表

        Returns:
            dict: 附件統計資訊
        """
        summary = {
            "total_emails": len(messages),
            "total_attachments": 0,
            "attachment_types": {},
            "senders": set()
        }

        for msg in messages:
            summary["senders"].add(msg.sender)

            if msg.attachments:
                for att in msg.attachments:
                    summary["total_attachments"] += 1

                    # 統計檔案類型
                    ext = os.path.splitext(att.filename)[1].lower()
                    if ext:
                        summary["attachment_types"][ext] = \
                            summary["attachment_types"].get(ext, 0) + 1

        summary["senders"] = list(summary["senders"])
        return summary

    def print_summary(self, messages: List[Message]) -> None:
        """
        列印統計摘要

        Args:
            messages: 郵件列表
        """
        if not messages:
            return

        summary = self.get_attachment_summary(messages)

        print("\n📊 統計摘要")
        print("=" * 50)
        print(f"   📧 郵件總數：{summary['total_emails']}")
        print(f"   📎 附件總數：{summary['total_attachments']}")

        if summary["attachment_types"]:
            print(f"   📁 附件類型分布：")
            for ext, count in sorted(summary["attachment_types"].items(),
                                     key=lambda x: x[1], reverse=True):
                print(f"      {ext}: {count} 個")

        print(f"   👥 不同寄件人：{len(summary['senders'])} 位")
        print("=" * 50)

    def process_attachments(
        self,
        messages: List[Message],
        output_dir: str = "downloaded_invoices"
    ) -> Optional[ProcessingResult]:
        """
        處理郵件附件（第二階段核心功能）

        Args:
            messages: 郵件列表
            output_dir: 輸出目錄

        Returns:
            ProcessingResult: 處理結果
        """
        if not AttachmentProcessor:
            print("\n❌ 無法處理附件：AttachmentProcessor 未載入")
            print("請執行：pip install pdfplumber")
            return None

        if not messages:
            print("\n⚠️ 沒有郵件需要處理")
            return None

        # 建立處理器
        processor = AttachmentProcessor(
            output_dir=output_dir,
            organize_by_month=True
        )

        # 處理所有郵件
        result = processor.process_emails(messages)

        # 列印處理摘要
        processor.print_summary(result)

        # 整合供應商學習
        self._apply_vendor_learning(result)

        return result

    def _apply_vendor_learning(self, result: ProcessingResult) -> None:
        """
        應用供應商學習

        Args:
            result: 處理結果
        """
        if not get_vendor_service:
            return

        try:
            vendor_service = get_vendor_service()
            new_vendors = 0

            for pf in result.processed_files:
                if pf.success and pf.invoice_info.vendor:
                    lookup = vendor_service.lookup_vendor(pf.invoice_info.vendor)

                    if not lookup.found:
                        # 自動學習新供應商
                        vendor_service.learn_vendor(
                            pf.invoice_info.vendor,
                            category="other",
                            notes=f"從發票自動學習 - {pf.email_subject}"
                        )
                        new_vendors += 1
                    else:
                        # 顯示已知供應商的分類
                        print(f"   🏷️ {pf.invoice_info.vendor} -> {lookup.category_label}")

            if new_vendors > 0:
                vendor_service.save_changes()
                print(f"\n🎓 已自動學習 {new_vendors} 個新供應商")

        except Exception as e:
            print(f"⚠️ 供應商學習失敗：{e}")


def main():
    """主程式入口"""
    # 解析命令列參數
    parser = argparse.ArgumentParser(
        description="Gmail 發票自動下載工具"
    )
    parser.add_argument(
        "--mode",
        choices=["scan", "download"],
        default="download",
        help="執行模式：scan (只掃描) 或 download (掃描並下載)"
    )
    parser.add_argument(
        "--max",
        type=int,
        default=20,
        help="最多處理的郵件數量"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="downloaded_invoices",
        help="輸出目錄"
    )
    parser.add_argument(
        "--secret",
        type=str,
        default="client_secret.json",
        help="Google OAuth 憑證檔案路徑"
    )

    args = parser.parse_args()

    # 顯示標題
    phase = "第二階段" if args.mode == "download" else "第一階段"

    print("\n" + "=" * 60)
    print(f"  📧 Gmail 發票自動下載工具 - {phase}")
    print("  Gmail Invoice Auto-Fetcher")
    print("=" * 60)
    print(f"  執行時間：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  執行模式：{args.mode}")
    print(f"  最大郵件數：{args.max}")
    if args.mode == "download":
        print(f"  輸出目錄：{args.output}")
    print("=" * 60)

    # 建立發票抓取器
    fetcher = GmailInvoiceFetcher(client_secret_path=args.secret)

    # 連接 Gmail
    if not fetcher.connect():
        print("\n❌ 無法連接 Gmail，程式結束")
        return

    # 搜尋發票郵件
    messages = fetcher.search_invoice_emails(max_results=args.max)

    if not messages:
        print("\n📭 沒有找到符合條件的郵件")
        return

    if args.mode == "scan":
        # 第一階段：只掃描
        fetcher.print_email_info(messages)
        fetcher.print_summary(messages)
        print("\n✅ 掃描完成！")
        print("💡 提示：使用 --mode download 來下載並處理附件")

    else:
        # 第二階段：掃描 + 下載 + 處理
        result = fetcher.process_attachments(
            messages=messages,
            output_dir=args.output
        )

        if result and result.success_count > 0:
            print("\n" + "=" * 60)
            print("✅ 處理完成！")
            print("=" * 60)
            print(f"📁 發票已儲存至：{os.path.abspath(args.output)}")
            print("\n📋 檔案命名格式：YYYYMMDD_供應商_金額.pdf")
            print("   例如：20240525_PChome_1500.pdf")

            # 顯示供應商學習統計
            if get_vendor_service:
                try:
                    stats = get_vendor_service().get_stats()
                    print(f"\n🎓 供應商學習統計：")
                    print(f"   已學習供應商：{stats['total_vendors']} 個")
                except:
                    pass

            print("\n💡 下一步：")
            print("   1. 檢查 downloaded_invoices 資料夾中的發票")
            print("   2. 編輯 vendor_rules_local.json 調整分類")
            print("   3. 第三階段：整合到前端 Invoice Flow 系統")


if __name__ == "__main__":
    main()
