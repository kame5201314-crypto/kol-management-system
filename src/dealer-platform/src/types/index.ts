/**
 * 類型定義導出
 */

export * from './database'

/**
 * API 回應類型
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * 分頁參數
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 分頁回應
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 排序參數
 */
export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

/**
 * 篩選參數
 */
export interface FilterParams {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * 表格查詢參數
 */
export interface TableQueryParams extends PaginationParams {
  sort?: SortParams
  filters?: FilterParams
  search?: string
}

/**
 * 供應商評等統計
 */
export interface SupplierGradeStats {
  grade: string
  count: number
  percentage: number
}

/**
 * 採購單統計
 */
export interface PurchaseOrderStats {
  total: number
  draft: number
  pending: number
  approved: number
  completed: number
  totalAmount: number
}

/**
 * 交貨統計
 */
export interface DeliveryStats {
  total: number
  pending: number
  inTransit: number
  delivered: number
  onTimeRate: number
}

/**
 * 報價單統計
 */
export interface QuotationStats {
  total: number
  draft: number
  sent: number
  accepted: number
  rejected: number
  conversionRate: number
  totalAmount: number
}

/**
 * 儀表板數據
 */
export interface DashboardData {
  supplierStats: SupplierGradeStats[]
  purchaseOrderStats: PurchaseOrderStats
  deliveryStats: DeliveryStats
  quotationStats: QuotationStats
  recentActivities: Activity[]
}

/**
 * 活動記錄
 */
export interface Activity {
  id: string
  type: 'supplier' | 'purchase_order' | 'delivery' | 'quotation'
  action: 'created' | 'updated' | 'deleted' | 'status_changed'
  description: string
  timestamp: string
  userId: string | null
  userName: string | null
}

/**
 * 表單狀態
 */
export interface FormState {
  isLoading: boolean
  isSubmitting: boolean
  errors: Record<string, string>
}

/**
 * 選項類型
 */
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

/**
 * 通知類型
 */
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: string
}
