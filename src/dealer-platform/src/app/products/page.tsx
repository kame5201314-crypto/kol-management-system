import Link from 'next/link'
import { Plus, Package, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getProducts } from '@/actions/products'
import { formatCurrency } from '@/lib/utils'

const statusLabels: Record<string, string> = {
  active: '上架中',
  inactive: '已下架',
  discontinued: '已停產',
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info'> = {
  active: 'success',
  inactive: 'secondary',
  discontinued: 'destructive',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; status?: string }>
}) {
  const params = await searchParams
  const result = await getProducts({
    search: params.search,
    category: params.category,
    status: params.status,
  })
  const products = result.success ? result.data ?? [] : []

  const activeCount = products.filter((p) => p.status === 'active').length
  const inactiveCount = products.filter((p) => p.status === 'inactive').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">產品管理</h1>
            </div>
            <Link href="/products/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新增產品
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">總產品數</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{products.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">上架中</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">已下架</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-500">{inactiveCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* 搜尋列 */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <form className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  name="search"
                  type="text"
                  placeholder="搜尋產品代碼或名稱..."
                  defaultValue={params.search}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                name="status"
                defaultValue={params.status}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">全部狀態</option>
                <option value="active">上架中</option>
                <option value="inactive">已下架</option>
                <option value="discontinued">已停產</option>
              </select>
              <Button type="submit">搜尋</Button>
            </form>
          </CardContent>
        </Card>

        {/* 產品列表 */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>產品代碼</TableHead>
                  <TableHead>產品名稱</TableHead>
                  <TableHead>分類</TableHead>
                  <TableHead className="text-center">單位</TableHead>
                  <TableHead className="text-right">售價</TableHead>
                  <TableHead className="text-right">成本</TableHead>
                  <TableHead className="text-center">狀態</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {params.search ? '找不到符合的產品' : '尚未建立任何產品'}
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.code}</TableCell>
                      <TableCell>
                        <Link
                          href={`/products/${product.id}`}
                          className="text-primary hover:underline"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>{product.category ?? '-'}</TableCell>
                      <TableCell className="text-center">{product.unit}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.list_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.cost_price ? formatCurrency(product.cost_price) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusColors[product.status]}>
                          {statusLabels[product.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/products/${product.id}/edit`}>
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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
