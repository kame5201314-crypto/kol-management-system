/**
 * Base Platform API Client
 * Abstract class for platform integrations
 */

import type { Product, Order, ProductListing, PlatformType } from '@/types/database'

export interface PlatformConfig {
  apiKey?: string
  apiSecret?: string
  partnerId?: string
  shopId?: string
  accessToken?: string
  refreshToken?: string
  baseUrl: string
}

export interface PlatformProduct {
  id: string
  name: string
  sku: string
  description: string
  price: number
  stock: number
  images: string[]
  status: 'active' | 'inactive' | 'pending'
  url?: string
  platformData?: Record<string, unknown>
}

export interface PlatformOrder {
  id: string
  orderNumber: string
  status: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  shippingAddress: {
    address: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  items: Array<{
    sku: string
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  paymentMethod?: string
  paymentStatus?: string
  createdAt: string
  platformData?: Record<string, unknown>
}

export interface SyncResult<T> {
  success: boolean
  data?: T
  error?: string
  platformResponse?: unknown
}

export interface PlatformRateLimiter {
  maxRequests: number
  windowMs: number
  currentRequests: number
  windowStart: number
}

export abstract class BasePlatformClient {
  protected config: PlatformConfig
  protected rateLimiter: PlatformRateLimiter

  constructor(config: PlatformConfig) {
    this.config = config
    this.rateLimiter = {
      maxRequests: 100,
      windowMs: 60000, // 1 minute
      currentRequests: 0,
      windowStart: Date.now(),
    }
  }

  /**
   * Check rate limit before making request
   */
  protected async checkRateLimit(): Promise<void> {
    const now = Date.now()
    if (now - this.rateLimiter.windowStart > this.rateLimiter.windowMs) {
      this.rateLimiter.windowStart = now
      this.rateLimiter.currentRequests = 0
    }

    if (this.rateLimiter.currentRequests >= this.rateLimiter.maxRequests) {
      const waitTime = this.rateLimiter.windowMs - (now - this.rateLimiter.windowStart)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      this.rateLimiter.windowStart = Date.now()
      this.rateLimiter.currentRequests = 0
    }

    this.rateLimiter.currentRequests++
  }

  /**
   * Refresh access token if needed
   */
  abstract refreshToken(): Promise<SyncResult<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>>

  /**
   * Get products from platform
   */
  abstract getProducts(options?: { page?: number; limit?: number }): Promise<SyncResult<PlatformProduct[]>>

  /**
   * Get single product by ID
   */
  abstract getProduct(platformProductId: string): Promise<SyncResult<PlatformProduct>>

  /**
   * Create product on platform
   */
  abstract createProduct(product: Product): Promise<SyncResult<PlatformProduct>>

  /**
   * Update product on platform
   */
  abstract updateProduct(platformProductId: string, product: Partial<Product>): Promise<SyncResult<PlatformProduct>>

  /**
   * Delete/deactivate product on platform
   */
  abstract deleteProduct(platformProductId: string): Promise<SyncResult<void>>

  /**
   * Update product stock
   */
  abstract updateStock(platformProductId: string, stock: number): Promise<SyncResult<void>>

  /**
   * Update product price
   */
  abstract updatePrice(platformProductId: string, price: number): Promise<SyncResult<void>>

  /**
   * Get orders from platform
   */
  abstract getOrders(options?: {
    page?: number
    limit?: number
    status?: string
    startDate?: Date
    endDate?: Date
  }): Promise<SyncResult<PlatformOrder[]>>

  /**
   * Get single order
   */
  abstract getOrder(platformOrderId: string): Promise<SyncResult<PlatformOrder>>

  /**
   * Update order status
   */
  abstract updateOrderStatus(platformOrderId: string, status: string): Promise<SyncResult<void>>

  /**
   * Update shipping info
   */
  abstract updateShipping(
    platformOrderId: string,
    trackingNumber: string,
    shippingProvider?: string
  ): Promise<SyncResult<void>>

  /**
   * Test connection
   */
  abstract testConnection(): Promise<SyncResult<boolean>>

  /**
   * Make HTTP request with error handling and retries
   */
  protected async makeRequest<T>(
    url: string,
    options: RequestInit & { retries?: number } = {}
  ): Promise<SyncResult<T>> {
    const { retries = 3, ...fetchOptions } = options

    await this.checkRateLimit()

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        return { success: true, data, platformResponse: data }
      } catch (error) {
        if (attempt === retries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Request failed',
          }
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    return { success: false, error: 'Request failed after retries' }
  }
}

/**
 * Convert platform product to internal listing format
 */
export function convertToInternalProduct(
  platformProduct: PlatformProduct,
  platform: PlatformType
): Partial<ProductListing> {
  return {
    platform,
    platform_product_id: platformProduct.id,
    platform_url: platformProduct.url || null,
    listing_status: platformProduct.status === 'active' ? 'active' : 'inactive',
    platform_price: platformProduct.price,
    platform_stock: platformProduct.stock,
    platform_data: platformProduct.platformData || {},
  }
}

/**
 * Convert platform order to internal order format
 */
export function convertToInternalOrder(
  platformOrder: PlatformOrder,
  platform: PlatformType
): Partial<Order> {
  return {
    platform,
    platform_order_id: platformOrder.id,
    order_number: platformOrder.orderNumber,
    status: platformOrder.status as Order['status'],
    customer_name: platformOrder.customerName,
    customer_phone: platformOrder.customerPhone || null,
    customer_email: platformOrder.customerEmail || null,
    shipping_address: {
      recipient: platformOrder.customerName,
      address: platformOrder.shippingAddress.address,
      city: platformOrder.shippingAddress.city || '',
      state: platformOrder.shippingAddress.state,
      postal_code: platformOrder.shippingAddress.postalCode || '',
      country: platformOrder.shippingAddress.country || 'TW',
      phone: platformOrder.customerPhone,
    },
    subtotal: platformOrder.subtotal,
    shipping_fee: platformOrder.shippingFee,
    discount: platformOrder.discount,
    total_amount: platformOrder.total,
    currency: 'TWD',
    payment_method: platformOrder.paymentMethod || null,
    payment_status: (platformOrder.paymentStatus as Order['payment_status']) || 'pending',
  }
}
