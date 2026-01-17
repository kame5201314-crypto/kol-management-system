'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Search,
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Minus,
  RefreshCw,
  Filter,
  Download,
} from 'lucide-react'
import { formatNumber, formatDateTime } from '@/lib/utils'

interface InventoryItem {
  id: string
  sku: string
  productName: string
  variantName: string | null
  totalStock: number
  reservedStock: number
  availableStock: number
  lowStockThreshold: number
  warehouseLocation: string
  lastUpdated: string
}

// Initial mock data
const initialInventoryItems: InventoryItem[] = [
  {
    id: '1',
    sku: 'TSH-WHT-001-S',
    productName: '經典白色T恤',
    variantName: 'S',
    totalStock: 50,
    reservedStock: 5,
    availableStock: 45,
    lowStockThreshold: 10,
    warehouseLocation: 'A-01-01',
    lastUpdated: '2026-01-17T10:30:00Z',
  },
  {
    id: '2',
    sku: 'TSH-WHT-001-M',
    productName: '經典白色T恤',
    variantName: 'M',
    totalStock: 80,
    reservedStock: 12,
    availableStock: 68,
    lowStockThreshold: 10,
    warehouseLocation: 'A-01-02',
    lastUpdated: '2026-01-17T10:30:00Z',
  },
  {
    id: '3',
    sku: 'TSH-WHT-001-L',
    productName: '經典白色T恤',
    variantName: 'L',
    totalStock: 8,
    reservedStock: 3,
    availableStock: 5,
    lowStockThreshold: 10,
    warehouseLocation: 'A-01-03',
    lastUpdated: '2026-01-17T09:15:00Z',
  },
  {
    id: '4',
    sku: 'JNS-BLU-001-32',
    productName: '牛仔休閒褲',
    variantName: '32腰',
    totalStock: 3,
    reservedStock: 1,
    availableStock: 2,
    lowStockThreshold: 10,
    warehouseLocation: 'B-02-05',
    lastUpdated: '2026-01-17T08:00:00Z',
  },
  {
    id: '5',
    sku: 'SHO-RUN-001-42',
    productName: '運動慢跑鞋',
    variantName: '42號',
    totalStock: 0,
    reservedStock: 0,
    availableStock: 0,
    lowStockThreshold: 5,
    warehouseLocation: 'C-03-01',
    lastUpdated: '2026-01-16T14:20:00Z',
  },
]

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'set'>('add')
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('')
  const [adjustmentNotes, setAdjustmentNotes] = useState('')

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase())

    if (filter === 'low') {
      return matchesSearch && item.availableStock <= item.lowStockThreshold && item.availableStock > 0
    }
    if (filter === 'out') {
      return matchesSearch && item.availableStock === 0
    }
    return matchesSearch
  })

  const stats = {
    totalItems: inventoryItems.length,
    totalStock: inventoryItems.reduce((sum, i) => sum + i.totalStock, 0),
    lowStockItems: inventoryItems.filter((i) => i.availableStock <= i.lowStockThreshold && i.availableStock > 0).length,
    outOfStockItems: inventoryItems.filter((i) => i.availableStock === 0).length,
  }

  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItem(item)
    setAdjustmentType('add')
    setAdjustmentQuantity('')
    setAdjustmentNotes('')
    setIsAdjustOpen(true)
  }

  const handleAdjustSubmit = async () => {
    if (!selectedItem || !adjustmentQuantity) return

    const quantity = parseInt(adjustmentQuantity)
    const newStock = adjustmentType === 'add'
      ? selectedItem.availableStock + quantity
      : selectedItem.availableStock - quantity

    // Update local state (in production, call API)
    setInventoryItems(prev =>
      prev.map(item =>
        item.id === selectedItem.id
          ? { ...item, availableStock: Math.max(0, newStock) }
          : item
      )
    )
    setIsAdjustOpen(false)
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.availableStock === 0) {
      return { label: '缺貨', variant: 'destructive' as const }
    }
    if (item.availableStock <= item.lowStockThreshold) {
      return { label: '低庫存', variant: 'warning' as const }
    }
    return { label: '正常', variant: 'success' as const }
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="庫存管理"
        description="管理商品庫存，設定低庫存預警"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總品項</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalItems)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總庫存數</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalStock)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">低庫存</CardTitle>
              <TrendingDown className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.lowStockItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">缺貨</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.outOfStockItems}</div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜尋 SKU 或商品名稱..."
                className="w-80 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={(value: typeof filter) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="low">低庫存</SelectItem>
                <SelectItem value="out">缺貨</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              同步庫存
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              匯出
            </Button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>倉位</TableHead>
                <TableHead className="text-right">總庫存</TableHead>
                <TableHead className="text-right">保留</TableHead>
                <TableHead className="text-right">可用</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>更新時間</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    沒有找到庫存項目
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const status = getStockStatus(item)
                  const stockPercentage = (item.availableStock / item.lowStockThreshold) * 100
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          {item.variantName && (
                            <p className="text-sm text-muted-foreground">{item.variantName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell>{item.warehouseLocation}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.totalStock)}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.reservedStock)}</TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <span className="font-medium">{formatNumber(item.availableStock)}</span>
                          <Progress
                            value={Math.min(stockPercentage, 100)}
                            className="h-1.5 w-16"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(item.lastUpdated)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAdjust(item)}
                        >
                          調整
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Adjust Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>調整庫存</DialogTitle>
            <DialogDescription>
              {selectedItem && (
                <>
                  {selectedItem.productName}
                  {selectedItem.variantName && ` - ${selectedItem.variantName}`}
                  <br />
                  目前可用庫存：{selectedItem.availableStock}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>調整類型</Label>
              <Select value={adjustmentType} onValueChange={(value: typeof adjustmentType) => setAdjustmentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">
                    <div className="flex items-center">
                      <Plus className="mr-2 h-4 w-4 text-green-500" />
                      增加庫存
                    </div>
                  </SelectItem>
                  <SelectItem value="remove">
                    <div className="flex items-center">
                      <Minus className="mr-2 h-4 w-4 text-red-500" />
                      減少庫存
                    </div>
                  </SelectItem>
                  <SelectItem value="set">
                    <div className="flex items-center">
                      <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />
                      設定庫存
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>數量</Label>
              <Input
                type="number"
                min="0"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                placeholder="輸入數量"
              />
            </div>
            <div className="space-y-2">
              <Label>備註</Label>
              <Textarea
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                placeholder="輸入調整原因..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAdjustSubmit} disabled={!adjustmentQuantity}>
              確認調整
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
