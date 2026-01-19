'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createCustomer } from '@/actions/customers'

export default function NewCustomerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await createCustomer(formData)

    if (result.success) {
      router.push('/customers')
    } else {
      setError(result.error ?? '建立客戶失敗')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/customers" className="mr-4">
              <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </Link>
            <Users className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">新增客戶</h1>
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
                  客戶名稱 <span className="text-red-500">*</span>
                </label>
                <Input name="name" required placeholder="請輸入客戶名稱" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  簡稱
                </label>
                <Input name="short_name" placeholder="請輸入簡稱" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  統一編號
                </label>
                <Input name="tax_id" placeholder="請輸入統一編號" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客戶等級
                </label>
                <select
                  name="grade"
                  defaultValue="NEW"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="VIP">VIP</option>
                  <option value="A">A級</option>
                  <option value="B">B級</option>
                  <option value="C">C級</option>
                  <option value="NEW">新客戶</option>
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
                <Input name="contact_person" placeholder="請輸入聯絡人" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話
                </label>
                <Input name="phone" placeholder="請輸入電話" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  手機
                </label>
                <Input name="mobile" placeholder="請輸入手機" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input name="email" type="email" placeholder="請輸入Email" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  地址
                </label>
                <Input name="address" placeholder="請輸入地址" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  帳單地址
                </label>
                <Input name="billing_address" placeholder="請輸入帳單地址" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  出貨地址
                </label>
                <Input name="shipping_address" placeholder="請輸入出貨地址" />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>信用設定</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  信用額度
                </label>
                <Input
                  name="credit_limit"
                  type="number"
                  min="0"
                  defaultValue="0"
                  placeholder="請輸入信用額度"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  付款天數
                </label>
                <Input
                  name="payment_terms"
                  type="number"
                  min="0"
                  defaultValue="30"
                  placeholder="請輸入付款天數"
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
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="請輸入備註..."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Link href="/customers">
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
              建立客戶
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
