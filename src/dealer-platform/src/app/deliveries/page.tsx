import Link from 'next/link'
import { Plus, Search, Filter, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getDeliveries } from '@/actions/deliveries'
import { formatDate } from '@/lib/utils'

const statusLabels: Record<string, string> = {
  pending: '待出貨',
  in_transit: '運送中',
  delivered: '已到貨',
  inspecting: '驗收中',
  accepted: '已驗收',
  rejected: '已退回',
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info'> = {
  pending: 'secondary',
  in_transit: 'info',
  delivered: 'warning',
  inspecting: 'warning',
  accepted: 'success',
  rejected: 'destructive',
}

export default async function DeliveriesPage() {
  const result = await getDeliveries()
  const deliveries = result.success ? result.data ?? [] : []

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    awaiting: deliveries.filter(d => ['delivered', 'inspecting'].includes(d.status)).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                首頁
              </Link>
              <span className="text-gray-300">/</span>
              <h1 className="text-xl font-bold text-gray-900 flex items-center">
                <Truck className="w-6 h-6 mr-2 text-orange-500" />
                交貨追蹤
              </h1>
            </div>
            <Link href="/deliveries/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新增交貨
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">總交貨記錄</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-gray-500">{stats.pending}</div>
            <div className="text-sm text-gray-500">待出貨</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
            <div className="text-sm text-gray-500">運送中</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-orange-600">{stats.awaiting}</div>
            <div className="text-sm text-gray-500">待驗收</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜尋交貨單號、採購單號、物流追蹤..."
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              篩選
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>交貨單號</TableHead>
                <TableHead>採購單號</TableHead>
                <TableHead>供應商</TableHead>
                <TableHead>交貨日期</TableHead>
                <TableHead>物流追蹤</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    尚無交貨記錄
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery: any) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/deliveries/${delivery.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {delivery.delivery_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {delivery.purchase_order?.po_number ?? '-'}
                    </TableCell>
                    <TableCell>{delivery.supplier?.name ?? '-'}</TableCell>
                    <TableCell>{formatDate(delivery.delivery_date)}</TableCell>
                    <TableCell>
                      {delivery.tracking_number ? (
                        <span className="text-sm">
                          {delivery.carrier && `${delivery.carrier}: `}
                          {delivery.tracking_number}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[delivery.status] ?? 'default'}>
                        {statusLabels[delivery.status] ?? delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/deliveries/${delivery.id}`}>
                        <Button variant="ghost" size="sm">
                          檢視
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
