'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createSupplier } from '@/actions/suppliers'

export default function NewSupplierPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await createSupplier(formData)

    if (result.success) {
      router.push('/suppliers')
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
            <Link href="/suppliers" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">新增供應商</h1>
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
                    供應商代碼 <span className="text-red-500">*</span>
                  </label>
                  <Input name="code" required placeholder="例: SUP001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    供應商名稱 <span className="text-red-500">*</span>
                  </label>
                  <Input name="name" required placeholder="公司全名" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    簡稱
                  </label>
                  <Input name="short_name" placeholder="公司簡稱" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    統一編號
                  </label>
                  <Input name="tax_id" placeholder="8位數字" />
                </div>
              </CardContent>
            </Card>

            {/* 聯絡資訊 */}
            <Card>
              <CardHeader>
                <CardTitle>聯絡資訊</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    聯絡人
                  </label>
                  <Input name="contact_person" placeholder="聯絡人姓名" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話
                  </label>
                  <Input name="phone" placeholder="公司電話" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    手機
                  </label>
                  <Input name="mobile" placeholder="手機號碼" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    傳真
                  </label>
                  <Input name="fax" placeholder="傳真號碼" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input name="email" type="email" placeholder="電子郵件" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地址
                  </label>
                  <Input name="address" placeholder="公司地址" />
                </div>
              </CardContent>
            </Card>

            {/* 交易條件 */}
            <Card>
              <CardHeader>
                <CardTitle>交易條件</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    付款條件（天）
                  </label>
                  <Input
                    name="payment_terms"
                    type="number"
                    defaultValue="30"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    交易幣別
                  </label>
                  <select
                    name="currency"
                    defaultValue="TWD"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="TWD">TWD 新台幣</option>
                    <option value="USD">USD 美元</option>
                    <option value="CNY">CNY 人民幣</option>
                    <option value="JPY">JPY 日圓</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    備註
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="其他備註事項..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link href="/suppliers">
                <Button type="button" variant="outline">
                  取消
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    儲存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    儲存
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
