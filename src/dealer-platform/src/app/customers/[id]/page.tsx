import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Users,
  Edit,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCustomer } from '@/actions/customers'
import { getCreditTransactions } from '@/actions/credit'

const gradeColors: Record<string, string> = {
  VIP: 'bg-purple-100 text-purple-800',
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800',
  NEW: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<string, string> = {
  active: '正常',
  inactive: '停用',
  suspended: '凍結',
  blocked: '黑名單',
}

const statusColors: Record<string, string> = {
  active: 'success',
  inactive: 'secondary',
  suspended: 'warning',
  blocked: 'destructive',
}

const txTypeLabels: Record<string, string> = {
  order: '訂單',
  payment: '付款',
  refund: '退款',
  adjustment: '調整',
  write_off: '沖銷',
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getCustomer(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const customer = result.data

  // 取得信用交易記錄
  const txResult = await getCreditTransactions(id)
  const transactions = txResult.success ? txResult.data ?? [] : []

  // 計算信用使用率
  const creditUsageRate = customer.credit_limit > 0
    ? ((customer.current_balance / customer.credit_limit) * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/customers" className="mr-4">
                <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </Link>
              <Users className="w-6 h-6 text-primary mr-2" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{customer.name}</h1>
                <p className="text-sm text-gray-500">{customer.code}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${gradeColors[customer.grade]}`}>
                {customer.grade}
              </span>
              <Badge variant={statusColors[customer.status] as any}>
                {statusLabels[customer.status]}
              </Badge>
              {customer.credit_hold && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  信用凍結
                </Badge>
              )}
              <Link href={`/customers/${id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  編輯
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側內容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 信用警示 */}
            {customer.credit_hold && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                  <span className="font-medium text-orange-800">信用凍結中</span>
                </div>
                {customer.credit_hold_reason && (
                  <p className="text-sm text-orange-700 mt-1">{customer.credit_hold_reason}</p>
                )}
              </div>
            )}

            {/* 基本資料 */}
            <Card>
              <CardHeader>
                <CardTitle>基本資料</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">客戶名稱</div>
                  <div className="font-medium">{customer.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">簡稱</div>
                  <div className="font-medium">{customer.short_name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">統一編號</div>
                  <div className="font-medium">{customer.tax_id || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">付款天數</div>
                  <div className="font-medium">{customer.payment_terms} 天</div>
                </div>
              </CardContent>
            </Card>

            {/* 聯絡資訊 */}
            <Card>
              <CardHeader>
                <CardTitle>聯絡資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.contact_person && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{customer.contact_person}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.mobile && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{customer.mobile} (手機)</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{customer.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 最近信用交易 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>最近信用交易</CardTitle>
                <Link href={`/customers/${id}/credit`}>
                  <Button variant="ghost" size="sm">
                    查看全部
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    尚無交易記錄
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <div className="font-medium">{txTypeLabels[tx.transaction_type]}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(tx.transaction_date).toLocaleDateString('zh-TW')}
                          </div>
                        </div>
                        <div className={`font-medium ${
                          tx.transaction_type === 'payment' || tx.transaction_type === 'refund'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {tx.transaction_type === 'payment' || tx.transaction_type === 'refund' ? '-' : '+'}
                          ${tx.amount?.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右側欄位 */}
          <div className="space-y-6">
            {/* 信用概況 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  信用概況
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">信用額度</div>
                  <div className="text-2xl font-bold">
                    ${customer.credit_limit?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">目前餘額</div>
                  <div className="text-xl font-semibold text-orange-600">
                    ${customer.current_balance?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">可用額度</div>
                  <div className={`text-xl font-semibold ${
                    customer.available_credit < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ${customer.available_credit?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">使用率</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        Number(creditUsageRate) > 80 ? 'bg-red-500' :
                        Number(creditUsageRate) > 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(Number(creditUsageRate), 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{creditUsageRate}%</div>
                </div>
              </CardContent>
            </Card>

            {/* 訂單統計 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  訂單統計
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">累計訂單數</div>
                  <div className="text-xl font-semibold">{customer.total_orders}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">累計消費金額</div>
                  <div className="text-xl font-semibold">
                    ${customer.total_amount?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">最後訂購日</div>
                  <div className="font-medium">
                    {customer.last_order_date
                      ? new Date(customer.last_order_date).toLocaleDateString('zh-TW')
                      : '-'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 備註 */}
            {customer.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>備註</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
