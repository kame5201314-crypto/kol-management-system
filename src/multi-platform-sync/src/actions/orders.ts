'use server'

/**
 * Order Management Server Actions
 * Handles all order-related operations
 */

import { revalidatePath } from 'next/cache'
import {
  getOrders,
  getOrderById,
  updateOrder,
  getOrderItems,
} from '@/lib/supabase/database'
import { createSyncService } from '@/lib/sync/sync-service'
import type { Order, OrderItem, PlatformType } from '@/types/database'

// Default org/user for development
const DEFAULT_ORG_ID = 'default'
const DEFAULT_USER_ID = 'system'

// Response types
interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

interface OrderWithItems extends Order {
  items?: OrderItem[]
}

// Mock order data
const mockOrders: OrderWithItems[] = [
  {
    id: '1',
    org_id: DEFAULT_ORG_ID,
    platform_connection_id: '1',
    platform: 'shopee',
    platform_order_id: 'SP-12345678',
    order_number: 'ORD-2024-001',
    status: 'pending',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '0912345678',
    shipping_address: {
      recipient: 'John Doe',
      address: '123 Main Street',
      city: 'Taipei',
      state: 'Taipei City',
      postal_code: '100',
      country: 'TW',
      phone: '0912345678',
    },
    subtotal: 2990,
    shipping_fee: 60,
    discount: 100,
    total_amount: 2950,
    currency: 'TWD',
    payment_method: 'credit_card',
    payment_status: 'paid',
    shipped_at: null,
    delivered_at: null,
    notes: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    created_by: null,
    updated_by: null,
    is_deleted: false,
    deleted_at: null,
    metadata: {},
    version: 1,
    items: [
      {
        id: '1',
        org_id: DEFAULT_ORG_ID,
        order_id: '1',
        product_id: '1',
        product_listing_id: '1',
        sku: 'SKU-001',
        name: 'Premium Wireless Earbuds',
        variant_name: 'Black',
        quantity: 1,
        unit_price: 2990,
        subtotal: 2990,
        platform_item_id: 'SP-ITEM-001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        updated_by: null,
        is_deleted: false,
        deleted_at: null,
        metadata: {},
        version: 1,
      },
    ],
  },
  {
    id: '2',
    org_id: DEFAULT_ORG_ID,
    platform_connection_id: '2',
    platform: 'momo',
    platform_order_id: 'MM-87654321',
    order_number: 'ORD-2024-002',
    status: 'shipped',
    customer_name: 'Jane Smith',
    customer_email: 'jane@example.com',
    customer_phone: '0923456789',
    shipping_address: {
      recipient: 'Jane Smith',
      address: '456 Oak Avenue',
      city: 'Taichung',
      state: 'Taichung City',
      postal_code: '400',
      country: 'TW',
      phone: '0923456789',
    },
    subtotal: 4580,
    shipping_fee: 0,
    discount: 200,
    total_amount: 4380,
    currency: 'TWD',
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    shipped_at: new Date(Date.now() - 86400000).toISOString(),
    delivered_at: null,
    notes: 'Please handle with care',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    created_by: null,
    updated_by: null,
    is_deleted: false,
    deleted_at: null,
    metadata: {},
    version: 1,
    items: [
      {
        id: '2',
        org_id: DEFAULT_ORG_ID,
        order_id: '2',
        product_id: '2',
        product_listing_id: '2',
        sku: 'SKU-002',
        name: 'Smart Watch Pro',
        variant_name: 'Silver',
        quantity: 1,
        unit_price: 4580,
        subtotal: 4580,
        platform_item_id: 'MM-ITEM-001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        updated_by: null,
        is_deleted: false,
        deleted_at: null,
        metadata: {},
        version: 1,
      },
    ],
  },
  {
    id: '3',
    org_id: DEFAULT_ORG_ID,
    platform_connection_id: '1',
    platform: 'shopee',
    platform_order_id: 'SP-11223344',
    order_number: 'ORD-2024-003',
    status: 'delivered',
    customer_name: 'Bob Wilson',
    customer_email: 'bob@example.com',
    customer_phone: '0934567890',
    shipping_address: {
      recipient: 'Bob Wilson',
      address: '789 Pine Road',
      city: 'Kaohsiung',
      state: 'Kaohsiung City',
      postal_code: '800',
      country: 'TW',
      phone: '0934567890',
    },
    subtotal: 890,
    shipping_fee: 60,
    discount: 0,
    total_amount: 950,
    currency: 'TWD',
    payment_method: 'cod',
    payment_status: 'paid',
    shipped_at: new Date(Date.now() - 259200000).toISOString(),
    delivered_at: new Date(Date.now() - 86400000).toISOString(),
    notes: null,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    created_by: null,
    updated_by: null,
    is_deleted: false,
    deleted_at: null,
    metadata: {},
    version: 1,
    items: [
      {
        id: '3',
        org_id: DEFAULT_ORG_ID,
        order_id: '3',
        product_id: '3',
        product_listing_id: '3',
        sku: 'SKU-003',
        name: 'Portable Charger 20000mAh',
        variant_name: null,
        quantity: 1,
        unit_price: 890,
        subtotal: 890,
        platform_item_id: 'SP-ITEM-002',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        updated_by: null,
        is_deleted: false,
        deleted_at: null,
        metadata: {},
        version: 1,
      },
    ],
  },
]

function isUsingMockData(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo')
}

/**
 * Get all orders with optional filters
 */
export async function fetchOrders(filters?: {
  platform?: PlatformType
  status?: Order['status']
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}): Promise<ActionResponse<{ orders: OrderWithItems[]; total: number }>> {
  try {
    if (isUsingMockData()) {
      let filtered = [...mockOrders]

      if (filters?.platform) {
        filtered = filtered.filter((o) => o.platform === filters.platform)
      }
      if (filters?.status) {
        filtered = filtered.filter((o) => o.status === filters.status)
      }
      if (filters?.startDate) {
        filtered = filtered.filter(
          (o) => new Date(o.created_at) >= new Date(filters.startDate!)
        )
      }
      if (filters?.endDate) {
        filtered = filtered.filter(
          (o) => new Date(o.created_at) <= new Date(filters.endDate!)
        )
      }

      const page = filters?.page || 1
      const limit = filters?.limit || 20
      const start = (page - 1) * limit
      const paginated = filtered.slice(start, start + limit)

      return {
        success: true,
        data: { orders: paginated, total: filtered.length },
      }
    }

    const { data, error } = await getOrders(DEFAULT_ORG_ID, {
      platform: filters?.platform,
      status: filters?.status,
    })
    if (error) throw new Error(error)

    return {
      success: true,
      data: { orders: data || [], total: data?.length || 0 },
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders',
    }
  }
}

/**
 * Get order by ID with items
 */
export async function fetchOrderById(id: string): Promise<ActionResponse<OrderWithItems>> {
  try {
    if (isUsingMockData()) {
      const order = mockOrders.find((o) => o.id === id)
      if (!order) throw new Error('Order not found')
      return { success: true, data: order }
    }

    const { data: order, error: orderError } = await getOrderById(DEFAULT_ORG_ID, id)
    if (orderError) throw new Error(orderError)
    if (!order) throw new Error('Order not found')

    const { data: items } = await getOrderItems(DEFAULT_ORG_ID, id)

    return { success: true, data: { ...order, items: items || [] } }
  } catch (error) {
    console.error('Error fetching order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order',
    }
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  trackingNumber?: string
): Promise<ActionResponse<Order>> {
  try {
    if (isUsingMockData()) {
      const index = mockOrders.findIndex((o) => o.id === orderId)
      if (index === -1) throw new Error('Order not found')

      const updates: Partial<Order> = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === 'shipped') {
        updates.shipped_at = new Date().toISOString()
        if (trackingNumber) {
          updates.metadata = { ...mockOrders[index].metadata, trackingNumber }
        }
      } else if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString()
      }

      mockOrders[index] = { ...mockOrders[index], ...updates }
      return { success: true, data: mockOrders[index] }
    }

    const updates: Partial<Order> = { status }

    if (status === 'shipped') {
      updates.shipped_at = new Date().toISOString()
      if (trackingNumber) {
        updates.metadata = { trackingNumber }
      }
    } else if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString()
    }

    const { data, error } = await updateOrder(
      DEFAULT_ORG_ID,
      orderId,
      updates,
      DEFAULT_USER_ID
    )

    if (error) throw new Error(error)
    if (!data) throw new Error('Failed to update order')

    revalidatePath('/auth/orders')
    return { success: true, data }
  } catch (error) {
    console.error('Error updating order status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order',
    }
  }
}

/**
 * Add note to order
 */
export async function addOrderNote(
  orderId: string,
  note: string
): Promise<ActionResponse<Order>> {
  try {
    if (isUsingMockData()) {
      const index = mockOrders.findIndex((o) => o.id === orderId)
      if (index === -1) throw new Error('Order not found')

      mockOrders[index] = {
        ...mockOrders[index],
        notes: note,
        updated_at: new Date().toISOString(),
      }
      return { success: true, data: mockOrders[index] }
    }

    const { data, error } = await updateOrder(
      DEFAULT_ORG_ID,
      orderId,
      { notes: note },
      DEFAULT_USER_ID
    )

    if (error) throw new Error(error)
    if (!data) throw new Error('Failed to add note')

    revalidatePath('/auth/orders')
    return { success: true, data }
  } catch (error) {
    console.error('Error adding order note:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add note',
    }
  }
}

/**
 * Sync orders from platforms
 */
export async function syncOrdersFromPlatforms(options?: {
  platform?: string
  startDate?: Date
  endDate?: Date
}): Promise<ActionResponse<{ jobId: string; ordersImported: number }>> {
  try {
    if (isUsingMockData()) {
      return {
        success: true,
        data: { jobId: `job-${Date.now()}`, ordersImported: 5 },
      }
    }

    const syncService = createSyncService(DEFAULT_ORG_ID, DEFAULT_USER_ID)
    const result = await syncService.syncOrders(options)

    revalidatePath('/auth/orders')
    return {
      success: true,
      data: { jobId: result.jobId, ordersImported: result.processedItems },
    }
  } catch (error) {
    console.error('Error syncing orders:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync orders',
    }
  }
}

/**
 * Get order statistics
 */
export async function fetchOrderStats(period: 'today' | 'week' | 'month'): Promise<
  ActionResponse<{
    totalOrders: number
    pendingOrders: number
    shippedOrders: number
    completedOrders: number
    totalRevenue: number
    averageOrderValue: number
  }>
> {
  try {
    let startDate: Date
    const now = new Date()

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
    }

    if (isUsingMockData()) {
      const filtered = mockOrders.filter(
        (o) => new Date(o.created_at) >= startDate
      )

      const stats = {
        totalOrders: filtered.length,
        pendingOrders: filtered.filter((o) => o.status === 'pending').length,
        shippedOrders: filtered.filter((o) => o.status === 'shipped').length,
        completedOrders: filtered.filter((o) => o.status === 'delivered').length,
        totalRevenue: filtered.reduce((sum, o) => sum + o.total_amount, 0),
        averageOrderValue: filtered.length
          ? filtered.reduce((sum, o) => sum + o.total_amount, 0) / filtered.length
          : 0,
      }

      return { success: true, data: stats }
    }

    const { data, error } = await getOrders(DEFAULT_ORG_ID, {})
    if (error) throw new Error(error)

    const orders = (data || []).filter(
      (o) => new Date(o.created_at) >= startDate
    )

    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      shippedOrders: orders.filter((o) => o.status === 'shipped').length,
      completedOrders: orders.filter((o) => o.status === 'delivered').length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
      averageOrderValue: orders.length
        ? orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length
        : 0,
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching order stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    }
  }
}

/**
 * Export orders to CSV
 */
export async function exportOrders(filters?: {
  platform?: PlatformType
  status?: Order['status']
  startDate?: string
  endDate?: string
}): Promise<ActionResponse<string>> {
  try {
    const { data } = await fetchOrders(filters)
    if (!data) throw new Error('No orders to export')

    const headers = [
      'Order Number',
      'Platform',
      'Status',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Total Amount',
      'Currency',
      'Payment Status',
      'Created At',
    ]

    const rows = data.orders.map((order) => [
      order.order_number,
      order.platform,
      order.status,
      order.customer_name,
      order.customer_email || '',
      order.customer_phone || '',
      order.total_amount.toString(),
      order.currency,
      order.payment_status,
      order.created_at,
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    return { success: true, data: csv }
  } catch (error) {
    console.error('Error exporting orders:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export orders',
    }
  }
}
