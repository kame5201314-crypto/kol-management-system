import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  MessageSquare,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getWholesaleInquiry } from '@/actions/wholesale-inquiries'
import { InquiryActionButtons } from '@/components/wholesale-inquiries/inquiry-action-buttons'

const statusLabels: Record<string, string> = {
  submitted: '已提交',
  reviewing: '審核中',
  quoted: '已報價',
  accepted: '已接受',
  rejected: '已拒絕',
  expired: '已過期',
  cancelled: '已取消',
}

const statusColors: Record<string, string> = {
  submitted: 'info',
  reviewing: 'warning',
  quoted: 'secondary',
  accepted: 'success',
  rejected: 'destructive',
  expired: 'destructive',
  cancelled: 'secondary',
}

export default async function WholesaleInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getWholesaleInquiry(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const inquiry = result.data

  // 計算總金額
  const totalEstimated = inquiry.items?.reduce((sum, item) =>
    sum + (item.target_price || 0) * item.requested_quantity, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/wholesale-inquiries" className="mr-4">
                <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </Link>
              <MessageSquare className="w-6 h-6 text-primary mr-2" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{inquiry.inquiry_number}</h1>
                <p className="text-sm text-gray-500">{inquiry.customer_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={statusColors[inquiry.status] as any}>
                {statusLabels[inquiry.status]}
              </Badge>
              <InquiryActionButtons inquiryId={id} status={inquiry.status} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側內容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 客戶資訊 */}
            <Card>
              <CardHeader>
                <CardTitle>客戶資訊</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">客戶姓名</div>
                  <div className="font-medium">{inquiry.customer_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">公司名稱</div>
                  <div className="font-medium">{inquiry.customer_company || '-'}</div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{inquiry.customer_email}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">電話</div>
                    <div className="font-medium">{inquiry.customer_phone || '-'}</div>
                  </div>
                </div>
                {inquiry.customer_grade && (
                  <div>
                    <div className="text-sm text-gray-500">客戶等級</div>
                    <Badge variant="secondary">{inquiry.customer_grade}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 詢價明細 */}
            <Card>
              <CardHeader>
                <CardTitle>詢價明細</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>產品代碼</TableHead>
                      <TableHead>產品名稱</TableHead>
                      <TableHead className="text-right">數量</TableHead>
                      <TableHead>單位</TableHead>
                      <TableHead className="text-right">目標價格</TableHead>
                      <TableHead className="text-right">報價單價</TableHead>
                      <TableHead className="text-right">報價金額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiry.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product_code}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="text-right">{item.requested_quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">
                          {item.target_price ? `$${item.target_price.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quoted_unit_price ? `$${item.quoted_unit_price.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quoted_amount ? `$${item.quoted_amount.toLocaleString()}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 備註 */}
            {(inquiry.notes || inquiry.response_notes) && (
              <Card>
                <CardHeader>
                  <CardTitle>備註</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inquiry.notes && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">客戶備註</div>
                      <p className="text-gray-700 whitespace-pre-wrap">{inquiry.notes}</p>
                    </div>
                  )}
                  {inquiry.response_notes && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">報價備註</div>
                      <p className="text-gray-700 whitespace-pre-wrap">{inquiry.response_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右側欄位 */}
          <div className="space-y-6">
            {/* 詢價摘要 */}
            <Card>
              <CardHeader>
                <CardTitle>詢價摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">詢價日期</div>
                  <div className="font-medium">
                    {new Date(inquiry.inquiry_date).toLocaleDateString('zh-TW')}
                  </div>
                </div>
                {inquiry.expected_delivery_date && (
                  <div>
                    <div className="text-sm text-gray-500">期望交貨日</div>
                    <div className="font-medium">
                      {new Date(inquiry.expected_delivery_date).toLocaleDateString('zh-TW')}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">品項數量</div>
                  <div className="font-medium">{inquiry.items?.length || 0} 項</div>
                </div>
                {totalEstimated > 0 && (
                  <div>
                    <div className="text-sm text-gray-500">估計金額（目標價）</div>
                    <div className="text-xl font-semibold text-gray-600">
                      ${totalEstimated.toLocaleString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 報價資訊 */}
            {inquiry.quoted_amount && (
              <Card>
                <CardHeader>
                  <CardTitle>報價資訊</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">報價金額</div>
                    <div className="text-2xl font-bold text-primary">
                      ${inquiry.quoted_amount.toLocaleString()}
                    </div>
                  </div>
                  {inquiry.valid_until && (
                    <div>
                      <div className="text-sm text-gray-500">報價有效期</div>
                      <div className="font-medium">
                        {new Date(inquiry.valid_until).toLocaleDateString('zh-TW')}
                      </div>
                    </div>
                  )}
                  {inquiry.quoted_at && (
                    <div>
                      <div className="text-sm text-gray-500">報價時間</div>
                      <div className="font-medium">
                        {new Date(inquiry.quoted_at).toLocaleString('zh-TW')}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 關聯報價單 */}
            {inquiry.quotation_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    關聯報價單
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/quotations/${inquiry.quotation_id}`}>
                    <Button variant="outline" className="w-full">
                      查看報價單
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* 時間軸 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  處理時程
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-24 text-gray-500">提交時間</div>
                  <div className="font-medium">
                    {inquiry.submitted_at
                      ? new Date(inquiry.submitted_at).toLocaleString('zh-TW')
                      : '-'}
                  </div>
                </div>
                {inquiry.reviewed_at && (
                  <div className="flex items-center text-sm">
                    <div className="w-24 text-gray-500">審核時間</div>
                    <div className="font-medium">
                      {new Date(inquiry.reviewed_at).toLocaleString('zh-TW')}
                    </div>
                  </div>
                )}
                {inquiry.quoted_at && (
                  <div className="flex items-center text-sm">
                    <div className="w-24 text-gray-500">報價時間</div>
                    <div className="font-medium">
                      {new Date(inquiry.quoted_at).toLocaleString('zh-TW')}
                    </div>
                  </div>
                )}
                {inquiry.responded_at && (
                  <div className="flex items-center text-sm">
                    <div className="w-24 text-gray-500">回應時間</div>
                    <div className="font-medium">
                      {new Date(inquiry.responded_at).toLocaleString('zh-TW')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
