import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  Building,
  Edit,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getPurchaseOrder } from '@/actions/purchase-orders'
import { formatCurrency, formatDate } from '@/lib/utils'
import { POActionButtons } from '@/components/purchase-orders/po-action-buttons'

const statusLabels: Record<string, string> = {
  draft: '草稿',
  pending: '待審核',
  approved: '已核准',
  ordered: '已下單',
  partial: '部分到貨',
  completed: '已完成',
  cancelled: '已取消',
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info'> = {
  draft: 'secondary',
  pending: 'warning',
  approved: 'info',
  ordered: 'info',
  partial: 'warning',
  completed: 'success',
  cancelled: 'destructive',
}

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getPurchaseOrder(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const order = result.data
  const supplier = (order as any).supplier

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/purchase-orders" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{order.po_number}</h1>
                <p className="text-sm text-gray-500">
                  {supplier?.name ?? '未知供應商'}
                </p>
              </div>
              <Badge variant={statusColors[order.status]}>
                {statusLabels[order.status]}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <POActionButtons poId={order.id} status={order.status} />
              {order.status === 'draft' && (
                <Link href={`/purchase-orders/${order.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    編輯
                  </Button>
                </Link>
              )}
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                列印
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 訂單資訊 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>訂單資訊</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">訂單日期</label>
                    <p className="font-medium">{formatDate(order.order_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">預計交貨日</label>
                    <p className="font-medium">
                      {order.expected_date ? formatDate(order.expected_date) : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">付款條件</label>
                    <p className="font-medium">{order.payment_terms} 天</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">幣別</label>
                    <p className="font-medium">{order.currency}</p>
                  </div>
                </div>

                {order.shipping_address && (
                  <div className="mt-4 pt-4 border-t">
                    <label className="text-sm text-gray-500">送貨地址</label>
                    <p className="font-medium">{order.shipping_address}</p>
                  </div>
                )}

                {order.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <label className="text-sm text-gray-500">備註</label>
                    <p className="text-gray-600">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 品項明細 */}
            <Card>
              <CardHeader>
                <CardTitle>品項明細</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>產品代碼</TableHead>
                      <TableHead>產品名稱</TableHead>
                      <TableHead className="text-center">單位</TableHead>
                      <TableHead className="text-right">數量</TableHead>
                      <TableHead className="text-right">單價</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead className="text-right">已收</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.line_number}</TableCell>
                        <TableCell className="font-medium">{item.product_code}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="text-center">{item.unit}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.received_qty > 0 ? (
                            <span className={item.received_qty >= item.quantity ? 'text-green-600' : 'text-orange-600'}>
                              {item.received_qty}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 金額摘要 */}
            <Card>
              <CardHeader>
                <CardTitle>金額摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">小計</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">稅額</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>總計</span>
                    <span className="text-primary">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 供應商資訊 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  供應商資訊
                </CardTitle>
              </CardHeader>
              <CardContent>
                {supplier ? (
                  <div className="space-y-2">
                    <p className="font-medium">{supplier.name}</p>
                    <p className="text-sm text-gray-500">{supplier.code}</p>
                    <Link
                      href={`/suppliers/${supplier.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      查看供應商詳情
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500">無供應商資訊</p>
                )}
              </CardContent>
            </Card>

            {/* 審核資訊 */}
            {order.approved_at && (
              <Card>
                <CardHeader>
                  <CardTitle>審核資訊</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-500">核准時間</label>
                      <p className="font-medium">{formatDate(order.approved_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
