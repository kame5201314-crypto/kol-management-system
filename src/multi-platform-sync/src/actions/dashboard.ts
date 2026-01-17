'use server'

/**
 * Dashboard Server Actions
 * Handles all dashboard statistics and reporting
 */

import {
  getProducts,
  getOrders,
  getInventory,
  getPlatformConnections,
  getSyncJobs,
} from '@/lib/supabase/database'
import type { PlatformType } from '@/types/database'

// Default org for development
const DEFAULT_ORG_ID = 'default'

// Response types
interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

// Dashboard statistics interfaces
interface OverviewStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  monthlyRevenue: number
  connectedPlatforms: number
  lowStockItems: number
}

interface PlatformStats {
  platform: PlatformType
  name: string
  orders: number
  revenue: number
  products: number
  isConnected: boolean
  lastSyncAt: string | null
}

interface RecentActivity {
  id: string
  type: 'order' | 'sync' | 'inventory' | 'product'
  title: string
  description: string
  timestamp: string
  platform?: PlatformType
  status?: string
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }[]
}

function isUsingMockData(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo')
}

/**
 * Get dashboard overview statistics
 */
export async function fetchDashboardStats(): Promise<ActionResponse<OverviewStats>> {
  try {
    if (isUsingMockData()) {
      return {
        success: true,
        data: {
          totalProducts: 156,
          activeProducts: 142,
          totalOrders: 1248,
          pendingOrders: 23,
          totalRevenue: 2456780,
          monthlyRevenue: 358920,
          connectedPlatforms: 3,
          lowStockItems: 8,
        },
      }
    }

    // Fetch all necessary data
    const [
      { data: products },
      { data: orders },
      { data: inventory },
      { data: platforms },
    ] = await Promise.all([
      getProducts(DEFAULT_ORG_ID),
      getOrders(DEFAULT_ORG_ID, {}),
      getInventory(DEFAULT_ORG_ID),
      getPlatformConnections(DEFAULT_ORG_ID),
    ])

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyOrders = (orders || []).filter(
      (o) => new Date(o.created_at) >= monthStart
    )

    const stats: OverviewStats = {
      totalProducts: products?.length || 0,
      activeProducts: products?.filter((p) => p.is_active).length || 0,
      totalOrders: orders?.length || 0,
      pendingOrders: orders?.filter((o) => o.status === 'pending').length || 0,
      totalRevenue: orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0,
      monthlyRevenue: monthlyOrders.reduce((sum, o) => sum + o.total_amount, 0),
      connectedPlatforms: platforms?.filter((p) => p.is_connected).length || 0,
      lowStockItems: inventory?.filter(
        (i) => i.available_stock <= i.low_stock_threshold
      ).length || 0,
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    }
  }
}

/**
 * Get statistics per platform
 */
export async function fetchPlatformStats(): Promise<ActionResponse<PlatformStats[]>> {
  try {
    if (isUsingMockData()) {
      return {
        success: true,
        data: [
          {
            platform: 'shopee',
            name: 'Shopee',
            orders: 523,
            revenue: 1256890,
            products: 142,
            isConnected: true,
            lastSyncAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            platform: 'momo',
            name: 'Momo',
            orders: 412,
            revenue: 856420,
            products: 98,
            isConnected: true,
            lastSyncAt: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            platform: 'shopline',
            name: 'Shopline',
            orders: 313,
            revenue: 343470,
            products: 76,
            isConnected: false,
            lastSyncAt: null,
          },
        ],
      }
    }

    const [{ data: orders }, { data: platforms }] = await Promise.all([
      getOrders(DEFAULT_ORG_ID, {}),
      getPlatformConnections(DEFAULT_ORG_ID),
    ])

    const platformNames: Record<PlatformType, string> = {
      shopee: 'Shopee',
      momo: 'Momo',
      shopline: 'Shopline',
      ruten: 'Ruten',
      pchome: 'PChome',
      yahoo: 'Yahoo',
    }

    const stats: PlatformStats[] = (platforms || []).map((platform) => {
      const platformOrders = (orders || []).filter(
        (o) => o.platform === platform.platform
      )

      return {
        platform: platform.platform,
        name: platformNames[platform.platform] || platform.platform,
        orders: platformOrders.length,
        revenue: platformOrders.reduce((sum, o) => sum + o.total_amount, 0),
        products: 0, // Would need to count listings per platform
        isConnected: platform.is_connected,
        lastSyncAt: platform.last_sync_at,
      }
    })

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching platform stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch platform stats',
    }
  }
}

/**
 * Get recent activity feed
 */
export async function fetchRecentActivity(
  limit: number = 10
): Promise<ActionResponse<RecentActivity[]>> {
  try {
    if (isUsingMockData()) {
      return {
        success: true,
        data: [
          {
            id: '1',
            type: 'order',
            title: 'New Order Received',
            description: 'Order ORD-2024-001 from Shopee',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            platform: 'shopee',
            status: 'pending',
          },
          {
            id: '2',
            type: 'sync',
            title: 'Inventory Sync Completed',
            description: 'Synced 45 items to Momo',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            platform: 'momo',
            status: 'success',
          },
          {
            id: '3',
            type: 'inventory',
            title: 'Low Stock Alert',
            description: 'SKU-003 is running low (5 units left)',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'warning',
          },
          {
            id: '4',
            type: 'order',
            title: 'Order Shipped',
            description: 'Order ORD-2024-002 shipped to customer',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            platform: 'momo',
            status: 'shipped',
          },
          {
            id: '5',
            type: 'product',
            title: 'Product Listed',
            description: 'Smart Watch Pro listed on Shopee',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            platform: 'shopee',
            status: 'success',
          },
        ],
      }
    }

    // Fetch recent orders and sync jobs
    const [{ data: orders }, { data: syncJobs }] = await Promise.all([
      getOrders(DEFAULT_ORG_ID, {}),
      getSyncJobs(DEFAULT_ORG_ID),
    ])

    const activities: RecentActivity[] = []

    // Add recent orders
    const recentOrders = (orders || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit / 2)

    for (const order of recentOrders) {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        title: order.status === 'pending' ? 'New Order Received' : `Order ${order.status}`,
        description: `Order ${order.order_number} from ${order.platform}`,
        timestamp: order.created_at,
        platform: order.platform,
        status: order.status,
      })
    }

    // Add recent sync jobs
    const recentSyncs = (syncJobs || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit / 2)

    for (const job of recentSyncs) {
      activities.push({
        id: `sync-${job.id}`,
        type: 'sync',
        title: `${job.job_type.replace('_', ' ')} ${job.status}`,
        description: `Processed ${job.processed_items} items`,
        timestamp: job.created_at,
        status: job.status,
      })
    }

    // Sort by timestamp
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return { success: true, data: activities.slice(0, limit) }
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch activity',
    }
  }
}

/**
 * Get sales chart data
 */
export async function fetchSalesChartData(
  period: '7d' | '30d' | '90d'
): Promise<ActionResponse<ChartData>> {
  try {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90

    if (isUsingMockData()) {
      const labels: string[] = []
      const data: number[] = []
      const orderCounts: number[] = []

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        labels.push(date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }))
        data.push(Math.floor(Math.random() * 50000) + 10000)
        orderCounts.push(Math.floor(Math.random() * 30) + 5)
      }

      return {
        success: true,
        data: {
          labels,
          datasets: [
            {
              label: 'Revenue (TWD)',
              data,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            },
            {
              label: 'Orders',
              data: orderCounts,
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
            },
          ],
        },
      }
    }

    const { data: orders } = await getOrders(DEFAULT_ORG_ID, {})
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const filteredOrders = (orders || []).filter(
      (o) => new Date(o.created_at) >= startDate
    )

    // Group by date
    const dailyData: Record<string, { revenue: number; orders: number }> = {}

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      dailyData[dateKey] = { revenue: 0, orders: 0 }
    }

    for (const order of filteredOrders) {
      const dateKey = order.created_at.split('T')[0]
      if (dailyData[dateKey]) {
        dailyData[dateKey].revenue += order.total_amount
        dailyData[dateKey].orders += 1
      }
    }

    const labels = Object.keys(dailyData).map((date) =>
      new Date(date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
    )
    const revenueData = Object.values(dailyData).map((d) => d.revenue)
    const orderData = Object.values(dailyData).map((d) => d.orders)

    return {
      success: true,
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue (TWD)',
            data: revenueData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          },
          {
            label: 'Orders',
            data: orderData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
          },
        ],
      },
    }
  } catch (error) {
    console.error('Error fetching sales chart data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch chart data',
    }
  }
}

/**
 * Get platform distribution chart data
 */
export async function fetchPlatformDistribution(): Promise<ActionResponse<ChartData>> {
  try {
    if (isUsingMockData()) {
      return {
        success: true,
        data: {
          labels: ['Shopee', 'Momo', 'Shopline'],
          datasets: [
            {
              label: 'Orders by Platform',
              data: [523, 412, 313],
              backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
              ],
            },
          ],
        },
      }
    }

    const { data: orders } = await getOrders(DEFAULT_ORG_ID, {})

    const platformCounts: Record<string, number> = {}
    const platformNames: Record<string, string> = {
      shopee: 'Shopee',
      momo: 'Momo',
      shopline: 'Shopline',
      ruten: 'Ruten',
      pchome: 'PChome',
      yahoo: 'Yahoo',
    }

    for (const order of orders || []) {
      platformCounts[order.platform] = (platformCounts[order.platform] || 0) + 1
    }

    const labels = Object.keys(platformCounts).map(
      (p) => platformNames[p] || p
    )
    const data = Object.values(platformCounts)

    const colors = [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)',
      'rgb(75, 192, 192)',
      'rgb(153, 102, 255)',
      'rgb(255, 159, 64)',
    ]

    return {
      success: true,
      data: {
        labels,
        datasets: [
          {
            label: 'Orders by Platform',
            data,
            backgroundColor: colors.slice(0, labels.length),
          },
        ],
      },
    }
  } catch (error) {
    console.error('Error fetching platform distribution:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch distribution',
    }
  }
}

/**
 * Get top selling products
 */
export async function fetchTopProducts(
  limit: number = 5
): Promise<ActionResponse<{ name: string; sku: string; sold: number; revenue: number }[]>> {
  try {
    if (isUsingMockData()) {
      return {
        success: true,
        data: [
          { name: 'Premium Wireless Earbuds', sku: 'SKU-001', sold: 156, revenue: 466440 },
          { name: 'Smart Watch Pro', sku: 'SKU-002', sold: 98, revenue: 448840 },
          { name: 'Portable Charger 20000mAh', sku: 'SKU-003', sold: 234, revenue: 208260 },
          { name: 'USB-C Cable 2m', sku: 'SKU-004', sold: 512, revenue: 127488 },
          { name: 'Phone Stand', sku: 'SKU-005', sold: 187, revenue: 55913 },
        ],
      }
    }

    // In production, this would aggregate order items
    // For now, return empty since we need order items table
    return { success: true, data: [] }
  } catch (error) {
    console.error('Error fetching top products:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch top products',
    }
  }
}
