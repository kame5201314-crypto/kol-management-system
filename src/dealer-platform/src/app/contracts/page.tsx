import Link from 'next/link'
import { FileText, Plus, Search, Filter, AlertTriangle } from 'lucide-react'
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
import { getContracts, getExpiringContracts } from '@/actions/contracts'

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
  supplier: '供應商',
  customer: '客戶',
  partner: '合作夥伴',
}

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; status?: string }>
}) {
  const params = await searchParams
  const result = await getContracts({
    contractType: params.type,
    status: params.status,
    search: params.search,
  })
  const contracts = result.success ? result.data ?? [] : []

  // 取得即將到期合約
  const expiringResult = await getExpiringContracts(30)
  const expiringCount = expiringResult.success ? expiringResult.data?.length ?? 0 : 0

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    expiring: expiringCount,
    totalValue: contracts
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.contract_value || 0), 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-primary mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">合約管理</h1>
            </div>
            <div className="flex items-center space-x-2">
              {expiringCount > 0 && (
                <Link href="/contracts/expiring">
                  <Button variant="outline" className="text-orange-600 border-orange-600">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {expiringCount} 即將到期
                  </Button>
                </Link>
              )}
              <Link href="/contracts/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  新增合約
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">全部合約</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">生效中</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-orange-600">{stats.expiring}</div>
            <div className="text-sm text-gray-500">即將到期</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-blue-600">
              ${stats.totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">合約總金額</div>
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
                  placeholder="搜尋合約編號、標題..."
                  className="pl-10"
                  defaultValue={params.search}
                />
              </div>
            </div>
            <select
              name="type"
              defaultValue={params.type}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">全部類型</option>
              <option value="supplier">供應商</option>
              <option value="customer">客戶</option>
              <option value="partner">合作夥伴</option>
            </select>
            <select
              name="status"
              defaultValue={params.status}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">全部狀態</option>
              <option value="draft">草稿</option>
              <option value="pending">待核准</option>
              <option value="active">生效中</option>
              <option value="expired">已到期</option>
              <option value="terminated">已終止</option>
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
                <TableHead>合約編號</TableHead>
                <TableHead>標題</TableHead>
                <TableHead>類型</TableHead>
                <TableHead>對象</TableHead>
                <TableHead>有效期間</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    尚無合約資料
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => {
                  // 檢查是否即將到期
                  const endDate = new Date(contract.end_date)
                  const today = new Date()
                  const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  const isExpiring = contract.status === 'active' && daysUntilExpiry <= 30 && daysUntilExpiry > 0

                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.contract_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {contract.title}
                          {isExpiring && (
                            <AlertTriangle className="w-4 h-4 text-orange-500 ml-2" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {typeLabels[contract.contract_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{contract.party_name}</TableCell>
                      <TableCell>
                        {contract.start_date} ~ {contract.end_date}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[contract.status] as any}>
                          {statusLabels[contract.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/contracts/${contract.id}`}>
                          <Button variant="ghost" size="sm">
                            查看
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
