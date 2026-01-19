import Link from 'next/link'
import { MessageSquare, Plus, Search, Filter } from 'lucide-react'
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
import { getWholesaleInquiries } from '@/actions/wholesale-inquiries'

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

export default async function WholesaleInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const result = await getWholesaleInquiries({
    status: params.status,
    search: params.search,
  })
  const inquiries = result.success ? result.data ?? [] : []

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'submitted' || i.status === 'reviewing').length,
    quoted: inquiries.filter(i => i.status === 'quoted').length,
    accepted: inquiries.filter(i => i.status === 'accepted').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 text-primary mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">批發詢價</h1>
            </div>
            <Link href="/wholesale-inquiries/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新增詢價
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">全部詢價</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">待處理</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-blue-600">{stats.quoted}</div>
            <div className="text-sm text-gray-500">已報價</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-gray-500">已成交</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
          <form className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  name="search"
                  placeholder="搜尋詢價單號、客戶名稱..."
                  className="pl-10"
                  defaultValue={params.search}
                />
              </div>
            </div>
            <select
              name="status"
              defaultValue={params.status}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">全部狀態</option>
              <option value="submitted">已提交</option>
              <option value="reviewing">審核中</option>
              <option value="quoted">已報價</option>
              <option value="accepted">已接受</option>
              <option value="rejected">已拒絕</option>
              <option value="expired">已過期</option>
            </select>
            <Button type="submit">
              <Filter className="w-4 h-4 mr-2" />
              搜尋
            </Button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>詢價單號</TableHead>
                <TableHead>客戶名稱</TableHead>
                <TableHead>公司</TableHead>
                <TableHead>詢價日期</TableHead>
                <TableHead className="text-right">報價金額</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    尚無詢價單
                  </TableCell>
                </TableRow>
              ) : (
                inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">{inquiry.inquiry_number}</TableCell>
                    <TableCell>{inquiry.customer_name}</TableCell>
                    <TableCell>{inquiry.customer_company || '-'}</TableCell>
                    <TableCell>
                      {new Date(inquiry.inquiry_date).toLocaleDateString('zh-TW')}
                    </TableCell>
                    <TableCell className="text-right">
                      {inquiry.quoted_amount
                        ? `$${inquiry.quoted_amount.toLocaleString()}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[inquiry.status] as any}>
                        {statusLabels[inquiry.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/wholesale-inquiries/${inquiry.id}`}>
                        <Button variant="ghost" size="sm">
                          查看
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
