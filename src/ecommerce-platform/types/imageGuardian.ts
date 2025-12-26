/**
 * AI 自動檢舉系統 (Image Guardian) - 類型定義
 *
 * 三大核心模組：
 * 1. 數位資產庫 (Asset Vault) - 圖片白名單與 AI 指紋管理
 * 2. 全網巡邏獵人 (Hunter Engine) - 爬蟲掃描與圖片比對
 * 3. 維權作戰中心 (Legal War Room) - 證據存證與自動檢舉
 */

// ==================== 基礎類型 ====================

/** 資產狀態 */
export type AssetStatus = 'processing' | 'indexed' | 'monitoring' | 'archived';

/** 相似度等級 */
export type SimilarityLevel = 'exact' | 'high' | 'medium' | 'low';

/** 侵權案件狀態 */
export type CaseStatus = 'detected' | 'reviewing' | 'warning_sent' | 'reported' | 'resolved' | 'dismissed';

/** 平台類型 */
export type PlatformType = 'shopee' | 'ruten' | 'yahoo' | 'other';

/** 警告信等級 */
export type WarningLevel = 'friendly' | 'formal' | 'legal';

/** 掃描任務狀態 */
export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

/** 掃描類型 */
export type ScanType = 'keyword' | 'visual' | 'hybrid';

// ==================== 數位資產庫 (Asset Vault) ====================

/** 圖片指紋 */
export interface ImageFingerprint {
  pHash: string;                    // 感知雜湊 (64 bit hex)
  orbDescriptors?: string;          // ORB 特徵描述符 (Base64 編碼)
  colorHistogram?: string;          // 顏色直方圖 (Base64 編碼)
  featureCount?: number;            // ORB 特徵點數量
}

/** 數位資產 */
export interface DigitalAsset {
  id: string;
  userId: string;
  fileName: string;
  originalUrl: string;
  thumbnailUrl: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
  fingerprint: ImageFingerprint;
  metadata: {
    uploadedBy: string;
    uploadedAt: string;
    tags: string[];
    description?: string;
    productSku?: string;
    brandName?: string;
  };
  status: AssetStatus;
  scanStats: {
    lastScanAt?: string;
    totalScans: number;
    violationsFound: number;
  };
  createdAt: string;
  updatedAt: string;
}

/** 授權白名單條目 */
export interface WhitelistEntry {
  id: string;
  assetId: string;
  platformType: PlatformType;
  sellerName: string;
  sellerId?: string;
  storeUrl: string;
  authorizedAt: string;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
}

/** 資產上傳請求 */
export interface AssetUploadRequest {
  files: File[];
  tags?: string[];
  description?: string;
  productSku?: string;
  brandName?: string;
}

/** 資產上傳進度 */
export interface AssetUploadProgress {
  fileName: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

// ==================== 全網巡邏獵人 (Hunter Engine) ====================

/** 掃描設定 */
export interface ScanConfig {
  assetIds: string[];               // 要掃描的資產 ID
  platforms: PlatformType[];        // 目標平台
  keywords: string[];               // 搜尋關鍵字
  priceRange?: {
    min?: number;
    max?: number;
  };
  similarityThreshold: number;      // 相似度門檻 (0-100)
  maxResults: number;               // 最大結果數
  scanDepth?: number;               // 掃描深度 (頁數)
}

/** 掃描任務 */
export interface ScanTask {
  id: string;
  userId: string;
  type: ScanType;
  status: ScanStatus;
  config: ScanConfig;
  progress: number;
  totalScanned: number;
  violationsFound: number;
  executionTimeMs?: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

/** 相似度評分 */
export interface SimilarityScore {
  overall: number;                  // 綜合相似度 (0-100)
  pHashScore: number;               // pHash 分數 (0-100)
  pHashDistance: number;            // pHash 漢明距離 (0-64)
  orbScore?: number;                // ORB 分數 (0-100)
  orbMatches?: number;              // ORB 匹配點數
  colorScore?: number;              // 顏色直方圖分數 (0-100)
  level: SimilarityLevel;
}

/** 商品資訊 */
export interface ListingInfo {
  listingId: string;
  title: string;
  price: number;
  currency: string;
  url: string;
  imageUrl: string;
  thumbnailUrl: string;
  sellerName: string;
  sellerId: string;
  sellerUrl: string;
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
  location?: string;
  shopAge?: string;
}

/** 侵權記錄 */
export interface Violation {
  id: string;
  assetId: string;
  assetFileName: string;
  assetThumbnail: string;
  taskId: string;
  platform: PlatformType;
  listing: ListingInfo;
  similarity: SimilarityScore;
  evidence: {
    screenshotUrl?: string;
    screenshotAt?: string;
    pageHtml?: string;
    metadata?: Record<string, unknown>;
  };
  isWhitelisted: boolean;
  caseId?: string;
  detectedAt: string;
  createdAt: string;
}

/** 盜圖者畫像 */
export interface InfringerProfile {
  sellerId: string;
  sellerName: string;
  platform: PlatformType;
  profileUrl: string;
  stats: {
    totalListings: number;
    violatingListings: number;
    estimatedRevenue: number;
    averagePrice: number;
    totalSales: number;
    firstDetectedAt: string;
    lastDetectedAt: string;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  violations: Violation[];
  notes?: string;
}

/** 掃描結果 */
export interface ScanResult {
  taskId: string;
  totalScanned: number;
  violationsFound: number;
  violations: Violation[];
  infringers: InfringerProfile[];
  executionTimeMs: number;
  scannedPlatforms: PlatformType[];
}

// ==================== 維權作戰中心 (Legal War Room) ====================

/** 維權案件 */
export interface LegalCase {
  id: string;
  userId: string;
  caseNumber: string;
  status: CaseStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  infringer: InfringerProfile;
  violations: Violation[];
  timeline: CaseEvent[];
  letters: WarningLetter[];
  reports: OfficialReport[];
  notes: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

/** 案件事件 */
export interface CaseEvent {
  id: string;
  caseId: string;
  eventType:
    | 'created'
    | 'status_changed'
    | 'letter_sent'
    | 'report_filed'
    | 'response_received'
    | 'evidence_added'
    | 'resolved'
    | 'note_added';
  description: string;
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
}

/** 警告信 */
export interface WarningLetter {
  id: string;
  caseId: string;
  level: WarningLevel;
  templateId?: string;
  subject: string;
  content: string;
  variables: Record<string, string>;
  recipientEmail?: string;
  recipientName?: string;
  sentAt?: string;
  sentVia: 'email' | 'platform_message' | 'manual' | 'draft';
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'responded';
  response?: string;
  responseAt?: string;
  attachments: string[];
  createdAt: string;
}

/** 警告信模板 */
export interface WarningLetterTemplate {
  id: string;
  name: string;
  level: WarningLevel;
  subject: string;
  content: string;
  variables: string[];
  description: string;
  isDefault: boolean;
}

/** 官方檢舉 */
export interface OfficialReport {
  id: string;
  caseId: string;
  platform: PlatformType;
  reportType: 'copyright' | 'trademark' | 'counterfeit';
  reportContent: string;
  attachments: string[];
  submittedAt?: string;
  confirmationNumber?: string;
  status: 'draft' | 'submitted' | 'processing' | 'resolved' | 'rejected';
  platformResponse?: string;
  platformResponseAt?: string;
  createdAt: string;
}

/** 檢舉模板 */
export interface ReportTemplate {
  id: string;
  platform: PlatformType;
  reportType: 'copyright' | 'trademark' | 'counterfeit';
  name: string;
  content: string;
  requiredFields: string[];
  instructions: string;
}

// ==================== 儀表板統計 ====================

/** Image Guardian 統計數據 */
export interface ImageGuardianStats {
  assets: {
    total: number;
    monitoring: number;
    archived: number;
    newThisMonth: number;
  };
  scans: {
    totalScans: number;
    scansThisMonth: number;
    lastScanAt?: string;
    averageScanTime: number;
    successRate: number;
  };
  violations: {
    total: number;
    newThisWeek: number;
    newThisMonth: number;
    byPlatform: Record<PlatformType, number>;
    bySimilarity: Record<SimilarityLevel, number>;
  };
  cases: {
    total: number;
    active: number;
    resolved: number;
    warningsSent: number;
    reportsField: number;
    resolutionRate: number;
  };
  topInfringers: InfringerProfile[];
  recentActivity: CaseEvent[];
}

// ==================== 標籤與顯示文字 ====================

export const PLATFORM_LABELS: Record<PlatformType, string> = {
  shopee: '蝦皮購物',
  ruten: '露天拍賣',
  yahoo: 'Yahoo 拍賣',
  other: '其他平台'
};

export const PLATFORM_ICONS: Record<PlatformType, string> = {
  shopee: 'ShoppingBag',
  ruten: 'Store',
  yahoo: 'Globe',
  other: 'MoreHorizontal'
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  processing: '處理中',
  indexed: '已索引',
  monitoring: '監控中',
  archived: '已歸檔'
};

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  detected: '已偵測',
  reviewing: '審查中',
  warning_sent: '已發警告',
  reported: '已檢舉',
  resolved: '已解決',
  dismissed: '已排除'
};

export const SCAN_STATUS_LABELS: Record<ScanStatus, string> = {
  queued: '排隊中',
  running: '掃描中',
  completed: '已完成',
  failed: '失敗',
  cancelled: '已取消'
};

export const SIMILARITY_LEVEL_LABELS: Record<SimilarityLevel, string> = {
  exact: '完全相同',
  high: '高度相似',
  medium: '中度相似',
  low: '低相似度'
};

export const WARNING_LEVEL_LABELS: Record<WarningLevel, string> = {
  friendly: '友善提醒',
  formal: '正式警告',
  legal: '法律警告'
};

export const SCAN_TYPE_LABELS: Record<ScanType, string> = {
  keyword: '關鍵字搜尋',
  visual: '視覺比對',
  hybrid: '混合搜尋'
};

// ==================== 顏色配置 ====================

export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
  processing: 'bg-yellow-100 text-yellow-700',
  indexed: 'bg-blue-100 text-blue-700',
  monitoring: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-700'
};

export const CASE_STATUS_COLORS: Record<CaseStatus, string> = {
  detected: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  warning_sent: 'bg-orange-100 text-orange-700',
  reported: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-700'
};

export const SCAN_STATUS_COLORS: Record<ScanStatus, string> = {
  queued: 'bg-gray-100 text-gray-700',
  running: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700'
};

export const SIMILARITY_LEVEL_COLORS: Record<SimilarityLevel, string> = {
  exact: 'bg-red-100 text-red-700 border-red-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-gray-100 text-gray-700 border-gray-300'
};

export const WARNING_LEVEL_COLORS: Record<WarningLevel, string> = {
  friendly: 'bg-green-100 text-green-700',
  formal: 'bg-yellow-100 text-yellow-700',
  legal: 'bg-red-100 text-red-700'
};

export const PLATFORM_COLORS: Record<PlatformType, string> = {
  shopee: 'bg-orange-100 text-orange-700',
  ruten: 'bg-blue-100 text-blue-700',
  yahoo: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700'
};

export const RISK_LEVEL_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700'
};

// ==================== 工具函數 ====================

/** 獲取相似度等級 */
export function getSimilarityLevel(score: number): SimilarityLevel {
  if (score >= 95) return 'exact';
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

/** 獲取風險等級 */
export function getRiskLevel(violations: number, revenue: number): 'low' | 'medium' | 'high' | 'critical' {
  const riskScore = (violations * 10) + (revenue / 10000);
  if (riskScore >= 100) return 'critical';
  if (riskScore >= 50) return 'high';
  if (riskScore >= 20) return 'medium';
  return 'low';
}

/** 格式化相似度為百分比 */
export function formatSimilarity(score: number): string {
  return `${score.toFixed(1)}%`;
}

/** 生成案件編號 */
export function generateCaseNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `IG-${year}${month}-${random}`;
}

/** 計算 pHash 漢明距離對應的相似度 */
export function pHashDistanceToScore(distance: number): number {
  // 漢明距離 0-64，轉換為 0-100 分數
  return Math.max(0, 100 - (distance * 100 / 64));
}
