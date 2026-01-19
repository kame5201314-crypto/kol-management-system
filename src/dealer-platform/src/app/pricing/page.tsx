import Link from 'next/link'
import { DollarSign, Plus, Search, Filter, CheckCircle, XCircle } from 'lucide-react'
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
import { getPricingRules } from '@/actions/pricing'

const ruleTypeLabels: Record<string, string> = {
  customer_grade: '客戶等級',
  quantity: '數量階梯',
  promotion: '促銷活動',
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; active?: string }>
}) {
  const params = await searchParams
  const result = await getPricingRules({
    ruleType: params.type,
    isActive: params.active === 'true' ? true : params.active === 'false' ? false : undefined,
  })
  const rules = result.success ? result.data ?? [] : []

  const stats = {
    total: rules.length,
    active: rules.filter(r => r.is_active).length,
    quantity: rules.filter(r => r.rule_type === 'quantity').length,
    promotion: rules.filter(r => r.rule_type === 'promotion').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 text-primary mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">階梯定價</h1>
            </div>
            <Link href="/pricing/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新增規則
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
            <div className="text-sm text-gray-500">全部規則</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">啟用中</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-blue-600">{stats.quantity}</div>
            <div className="text-sm text-gray-500">數量階梯</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-purple-600">{stats.promotion}</div>
            <div className="text-sm text-gray-500">促銷活動</div>
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
                  placeholder="搜尋規則名稱..."
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
              <option value="customer_grade">客戶等級</option>
              <option value="quantity">數量階梯</option>
              <option value="promotion">促銷活動</option>
            </select>
            <select
              name="active"
              defaultValue={params.active}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">全部狀態</option>
              <option value="true">啟用</option>
              <option value="false">停用</option>
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
                <TableHead>規則名稱</TableHead>
                <TableHead>類型</TableHead>
                <TableHead>優先順序</TableHead>
                <TableHead>折扣</TableHead>
                <TableHead>有效期間</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    尚無價格規則
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ruleTypeLabels[rule.rule_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      {rule.discount_percent
                        ? `${rule.discount_percent}%`
                        : rule.discount_amount
                        ? `$${rule.discount_amount}`
                        : rule.fixed_price
                        ? `固定 $${rule.fixed_price}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {rule.valid_from && rule.valid_until
                        ? `${rule.valid_from} ~ ${rule.valid_until}`
                        : rule.valid_from
                        ? `${rule.valid_from} 起`
                        : rule.valid_until
                        ? `至 ${rule.valid_until}`
                        : '無限期'}
                    </TableCell>
                    <TableCell>
                      {rule.is_active ? (
                        <Badge variant="success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          啟用
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="w-3 h-3 mr-1" />
                          停用
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/pricing/${rule.id}`}>
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
