import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CreditCard, DollarSign, AlertTriangle } from 'lucide-react'
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
import { getCustomer } from '@/actions/customers'
import { getCreditTransactions } from '@/actions/credit'

const txTypeLabels: Record<string, string> = {
  order: '訂單',
  payment: '付款',
  refund: '退款',
  adjustment: '調整',
  write_off: '沖銷',
}

const txTypeColors: Record<string, string> = {
  order: 'destructive',
  payment: 'success',
  refund: 'success',
  adjustment: 'secondary',
  write_off: 'warning',
}

export default async function CustomerCreditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const customerResult = await getCustomer(id)

  if (!customerResult.success || !customerResult.data) {
    notFound()
  }

  const customer = customerResult.data
  const txResult = await getCreditTransactions(id)
  const transactions = txResult.success ? txResult.data ?? [] : []

  // 計算統計
  const totalOrders = transactions
    .filter(tx => tx.transaction_type === 'order')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalPayments = transactions
    .filter(tx => tx.transaction_type === 'payment' || tx.transaction_type === 'refund')
    .reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href={`/customers/${id}`} className="mr-4">
                <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </Link>
              <CreditCard className="w-6 h-6 text-primary mr-2" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">信用交易記錄</h1>
                <p className="text-sm text-gray-500">{customer.name} ({customer.code})</p>
              </div>
            </div>
            {customer.credit_hold && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                信用凍結
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 信用摘要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500">信用額度</div>
              <div className="text-2xl font-bold">
                ${customer.credit_limit?.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500">目前餘額</div>
              <div className="text-2xl font-bold text-orange-600">
                ${customer.current_balance?.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500">可用額度</div>
              <div className={`text-2xl font-bold ${
                customer.available_credit < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                ${customer.available_credit?.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500">累計付款</div>
              <div className="text-2xl font-bold text-blue-600">
                ${totalPayments.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 交易記錄表格 */}
        <Card>
          <CardHeader>
            <CardTitle>交易記錄</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>說明</TableHead>
                  <TableHead>參考單號</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                  <TableHead className="text-right">餘額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      尚無交易記錄
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {new Date(tx.transaction_date).toLocaleDateString('zh-TW')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={txTypeColors[tx.transaction_type] as any}>
                          {txTypeLabels[tx.transaction_type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {tx.description || '-'}
                      </TableCell>
                      <TableCell>
                        {tx.reference_number || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={
                          tx.transaction_type === 'payment' || tx.transaction_type === 'refund'
                            ? 'text-green-600'
                            : tx.transaction_type === 'order'
                            ? 'text-red-600'
                            : ''
                        }>
                          {tx.transaction_type === 'payment' || tx.transaction_type === 'refund' ? '-' : '+'}
                          ${tx.amount?.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${tx.balance_after?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
