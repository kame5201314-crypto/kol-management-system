import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
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
import { getQuotation } from '@/actions/quotations'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { QuotationActionButtons } from '@/components/quotations/quotation-action-buttons'

const statusLabels: Record<string, string> = {
  draft: '草稿',
  sent: '已發送',
  viewed: '已查看',
  accepted: '已接受',
  rejected: '已拒絕',
  expired: '已過期',
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info'> = {
  draft: 'secondary',
  sent: 'info',
  viewed: 'warning',
  accepted: 'success',
  rejected: 'destructive',
  expired: 'secondary',
}

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getQuotation(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const quotation = result.data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/quotations" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{quotation.quote_number}</h1>
                <p className="text-sm text-gray-500">{quotation.customer_name}</p>
              </div>
              <Badge variant={statusColors[quotation.status]}>
                {statusLabels[quotation.status]}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {quotation.status === 'draft' && (
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  發送報價
                </Button>
              )}
              {quotation.status === 'sent' && (
                <>
                  <Button variant="outline">
                    <XCircle className="w-4 h-4 mr-2" />
                    標記拒絕
                  </Button>
                  <Button>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    標記成交
                  </Button>
                </>
              )}
              <Button variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                複製
              </Button>
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
            {/* 報價資訊 */}
            <Card>
              <CardHeader>
                <CardTitle>報價資訊</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">報價日期</label>
                    <p className="font-medium">{formatDate(quotation.quote_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">有效期限</label>
                    <p className="font-medium">
                      {quotation.valid_until ? formatDate(quotation.valid_until) : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">幣別</label>
                    <p className="font-medium">{quotation.currency}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">狀態</label>
                    <p>
                      <Badge variant={statusColors[quotation.status]}>
                        {statusLabels[quotation.status]}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  {quotation.payment_terms && (
                    <div>
                      <label className="text-sm text-gray-500">付款條件</label>
                      <p className="font-medium">{quotation.payment_terms}</p>
                    </div>
                  )}
                  {quotation.delivery_terms && (
                    <div>
                      <label className="text-sm text-gray-500">交貨條件</label>
                      <p className="font-medium">{quotation.delivery_terms}</p>
                    </div>
                  )}
                </div>

                {quotation.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <label className="text-sm text-gray-500">備註</label>
                    <p className="text-gray-600">{quotation.notes}</p>
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
                      <TableHead className="text-right">折扣</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotation.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.line_number}</TableCell>
                        <TableCell className="font-medium">{item.product_code}</TableCell>
                        <TableCell>
                          <div>
                            <p>{item.product_name}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500">{item.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.unit}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.discount_percent > 0 ? (
                            <span className="text-red-500">-{item.discount_percent}%</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.amount)}
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
                  <span>{formatCurrency(quotation.subtotal)}</span>
                </div>
                {quotation.discount_amount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>折扣 ({quotation.discount_percent}%)</span>
                    <span>-{formatCurrency(quotation.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">稅額 ({quotation.tax_rate}%)</span>
                  <span>{formatCurrency(quotation.tax_amount)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>總計</span>
                    <span className="text-primary">{formatCurrency(quotation.total_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 客戶資訊 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  客戶資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium">{quotation.customer_name}</p>
                {quotation.customer_contact && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    {quotation.customer_contact}
                  </div>
                )}
                {quotation.customer_email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {quotation.customer_email}
                  </div>
                )}
                {quotation.customer_phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {quotation.customer_phone}
                  </div>
                )}
                {quotation.customer_address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {quotation.customer_address}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 時間軸 */}
            <Card>
              <CardHeader>
                <CardTitle>時間軸</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <TimelineItem
                    label="建立時間"
                    time={quotation.created_at}
                    active
                  />
                  {quotation.sent_at && (
                    <TimelineItem
                      label="發送時間"
                      time={quotation.sent_at}
                      active
                    />
                  )}
                  {quotation.viewed_at && (
                    <TimelineItem
                      label="查看時間"
                      time={quotation.viewed_at}
                      active
                    />
                  )}
                  {quotation.responded_at && (
                    <TimelineItem
                      label={quotation.status === 'accepted' ? '成交時間' : '拒絕時間'}
                      time={quotation.responded_at}
                      active
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 內部備註 */}
            {quotation.internal_notes && (
              <Card>
                <CardHeader>
                  <CardTitle>內部備註</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{quotation.internal_notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function TimelineItem({
  label,
  time,
  active,
}: {
  label: string
  time: string
  active: boolean
}) {
  return (
    <div className="flex items-center">
      <div
        className={`w-2 h-2 rounded-full mr-3 ${
          active ? 'bg-primary' : 'bg-gray-300'
        }`}
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-500">{formatDateTime(time)}</p>
      </div>
    </div>
  )
}
