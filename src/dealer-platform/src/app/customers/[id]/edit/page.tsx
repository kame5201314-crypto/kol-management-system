'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCustomer, updateCustomer } from '@/actions/customers'
import type { Customer } from '@/types'

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerId, setCustomerId] = useState<string>('')

  useEffect(() => {
    async function fetchData() {
      const { id } = await params
      setCustomerId(id)
      const result = await getCustomer(id)
      if (result.success && result.data) {
        setCustomer(result.data)
      } else {
        setError('找不到客戶資料')
      }
      setIsFetching(false)
    }
    fetchData()
  }, [params])

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await updateCustomer(customerId, formData)

    if (result.success) {
      router.push(`/customers/${customerId}`)
    } else {
      setError(result.error ?? '更新客戶失敗')
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

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || '找不到客戶資料'}</p>
          <Link href="/customers">
            <Button>返回客戶列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href={`/customers/${customerId}`} className="mr-4">
              <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </Link>
            <Users className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">
              編輯客戶 - {customer.name}
            </h1>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客戶代碼
                </label>
                <Input value={customer.code} disabled className="bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客戶名稱 <span className="text-red-500">*</span>
                </label>
                <Input name="name" required defaultValue={customer.name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  簡稱
                </label>
                <Input name="short_name" defaultValue={customer.short_name || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  統一編號
                </label>
                <Input name="tax_id" defaultValue={customer.tax_id || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客戶等級
                </label>
                <select
                  name="grade"
                  defaultValue={customer.grade}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="VIP">VIP</option>
                  <option value="A">A級</option>
                  <option value="B">B級</option>
                  <option value="C">C級</option>
                  <option value="NEW">新客戶</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  狀態
                </label>
                <select
                  name="status"
                  defaultValue={customer.status}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="active">正常</option>
                  <option value="inactive">停用</option>
                  <option value="suspended">凍結</option>
                  <option value="blocked">黑名單</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>聯絡資訊</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡人
                </label>
                <Input name="contact_person" defaultValue={customer.contact_person || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話
                </label>
                <Input name="phone" defaultValue={customer.phone || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  手機
                </label>
                <Input name="mobile" defaultValue={customer.mobile || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input name="email" type="email" defaultValue={customer.email || ''} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  地址
                </label>
                <Input name="address" defaultValue={customer.address || ''} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  帳單地址
                </label>
                <Input name="billing_address" defaultValue={customer.billing_address || ''} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  出貨地址
                </label>
                <Input name="shipping_address" defaultValue={customer.shipping_address || ''} />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>付款設定</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  付款天數
                </label>
                <Input
                  name="payment_terms"
                  type="number"
                  min="0"
                  defaultValue={customer.payment_terms}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  信用額度（請至詳情頁調整）
                </label>
                <Input
                  value={`$${customer.credit_limit?.toLocaleString()}`}
                  disabled
                  className="bg-gray-100"
                />
              </div>
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
                defaultValue={customer.notes || ''}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Link href={`/customers/${customerId}`}>
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
              儲存變更
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
