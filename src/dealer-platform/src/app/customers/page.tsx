import Link from 'next/link'
import { Users, Plus, Search, Filter, AlertTriangle } from 'lucide-react'
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
import { getCustomers } from '@/actions/customers'

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

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; grade?: string; status?: string }>
}) {
  const params = await searchParams
  const result = await getCustomers({
    search: params.search,
    grade: params.grade,
    status: params.status,
  })
  const customers = result.success ? result.data ?? [] : []

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    creditHold: customers.filter(c => c.credit_hold).length,
    totalCreditLimit: customers.reduce((sum, c) => sum + (c.credit_limit || 0), 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-primary mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">客戶管理</h1>
            </div>
            <Link href="/customers/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新增客戶
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
            <div className="text-sm text-gray-500">全部客戶</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">正常客戶</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-orange-600">{stats.creditHold}</div>
            <div className="text-sm text-gray-500">信用凍結</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-blue-600">
              ${stats.totalCreditLimit.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">總信用額度</div>
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
                  placeholder="搜尋客戶代碼、名稱..."
                  className="pl-10"
                  defaultValue={params.search}
                />
              </div>
            </div>
            <select
              name="grade"
              defaultValue={params.grade}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">全部等級</option>
              <option value="VIP">VIP</option>
              <option value="A">A級</option>
              <option value="B">B級</option>
              <option value="C">C級</option>
              <option value="NEW">新客戶</option>
            </select>
            <select
              name="status"
              defaultValue={params.status}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">全部狀態</option>
              <option value="active">正常</option>
              <option value="inactive">停用</option>
              <option value="suspended">凍結</option>
              <option value="blocked">黑名單</option>
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
                <TableHead>客戶代碼</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead>等級</TableHead>
                <TableHead>聯絡人</TableHead>
                <TableHead className="text-right">信用額度</TableHead>
                <TableHead className="text-right">可用額度</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    尚無客戶資料
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {customer.name}
                        {customer.credit_hold && (
                          <AlertTriangle className="w-4 h-4 text-orange-500 ml-2" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${gradeColors[customer.grade]}`}>
                        {customer.grade}
                      </span>
                    </TableCell>
                    <TableCell>{customer.contact_person || '-'}</TableCell>
                    <TableCell className="text-right">
                      ${customer.credit_limit?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={customer.available_credit < 0 ? 'text-red-600 font-medium' : ''}>
                        ${customer.available_credit?.toLocaleString() || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[customer.status] as any}>
                        {statusLabels[customer.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/customers/${customer.id}`}>
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
