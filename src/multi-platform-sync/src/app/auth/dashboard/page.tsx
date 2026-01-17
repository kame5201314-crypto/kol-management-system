'use client'

import { useEffect, useState, useTransition } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Package,
  ShoppingCart,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { PLATFORMS } from '@/config/constants'
import {
  fetchDashboardStats,
  fetchPlatformStats,
  fetchRecentActivity,
} from '@/actions/dashboard'
import { fetchLowStockItems } from '@/actions/inventory'
import { fetchOrders } from '@/actions/orders'
import { triggerPlatformSync } from '@/actions/platforms'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface DashboardData {
  stats: {
    totalProducts: number
    activeProducts: number
    totalOrders: number
    pendingOrders: number
    totalRevenue: number
    monthlyRevenue: number
    connectedPlatforms: number
    lowStockItems: number
  } | null
  platformStats: Array<{
    platform: string
    name: string
    orders: number
    revenue: number
    products: number
    isConnected: boolean
    lastSyncAt: string | null
  }>
  recentOrders: Array<{
    id: string
    platform: string
    order_number: string
    total_amount: number
    status: string
  }>
  lowStockItems: Array<{
    id: string
    sku: string
    product_name?: string
    available_stock: number
    low_stock_threshold: number
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    platformStats: [],
    recentOrders: [],
    lowStockItems: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setIsLoading(true)
    try {
      const [statsResult, platformResult, ordersResult, lowStockResult] = await Promise.all([
        fetchDashboardStats(),
        fetchPlatformStats(),
        fetchOrders({ limit: 4 }),
        fetchLowStockItems(),
      ])

      setData({
        stats: statsResult.data || null,
        platformStats: platformResult.data || [],
        recentOrders: (ordersResult.data?.orders || []).slice(0, 4).map((o) => ({
          id: o.id,
          platform: o.platform,
          order_number: o.order_number,
          total_amount: o.total_amount,
          status: o.status,
        })),
        lowStockItems: (lowStockResult.data || []).slice(0, 3).map((i) => ({
          id: i.id,
          sku: i.sku,
          product_name: i.product_name,
          available_stock: i.available_stock,
          low_stock_threshold: i.low_stock_threshold,
        })),
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleSync() {
    startTransition(async () => {
      const result = await triggerPlatformSync('all', 'full')
      if (result.success) {
        toast({
          title: 'Sync Started',
          description: 'Full sync has been initiated',
        })
        // Reload data after sync
        setTimeout(() => loadDashboardData(), 2000)
      } else {
        toast({
          title: 'Sync Failed',
          description: result.error || 'Failed to start sync',
          variant: 'destructive',
        })
      }
    })
  }

  const syncProgress = data.stats
    ? Math.round((data.stats.connectedPlatforms / 3) * 100)
    : 0

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <DashboardHeader
          title="Dashboard"
          description="View your e-commerce data overview"
        />
        <div className="flex-1 space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Dashboard"
        description="View your e-commerce data overview"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(data.stats?.totalProducts || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(data.stats?.activeProducts || 0)} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats?.pendingOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                {data.stats?.totalOrders || 0} total orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data.stats?.monthlyRevenue || 0)}
              </div>
              <p className="text-xs text-green-500">
                Total: {formatCurrency(data.stats?.totalRevenue || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.stats?.connectedPlatforms || 0}/3
              </div>
              <Progress value={syncProgress} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Platform Stats & Sync Status */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Platform Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Sales data by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.platformStats.map((item) => {
                  const platform = PLATFORMS[item.platform as keyof typeof PLATFORMS]
                  if (!platform) return null
                  return (
                    <div key={item.platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: platform.color }}
                        >
                          <span className="text-white text-xs font-bold">
                            {platform.displayName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{platform.displayName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.products} products · {item.orders} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.revenue)}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.isConnected ? (
                            item.lastSyncAt ? (
                              `Last sync: ${new Date(item.lastSyncAt).toLocaleTimeString()}`
                            ) : (
                              'Never synced'
                            )
                          ) : (
                            <span className="text-yellow-500">Not connected</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle>Sync Status</CardTitle>
              <CardDescription>Product listing sync status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Connected Platforms</span>
                  </div>
                  <span className="font-medium">{data.stats?.connectedPlatforms || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span>Active Products</span>
                  </div>
                  <span className="font-medium">{data.stats?.activeProducts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Low Stock Items</span>
                  </div>
                  <span className="font-medium">{data.stats?.lowStockItems || 0}</span>
                </div>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={handleSync}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {isPending ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders & Low Stock Alerts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest received orders</CardDescription>
              </div>
              <Link href="/auth/orders">
                <Button variant="ghost" size="sm">
                  View All <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No orders yet
                  </p>
                ) : (
                  data.recentOrders.map((order) => {
                    const platform = PLATFORMS[order.platform as keyof typeof PLATFORMS]
                    return (
                      <div key={order.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded flex items-center justify-center"
                            style={{ backgroundColor: platform?.color || '#gray' }}
                          >
                            <span className="text-white text-xs font-bold">
                              {platform?.displayName?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {platform?.displayName || order.platform}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                          <Badge
                            variant={
                              order.status === 'pending'
                                ? 'warning'
                                : order.status === 'confirmed'
                                ? 'info'
                                : order.status === 'shipped'
                                ? 'default'
                                : 'success'
                            }
                          >
                            {order.status === 'pending'
                              ? 'Pending'
                              : order.status === 'confirmed'
                              ? 'Confirmed'
                              : order.status === 'shipped'
                              ? 'Shipped'
                              : order.status === 'delivered'
                              ? 'Delivered'
                              : order.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Products below safety threshold</CardDescription>
              </div>
              <Link href="/auth/inventory">
                <Button variant="ghost" size="sm">
                  View All <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.lowStockItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No low stock items
                  </p>
                ) : (
                  data.lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.product_name || 'Unknown Product'}</p>
                        <p className="text-sm text-muted-foreground">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">
                          {item.available_stock} left
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Threshold: {item.low_stock_threshold}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
