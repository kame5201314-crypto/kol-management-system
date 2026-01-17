'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  MoreHorizontal,
  Eye,
  Printer,
  Truck,
  RefreshCw,
  Download,
  Filter,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { PLATFORMS, ORDER_STATUSES } from '@/config/constants'
import type { OrderStatus } from '@/types'

interface OrderItem {
  id: string
  platform: keyof typeof PLATFORMS
  orderNumber: string
  platformOrderId: string
  customerName: string
  status: OrderStatus
  totalAmount: number
  itemCount: number
  createdAt: string
  shippedAt: string | null
}

// Mock data
const orders: OrderItem[] = [
  {
    id: '1',
    platform: 'shopee',
    orderNumber: 'ORD-2401170001',
    platformOrderId: 'SP2401170001234',
    customerName: '王小明',
    status: 'pending',
    totalAmount: 1299,
    itemCount: 2,
    createdAt: '2026-01-17T10:30:00Z',
    shippedAt: null,
  },
  {
    id: '2',
    platform: 'momo',
    orderNumber: 'ORD-2401170002',
    platformOrderId: 'MM2401170023456',
    customerName: '李小華',
    status: 'confirmed',
    totalAmount: 2580,
    itemCount: 1,
    createdAt: '2026-01-17T09:15:00Z',
    shippedAt: null,
  },
  {
    id: '3',
    platform: 'shopline',
    orderNumber: 'ORD-2401170003',
    platformOrderId: 'SL2401170012345',
    customerName: '張大偉',
    status: 'shipped',
    totalAmount: 899,
    itemCount: 1,
    createdAt: '2026-01-17T08:00:00Z',
    shippedAt: '2026-01-17T14:30:00Z',
  },
  {
    id: '4',
    platform: 'shopee',
    orderNumber: 'ORD-2401160001',
    platformOrderId: 'SP2401160007890',
    customerName: '陳美玲',
    status: 'delivered',
    totalAmount: 3299,
    itemCount: 3,
    createdAt: '2026-01-16T14:20:00Z',
    shippedAt: '2026-01-16T16:00:00Z',
  },
  {
    id: '5',
    platform: 'momo',
    orderNumber: 'ORD-2401150001',
    platformOrderId: 'MM2401150034567',
    customerName: '林志豪',
    status: 'cancelled',
    totalAmount: 599,
    itemCount: 1,
    createdAt: '2026-01-15T11:00:00Z',
    shippedAt: null,
  },
]

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.platformOrderId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPlatform = platformFilter === 'all' || order.platform === platformFilter

    return matchesSearch && matchesStatus && matchesPlatform
  })

  const stats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filteredOrders.map((o) => o.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId])
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
    }
  }

  const handleViewDetail = (order: OrderItem) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  const getStatusBadge = (status: OrderStatus) => {
    const config = ORDER_STATUSES[status]
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'warning' | 'success' | 'info'> = {
      yellow: 'warning',
      blue: 'info',
      purple: 'default',
      green: 'success',
      gray: 'secondary',
      red: 'destructive',
    }
    return (
      <Badge variant={variants[config.color] || 'default'}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="訂單管理"
        description="管理來自各平台的訂單"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待處理</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已確認</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已出貨</CardTitle>
              <Truck className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.shipped}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已送達</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs & Filters */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>
                全部
              </TabsTrigger>
              <TabsTrigger value="pending" onClick={() => setStatusFilter('pending')}>
                待處理 ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="confirmed" onClick={() => setStatusFilter('confirmed')}>
                已確認 ({stats.confirmed})
              </TabsTrigger>
              <TabsTrigger value="shipped" onClick={() => setStatusFilter('shipped')}>
                已出貨 ({stats.shipped})
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {selectedOrders.length > 0 && (
                <>
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    列印 ({selectedOrders.length})
                  </Button>
                  <Button variant="outline" size="sm">
                    <Truck className="mr-2 h-4 w-4" />
                    標記出貨
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                同步訂單
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                匯出
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜尋訂單編號、客戶名稱..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="平台" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部平台</SelectItem>
                {Object.entries(PLATFORMS).map(([key, platform]) => (
                  <SelectItem key={key} value={key}>
                    {platform.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all" className="space-y-4">
            {/* Orders Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>訂單編號</TableHead>
                    <TableHead>平台</TableHead>
                    <TableHead>客戶</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>建立時間</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        沒有找到訂單
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const platform = PLATFORMS[order.platform]
                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={(checked) =>
                                handleSelectOrder(order.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.platformOrderId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-6 w-6 rounded"
                                style={{ backgroundColor: platform.color }}
                              />
                              <span className="text-sm">{platform.displayName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{order.customerName}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.itemCount} 件商品
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(order.totalAmount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateTime(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDetail(order)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  查看詳情
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" />
                                  列印出貨單
                                </DropdownMenuItem>
                                {order.status === 'confirmed' && (
                                  <DropdownMenuItem>
                                    <Truck className="mr-2 h-4 w-4" />
                                    標記出貨
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'pending' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                      <XCircle className="mr-2 h-4 w-4" />
                                      取消訂單
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>訂單詳情</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">平台</p>
                  <p className="font-medium">{PLATFORMS[selectedOrder.platform].displayName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">狀態</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">客戶</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">金額</p>
                  <p className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">建立時間</p>
                  <p className="font-medium">{formatDateTime(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">出貨時間</p>
                  <p className="font-medium">
                    {selectedOrder.shippedAt ? formatDateTime(selectedOrder.shippedAt) : '-'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Printer className="mr-2 h-4 w-4" />
                  列印出貨單
                </Button>
                {selectedOrder.status === 'confirmed' && (
                  <Button variant="outline" className="flex-1">
                    <Truck className="mr-2 h-4 w-4" />
                    標記出貨
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
