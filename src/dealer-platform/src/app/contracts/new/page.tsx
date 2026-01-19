'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createContract } from '@/actions/contracts'

interface ContractItem {
  id: string
  product_code: string
  product_name: string
  unit: string
  contracted_price: number
  min_quantity?: number
  max_quantity?: number
  notes?: string
}

export default function NewContractPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<ContractItem[]>([
    { id: '1', product_code: '', product_name: '', unit: '個', contracted_price: 0 },
  ])

  function addItem() {
    setItems([...items, {
      id: Date.now().toString(),
      product_code: '',
      product_name: '',
      unit: '個',
      contracted_price: 0,
    }])
  }

  function removeItem(id: string) {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id))
    }
  }

  function updateItem(id: string, field: keyof ContractItem, value: any) {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await createContract(formData, items.map(i => ({
      product_code: i.product_code,
      product_name: i.product_name,
      unit: i.unit,
      contracted_price: i.contracted_price,
      min_quantity: i.min_quantity,
      max_quantity: i.max_quantity,
      notes: i.notes,
    })))

    if (result.success) {
      router.push('/contracts')
    } else {
      setError(result.error ?? '建立合約失敗')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/contracts" className="mr-4">
              <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </Link>
            <FileText className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">新增合約</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form action={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>基本資料</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  合約標題 <span className="text-red-500">*</span>
                </label>
                <Input name="title" required placeholder="例：2026年度供貨合約" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  合約類型
                </label>
                <select
                  name="contract_type"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="supplier">供應商合約</option>
                  <option value="customer">客戶合約</option>
                  <option value="partner">合作夥伴合約</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  對象類型
                </label>
                <select
                  name="party_type"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="supplier">供應商</option>
                  <option value="customer">客戶</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  對象名稱 <span className="text-red-500">*</span>
                </label>
                <Input name="party_name" required placeholder="請輸入供應商或客戶名稱" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡人
                </label>
                <Input name="party_contact" placeholder="請輸入聯絡人" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡電話
                </label>
                <Input name="party_phone" placeholder="請輸入電話" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input name="party_email" type="email" placeholder="請輸入Email" />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>合約期間</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開始日期 <span className="text-red-500">*</span>
                </label>
                <Input name="start_date" type="date" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  結束日期 <span className="text-red-500">*</span>
                </label>
                <Input name="end_date" type="date" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  到期前提醒天數
                </label>
                <Input name="renewal_notice_days" type="number" defaultValue="30" />
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="auto_renew"
                    value="true"
                    className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                  />
                  自動續約
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  合約金額
                </label>
                <Input name="contract_value" type="number" min="0" placeholder="選填" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  幣別
                </label>
                <select
                  name="currency"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="TWD">TWD</option>
                  <option value="USD">USD</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>約定產品價格</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                新增品項
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-4 bg-gray-50 rounded-lg">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">產品代碼</label>
                    <Input
                      value={item.product_code}
                      onChange={(e) => updateItem(item.id, 'product_code', e.target.value)}
                      placeholder="代碼"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">產品名稱</label>
                    <Input
                      value={item.product_name}
                      onChange={(e) => updateItem(item.id, 'product_name', e.target.value)}
                      placeholder="名稱"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-500 mb-1">單位</label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">約定價格</label>
                    <Input
                      type="number"
                      min="0"
                      value={item.contracted_price}
                      onChange={(e) => updateItem(item.id, 'contracted_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-500 mb-1">最小量</label>
                    <Input
                      type="number"
                      min="0"
                      value={item.min_quantity ?? ''}
                      onChange={(e) => updateItem(item.id, 'min_quantity', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-500 mb-1">最大量</label>
                    <Input
                      type="number"
                      min="0"
                      value={item.max_quantity ?? ''}
                      onChange={(e) => updateItem(item.id, 'max_quantity', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>合約條款</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  付款條件
                </label>
                <textarea
                  name="payment_terms"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder="例：月結30天"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  交貨條件
                </label>
                <textarea
                  name="delivery_terms"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder="例：訂單後7個工作天內出貨"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder="其他備註事項..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Link href="/contracts">
              <Button type="button" variant="outline">
                取消
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              建立合約
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
