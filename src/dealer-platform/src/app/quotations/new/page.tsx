'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createQuotation } from '@/actions/quotations'
import { formatCurrency } from '@/lib/utils'

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

export default function NewQuotationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [taxRate, setTaxRate] = useState(5)
  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', product_code: '', product_name: '', description: '', unit: 'PCS', quantity: 1, unit_price: 0, discount_percent: 0 },
  ])

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), product_code: '', product_name: '', description: '', unit: 'PCS', quantity: 1, unit_price: 0, discount_percent: 0 },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
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

    setIsLoading(true)
    setError(null)

    const result = await createQuotation(formData, validItems)

    if (result.success) {
      router.push('/quotations')
    } else {
      setError(result.error ?? '建立失敗')
      setIsLoading(false)
    }
  }

  // 計算有效期限預設值（30天後）
  const defaultValidUntil = new Date()
  defaultValidUntil.setDate(defaultValidUntil.getDate() + 30)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/quotations" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">新增報價單</h1>
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
                    <Input name="customer_name" required placeholder="公司或個人名稱" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      聯絡人
                    </label>
                    <Input name="customer_contact" placeholder="聯絡人姓名" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input name="customer_email" type="email" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      電話
                    </label>
                    <Input name="customer_phone" placeholder="電話號碼" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      地址
                    </label>
                    <Input name="customer_address" placeholder="客戶地址" />
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
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      有效期限
                    </label>
                    <Input
                      name="valid_until"
                      type="date"
                      defaultValue={defaultValidUntil.toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      幣別
                    </label>
                    <select
                      name="currency"
                      defaultValue="TWD"
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
                    <Input name="payment_terms" placeholder="例: 月結30天" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      交貨條件
                    </label>
                    <Input name="delivery_terms" placeholder="例: 訂單確認後7天" />
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
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="會顯示在報價單上..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      內部備註
                    </label>
                    <textarea
                      name="internal_notes"
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="僅供內部參考..."
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          建立中...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          建立報價單
                        </>
                      )}
                    </Button>
                    <Link href="/quotations" className="block">
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
