'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSuppliers } from '@/actions/suppliers'
import { getPurchaseOrders } from '@/actions/purchase-orders'
import { createDelivery } from '@/actions/deliveries'
import type { Supplier, PurchaseOrder } from '@/types'

interface DeliveryItem {
  id: string
  product_code: string
  product_name: string
  quantity: number
}

export default function NewDeliveryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState('')
  const [items, setItems] = useState<DeliveryItem[]>([
    { id: '1', product_code: '', product_name: '', quantity: 1 },
  ])

  useEffect(() => {
    async function fetchData() {
      const [suppliersResult, ordersResult] = await Promise.all([
        getSuppliers(),
        getPurchaseOrders(),
      ])
      if (suppliersResult.success && suppliersResult.data) {
        setSuppliers(suppliersResult.data)
      }
      if (ordersResult.success && ordersResult.data) {
        setPurchaseOrders(ordersResult.data as PurchaseOrder[])
      }
    }
    fetchData()
  }, [])

  // 過濾對應供應商的採購單
  const filteredOrders = purchaseOrders.filter(
    (order: any) => order.supplier_id === selectedSupplierId &&
    ['approved', 'ordered', 'partial'].includes(order.status)
  )

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), product_code: '', product_name: '', quantity: 1 },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof DeliveryItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  async function handleSubmit(formData: FormData) {
    const validItems = items.filter(
      (item) => item.product_code && item.product_name && item.quantity > 0
    )

    if (validItems.length === 0) {
      setError('請至少新增一個品項')
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await createDelivery(formData, validItems)

    if (result.success) {
      router.push('/deliveries')
    } else {
      setError(result.error ?? '建立失敗')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/deliveries" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">新增交貨記錄</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form action={handleSubmit}>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* 基本資料 */}
            <Card>
              <CardHeader>
                <CardTitle>基本資料</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    供應商 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="supplier_id"
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">請選擇供應商</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.code} - {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    對應採購單 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="po_id"
                    required
                    disabled={!selectedSupplierId}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:bg-gray-100"
                  >
                    <option value="">請選擇採購單</option>
                    {filteredOrders.map((order: any) => (
                      <option key={order.id} value={order.id}>
                        {order.po_number}
                      </option>
                    ))}
                  </select>
                  {selectedSupplierId && filteredOrders.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">此供應商目前無進行中的採購單</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    交貨日期
                  </label>
                  <Input
                    name="delivery_date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    物流商
                  </label>
                  <Input name="carrier" placeholder="例: 黑貓宅急便" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    物流追蹤號
                  </label>
                  <Input name="tracking_number" placeholder="物流追蹤編號" />
                </div>
              </CardContent>
            </Card>

            {/* 品項明細 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>交貨品項</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  新增品項
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 items-end p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="col-span-3">
                        <label className="block text-xs text-gray-500 mb-1">
                          產品代碼
                        </label>
                        <Input
                          value={item.product_code}
                          onChange={(e) =>
                            updateItem(item.id, 'product_code', e.target.value)
                          }
                          placeholder="代碼"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="block text-xs text-gray-500 mb-1">
                          產品名稱
                        </label>
                        <Input
                          value={item.product_name}
                          onChange={(e) =>
                            updateItem(item.id, 'product_name', e.target.value)
                          }
                          placeholder="名稱"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs text-gray-500 mb-1">
                          數量
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 備註 */}
            <Card>
              <CardHeader>
                <CardTitle>備註</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  name="notes"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="其他備註事項..."
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link href="/deliveries">
                <Button type="button" variant="outline">
                  取消
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    建立中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    建立交貨記錄
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
