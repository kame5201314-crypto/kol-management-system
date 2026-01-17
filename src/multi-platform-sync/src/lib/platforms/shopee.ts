/**
 * Shopee Platform API Client
 * Taiwan Shopee Partner API Integration
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

interface ShopeeConfig extends PlatformConfig {
  partnerId: string
  partnerKey: string
  shopId: string
}

interface ShopeeProductResponse {
  item_id: number
  item_sku: string
  item_name: string
  description: string
  price_info: {
    current_price: number
    original_price: number
  }[]
  stock_info: {
    current_stock: number
    normal_stock: number
  }[]
  images: {
    image_url_list: string[]
  }
  item_status: string
  item_link?: string
}

interface ShopeeOrderResponse {
  order_sn: string
  order_status: string
  buyer_username: string
  recipient_address: {
    name: string
    phone: string
    full_address: string
    city: string
    state: string
    zipcode: string
  }
  item_list: Array<{
    item_id: number
    item_sku: string
    item_name: string
    model_quantity_purchased: number
    model_discounted_price: number
  }>
  total_amount: number
  shipping_carrier: string
  tracking_no: string
  payment_method: string
  create_time: number
}

export class ShopeeClient extends BasePlatformClient {
  private partnerId: string
  private partnerKey: string
  private shopId: string

  constructor(config: ShopeeConfig) {
    super({
      ...config,
      baseUrl: config.baseUrl || 'https://partner.shopeemobile.com',
    })
    this.partnerId = config.partnerId
    this.partnerKey = config.partnerKey
    this.shopId = config.shopId

    // Shopee rate limits
    this.rateLimiter = {
      maxRequests: 1000,
      windowMs: 60000,
      currentRequests: 0,
      windowStart: Date.now(),
    }
  }

  /**
   * Generate Shopee API signature
   */
  private generateSignature(path: string, timestamp: number): string {
    const baseString = `${this.partnerId}${path}${timestamp}${this.config.accessToken}${this.shopId}`
    return crypto.createHmac('sha256', this.partnerKey).update(baseString).digest('hex')
  }

  /**
   * Build authenticated URL
   */
  private buildUrl(path: string, params: Record<string, string> = {}): string {
    const timestamp = Math.floor(Date.now() / 1000)
    const sign = this.generateSignature(path, timestamp)

    const url = new URL(`${this.config.baseUrl}${path}`)
    url.searchParams.set('partner_id', this.partnerId)
    url.searchParams.set('timestamp', timestamp.toString())
    url.searchParams.set('access_token', this.config.accessToken || '')
    url.searchParams.set('shop_id', this.shopId)
    url.searchParams.set('sign', sign)

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })

    return url.toString()
  }

  async refreshToken(): Promise<SyncResult<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>> {
    const path = '/api/v2/auth/access_token/get'
    const timestamp = Math.floor(Date.now() / 1000)
    const baseString = `${this.partnerId}${path}${timestamp}`
    const sign = crypto.createHmac('sha256', this.partnerKey).update(baseString).digest('hex')

    const url = `${this.config.baseUrl}${path}?partner_id=${this.partnerId}&timestamp=${timestamp}&sign=${sign}`

    const result = await this.makeRequest<{
      access_token: string
      refresh_token: string
      expire_in: number
    }>(url, {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: this.config.refreshToken,
        partner_id: parseInt(this.partnerId),
        shop_id: parseInt(this.shopId),
      }),
    })

    if (result.success && result.data) {
      return {
        success: true,
        data: {
          accessToken: result.data.access_token,
          refreshToken: result.data.refresh_token,
          expiresAt: new Date(Date.now() + result.data.expire_in * 1000),
        },
      }
    }

    return { success: false, error: result.error }
  }

  async getProducts(options?: { page?: number; limit?: number }): Promise<SyncResult<PlatformProduct[]>> {
    const offset = ((options?.page || 1) - 1) * (options?.limit || 50)
    const url = this.buildUrl('/api/v2/product/get_item_list', {
      offset: offset.toString(),
      page_size: (options?.limit || 50).toString(),
      item_status: 'NORMAL',
    })

    const result = await this.makeRequest<{
      response: {
        item: Array<{ item_id: number }>
      }
    }>(url)

    if (!result.success || !result.data) {
      return { success: false, error: result.error }
    }

    // Get detailed info for each item
    const itemIds = result.data.response.item.map((i) => i.item_id)
    if (itemIds.length === 0) {
      return { success: true, data: [] }
    }

    const detailUrl = this.buildUrl('/api/v2/product/get_item_base_info', {
      item_id_list: itemIds.join(','),
    })

    const detailResult = await this.makeRequest<{
      response: {
        item_list: ShopeeProductResponse[]
      }
    }>(detailUrl)

    if (!detailResult.success || !detailResult.data) {
      return { success: false, error: detailResult.error }
    }

    const products: PlatformProduct[] = detailResult.data.response.item_list.map((item) => ({
      id: item.item_id.toString(),
      name: item.item_name,
      sku: item.item_sku || `SHOPEE-${item.item_id}`,
      description: item.description,
      price: item.price_info?.[0]?.current_price || 0,
      stock: item.stock_info?.[0]?.current_stock || 0,
      images: item.images?.image_url_list || [],
      status: item.item_status === 'NORMAL' ? 'active' : 'inactive',
      url: item.item_link,
      platformData: { shopee: item },
    }))

    return { success: true, data: products }
  }

  async getProduct(platformProductId: string): Promise<SyncResult<PlatformProduct>> {
    const url = this.buildUrl('/api/v2/product/get_item_base_info', {
      item_id_list: platformProductId,
    })

    const result = await this.makeRequest<{
      response: {
        item_list: ShopeeProductResponse[]
      }
    }>(url)

    if (!result.success || !result.data?.response?.item_list?.[0]) {
      return { success: false, error: result.error || 'Product not found' }
    }

    const item = result.data.response.item_list[0]
    return {
      success: true,
      data: {
        id: item.item_id.toString(),
        name: item.item_name,
        sku: item.item_sku || `SHOPEE-${item.item_id}`,
        description: item.description,
        price: item.price_info?.[0]?.current_price || 0,
        stock: item.stock_info?.[0]?.current_stock || 0,
        images: item.images?.image_url_list || [],
        status: item.item_status === 'NORMAL' ? 'active' : 'inactive',
        url: item.item_link,
        platformData: { shopee: item },
      },
    }
  }

  async createProduct(product: Product): Promise<SyncResult<PlatformProduct>> {
    const url = this.buildUrl('/api/v2/product/add_item')

    const result = await this.makeRequest<{
      response: {
        item_id: number
      }
    }>(url, {
      method: 'POST',
      body: JSON.stringify({
        item_name: product.name,
        description: product.description,
        item_sku: product.sku,
        original_price: product.base_price,
        normal_stock: 0,
        weight: product.weight || 0.1,
        image: {
          image_id_list: [], // Would need to upload images first
        },
        category_id: 0, // Would need category mapping
        brand: {
          brand_id: 0,
          original_brand_name: product.brand || '',
        },
      }),
    })

    if (!result.success || !result.data) {
      return { success: false, error: result.error }
    }

    // Fetch the created product details
    return this.getProduct(result.data.response.item_id.toString())
  }

  async updateProduct(platformProductId: string, product: Partial<Product>): Promise<SyncResult<PlatformProduct>> {
    const url = this.buildUrl('/api/v2/product/update_item')

    const updateData: Record<string, unknown> = {
      item_id: parseInt(platformProductId),
    }

    if (product.name) updateData.item_name = product.name
    if (product.description) updateData.description = product.description
    if (product.sku) updateData.item_sku = product.sku

    const result = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(updateData),
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return this.getProduct(platformProductId)
  }

  async deleteProduct(platformProductId: string): Promise<SyncResult<void>> {
    const url = this.buildUrl('/api/v2/product/delete_item')

    const result = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        item_id: parseInt(platformProductId),
      }),
    })

    return { success: result.success, error: result.error }
  }

  async updateStock(platformProductId: string, stock: number): Promise<SyncResult<void>> {
    const url = this.buildUrl('/api/v2/product/update_stock')

    const result = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        item_id: parseInt(platformProductId),
        stock_list: [
          {
            model_id: 0,
            normal_stock: stock,
          },
        ],
      }),
    })

    return { success: result.success, error: result.error }
  }

  async updatePrice(platformProductId: string, price: number): Promise<SyncResult<void>> {
    const url = this.buildUrl('/api/v2/product/update_price')

    const result = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        item_id: parseInt(platformProductId),
        price_list: [
          {
            model_id: 0,
            original_price: price,
          },
        ],
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
    const params: Record<string, string> = {
      time_range_field: 'create_time',
      time_from: Math.floor((options?.startDate?.getTime() || Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000).toString(),
      time_to: Math.floor((options?.endDate?.getTime() || Date.now()) / 1000).toString(),
      page_size: (options?.limit || 50).toString(),
    }

    if (options?.status) {
      params.order_status = options.status.toUpperCase()
    }

    const url = this.buildUrl('/api/v2/order/get_order_list', params)

    const result = await this.makeRequest<{
      response: {
        order_list: Array<{ order_sn: string }>
      }
    }>(url)

    if (!result.success || !result.data) {
      return { success: false, error: result.error }
    }

    const orderSns = result.data.response.order_list.map((o) => o.order_sn)
    if (orderSns.length === 0) {
      return { success: true, data: [] }
    }

    // Get detailed order info
    const detailUrl = this.buildUrl('/api/v2/order/get_order_detail', {
      order_sn_list: orderSns.join(','),
      response_optional_fields: 'buyer_username,recipient_address,item_list,payment_method',
    })

    const detailResult = await this.makeRequest<{
      response: {
        order_list: ShopeeOrderResponse[]
      }
    }>(detailUrl)

    if (!detailResult.success || !detailResult.data) {
      return { success: false, error: detailResult.error }
    }

    const orders: PlatformOrder[] = detailResult.data.response.order_list.map((order) => ({
      id: order.order_sn,
      orderNumber: order.order_sn,
      status: this.mapOrderStatus(order.order_status),
      customerName: order.recipient_address?.name || order.buyer_username,
      customerPhone: order.recipient_address?.phone,
      shippingAddress: {
        address: order.recipient_address?.full_address || '',
        city: order.recipient_address?.city,
        state: order.recipient_address?.state,
        postalCode: order.recipient_address?.zipcode,
        country: 'TW',
      },
      items: order.item_list?.map((item) => ({
        sku: item.item_sku || `SHOPEE-${item.item_id}`,
        name: item.item_name,
        quantity: item.model_quantity_purchased,
        price: item.model_discounted_price,
      })) || [],
      subtotal: order.total_amount,
      shippingFee: 0,
      discount: 0,
      total: order.total_amount,
      paymentMethod: order.payment_method,
      paymentStatus: 'paid',
      createdAt: new Date(order.create_time * 1000).toISOString(),
      platformData: { shopee: order },
    }))

    return { success: true, data: orders }
  }

  async getOrder(platformOrderId: string): Promise<SyncResult<PlatformOrder>> {
    const url = this.buildUrl('/api/v2/order/get_order_detail', {
      order_sn_list: platformOrderId,
      response_optional_fields: 'buyer_username,recipient_address,item_list,payment_method',
    })

    const result = await this.makeRequest<{
      response: {
        order_list: ShopeeOrderResponse[]
      }
    }>(url)

    if (!result.success || !result.data?.response?.order_list?.[0]) {
      return { success: false, error: result.error || 'Order not found' }
    }

    const order = result.data.response.order_list[0]
    return {
      success: true,
      data: {
        id: order.order_sn,
        orderNumber: order.order_sn,
        status: this.mapOrderStatus(order.order_status),
        customerName: order.recipient_address?.name || order.buyer_username,
        customerPhone: order.recipient_address?.phone,
        shippingAddress: {
          address: order.recipient_address?.full_address || '',
          city: order.recipient_address?.city,
          state: order.recipient_address?.state,
          postalCode: order.recipient_address?.zipcode,
          country: 'TW',
        },
        items: order.item_list?.map((item) => ({
          sku: item.item_sku || `SHOPEE-${item.item_id}`,
          name: item.item_name,
          quantity: item.model_quantity_purchased,
          price: item.model_discounted_price,
        })) || [],
        subtotal: order.total_amount,
        shippingFee: 0,
        discount: 0,
        total: order.total_amount,
        paymentMethod: order.payment_method,
        paymentStatus: 'paid',
        createdAt: new Date(order.create_time * 1000).toISOString(),
        platformData: { shopee: order },
      },
    }
  }

  async updateOrderStatus(platformOrderId: string, status: string): Promise<SyncResult<void>> {
    // Shopee doesn't allow direct status updates - status changes through shipping
    return {
      success: false,
      error: 'Shopee order status is updated automatically based on shipping status',
    }
  }

  async updateShipping(
    platformOrderId: string,
    trackingNumber: string,
    shippingProvider?: string
  ): Promise<SyncResult<void>> {
    const url = this.buildUrl('/api/v2/logistics/ship_order')

    const result = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        order_sn: platformOrderId,
        tracking_number: trackingNumber,
      }),
    })

    return { success: result.success, error: result.error }
  }

  async testConnection(): Promise<SyncResult<boolean>> {
    const url = this.buildUrl('/api/v2/shop/get_shop_info')

    const result = await this.makeRequest<{
      response: {
        shop_name: string
      }
    }>(url)

    return {
      success: result.success,
      data: result.success,
      error: result.error,
    }
  }

  private mapOrderStatus(shopeeStatus: string): string {
    const statusMap: Record<string, string> = {
      UNPAID: 'pending',
      READY_TO_SHIP: 'confirmed',
      PROCESSED: 'processing',
      SHIPPED: 'shipped',
      COMPLETED: 'delivered',
      CANCELLED: 'cancelled',
      IN_CANCEL: 'cancelled',
      TO_RETURN: 'refunded',
    }
    return statusMap[shopeeStatus] || 'pending'
  }
}

export function createShopeeClient(config: ShopeeConfig): ShopeeClient {
  return new ShopeeClient(config)
}
