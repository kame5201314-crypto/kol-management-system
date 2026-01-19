import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  Edit,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
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
import { getContract } from '@/actions/contracts'

const statusLabels: Record<string, string> = {
  draft: '草稿',
  pending: '待核准',
  active: '生效中',
  expiring: '即將到期',
  expired: '已到期',
  terminated: '已終止',
  renewed: '已續約',
}

const statusColors: Record<string, string> = {
  draft: 'secondary',
  pending: 'warning',
  active: 'success',
  expiring: 'warning',
  expired: 'destructive',
  terminated: 'destructive',
  renewed: 'info',
}

const typeLabels: Record<string, string> = {
  supplier: '供應商合約',
  customer: '客戶合約',
  partner: '合作夥伴合約',
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getContract(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const contract = result.data

  // 計算剩餘天數
  const today = new Date()
  const endDate = new Date(contract.end_date)
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/contracts" className="mr-4">
                <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </Link>
              <FileText className="w-6 h-6 text-primary mr-2" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{contract.title}</h1>
                <p className="text-sm text-gray-500">{contract.contract_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={statusColors[contract.status] as any}>
                {statusLabels[contract.status]}
              </Badge>
              {contract.status === 'active' && daysRemaining <= 30 && daysRemaining > 0 && (
                <Badge variant="warning">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {daysRemaining} 天後到期
                </Badge>
              )}
              {(contract.status === 'draft' || contract.status === 'pending') && (
                <Link href={`/contracts/${id}/edit`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    編輯
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側內容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本資料 */}
            <Card>
              <CardHeader>
                <CardTitle>合約資訊</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">合約類型</div>
                  <div className="font-medium">{typeLabels[contract.contract_type]}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">對象名稱</div>
                  <div className="font-medium">{contract.party_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">聯絡人</div>
                  <div className="font-medium">{contract.party_contact || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">聯絡電話</div>
                  <div className="font-medium">{contract.party_phone || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{contract.party_email || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">自動續約</div>
                  <div className="font-medium">{contract.auto_renew ? '是' : '否'}</div>
                </div>
              </CardContent>
            </Card>

            {/* 合約條款 */}
            <Card>
              <CardHeader>
                <CardTitle>合約條款</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contract.payment_terms && (
                  <div>
                    <div className="text-sm text-gray-500">付款條件</div>
                    <div className="font-medium whitespace-pre-wrap">{contract.payment_terms}</div>
                  </div>
                )}
                {contract.delivery_terms && (
                  <div>
                    <div className="text-sm text-gray-500">交貨條件</div>
                    <div className="font-medium whitespace-pre-wrap">{contract.delivery_terms}</div>
                  </div>
                )}
                {contract.warranty_terms && (
                  <div>
                    <div className="text-sm text-gray-500">保固條款</div>
                    <div className="font-medium whitespace-pre-wrap">{contract.warranty_terms}</div>
                  </div>
                )}
                {!contract.payment_terms && !contract.delivery_terms && !contract.warranty_terms && (
                  <div className="text-gray-500">尚未設定條款</div>
                )}
              </CardContent>
            </Card>

            {/* 約定產品價格 */}
            {contract.items && contract.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>約定產品價格</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>產品代碼</TableHead>
                        <TableHead>產品名稱</TableHead>
                        <TableHead>單位</TableHead>
                        <TableHead className="text-right">約定價格</TableHead>
                        <TableHead className="text-right">數量範圍</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contract.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product_code}</TableCell>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">
                            ${item.contracted_price.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.min_quantity || item.max_quantity
                              ? `${item.min_quantity || 0} ~ ${item.max_quantity || '無上限'}`
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右側欄位 */}
          <div className="space-y-6">
            {/* 合約期間 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  合約期間
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">開始日期</div>
                  <div className="font-medium">{contract.start_date}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">結束日期</div>
                  <div className="font-medium">{contract.end_date}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">剩餘天數</div>
                  <div className={`text-xl font-semibold ${
                    daysRemaining <= 0 ? 'text-red-600' :
                    daysRemaining <= 30 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {daysRemaining <= 0 ? '已到期' : `${daysRemaining} 天`}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">到期前提醒</div>
                  <div className="font-medium">{contract.renewal_notice_days} 天</div>
                </div>
              </CardContent>
            </Card>

            {/* 合約金額 */}
            {contract.contract_value && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    合約金額
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contract.currency} ${contract.contract_value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 核准資訊 */}
            {contract.approved_at && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    核准資訊
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-500">核准時間</div>
                    <div className="font-medium">
                      {new Date(contract.approved_at).toLocaleString('zh-TW')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 備註 */}
            {contract.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>備註</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{contract.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
