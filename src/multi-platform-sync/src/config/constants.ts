import type { PlatformType } from '@/types'

// Platform Configuration
export const PLATFORMS: Record<
  PlatformType,
  {
    name: string
    displayName: string
    color: string
    icon: string
    baseUrl: string
    apiDocs: string
  }
> = {
  shopee: {
    name: 'shopee',
    displayName: '蝦皮購物',
    color: '#EE4D2D',
    icon: '/icons/shopee.svg',
    baseUrl: 'https://shopee.tw',
    apiDocs: 'https://open.shopee.com',
  },
  momo: {
    name: 'momo',
    displayName: 'momo購物',
    color: '#D5006D',
    icon: '/icons/momo.svg',
    baseUrl: 'https://www.momoshop.com.tw',
    apiDocs: '',
  },
  shopline: {
    name: 'shopline',
    displayName: 'SHOPLINE',
    color: '#00C7B7',
    icon: '/icons/shopline.svg',
    baseUrl: 'https://shopline.tw',
    apiDocs: 'https://developers.shopline.tw',
  },
  ruten: {
    name: 'ruten',
    displayName: '露天拍賣',
    color: '#FF6600',
    icon: '/icons/ruten.svg',
    baseUrl: 'https://www.ruten.com.tw',
    apiDocs: '',
  },
  pchome: {
    name: 'pchome',
    displayName: 'PChome 商店街',
    color: '#E91E63',
    icon: '/icons/pchome.svg',
    baseUrl: 'https://www.pcstore.com.tw',
    apiDocs: '',
  },
  yahoo: {
    name: 'yahoo',
    displayName: 'Yahoo購物',
    color: '#6001D2',
    icon: '/icons/yahoo.svg',
    baseUrl: 'https://tw.buy.yahoo.com',
    apiDocs: '',
  },
}

// Sync Settings
export const SYNC_INTERVALS = [
  { value: 5, label: '每 5 分鐘' },
  { value: 15, label: '每 15 分鐘' },
  { value: 30, label: '每 30 分鐘' },
  { value: 60, label: '每小時' },
  { value: 360, label: '每 6 小時' },
  { value: 1440, label: '每天' },
]

// Order Status Configuration
export const ORDER_STATUSES = {
  pending: { label: '待處理', color: 'yellow' },
  confirmed: { label: '已確認', color: 'blue' },
  shipped: { label: '已出貨', color: 'purple' },
  delivered: { label: '已送達', color: 'green' },
  cancelled: { label: '已取消', color: 'gray' },
  returned: { label: '已退貨', color: 'red' },
}

// Sync Status Configuration
export const SYNC_STATUSES = {
  pending: { label: '待同步', color: 'yellow' },
  syncing: { label: '同步中', color: 'blue' },
  synced: { label: '已同步', color: 'green' },
  failed: { label: '同步失敗', color: 'red' },
  partial: { label: '部分同步', color: 'orange' },
}

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Image Configuration
export const IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxCount: 9,
  dimensions: {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 500, height: 500 },
    large: { width: 1000, height: 1000 },
  },
}

// Currency
export const DEFAULT_CURRENCY = 'TWD'

// Weight Units
export const WEIGHT_UNITS = [
  { value: 'g', label: '公克' },
  { value: 'kg', label: '公斤' },
]

// Stock Alert Thresholds
export const LOW_STOCK_THRESHOLD = 10
export const OUT_OF_STOCK_THRESHOLD = 0
