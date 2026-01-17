'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSupplier, updateSupplier } from '@/actions/suppliers'
import type { Supplier } from '@/types'

export default function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [supplierId, setSupplierId] = useState<string>('')

  useEffect(() => {
    async function fetchSupplier() {
      const { id } = await params
      setSupplierId(id)
      const result = await getSupplier(id)
      if (result.success && result.data) {
        setSupplier(result.data)
      } else {
        setError('找不到供應商資料')
      }
      setIsFetching(false)
    }
    fetchSupplier()
  }, [params])

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await updateSupplier(supplierId, formData)

    if (result.success) {
      router.push(`/suppliers/${supplierId}`)
    } else {
      setError(result.error ?? '更新失敗')
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error ?? '找不到供應商'}</p>
          <Link href="/suppliers">
            <Button>返回列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Link href={`/suppliers/${supplierId}`} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">編輯供應商</h1>
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
                    供應商代碼
                  </label>
                  <Input value={supplier.code} disabled className="bg-gray-100" />
                  <p className="text-xs text-gray-500 mt-1">代碼建立後無法修改</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    供應商名稱 <span className="text-red-500">*</span>
                  </label>
                  <Input name="name" required defaultValue={supplier.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    簡稱
                  </label>
                  <Input name="short_name" defaultValue={supplier.short_name ?? ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    統一編號
                  </label>
                  <Input name="tax_id" defaultValue={supplier.tax_id ?? ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    狀態
                  </label>
                  <select
                    name="status"
                    defaultValue={supplier.status}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="active">啟用</option>
                    <option value="inactive">停用</option>
                    <option value="blocked">封鎖</option>
                  </select>
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
                  <Input name="contact_person" defaultValue={supplier.contact_person ?? ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話
                  </label>
                  <Input name="phone" defaultValue={supplier.phone ?? ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    手機
                  </label>
                  <Input name="mobile" defaultValue={supplier.mobile ?? ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    傳真
                  </label>
                  <Input name="fax" defaultValue={supplier.fax ?? ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input name="email" type="email" defaultValue={supplier.email ?? ''} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地址
                  </label>
                  <Input name="address" defaultValue={supplier.address ?? ''} />
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
                    defaultValue={supplier.payment_terms}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    交易幣別
                  </label>
                  <select
                    name="currency"
                    defaultValue={supplier.currency}
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
                    defaultValue={supplier.notes ?? ''}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link href={`/suppliers/${supplierId}`}>
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
                    儲存變更
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
