/**
 * Shopline Platform API Client
 * Shopline Store API Integration
 */

import {
  BasePlatformClient,
  PlatformConfig,
  PlatformProduct,
  PlatformOrder,
  SyncResult,
} from './base'
import type { Product } from '@/types/database'

interface ShoplineConfig extends PlatformConfig {
  storeId: string
  apiKey: string
}

interface ShoplineProductResponse {
  _id: string
  sku: string
  title: {
    zh_tw: string
    en: string
  }
  description: {
    zh_tw: string
    en: string
  }
  price: {
    sale_price: number
    original_price: number
  }
  quantity: number
  images: Array<{
    url: string
  }>
  status: 'active' | 'hidden' | 'draft'
  handle: string
  created_at: string
  updated_at: string
}

interface ShoplineOrderResponse {
  _id: string
  order_no: string
  status: string
  customer: {
    name: string
    phone: string
    email: string
  }
  shipping_address: {
    recipient_name: string
    phone: string
    address_1: string
    address_2?: string
    city: string
    state?: string
    zip: string
    country: string
  }
  line_items: Array<{
    product_id: string
    sku: string
    title: string
    quantity: number
    price: number
  }>
  subtotal: number
  shipping_fee: number
  discount: number
  total: number
  payment_method: string
  payment_status: string
  fulfillment_status: string
  tracking_number?: string
  created_at: string
}

export class ShoplineClient extends BasePlatformClient {
  private storeId: string
  private apiKey: string

  constructor(config: ShoplineConfig) {
    super({
      ...config,
      baseUrl: config.baseUrl || 'https://api.shoplineapp.com',
    })
    this.storeId = config.storeId
    this.apiKey = config.apiKey

    // Shopline rate limits
    this.rateLimiter = {
      maxRequests: 120,
      windowMs: 60000,
      currentRequests: 0,
      windowStart: Date.now(),
    }
  }

  /**
   * Build authenticated request headers
   */
  private buildHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.accessToken}`,
      'X-Store-Id': this.storeId,
    }
  }

  async refreshToken(): Promise<SyncResult<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>> {
    const result = await this.makeRequest<{
      access_token: string
      refresh_token: string
      expires_in: number
    }>(`${this.config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.config.refreshToken,
        client_id: this.apiKey,
      }),
    })

    if (result.success && result.data) {
      return {
        success: true,
        data: {
          accessToken: result.data.access_token,
          refreshToken: result.data.refresh_token,
          expiresAt: new Date(Date.now() + result.data.expires_in * 1000),
        },
      }
    }

    return { success: false, error: result.error }
  }

  async getProducts(options?: { page?: number; limit?: number }): Promise<SyncResult<PlatformProduct[]>> {
    const params = new URLSearchParams({
      page: (options?.page || 1).toString(),
      limit: (options?.limit || 50).toString(),
    })

    const result = await this.makeRequest<{
      items: ShoplineProductResponse[]
      pagination: {
        total: number
        page: number
        limit: number
      }
    }>(`${this.config.baseUrl}/v1/products?${params}`, {
      method: 'GET',
      headers: this.buildHeaders(),
    })

    if (!result.success || !result.data) {
      return { success: false, error: result.error }
    }

    const products: PlatformProduct[] = result.data.items.map((item) => ({
      id: item._id,
      name: item.title.zh_tw || item.title.en,
      sku: item.sku,
      description: item.description.zh_tw || item.description.en,
      price: item.price.sale_price,
      stock: item.quantity,
      images: item.images.map((img) => img.url),
      status: item.status === 'active' ? 'active' : 'inactive',
      url: `https://${this.storeId}.shoplineapp.com/products/${item.handle}`,
      platformData: { shopline: item },
    }))

    return { success: true, data: products }
  }

  async getProduct(platformProductId: string): Promise<SyncResult<PlatformProduct>> {
    const result = await this.makeRequest<ShoplineProductResponse>(
      `${this.config.baseUrl}/v1/products/${platformProductId}`,
      {
        method: 'GET',
        headers: this.buildHeaders(),
      }
    )

    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Product not found' }
    }

    const item = result.data
    return {
      success: true,
      data: {
        id: item._id,
        name: item.title.zh_tw || item.title.en,
        sku: item.sku,
        description: item.description.zh_tw || item.description.en,
        price: item.price.sale_price,
        stock: item.quantity,
        images: item.images.map((img) => img.url),
        status: item.status === 'active' ? 'active' : 'inactive',
        url: `https://${this.storeId}.shoplineapp.com/products/${item.handle}`,
        platformData: { shopline: item },
      },
    }
  }

  async createProduct(product: Product): Promise<SyncResult<PlatformProduct>> {
    const productData = {
      sku: product.sku,
      title: {
        zh_tw: product.name,
        en: product.name,
      },
      description: {
        zh_tw: product.description || '',
        en: product.description || '',
      },
      price: {
        sale_price: product.base_price,
        original_price: product.base_price,
      },
      quantity: 0,
      status: product.is_active ? 'active' : 'draft',
      images: (product.images || []).map((url) => ({ url })),
    }

    const result = await this.makeRequest<ShoplineProductResponse>(`${this.config.baseUrl}/v1/products`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(productData),
    })

    if (!result.success || !result.data) {
      return { success: false, error: result.error }
    }

    return this.getProduct(result.data._id)
  }

  async updateProduct(platformProductId: string, product: Partial<Product>): Promise<SyncResult<PlatformProduct>> {
    const updateData: Record<string, unknown> = {}

    if (product.name) {
      updateData.title = {
        zh_tw: product.name,
        en: product.name,
      }
    }
    if (product.description) {
      updateData.description = {
        zh_tw: product.description,
        en: product.description,
      }
    }
    if (product.base_price) {
      updateData.price = {
        sale_price: product.base_price,
        original_price: product.base_price,
      }
    }
    if (product.sku) {
      updateData.sku = product.sku
    }

    const result = await this.makeRequest(`${this.config.baseUrl}/v1/products/${platformProductId}`, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(updateData),
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return this.getProduct(platformProductId)
  }

  async deleteProduct(platformProductId: string): Promise<SyncResult<void>> {
    const result = await this.makeRequest(`${this.config.baseUrl}/v1/products/${platformProductId}`, {
      method: 'DELETE',
      headers: this.buildHeaders(),
    })

    return { success: result.success, error: result.error }
  }

  async updateStock(platformProductId: string, stock: number): Promise<SyncResult<void>> {
    const result = await this.makeRequest(`${this.config.baseUrl}/v1/products/${platformProductId}/inventory`, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify({ quantity: stock }),
    })

    return { success: result.success, error: result.error }
  }

  async updatePrice(platformProductId: string, price: number): Promise<SyncResult<void>> {
    const result = await this.makeRequest(`${this.config.baseUrl}/v1/products/${platformProductId}`, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        price: {
          sale_price: price,
          original_price: price,
        },
      }),
    })

    return { success: result.success, error: result.error }
  }

  async getOrders(options?: {
    page?: number
    limit?: number
    status?: string
    startDate?: Date
    endDate?: Date
  }): Promise<SyncResult<PlatformOrder[]>> {
    const params = new URLSearchParams({
      page: (options?.page || 1).toString(),
      limit: (options?.limit || 50).toString(),
    })

    if (options?.status) {
      params.set('status', options.status)
    }
    if (options?.startDate) {
      params.set('created_at_min', options.startDate.toISOString())
    }
    if (options?.endDate) {
      params.set('created_at_max', options.endDate.toISOString())
    }

    const result = await this.makeRequest<{
      items: ShoplineOrderResponse[]
      pagination: {
        total: number
        page: number
        limit: number
      }
    }>(`${this.config.baseUrl}/v1/orders?${params}`, {
      method: 'GET',
      headers: this.buildHeaders(),
    })

    if (!result.success || !result.data) {
      return { success: false, error: result.error }
    }

    const orders: PlatformOrder[] = result.data.items.map((order) => ({
      id: order._id,
      orderNumber: order.order_no,
      status: this.mapOrderStatus(order.status, order.fulfillment_status),
      customerName: order.shipping_address.recipient_name || order.customer.name,
      customerPhone: order.shipping_address.phone || order.customer.phone,
      customerEmail: order.customer.email,
      shippingAddress: {
        address: [order.shipping_address.address_1, order.shipping_address.address_2].filter(Boolean).join(', '),
        city: order.shipping_address.city,
        state: order.shipping_address.state,
        postalCode: order.shipping_address.zip,
        country: order.shipping_address.country,
      },
      items: order.line_items.map((item) => ({
        sku: item.sku,
        name: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: order.subtotal,
      shippingFee: order.shipping_fee,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      platformData: { shopline: order },
    }))

    return { success: true, data: orders }
  }

  async getOrder(platformOrderId: string): Promise<SyncResult<PlatformOrder>> {
    const result = await this.makeRequest<ShoplineOrderResponse>(
      `${this.config.baseUrl}/v1/orders/${platformOrderId}`,
      {
        method: 'GET',
        headers: this.buildHeaders(),
      }
    )

    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Order not found' }
    }

    const order = result.data
    return {
      success: true,
      data: {
        id: order._id,
        orderNumber: order.order_no,
        status: this.mapOrderStatus(order.status, order.fulfillment_status),
        customerName: order.shipping_address.recipient_name || order.customer.name,
        customerPhone: order.shipping_address.phone || order.customer.phone,
        customerEmail: order.customer.email,
        shippingAddress: {
          address: [order.shipping_address.address_1, order.shipping_address.address_2].filter(Boolean).join(', '),
          city: order.shipping_address.city,
          state: order.shipping_address.state,
          postalCode: order.shipping_address.zip,
          country: order.shipping_address.country,
        },
        items: order.line_items.map((item) => ({
          sku: item.sku,
          name: item.title,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: order.subtotal,
        shippingFee: order.shipping_fee,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        platformData: { shopline: order },
      },
    }
  }

  async updateOrderStatus(platformOrderId: string, status: string): Promise<SyncResult<void>> {
    const result = await this.makeRequest(`${this.config.baseUrl}/v1/orders/${platformOrderId}`, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify({ status }),
    })

    return { success: result.success, error: result.error }
  }

  async updateShipping(
    platformOrderId: string,
    trackingNumber: string,
    shippingProvider?: string
  ): Promise<SyncResult<void>> {
    const result = await this.makeRequest(`${this.config.baseUrl}/v1/orders/${platformOrderId}/fulfillments`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        tracking_number: trackingNumber,
        tracking_company: shippingProvider,
        notify_customer: true,
      }),
    })

    return { success: result.success, error: result.error }
  }

  async testConnection(): Promise<SyncResult<boolean>> {
    const result = await this.makeRequest<{
      store_name: string
    }>(`${this.config.baseUrl}/v1/shop`, {
      method: 'GET',
      headers: this.buildHeaders(),
    })

    return {
      success: result.success,
      data: result.success,
      error: result.error,
    }
  }

  private mapOrderStatus(status: string, fulfillmentStatus: string): string {
    if (status === 'cancelled') return 'cancelled'
    if (status === 'refunded') return 'refunded'
    if (fulfillmentStatus === 'fulfilled') return 'delivered'
    if (fulfillmentStatus === 'partial') return 'shipped'
    if (status === 'paid') return 'confirmed'
    if (status === 'pending') return 'pending'
    return 'pending'
  }
}

export function createShoplineClient(config: ShoplineConfig): ShoplineClient {
  return new ShoplineClient(config)
}
