// Invoice Flow (發票歸檔機器人) 類型定義

// 發票分類
export type InvoiceCategory =
  | 'office_supplies'    // 辦公用品
  | 'transportation'     // 交通費
  | 'meals'              // 餐飲費
  | 'utilities'          // 水電費
  | 'rent'               // 租金
  | 'marketing'          // 行銷費用
  | 'professional'       // 專業服務
  | 'equipment'          // 設備
  | 'inventory'          // 進貨成本
  | 'shipping'           // 運費
  | 'insurance'          // 保險
  | 'tax'                // 稅務
  | 'other';             // 其他

// OCR 處理狀態
export type OCRStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual_required';

// 發票狀態
export type InvoiceStatus = 'draft' | 'pending_review' | 'confirmed' | 'archived' | 'rejected';

// 發票類型
export type InvoiceType = 'receipt' | 'invoice' | 'e-invoice' | 'other';

// OCR 識別結果
export interface OCRResult {
  taxId?: string;
  invoiceNumber?: string;
  date?: string;
  amount?: number;
  storeName?: string;
  items?: {
    name: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
  }[];
  confidence: number; // 0-1 信心度
  rawText?: string;
}

// 發票記錄
export interface Invoice {
  id: string;
  // OCR 識別資料
  taxId: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  storeName: string;
  items?: {
    name: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
  }[];

  // 分類資訊
  category: InvoiceCategory;
  invoiceType: InvoiceType;
  tags?: string[];

  // 檔案資訊
  originalFileName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileType: 'image' | 'pdf';

  // 處理資訊
  ocrStatus: OCRStatus;
  ocrConfidence?: number;
  ocrResult?: OCRResult;

  // 審核資訊
  status: InvoiceStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;

  // 歸檔
  archiveMonth: string; // 格式: YYYY-MM

  // 元資料
  uploadedBy: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

// 上傳批次
export interface UploadBatch {
  id: string;
  totalFiles: number;
  processedFiles: number;
  successCount: number;
  failedCount: number;
  status: 'uploading' | 'processing' | 'completed' | 'partial_failed';
  uploadedBy: string;
  uploadedAt: string;
}

// 月度歸檔摘要
export interface MonthlyArchive {
  month: string; // 格式: YYYY-MM
  totalInvoices: number;
  totalAmount: number;
  byCategory: {
    category: InvoiceCategory;
    count: number;
    amount: number;
  }[];
  byStatus: {
    status: InvoiceStatus;
    count: number;
  }[];
  lastUpdated: string;
}

// 匯出設定
export interface InvoiceExportConfig {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  categories?: InvoiceCategory[];
  format: 'excel' | 'csv';
  includeImages: boolean;
  groupBy: 'date' | 'category' | 'store';
  accountingFormat: boolean; // 使用會計格式
}

// Invoice Flow 儀表板統計
export interface InvoiceFlowStats {
  totalThisMonth: number;
  totalAmountThisMonth: number;
  pendingReview: number;
  processingOCR: number;
  recentUploads: Invoice[];
  categoryBreakdown: {
    category: InvoiceCategory;
    count: number;
    amount: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    count: number;
    amount: number;
  }[];
}

// 標籤中文對應
export const INVOICE_CATEGORY_LABELS: Record<InvoiceCategory, string> = {
  office_supplies: '辦公用品',
  transportation: '交通費',
  meals: '餐飲費',
  utilities: '水電費',
  rent: '租金',
  marketing: '行銷費用',
  professional: '專業服務',
  equipment: '設備',
  inventory: '進貨成本',
  shipping: '運費',
  insurance: '保險',
  tax: '稅務',
  other: '其他'
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: '草稿',
  pending_review: '待審核',
  confirmed: '已確認',
  archived: '已歸檔',
  rejected: '已拒絕'
};

export const OCR_STATUS_LABELS: Record<OCRStatus, string> = {
  pending: '待處理',
  processing: '處理中',
  completed: '已完成',
  failed: '處理失敗',
  manual_required: '需人工處理'
};

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  receipt: '收據',
  invoice: '發票',
  'e-invoice': '電子發票',
  other: '其他'
};

// 狀態顏色對應
export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  archived: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700'
};

export const OCR_STATUS_COLORS: Record<OCRStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  manual_required: 'bg-orange-100 text-orange-700'
};

// 分類圖標對應 (Lucide icon 名稱)
export const INVOICE_CATEGORY_ICONS: Record<InvoiceCategory, string> = {
  office_supplies: 'FileText',
  transportation: 'Car',
  meals: 'UtensilsCrossed',
  utilities: 'Zap',
  rent: 'Building',
  marketing: 'Megaphone',
  professional: 'Briefcase',
  equipment: 'Wrench',
  inventory: 'Package',
  shipping: 'Truck',
  insurance: 'Shield',
  tax: 'Receipt',
  other: 'MoreHorizontal'
};

// ============================================
// Vendor Learning (供應商學習) 類型定義
// ============================================

// 單一供應商規則
export interface VendorRule {
  category: InvoiceCategory;
  categoryLabel: string;
  confidence: number;        // 自動分類的信心度 0-1
  aliases: string[];         // 供應商名稱的別名
  notes?: string;            // 備註
  lastUsed?: string;         // 最後使用時間
  usageCount?: number;       // 使用次數
}

// 供應商規則集合
export interface VendorRulesData {
  _description?: string;
  _usage?: string;
  _lastUpdated?: string;
  rules: Record<string, VendorRule>;
}

// 供應商學習查詢結果
export interface VendorLookupResult {
  found: boolean;
  vendorName: string;           // 匹配到的供應商名稱（標準化）
  matchedBy?: 'exact' | 'alias' | 'fuzzy';  // 匹配方式
  originalQuery?: string;       // 原始查詢字串
  rule?: VendorRule;
  suggestedCategory: InvoiceCategory;
  suggestedCategoryLabel: string;
  confidence: number;
}

// 供應商統計
export interface VendorStats {
  totalVendors: number;
  totalRules: number;
  categoryCoverage: {
    category: InvoiceCategory;
    vendorCount: number;
  }[];
  topVendors: {
    name: string;
    usageCount: number;
    category: InvoiceCategory;
  }[];
  uncategorizedCount: number;
}
