'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createProduct } from '@/actions/products'

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await createProduct(formData)

    if (result.success) {
      router.push('/products')
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
            <Link href="/products" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">新增產品</h1>
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
                    產品代碼 <span className="text-red-500">*</span>
                  </label>
                  <Input name="code" required placeholder="例: PRD-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    產品名稱 <span className="text-red-500">*</span>
                  </label>
                  <Input name="name" required placeholder="產品名稱" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分類
                  </label>
                  <Input name="category" placeholder="產品分類" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    單位
                  </label>
                  <select
                    name="unit"
                    defaultValue="PCS"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="PCS">PCS (個)</option>
                    <option value="SET">SET (組)</option>
                    <option value="BOX">BOX (盒)</option>
                    <option value="KG">KG (公斤)</option>
                    <option value="M">M (公尺)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    產品描述
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="產品說明..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* 價格資訊 */}
            <Card>
              <CardHeader>
                <CardTitle>價格資訊</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    售價 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="base_price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    成本價
                  </label>
                  <Input
                    name="cost_price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 其他設定 */}
            <Card>
              <CardHeader>
                <CardTitle>其他設定</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最小訂購量
                  </label>
                  <Input
                    name="min_order_qty"
                    type="number"
                    min="1"
                    defaultValue="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    前置時間 (天)
                  </label>
                  <Input
                    name="lead_time_days"
                    type="number"
                    min="0"
                    placeholder="例: 7"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link href="/products">
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
                    建立產品
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
