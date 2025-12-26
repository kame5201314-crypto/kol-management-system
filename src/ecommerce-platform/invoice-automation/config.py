"""
發票自動化工具 - 配置檔案
Invoice Automation Tool - Configuration

可自訂的設定項目
"""

# ============================================
# Gmail 連接設定
# ============================================

# OAuth 憑證檔案路徑
CLIENT_SECRET_FILE = "client_secret.json"

# Gmail Token 儲存路徑（自動生成）
GMAIL_TOKEN_FILE = "gmail_token.json"


# ============================================
# 發票搜尋關鍵字
# ============================================

# 發票關鍵字清單（可自行新增）
INVOICE_KEYWORDS = [
    # 英文關鍵字
    "invoice",
    "receipt",
    "billing",
    "payment confirmation",
    "order confirmation",
    "statement",

    # 中文關鍵字
    "發票",
    "電子發票",
    "統一發票",
    "收據",
    "帳單",
    "繳費通知",
    "訂單確認",
    "付款確認",
    "消費明細",
]

# 排除的寄件人（垃圾郵件過濾）
EXCLUDED_SENDERS = [
    "noreply@spam.com",
    # 可以新增其他要排除的寄件人
]


# ============================================
# 附件下載設定
# ============================================

# 附件儲存目錄
ATTACHMENTS_DIR = "downloads/attachments"

# 按月份建立子資料夾
ORGANIZE_BY_MONTH = True

# 支援的附件格式
SUPPORTED_EXTENSIONS = [
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".tif",
    ".tiff",
]


# ============================================
# 供應商學習整合
# ============================================

# 供應商規則 JSON 檔案路徑
VENDOR_RULES_FILE = "../data/vendorRules.json"

# 是否自動學習新供應商
AUTO_LEARN_VENDORS = True


# ============================================
# 日誌設定
# ============================================

# 日誌等級：DEBUG, INFO, WARNING, ERROR
LOG_LEVEL = "INFO"

# 日誌檔案路徑
LOG_FILE = "logs/invoice_automation.log"


# ============================================
# 進階設定
# ============================================

# 每次搜尋的最大郵件數量
MAX_EMAILS_PER_SEARCH = 50

# 是否自動標記郵件為已讀
MARK_AS_READ_AFTER_DOWNLOAD = True

# 是否自動加標籤
ADD_LABEL_AFTER_PROCESS = True
PROCESSED_LABEL = "已處理發票"
