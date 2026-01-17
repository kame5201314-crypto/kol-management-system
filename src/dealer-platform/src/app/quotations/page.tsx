import Link from 'next/link'
import { Plus, Search, Filter, FileText } from 'lucide-react'
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
import { getQuotations } from '@/actions/quotations'
import { formatCurrency, formatDate } from '@/lib/utils'

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

export default async function QuotationsPage() {
  const result = await getQuotations()
  const quotations = result.success ? result.data ?? [] : []

  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'draft').length,
    sent: quotations.filter(q => q.status === 'sent').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
  }

  // 計算成交率
  const respondedCount = quotations.filter(q => ['accepted', 'rejected'].includes(q.status)).length
  const conversionRate = respondedCount > 0
    ? Math.round((stats.accepted / respondedCount) * 100)
    : 0

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
                <FileText className="w-6 h-6 mr-2 text-purple-500" />
                報價單管理
              </h1>
            </div>
            <Link href="/quotations/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新增報價單
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">總報價單數</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-gray-500">{stats.draft}</div>
            <div className="text-sm text-gray-500">草稿</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
            <div className="text-sm text-gray-500">已發送</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-gray-500">已成交</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-purple-600">{conversionRate}%</div>
            <div className="text-sm text-gray-500">成交率</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜尋報價單號、客戶名稱..."
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
                <TableHead>報價單號</TableHead>
                <TableHead>客戶名稱</TableHead>
                <TableHead>報價日期</TableHead>
                <TableHead>有效期限</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    尚無報價單資料，請點擊「新增報價單」開始建立
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/quotations/${quotation.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {quotation.quote_number}
                      </Link>
                    </TableCell>
                    <TableCell>{quotation.customer_name}</TableCell>
                    <TableCell>{formatDate(quotation.quote_date)}</TableCell>
                    <TableCell>
                      {quotation.valid_until ? formatDate(quotation.valid_until) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(quotation.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[quotation.status] ?? 'default'}>
                        {statusLabels[quotation.status] ?? quotation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/quotations/${quotation.id}`}>
                        <Button variant="ghost" size="sm">
                          檢視
                        </Button>
                      </Link>
                      <Link href={`/quotations/${quotation.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          編輯
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
