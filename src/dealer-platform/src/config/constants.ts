/**
 * 商業邏輯常量配置
 */

/**
 * 供應商評等定義
 */
export const SUPPLIER_GRADES = {
  A: { label: 'A級', color: 'green', minScore: 90 },
  B: { label: 'B級', color: 'blue', minScore: 75 },
  C: { label: 'C級', color: 'yellow', minScore: 60 },
  D: { label: 'D級', color: 'red', minScore: 0 },
} as const

/**
 * 供應商評分權重
 */
export const SCORE_WEIGHTS = {
  quality: 0.30,      // 品質 30%
  delivery: 0.25,     // 交貨 25%
  price: 0.20,        // 價格 20%
  service: 0.15,      // 服務 15%
  compliance: 0.10,   // 合規 10%
} as const

/**
 * 採購單狀態
 */
export const PURCHASE_ORDER_STATUS = {
  draft: { label: '草稿', color: 'gray' },
  pending: { label: '待審核', color: 'yellow' },
  approved: { label: '已核准', color: 'blue' },
  ordered: { label: '已下單', color: 'blue' },
  partial: { label: '部分到貨', color: 'orange' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'red' },
} as const

/**
 * 交貨狀態
 */
export const DELIVERY_STATUS = {
  pending: { label: '待出貨', color: 'gray' },
  in_transit: { label: '運送中', color: 'blue' },
  delivered: { label: '已到貨', color: 'orange' },
  inspecting: { label: '驗收中', color: 'yellow' },
  accepted: { label: '已驗收', color: 'green' },
  rejected: { label: '已退回', color: 'red' },
} as const

/**
 * 報價單狀態
 */
export const QUOTATION_STATUS = {
  draft: { label: '草稿', color: 'gray' },
  sent: { label: '已發送', color: 'blue' },
  viewed: { label: '已查看', color: 'yellow' },
  accepted: { label: '已接受', color: 'green' },
  rejected: { label: '已拒絕', color: 'red' },
  expired: { label: '已過期', color: 'gray' },
} as const

/**
 * 支援的貨幣
 */
export const CURRENCIES = [
  { value: 'TWD', label: 'TWD 新台幣', symbol: 'NT$' },
  { value: 'USD', label: 'USD 美元', symbol: '$' },
  { value: 'CNY', label: 'CNY 人民幣', symbol: '¥' },
  { value: 'JPY', label: 'JPY 日圓', symbol: '¥' },
  { value: 'EUR', label: 'EUR 歐元', symbol: '€' },
] as const

/**
 * 預設稅率
 */
export const DEFAULT_TAX_RATE = 5

/**
 * 預設付款條件（天數）
 */
export const DEFAULT_PAYMENT_TERMS = 30

/**
 * 報價單預設有效天數
 */
export const DEFAULT_QUOTE_VALIDITY_DAYS = 30

/**
 * 分頁預設值
 */
export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
} as const

/**
 * 日期格式
 */
export const DATE_FORMAT = {
  display: 'yyyy/MM/dd',
  displayWithTime: 'yyyy/MM/dd HH:mm',
  api: 'yyyy-MM-dd',
} as const
