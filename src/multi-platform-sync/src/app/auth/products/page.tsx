'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  Upload,
  Download,
  Filter,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getProducts, createProduct, deleteProduct, syncProductToPlatforms } from '@/actions/products'
import type { Product } from '@/types'
import { PLATFORMS } from '@/config/constants'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    const result = await getProducts()
    if (result.success && result.data) {
      setProducts(result.data)
    }
    setLoading(false)
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((p) => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    }
  }

  const handleCreateProduct = async (formData: FormData) => {
    const result = await createProduct(formData)
    if (result.success) {
      setIsCreateDialogOpen(false)
      loadProducts()
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('確定要刪除此商品嗎？')) {
      const result = await deleteProduct(productId)
      if (result.success) {
        loadProducts()
      }
    }
  }

  const handleSyncProducts = async () => {
    if (selectedProducts.length === 0 || selectedPlatforms.length === 0) return

    for (const productId of selectedProducts) {
      await syncProductToPlatforms(productId, selectedPlatforms)
    }

    setIsSyncDialogOpen(false)
    setSelectedProducts([])
    setSelectedPlatforms([])
  }

  const getTotalStock = (product: Product) => {
    return product.variants.reduce((sum, v) => sum + v.stock, 0)
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="商品管理"
        description="管理您的商品資料，一鍵同步到多個平台"
      />

      <div className="flex-1 space-y-4 p-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜尋商品名稱或 SKU..."
                className="w-80 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              篩選
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {selectedProducts.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSyncDialogOpen(true)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  同步選中 ({selectedProducts.length})
                </Button>
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  刪除選中
                </Button>
              </>
            )}
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              匯入
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              匯出
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  新增商品
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form action={handleCreateProduct}>
                  <DialogHeader>
                    <DialogTitle>新增商品</DialogTitle>
                    <DialogDescription>
                      填寫商品基本資料
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">商品名稱 *</Label>
                        <Input id="name" name="name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU *</Label>
                        <Input id="sku" name="sku" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">商品描述</Label>
                      <Textarea id="description" name="description" rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="base_price">售價</Label>
                        <Input id="base_price" name="base_price" type="number" min="0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost_price">成本價</Label>
                        <Input id="cost_price" name="cost_price" type="number" min="0" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button type="submit">建立商品</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>商品</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">售價</TableHead>
                <TableHead className="text-right">庫存</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>更新時間</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    載入中...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    沒有找到商品
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) =>
                          handleSelectProduct(product.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-muted" />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.brand || '無品牌'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.base_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {getTotalStock(product)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'success' : 'secondary'}>
                        {product.is_active ? '上架中' : '已下架'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(product.updated_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/auth/products/${product.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              編輯
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProducts([product.id])
                              setIsSyncDialogOpen(true)
                            }}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            同步到平台
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            刪除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sync Dialog */}
      <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>同步到平台</DialogTitle>
            <DialogDescription>
              選擇要同步的平台，已選擇 {selectedProducts.length} 個商品
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {Object.entries(PLATFORMS).map(([key, platform]) => (
              <div key={key} className="flex items-center space-x-3">
                <Checkbox
                  id={key}
                  checked={selectedPlatforms.includes(key)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPlatforms([...selectedPlatforms, key])
                    } else {
                      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== key))
                    }
                  }}
                />
                <div
                  className="h-6 w-6 rounded"
                  style={{ backgroundColor: platform.color }}
                />
                <Label htmlFor={key}>{platform.displayName}</Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSyncDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSyncProducts}
              disabled={selectedPlatforms.length === 0}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              開始同步
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
