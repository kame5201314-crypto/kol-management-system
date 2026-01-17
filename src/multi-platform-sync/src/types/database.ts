/**
 * Database Types for Multi-Platform Sync
 * Schema: sync
 */

// Platform Types
export type PlatformType = 'shopee' | 'momo' | 'shopline' | 'ruten' | 'pchome' | 'yahoo'

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'partial'

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

// Base Fields (required for all tables)
export interface BaseFields {
  id: string
  org_id: string
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  is_deleted: boolean
  deleted_at: string | null
  metadata: Record<string, unknown>
  version: number
}

// Products Table
export interface Product extends BaseFields {
  name: string
  sku: string
  description: string
  base_price: number
  cost_price: number
  weight: number | null
  weight_unit: 'g' | 'kg'
  dimensions: {
    length?: number
    width?: number
    height?: number
    unit?: 'cm' | 'm'
  } | null
  category_id: string | null
  brand: string | null
  images: string[]
  tags: string[]
  is_active: boolean
  variants: ProductVariant[]
}

export interface ProductVariant {
  id: string
  sku: string
  name: string
  price_adjustment: number
  stock: number
  attributes: Record<string, string>
}

// Platform Connections Table
export interface PlatformConnection extends BaseFields {
  platform: PlatformType
  shop_id: string
  shop_name: string
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  is_connected: boolean
  last_sync_at: string | null
  sync_settings: {
    auto_sync: boolean
    sync_interval_minutes: number
    sync_inventory: boolean
    sync_orders: boolean
    sync_prices: boolean
  }
}

// Product Platform Listings Table
export interface ProductListing extends BaseFields {
  product_id: string
  platform_connection_id: string
  platform: PlatformType
  platform_product_id: string | null
  platform_url: string | null
  listing_status: 'draft' | 'active' | 'inactive' | 'deleted'
  sync_status: SyncStatus
  last_sync_at: string | null
  last_sync_error: string | null
  platform_price: number
  platform_stock: number
  platform_data: Record<string, unknown>
}

// Inventory Table
export interface Inventory extends BaseFields {
  product_id: string
  variant_id: string | null
  sku: string
  total_stock: number
  reserved_stock: number
  available_stock: number
  low_stock_threshold: number
  warehouse_location: string | null
}

// Inventory Logs Table
export interface InventoryLog extends BaseFields {
  inventory_id: string
  product_id: string
  change_type: 'sale' | 'restock' | 'adjustment' | 'return' | 'sync' | 'damage'
  change_quantity: number
  previous_quantity: number
  new_quantity: number
  reference_type: 'order' | 'manual' | 'sync' | null
  reference_id: string | null
  notes: string | null
}

// Orders Table
export interface Order extends BaseFields {
  platform_connection_id: string
  platform: PlatformType
  platform_order_id: string
  order_number: string
  status: OrderStatus
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  shipping_address: {
    recipient: string
    address: string
    city: string
    state?: string
    postal_code: string
    country: string
    phone?: string
  }
  subtotal: number
  shipping_fee: number
  discount: number
  total_amount: number
  currency: string
  payment_method: string | null
  payment_status: 'pending' | 'paid' | 'refunded' | 'partial_refund'
  shipped_at: string | null
  delivered_at: string | null
  notes: string | null
}

// Order Items Table
export interface OrderItem extends BaseFields {
  order_id: string
  product_id: string | null
  product_listing_id: string | null
  sku: string
  name: string
  variant_name: string | null
  quantity: number
  unit_price: number
  subtotal: number
  platform_item_id: string | null
}

// Sync Jobs Table
export interface SyncJob extends BaseFields {
  platform_connection_id: string | null
  job_type: 'product_sync' | 'inventory_sync' | 'order_sync' | 'full_sync'
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string | null
  completed_at: string | null
  total_items: number
  processed_items: number
  success_items: number
  failed_items: number
  error_log: string[]
}

// Sync Logs Table
export interface SyncLog {
  id: string
  org_id: string
  job_id: string | null
  platform: PlatformType
  action: string
  entity_type: string
  entity_id?: string
  status: 'success' | 'error' | 'skipped'
  message?: string
  request_data?: Record<string, unknown>
  response_data?: Record<string, unknown>
  error_details?: Record<string, unknown>
  created_at: string
  metadata?: Record<string, unknown>
}

// Categories Table
export interface Category extends BaseFields {
  name: string
  slug: string
  parent_id: string | null
  description: string | null
  image_url: string | null
  sort_order: number
}

// Database Schema - Supabase public schema
export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at'>>
      }
      platform_connections: {
        Row: PlatformConnection
        Insert: Omit<PlatformConnection, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PlatformConnection, 'id' | 'created_at'>>
      }
      product_listings: {
        Row: ProductListing
        Insert: Omit<ProductListing, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProductListing, 'id' | 'created_at'>>
      }
      inventory: {
        Row: Inventory
        Insert: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Inventory, 'id' | 'created_at'>>
      }
      inventory_logs: {
        Row: InventoryLog
        Insert: Omit<InventoryLog, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<InventoryLog, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>
      }
      sync_jobs: {
        Row: SyncJob
        Insert: Omit<SyncJob, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SyncJob, 'id' | 'created_at'>>
      }
      sync_logs: {
        Row: SyncLog
        Insert: Omit<SyncLog, 'id' | 'created_at'>
        Update: Partial<Omit<SyncLog, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
    }
  }
}
