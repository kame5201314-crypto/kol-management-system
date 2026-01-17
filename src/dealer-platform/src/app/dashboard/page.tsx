import Link from 'next/link'
import {
  Users,
  ShoppingCart,
  Truck,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSuppliers } from '@/actions/suppliers'
import { getPurchaseOrders } from '@/actions/purchase-orders'
import { getDeliveries } from '@/actions/deliveries'
import { getQuotations } from '@/actions/quotations'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  // 取得各模組資料
  const [suppliersResult, ordersResult, deliveriesResult, quotationsResult] = await Promise.all([
    getSuppliers(),
    getPurchaseOrders(),
    getDeliveries(),
    getQuotations(),
  ])

  const suppliers = suppliersResult.success ? suppliersResult.data ?? [] : []
  const orders = ordersResult.success ? ordersResult.data ?? [] : []
  const deliveries = deliveriesResult.success ? deliveriesResult.data ?? [] : []
  const quotations = quotationsResult.success ? quotationsResult.data ?? [] : []

  // 計算統計數據
  const supplierStats = {
    total: suppliers.length,
    gradeA: suppliers.filter(s => s.grade === 'A').length,
    gradeD: suppliers.filter(s => s.grade === 'D').length,
  }

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o: any) => o.status === 'pending').length,
    inProgress: orders.filter((o: any) => ['approved', 'ordered', 'partial'].includes(o.status)).length,
    totalAmount: orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
  }

  const deliveryStats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    awaiting: deliveries.filter(d => ['delivered', 'inspecting'].includes(d.status)).length,
  }

  const quotationStats = {
    total: quotations.length,
    sent: quotations.filter(q => q.status === 'sent').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
    totalAmount: quotations.reduce((sum, q) => sum + q.total_amount, 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">經銷商管理平台</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                首頁
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">儀表板</h2>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 供應商統計 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                供應商
              </CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{supplierStats.total}</div>
              <div className="flex items-center space-x-2 mt-2 text-sm">
                <Badge variant="success">{supplierStats.gradeA} A級</Badge>
                {supplierStats.gradeD > 0 && (
                  <Badge variant="destructive">{supplierStats.gradeD} 需關注</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 採購單統計 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                採購單
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.total}</div>
              <div className="flex items-center space-x-2 mt-2 text-sm">
                {orderStats.pending > 0 && (
                  <Badge variant="warning">{orderStats.pending} 待審核</Badge>
                )}
                <Badge variant="info">{orderStats.inProgress} 進行中</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 交貨追蹤統計 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                交貨追蹤
              </CardTitle>
              <Truck className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveryStats.total}</div>
              <div className="flex items-center space-x-2 mt-2 text-sm">
                <Badge variant="info">{deliveryStats.inTransit} 運送中</Badge>
                {deliveryStats.awaiting > 0 && (
                  <Badge variant="warning">{deliveryStats.awaiting} 待驗收</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 報價單統計 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                報價單
              </CardTitle>
              <FileText className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quotationStats.total}</div>
              <div className="flex items-center space-x-2 mt-2 text-sm">
                <Badge variant="info">{quotationStats.sent} 已發送</Badge>
                <Badge variant="success">{quotationStats.accepted} 已成交</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 採購金額 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                採購總額
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(orderStats.totalAmount)}
              </div>
              <p className="text-sm text-gray-500 mt-1">所有採購單累計金額</p>
            </CardContent>
          </Card>

          {/* 報價金額 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                報價總額
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {formatCurrency(quotationStats.totalAmount)}
              </div>
              <p className="text-sm text-gray-500 mt-1">所有報價單累計金額</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/suppliers"
            className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-500 mr-3" />
              <span className="font-medium">供應商管理</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link
            href="/purchase-orders"
            className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 text-green-500 mr-3" />
              <span className="font-medium">採購單管理</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link
            href="/deliveries"
            className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Truck className="w-5 h-5 text-orange-500 mr-3" />
              <span className="font-medium">交貨追蹤</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link
            href="/quotations"
            className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-purple-500 mr-3" />
              <span className="font-medium">報價單管理</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>

        {/* Alerts Section */}
        {(supplierStats.gradeD > 0 || deliveryStats.awaiting > 0 || orderStats.pending > 0) && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
              待處理事項
            </h3>
            <div className="space-y-3">
              {supplierStats.gradeD > 0 && (
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center">
                    <TrendingDown className="w-5 h-5 text-red-500 mr-3" />
                    <span className="text-red-700">
                      {supplierStats.gradeD} 個供應商評等為 D 級，需要關注
                    </span>
                  </div>
                  <Link href="/suppliers?grade=D">
                    <Badge variant="destructive">查看</Badge>
                  </Link>
                </div>
              )}

              {orderStats.pending > 0 && (
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-yellow-700">
                      {orderStats.pending} 張採購單待審核
                    </span>
                  </div>
                  <Link href="/purchase-orders?status=pending">
                    <Badge variant="warning">查看</Badge>
                  </Link>
                </div>
              )}

              {deliveryStats.awaiting > 0 && (
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-orange-500 mr-3" />
                    <span className="text-orange-700">
                      {deliveryStats.awaiting} 筆交貨待驗收
                    </span>
                  </div>
                  <Link href="/deliveries?status=delivered">
                    <Badge variant="warning">查看</Badge>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
