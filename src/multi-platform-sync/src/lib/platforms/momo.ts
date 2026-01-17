/**
 * Momo Platform API Client
 * Taiwan Momo Shopping API Integration
 */

import crypto from 'crypto'
import {
  BasePlatformClient,
  PlatformConfig,
  PlatformProduct,
  PlatformOrder,
  SyncResult,
} from './base'
import type { Product } from '@/types/database'

interface MomoConfig extends PlatformConfig {
  merchantId: string
  apiKey: string
  apiSecret: string
}

interface MomoProductResponse {
  productId: string
  productCode: string
  productName: string
  description: string
  salePrice: number
  listPrice: number
  stockQty: number
  images: string[]
  status: number // 1: active, 0: inactive
  productUrl?: string
}

interface MomoOrderResponse {
  orderId: string
  orderNo: string
  orderStatus: number
  buyerName: string
  buyerPhone: string
  buyerEmail?: string
  shippingAddress: string
  shippingCity: string
  shippingZip: string
  items: Array<{
    productId: string
    productCode: string
    productName: string
    qty: number
    unitPrice: number
  }>
  totalAmount: number
  shippingFee: number
  discountAmount: number
  paymentMethod: string
  paymentStatus: number
  createTime: string
}

export class MomoClient extends BasePlatformClient {
  private merchantId: string
  private apiKey: string
  private apiSecret: string

  constructor(config: MomoConfig) {
    super({
      ...config,
      baseUrl: config.baseUrl || 'https://api.momoshop.com.tw',
    })
    this.merchantId = config.merchantId
    this.apiKey = config.apiKey
    this.apiSecret = config.apiSecret

    // Momo rate limits
    this.rateLimiter = {
      maxRequests: 500,
      windowMs: 60000,
      currentRequests: 0,
      windowStart: Date.now(),
    }
  }

  /**
   * Generate Momo API signature
   */
  private generateSignature(data: Record<string, unknown>, timestamp: string): string {
    const sortedKeys = Object.keys(data).sort()
    const signString = sortedKeys.map((key) => `${key}=${data[key]}`).join('&')
    const baseString = `${this.merchantId}${timestamp}${signString}${this.apiSecret}`
    return crypto.createHash('sha256').update(baseString).digest('hex').toUpperCase()
  }

  /**
   * Build authenticated request headers
   */
  private buildHeaders(data: Record<string, unknown>): HeadersInit {
    const timestamp = Date.now().toString()
    const signature = this.generateSignature(data, timestamp)

    return {
      'Content-Type': 'application/json',
      'X-Merchant-Id': this.merchantId,
      'X-Api-Key': this.apiKey,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
    }
  }

  async refreshToken(): Promise<SyncResult<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>> {
    // Momo uses API key authentication, no token refresh needed
    return {
      success: true,
      data: {
        accessToken: this.apiKey,
      },
    }
  }

  async getProducts(options?: { page?: number; limit?: number }): Promise<SyncResult<PlatformProduct[]>> {
    const requestData = {
      page: options?.page || 1,
      pageSize: options?.limit || 50,
    }

    const result = await this.makeRequest<{
      data: {
        products: MomoProductResponse[]
        total: number
      }
    }>(`${this.config.baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: this.buildHeaders(requestData),
      body: JSON.stringify(requestData),
    })

    if (!result.success || !result.data) {
      return { success: false, error: result.error }
    }

    const products: PlatformProduct[] = result.data.data.products.map((item) => ({
      id: item.productId,
      name: item.productName,
      sku: item.productCode,
      description: item.description,
      price: item.salePrice,
      stock: item.stockQty,
      images: item.images,
      status: item.status === 1 ? 'active' : 'inactive',
      url: item.productUrl,
      platformData: { momo: item },
    }))

    return { success: true, data: products }
  }

  async getProduct(platformProductId: string): Promise<SyncResult<PlatformProduct>> {
    const requestData = { productId: platformProductId }

    const result = await this.makeRequest<{
      data: MomoProductResponse
    }>(`${this.config.baseUrl}/api/v1/products/${platformProductId}`, {
      method: 'GET',
      headers: this.buildHeaders(requestData),
    })

    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Product not found' }
    }

    const item = result.data.data
    return {
      success: true,
      data: {
        id: item.productId,
        name: item.productName,
        sku: item.productCode,
        description: item.description,
        price: item.salePrice,
        stock: item.stockQty,
        images: item.images,
        status: item.status === 1 ? 'active' : 'inactive',
        url: item.productUrl,
        platformData: { momo: item },
      },
    }
  }

  async createProduct(product: Product): Promise<SyncResult<PlatformProduct>> {
    const requestData = {
      productCode: product.sku,
      productName: product.name,
      description: product.description || '',
      salePrice: product.base_price,
      listPrice: product.base_price,
      stockQty: 0,
      images: product.images || [],
      status: product.is_active ? 1 : 0,
    }

    const result = await this.makeRequest<{
      data: {
        productId: string
      }
    }>(`${this.config.baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: this.buildHeaders(requestData),
      body: JSON.stringify(requestData),
    })

    if (!result.success || !result.data) {
      return { success: false, error: result.error }
    }

    return this.getProduct(result.data.data.productId)
  }

  async updateProduct(platformProductId: string, product: Partial<Product>): Promise<SyncResult<PlatformProduct>> {
    const requestData: Record<string, unknown> = {
      productId: platformProductId,
    }

    if (product.name) requestData.productName = product.name
    if (product.description) requestData.description = product.description
    if (product.base_price) requestData.salePrice = product.base_price
    if (product.sku) requestData.productCode = product.sku

    const result = await this.makeRequest(`${this.config.baseUrl}/api/v1/products/${platformProductId}`, {
      method: 'PUT',
      headers: this.buildHeaders(requestData),
      body: JSON.stringify(requestData),
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return this.getProduct(platformProductId)
  }

  async deleteProduct(platformProductId: string): Promise<SyncResult<void>> {
    const requestData = { productId: platformProductId }

    const result = await this.makeRequest(`${this.config.baseUrl}/api/v1/products/${platformProductId}`, {
      method: 'DELETE',
      headers: this.buildHeaders(requestData),
    })

    return { success: result.success, error: result.error }
  }

  async updateStock(platformProductId: string, stock: number): Promise<SyncResult<void>> {
    const requestData = {
      productId: platformProductId,
      stockQty: stock,
    }

    const result = await this.makeRequest(`${this.config.baseUrl}/api/v1/products/${platformProductId}/stock`, {
      method: 'PUT',
      headers: this.buildHeaders(requestData),
      body: JSON.stringify(requestData),
    })

    return { success: result.success, error: result.error }
  }

  async updatePrice(platformProductId: string, price: number): Promise<SyncResult<void>> {
    const requestData = {
      productId: platformProductId,
      salePrice: price,
    }

    const result = await this.makeRequest(`${this.config.baseUrl}/api/v1/products/${platformProductId}/price`, {
      method: 'PUT',
      headers: this.buildHeaders(requestData),
      body: JSON.stringify(requestData),
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
    const requestData: Record<string, unknown> = {
      page: options?.page || 1,
      pageSize: options?.limit || 50,
    }

    if (options?.status) {
      requestData.orderStatus = this.mapStatusToMomo(options.status)
    }
    if (options?.startDate) {
      requestData.startTime = options.startDate.toISOString()
    }
    if (options?.endDate) {
      requestData.endTime = options.endDate.toISOString()
    }

    const result = await this.makeRequest<{
      data: {
        orders: MomoOrderResponse[]
        total: number
      }
    }>(`${this.config.baseUrl}/api/v1/orders`, {
      method: 'POST',
      headers: this.buildHeaders(requestData),
      body: JSON.stringify(requestData),
    })

    if (!result.success || !result.data) {
      return { success: false, error: result.error }
    }

    const orders: PlatformOrder[] = result.data.data.orders.map((order) => ({
      id: order.orderId,
      orderNumber: order.orderNo,
      status: this.mapOrderStatus(order.orderStatus),
      customerName: order.buyerName,
      customerPhone: order.buyerPhone,
      customerEmail: order.buyerEmail,
      shippingAddress: {
        address: order.shippingAddress,
        city: order.shippingCity,
        postalCode: order.shippingZip,
        country: 'TW',
      },
      items: order.items.map((item) => ({
        sku: item.productCode,
        name: item.productName,
        quantity: item.qty,
        price: item.unitPrice,
      })),
      subtotal: order.totalAmount - order.shippingFee + order.discountAmount,
      shippingFee: order.shippingFee,
      discount: order.discountAmount,
      total: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus === 1 ? 'paid' : 'pending',
      createdAt: order.createTime,
      platformData: { momo: order },
    }))

    return { success: true, data: orders }
  }

  async getOrder(platformOrderId: string): Promise<SyncResult<PlatformOrder>> {
    const requestData = { orderId: platformOrderId }

    const result = await this.makeRequest<{
      data: MomoOrderResponse
    }>(`${this.config.baseUrl}/api/v1/orders/${platformOrderId}`, {
      method: 'GET',
      headers: this.buildHeaders(requestData),
    })

    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Order not found' }
    }

    const order = result.data.data
    return {
      success: true,
      data: {
        id: order.orderId,
        orderNumber: order.orderNo,
        status: this.mapOrderStatus(order.orderStatus),
        customerName: order.buyerName,
        customerPhone: order.buyerPhone,
        customerEmail: order.buyerEmail,
        shippingAddress: {
          address: order.shippingAddress,
          city: order.shippingCity,
          postalCode: order.shippingZip,
          country: 'TW',
        },
        items: order.items.map((item) => ({
          sku: item.productCode,
          name: item.productName,
          quantity: item.qty,
          price: item.unitPrice,
        })),
        subtotal: order.totalAmount - order.shippingFee + order.discountAmount,
        shippingFee: order.shippingFee,
        discount: order.discountAmount,
        total: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus === 1 ? 'paid' : 'pending',
        createdAt: order.createTime,
        platformData: { momo: order },
      },
    }
  }

  async updateOrderStatus(platformOrderId: string, status: string): Promise<SyncResult<void>> {
    const requestData = {
      orderId: platformOrderId,
      orderStatus: this.mapStatusToMomo(status),
    }

    const result = await this.makeRequest(`${this.config.baseUrl}/api/v1/orders/${platformOrderId}/status`, {
      method: 'PUT',
      headers: this.buildHeaders(requestData),
      body: JSON.stringify(requestData),
    })

    return { success: result.success, error: result.error }
  }

  async updateShipping(
    platformOrderId: string,
    trackingNumber: string,
    shippingProvider?: string
  ): Promise<SyncResult<void>> {
    const requestData = {
      orderId: platformOrderId,
      trackingNo: trackingNumber,
      shippingCarrier: shippingProvider || 'OTHER',
    }

    const result = await this.makeRequest(`${this.config.baseUrl}/api/v1/orders/${platformOrderId}/shipping`, {
      method: 'PUT',
      headers: this.buildHeaders(requestData),
      body: JSON.stringify(requestData),
    })

    return { success: result.success, error: result.error }
  }

  async testConnection(): Promise<SyncResult<boolean>> {
    const requestData = {}

    const result = await this.makeRequest<{
      data: {
        merchantName: string
      }
    }>(`${this.config.baseUrl}/api/v1/merchant/info`, {
      method: 'GET',
      headers: this.buildHeaders(requestData),
    })

    return {
      success: result.success,
      data: result.success,
      error: result.error,
    }
  }

  private mapOrderStatus(momoStatus: number): string {
    const statusMap: Record<number, string> = {
      0: 'pending',
      1: 'confirmed',
      2: 'processing',
      3: 'shipped',
      4: 'delivered',
      5: 'cancelled',
      6: 'refunded',
    }
    return statusMap[momoStatus] || 'pending'
  }

  private mapStatusToMomo(status: string): number {
    const statusMap: Record<string, number> = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
      cancelled: 5,
      refunded: 6,
    }
    return statusMap[status] || 0
  }
}

export function createMomoClient(config: MomoConfig): MomoClient {
  return new MomoClient(config)
}
