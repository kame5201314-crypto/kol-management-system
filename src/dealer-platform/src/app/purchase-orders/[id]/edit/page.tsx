'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSuppliers } from '@/actions/suppliers'
import { getPurchaseOrder, updatePurchaseOrder } from '@/actions/purchase-orders'
import { formatCurrency } from '@/lib/utils'
import type { Supplier, PurchaseOrder, PurchaseOrderItem } from '@/types'

interface POItem {
  id: string
  product_code: string
  product_name: string
  unit: string
  quantity: number
  unit_price: number
}

export default function EditPurchaseOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [order, setOrder] = useState<(PurchaseOrder & { items: PurchaseOrderItem[] }) | null>(null)
  const [items, setItems] = useState<POItem[]>([])

  useEffect(() => {
    async function fetchData() {
      const [suppliersResult, orderResult] = await Promise.all([
        getSuppliers(),
        getPurchaseOrder(id),
      ])

      if (suppliersResult.success && suppliersResult.data) {
        setSuppliers(suppliersResult.data)
      }

      if (orderResult.success && orderResult.data) {
        const po = orderResult.data
        if (po.status !== 'draft') {
          setError('只能編輯草稿狀態的採購單')
        } else {
          setOrder(po)
          setItems(
            po.items.map((item) => ({
              id: item.id,
              product_code: item.product_code,
              product_name: item.product_name,
              unit: item.unit,
              quantity: item.quantity,
              unit_price: item.unit_price,
            }))
          )
        }
      } else {
        setError('找不到採購單')
      }

      setIsLoading(false)
    }
    fetchData()
  }, [id])

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), product_code: '', product_name: '', unit: 'PCS', quantity: 1, unit_price: 0 },
    ])
  }

  const removeItem = (itemId: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== itemId))
    }
  }

  const updateItem = (itemId: string, field: keyof POItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    )
  }

  // 計算金額
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  const taxAmount = subtotal * 0.05
  const totalAmount = subtotal + taxAmount

  async function handleSubmit(formData: FormData) {
    const validItems = items.filter(
      (item) => item.product_code && item.product_name && item.quantity > 0
    )

    if (validItems.length === 0) {
      setError('請至少新增一個品項')
      return
    }

    setIsSaving(true)
    setError(null)

    const result = await updatePurchaseOrder(id, formData, validItems)

    if (result.success) {
      router.push(`/purchase-orders/${id}`)
    } else {
      setError(result.error ?? '更新失敗')
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/purchase-orders">
            <Button>返回採購單列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Link href={`/purchase-orders/${id}`} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">編輯採購單 - {order.po_number}</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form action={handleSubmit}>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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
                      defaultValue={order.supplier_id}
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
                      訂單日期
                    </label>
                    <Input
                      name="order_date"
                      type="date"
                      defaultValue={order.order_date}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      預計交貨日
                    </label>
                    <Input
                      name="expected_date"
                      type="date"
                      defaultValue={order.expected_date ?? ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      幣別
                    </label>
                    <select
                      name="currency"
                      defaultValue={order.currency}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="TWD">TWD 新台幣</option>
                      <option value="USD">USD 美元</option>
                      <option value="CNY">CNY 人民幣</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      付款條件 (天)
                    </label>
                    <Input
                      name="payment_terms"
                      type="number"
                      min="0"
                      defaultValue={order.payment_terms}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      送貨地址
                    </label>
                    <Input
                      name="shipping_address"
                      defaultValue={order.shipping_address ?? ''}
                      placeholder="送貨地址"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 品項明細 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>品項明細</CardTitle>
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
                        <div className="col-span-2">
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
                        <div className="col-span-3">
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
                        <div className="col-span-1">
                          <label className="block text-xs text-gray-500 mb-1">
                            單位
                          </label>
                          <Input
                            value={item.unit}
                            onChange={(e) =>
                              updateItem(item.id, 'unit', e.target.value)
                            }
                          />
                        </div>
                        <div className="col-span-2">
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
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">
                            單價
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) =>
                              updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          <label className="block text-xs text-gray-500 mb-1">
                            小計
                          </label>
                          <p className="font-medium py-2 text-sm">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </p>
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
                    defaultValue={order.notes ?? ''}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="其他備註事項..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* 金額摘要 */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>金額摘要</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">小計</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">稅額 (5%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>總計</span>
                      <span className="text-primary">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button type="submit" className="w-full" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          儲存中...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          儲存變更
                        </>
                      )}
                    </Button>
                    <Link href={`/purchase-orders/${id}`} className="block">
                      <Button type="button" variant="outline" className="w-full">
                        取消
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
