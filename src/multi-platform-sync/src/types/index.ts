export * from './database'

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination Types
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form Types
export interface ProductFormData {
  name: string
  sku: string
  description: string
  base_price: number
  cost_price: number
  weight?: number
  weight_unit: 'g' | 'kg'
  category_id?: string
  brand?: string
  images: string[]
  tags: string[]
  is_active: boolean
}

export interface PlatformConnectionFormData {
  platform: string
  shop_id: string
  shop_name: string
  sync_settings: {
    auto_sync: boolean
    sync_interval_minutes: number
    sync_inventory: boolean
    sync_orders: boolean
    sync_prices: boolean
  }
}

// Dashboard Types
export interface DashboardStats {
  totalProducts: number
  activeListings: number
  pendingOrders: number
  totalRevenue: number
  syncStatus: {
    synced: number
    pending: number
    failed: number
  }
}

export interface PlatformStats {
  platform: string
  products: number
  orders: number
  revenue: number
  lastSync: string | null
}

// Chart Data Types
export interface ChartDataPoint {
  name: string
  value: number
}

export interface SalesChartData {
  date: string
  shopee: number
  momo: number
  shopline: number
  total: number
}

// Session Types
export interface UserSession {
  userId: string
  orgId: string
  email: string
  role: 'admin' | 'manager' | 'operator'
}
