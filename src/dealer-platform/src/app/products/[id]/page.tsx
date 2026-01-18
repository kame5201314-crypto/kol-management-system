import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Edit, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getProduct } from '@/actions/products'
import { formatCurrency, formatDateTime } from '@/lib/utils'

const statusLabels: Record<string, string> = {
  active: '上架中',
  inactive: '已下架',
  discontinued: '已停產',
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info'> = {
  active: 'success',
  inactive: 'secondary',
  discontinued: 'destructive',
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getProduct(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const product = result.data

  // 計算毛利率
  const grossMargin = product.cost_price
    ? ((product.list_price - product.cost_price) / product.list_price * 100).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/products" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Package className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-500">{product.code}</p>
              </div>
              <Badge variant={statusColors[product.status]}>
                {statusLabels[product.status]}
              </Badge>
            </div>
            <Link href={`/products/${product.id}/edit`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                編輯
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要內容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本資料 */}
            <Card>
              <CardHeader>
                <CardTitle>基本資料</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">產品代碼</label>
                    <p className="font-medium">{product.code}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">分類</label>
                    <p className="font-medium">{product.category ?? '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">單位</label>
                    <p className="font-medium">{product.unit}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">規格</label>
                    <p className="font-medium">{product.spec ?? '-'}</p>
                  </div>
                </div>

                {product.description && (
                  <div className="mt-4 pt-4 border-t">
                    <label className="text-sm text-gray-500">產品描述</label>
                    <p className="text-gray-600 mt-1">{product.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 價格資訊 */}
            <Card>
              <CardHeader>
                <CardTitle>價格資訊</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">售價</label>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(product.list_price)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">成本價</label>
                    <p className="font-medium">
                      {product.cost_price ? formatCurrency(product.cost_price) : '-'}
                    </p>
                  </div>
                  {grossMargin && (
                    <div>
                      <label className="text-sm text-gray-500">毛利率</label>
                      <p className="font-medium text-green-600">{grossMargin}%</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-500">最低價</label>
                    <p className="font-medium">
                      {product.min_price ? formatCurrency(product.min_price) : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 狀態資訊 */}
            <Card>
              <CardHeader>
                <CardTitle>狀態資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">目前狀態</label>
                  <p className="mt-1">
                    <Badge variant={statusColors[product.status]}>
                      {statusLabels[product.status]}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">建立時間</label>
                  <p className="text-sm">{formatDateTime(product.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">最後更新</label>
                  <p className="text-sm">{formatDateTime(product.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/quotations/new?product=${product.id}`} className="block">
                  <Button variant="outline" className="w-full">
                    建立報價單
                  </Button>
                </Link>
                <Link href={`/purchase-orders/new?product=${product.id}`} className="block">
                  <Button variant="outline" className="w-full">
                    建立採購單
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
