import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  Building,
  FileText,
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
import { getDelivery } from '@/actions/deliveries'
import { formatDate, formatDateTime } from '@/lib/utils'
import { DeliveryActionButtons } from '@/components/deliveries/delivery-action-buttons'

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

export default async function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getDelivery(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const delivery = result.data
  const supplier = (delivery as any).supplier
  const purchaseOrder = (delivery as any).purchase_order

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/deliveries" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{delivery.delivery_number}</h1>
                <p className="text-sm text-gray-500">
                  {supplier?.name ?? '未知供應商'}
                </p>
              </div>
              <Badge variant={statusColors[delivery.status]}>
                {statusLabels[delivery.status]}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <DeliveryActionButtons deliveryId={delivery.id} status={delivery.status} />
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
          {/* 主要內容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 交貨資訊 */}
            <Card>
              <CardHeader>
                <CardTitle>交貨資訊</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">交貨日期</label>
                    <p className="font-medium">{formatDate(delivery.delivery_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">採購單號</label>
                    <p className="font-medium">
                      {purchaseOrder ? (
                        <Link
                          href={`/purchase-orders/${purchaseOrder.id}`}
                          className="text-primary hover:underline"
                        >
                          {purchaseOrder.po_number}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">物流商</label>
                    <p className="font-medium">{delivery.carrier ?? '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">追蹤號</label>
                    <p className="font-medium">{delivery.tracking_number ?? '-'}</p>
                  </div>
                </div>

                {delivery.received_at && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">收貨時間</label>
                        <p className="font-medium">{formatDateTime(delivery.received_at)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {delivery.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <label className="text-sm text-gray-500">備註</label>
                    <p className="text-gray-600">{delivery.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 品項明細 */}
            <Card>
              <CardHeader>
                <CardTitle>交貨品項</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>產品代碼</TableHead>
                      <TableHead>產品名稱</TableHead>
                      <TableHead className="text-right">交貨數量</TableHead>
                      <TableHead className="text-right">合格數量</TableHead>
                      <TableHead className="text-right">不合格</TableHead>
                      <TableHead>不合格原因</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {delivery.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product_code}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {item.accepted_qty > 0 ? (
                            <span className="text-green-600">{item.accepted_qty}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.rejected_qty > 0 ? (
                            <span className="text-red-600">{item.rejected_qty}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {item.rejection_reason ?? '-'}
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
            {/* 狀態進度 */}
            <Card>
              <CardHeader>
                <CardTitle>狀態進度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatusStep
                    label="待出貨"
                    completed={['in_transit', 'delivered', 'inspecting', 'accepted', 'rejected'].includes(delivery.status)}
                    current={delivery.status === 'pending'}
                  />
                  <StatusStep
                    label="運送中"
                    completed={['delivered', 'inspecting', 'accepted', 'rejected'].includes(delivery.status)}
                    current={delivery.status === 'in_transit'}
                  />
                  <StatusStep
                    label="已到貨"
                    completed={['inspecting', 'accepted', 'rejected'].includes(delivery.status)}
                    current={delivery.status === 'delivered'}
                  />
                  <StatusStep
                    label="驗收中"
                    completed={['accepted', 'rejected'].includes(delivery.status)}
                    current={delivery.status === 'inspecting'}
                  />
                  <StatusStep
                    label={delivery.status === 'rejected' ? '已退回' : '已驗收'}
                    completed={delivery.status === 'accepted' || delivery.status === 'rejected'}
                    current={false}
                    isLast
                    rejected={delivery.status === 'rejected'}
                  />
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
          </div>
        </div>
      </main>
    </div>
  )
}

function StatusStep({
  label,
  completed,
  current,
  isLast = false,
  rejected = false,
}: {
  label: string
  completed: boolean
  current: boolean
  isLast?: boolean
  rejected?: boolean
}) {
  return (
    <div className="flex items-center">
      <div className="relative">
        <div
          className={`w-4 h-4 rounded-full border-2 ${
            completed
              ? rejected
                ? 'bg-red-500 border-red-500'
                : 'bg-green-500 border-green-500'
              : current
              ? 'bg-white border-primary'
              : 'bg-white border-gray-300'
          }`}
        >
          {completed && (
            <CheckCircle className="w-3 h-3 text-white absolute -top-0.5 -left-0.5" />
          )}
        </div>
        {!isLast && (
          <div
            className={`absolute top-4 left-1.5 w-0.5 h-6 ${
              completed ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
        )}
      </div>
      <span
        className={`ml-3 text-sm ${
          current ? 'font-medium text-primary' : completed ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  )
}
