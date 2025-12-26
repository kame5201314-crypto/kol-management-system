// 共用類型定義

// 使用者角色
export type UserRole = 'admin' | 'merchant' | 'kol' | 'operator';

// 平台使用者
export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

// 分頁參數
export interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
}

// API 回應包裝
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: PaginationParams;
}

// 日期範圍篩選
export interface DateRange {
  startDate: string;
  endDate: string;
}

// 通知
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// 排序方向
export type SortDirection = 'asc' | 'desc';

// 排序設定
export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// 篩選操作符
export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte';

// 篩選條件
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean;
}

// 匯出格式
export type ExportFormat = 'excel' | 'csv' | 'pdf';

// 匯出設定
export interface ExportConfig {
  format: ExportFormat;
  dateRange?: DateRange;
  columns?: string[];
  fileName?: string;
}

// 上傳檔案資訊
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

// 批次操作結果
export interface BatchOperationResult {
  total: number;
  success: number;
  failed: number;
  errors?: { id: string; error: string }[];
}

// 選單項目
export interface MenuItem {
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  description?: string;
  badge?: string | number;
  children?: MenuItem[];
}

// 模組導航
export interface ModuleNavigation {
  moduleId: string;
  moduleLabel: string;
  moduleIcon: React.ComponentType<{ className?: string; size?: number }>;
  items: MenuItem[];
}
