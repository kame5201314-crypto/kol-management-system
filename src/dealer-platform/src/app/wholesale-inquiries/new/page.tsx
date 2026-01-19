'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createWholesaleInquiry } from '@/actions/wholesale-inquiries'

interface InquiryItem {
  id: string
  product_code: string
  product_name: string
  requested_quantity: number
  unit: string
  target_price?: number
  notes?: string
}

export default function NewWholesaleInquiryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<InquiryItem[]>([
    { id: '1', product_code: '', product_name: '', requested_quantity: 1, unit: '個' },
  ])

  function addItem() {
    setItems([...items, {
      id: Date.now().toString(),
      product_code: '',
      product_name: '',
      requested_quantity: 1,
      unit: '個',
    }])
  }

  function removeItem(id: string) {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id))
    }
  }

  function updateItem(id: string, field: keyof InquiryItem, value: any) {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await createWholesaleInquiry(formData, items.map(i => ({
      product_code: i.product_code,
      product_name: i.product_name,
      requested_quantity: i.requested_quantity,
      unit: i.unit,
      target_price: i.target_price,
      notes: i.notes,
    })))

    if (result.success) {
      router.push('/wholesale-inquiries')
    } else {
      setError(result.error ?? '建立詢價單失敗')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/wholesale-inquiries" className="mr-4">
              <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </Link>
            <MessageSquare className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">新增批發詢價</h1>
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
              <CardTitle>客戶資訊</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客戶姓名 <span className="text-red-500">*</span>
                </label>
                <Input name="customer_name" required placeholder="請輸入客戶姓名" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  公司名稱
                </label>
                <Input name="customer_company" placeholder="請輸入公司名稱" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡人
                </label>
                <Input name="customer_contact" placeholder="請輸入聯絡人" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input name="customer_email" type="email" required placeholder="請輸入Email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話
                </label>
                <Input name="customer_phone" placeholder="請輸入電話" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客戶等級
                </label>
                <select
                  name="customer_grade"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">未分級</option>
                  <option value="VIP">VIP</option>
                  <option value="A">A級</option>
                  <option value="B">B級</option>
                  <option value="C">C級</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>詢價資訊</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  詢價日期
                </label>
                <Input
                  name="inquiry_date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  期望交貨日
                </label>
                <Input name="expected_delivery_date" type="date" />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>詢價品項</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                新增品項
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-4 bg-gray-50 rounded-lg">
                  <div className="col-span-1 text-center text-sm text-gray-500">
                    {index + 1}
                  </div>
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
                    <label className="block text-xs text-gray-500 mb-1">數量</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.requested_quantity}
                      onChange={(e) => updateItem(item.id, 'requested_quantity', parseInt(e.target.value) || 1)}
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
                    <label className="block text-xs text-gray-500 mb-1">目標價格</label>
                    <Input
                      type="number"
                      min="0"
                      value={item.target_price ?? ''}
                      placeholder="選填"
                      onChange={(e) => updateItem(item.id, 'target_price', e.target.value ? parseFloat(e.target.value) : undefined)}
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
              <CardTitle>備註</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                name="notes"
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="請輸入客戶的其他需求或備註..."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Link href="/wholesale-inquiries">
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
              建立詢價
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
