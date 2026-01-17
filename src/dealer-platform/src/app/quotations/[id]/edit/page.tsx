'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuotation, updateQuotation } from '@/actions/quotations'
import { formatCurrency } from '@/lib/utils'
import type { Quotation, QuotationItem } from '@/types'

interface QuoteItem {
  id: string
  product_code: string
  product_name: string
  description: string
  unit: string
  quantity: number
  unit_price: number
  discount_percent: number
}

export default function EditQuotationPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quotation, setQuotation] = useState<(Quotation & { items: QuotationItem[] }) | null>(null)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [taxRate, setTaxRate] = useState(5)
  const [items, setItems] = useState<QuoteItem[]>([])

  useEffect(() => {
    async function fetchData() {
      const result = await getQuotation(id)

      if (result.success && result.data) {
        const q = result.data
        if (q.status !== 'draft') {
          setError('只能編輯草稿狀態的報價單')
        } else {
          setQuotation(q)
          setDiscountPercent(q.discount_percent)
          setTaxRate(q.tax_rate)
          setItems(
            q.items.map((item) => ({
              id: item.id,
              product_code: item.product_code,
              product_name: item.product_name,
              description: item.description ?? '',
              unit: item.unit,
              quantity: item.quantity,
              unit_price: item.unit_price,
              discount_percent: item.discount_percent,
            }))
          )
        }
      } else {
        setError('找不到報價單')
      }

      setIsLoading(false)
    }
    fetchData()
  }, [id])

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), product_code: '', product_name: '', description: '', unit: 'PCS', quantity: 1, unit_price: 0, discount_percent: 0 },
    ])
  }

  const removeItem = (itemId: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== itemId))
    }
  }

  const updateItem = (itemId: string, field: keyof QuoteItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    )
  }

  // 計算金額
  const subtotal = items.reduce((sum, item) => {
    const discountMultiplier = 1 - (item.discount_percent / 100)
    return sum + item.quantity * item.unit_price * discountMultiplier
  }, 0)
  const discountAmount = subtotal * (discountPercent / 100)
  const taxableAmount = subtotal - discountAmount
  const taxAmount = taxableAmount * (taxRate / 100)
  const totalAmount = taxableAmount + taxAmount

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

    const result = await updateQuotation(id, formData, validItems)

    if (result.success) {
      router.push(`/quotations/${id}`)
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

  if (error && !quotation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/quotations">
            <Button>返回報價單列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!quotation) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Link href={`/quotations/${id}`} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">編輯報價單 - {quotation.quote_number}</h1>
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
              {/* 客戶資料 */}
              <Card>
                <CardHeader>
                  <CardTitle>客戶資料</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      客戶名稱 <span className="text-red-500">*</span>
                    </label>
                    <Input name="customer_name" required defaultValue={quotation.customer_name} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      聯絡人
                    </label>
                    <Input name="customer_contact" defaultValue={quotation.customer_contact ?? ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input name="customer_email" type="email" defaultValue={quotation.customer_email ?? ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      電話
                    </label>
                    <Input name="customer_phone" defaultValue={quotation.customer_phone ?? ''} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      地址
                    </label>
                    <Input name="customer_address" defaultValue={quotation.customer_address ?? ''} />
                  </div>
                </CardContent>
              </Card>

              {/* 報價資訊 */}
              <Card>
                <CardHeader>
                  <CardTitle>報價資訊</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      報價日期
                    </label>
                    <Input
                      name="quote_date"
                      type="date"
                      defaultValue={quotation.quote_date}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      有效期限
                    </label>
                    <Input
                      name="valid_until"
                      type="date"
                      defaultValue={quotation.valid_until ?? ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      幣別
                    </label>
                    <select
                      name="currency"
                      defaultValue={quotation.currency}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="TWD">TWD 新台幣</option>
                      <option value="USD">USD 美元</option>
                      <option value="CNY">CNY 人民幣</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      付款條件
                    </label>
                    <Input name="payment_terms" defaultValue={quotation.payment_terms ?? ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      交貨條件
                    </label>
                    <Input name="delivery_terms" defaultValue={quotation.delivery_terms ?? ''} />
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
                        className="p-4 bg-gray-50 rounded-lg space-y-3"
                      >
                        <div className="grid grid-cols-12 gap-2">
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
                          <div className="col-span-4">
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
                          <div className="col-span-5">
                            <label className="block text-xs text-gray-500 mb-1">
                              說明
                            </label>
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                updateItem(item.id, 'description', e.target.value)
                              }
                              placeholder="產品說明"
                            />
                          </div>
                          <div className="col-span-1 flex items-end">
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
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-2">
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
                          <div className="col-span-3">
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
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">
                              折扣 %
                            </label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount_percent}
                              onChange={(e) =>
                                updateItem(item.id, 'discount_percent', parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div className="col-span-3 text-right">
                            <label className="block text-xs text-gray-500 mb-1">
                              小計
                            </label>
                            <p className="font-medium py-2">
                              {formatCurrency(
                                item.quantity * item.unit_price * (1 - item.discount_percent / 100)
                              )}
                            </p>
                          </div>
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
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      給客戶的備註
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={quotation.notes ?? ''}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      內部備註
                    </label>
                    <textarea
                      name="internal_notes"
                      rows={3}
                      defaultValue={quotation.internal_notes ?? ''}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
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

                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">整單折扣</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          name="discount_percent"
                          type="number"
                          min="0"
                          max="100"
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                          className="w-20 text-right"
                        />
                        <span>%</span>
                      </div>
                    </div>
                    {discountAmount > 0 && (
                      <p className="text-right text-sm text-red-500">
                        -{formatCurrency(discountAmount)}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">稅率</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          name="tax_rate"
                          type="number"
                          min="0"
                          max="100"
                          value={taxRate}
                          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                          className="w-20 text-right"
                        />
                        <span>%</span>
                      </div>
                    </div>
                    <p className="text-right text-sm text-gray-500">
                      +{formatCurrency(taxAmount)}
                    </p>
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
                    <Link href={`/quotations/${id}`} className="block">
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
