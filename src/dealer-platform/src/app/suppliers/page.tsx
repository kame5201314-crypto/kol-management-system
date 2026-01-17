import Link from 'next/link'
import { Plus, Search, Filter, Users } from 'lucide-react'
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
import { getSuppliers } from '@/actions/suppliers'

const gradeColors = {
  A: 'bg-green-500',
  B: 'bg-blue-500',
  C: 'bg-yellow-500',
  D: 'bg-red-500',
}

const statusLabels = {
  active: '啟用',
  inactive: '停用',
  blocked: '封鎖',
}

const statusColors = {
  active: 'success',
  inactive: 'secondary',
  blocked: 'destructive',
} as const

export default async function SuppliersPage() {
  const result = await getSuppliers()
  const suppliers = result.success ? result.data ?? [] : []

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
                <Users className="w-6 h-6 mr-2 text-blue-500" />
                供應商管理
              </h1>
            </div>
            <Link href="/suppliers/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新增供應商
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-gray-900">{suppliers.length}</div>
            <div className="text-sm text-gray-500">總供應商數</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-green-600">
              {suppliers.filter(s => s.grade === 'A').length}
            </div>
            <div className="text-sm text-gray-500">A級供應商</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-blue-600">
              {suppliers.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">啟用中</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-red-600">
              {suppliers.filter(s => s.grade === 'D').length}
            </div>
            <div className="text-sm text-gray-500">需關注</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜尋供應商名稱、代碼..."
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
                <TableHead>代碼</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead>聯絡人</TableHead>
                <TableHead>電話</TableHead>
                <TableHead>評等</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    尚無供應商資料，請點擊「新增供應商」開始建立
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.code}</TableCell>
                    <TableCell>
                      <Link
                        href={`/suppliers/${supplier.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {supplier.name}
                      </Link>
                    </TableCell>
                    <TableCell>{supplier.contact_person ?? '-'}</TableCell>
                    <TableCell>{supplier.phone ?? '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${gradeColors[supplier.grade]}`}>
                        {supplier.grade}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[supplier.status]}>
                        {statusLabels[supplier.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/suppliers/${supplier.id}`}>
                        <Button variant="ghost" size="sm">
                          檢視
                        </Button>
                      </Link>
                      <Link href={`/suppliers/${supplier.id}/edit`}>
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
