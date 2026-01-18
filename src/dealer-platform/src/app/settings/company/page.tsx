'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function CompanySettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSaving(true)
    // TODO: Implement save logic
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/settings" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">公司資訊</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form action={handleSubmit}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本資訊</CardTitle>
                <CardDescription>設定公司的基本資料</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公司名稱 <span className="text-red-500">*</span>
                  </label>
                  <Input name="company_name" required placeholder="請輸入公司名稱" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    統一編號
                  </label>
                  <Input name="tax_id" placeholder="12345678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話
                  </label>
                  <Input name="phone" type="tel" placeholder="02-1234-5678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    傳真
                  </label>
                  <Input name="fax" type="tel" placeholder="02-1234-5679" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公司地址
                  </label>
                  <Input name="address" placeholder="請輸入公司地址" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電子郵件
                  </label>
                  <Input name="email" type="email" placeholder="contact@company.com" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>品牌設定</CardTitle>
                <CardDescription>設定公司的 Logo 與品牌顏色</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公司 Logo
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Building className="w-8 h-8 text-gray-400" />
                    </div>
                    <Button type="button" variant="outline">
                      上傳 Logo
                    </Button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">建議尺寸: 200x200px, PNG 或 JPG 格式</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    品牌主色
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input name="brand_color" type="color" defaultValue="#3B82F6" className="w-12 h-9 p-1" />
                    <Input name="brand_color_hex" defaultValue="#3B82F6" className="w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Link href="/settings">
                <Button type="button" variant="outline">取消</Button>
              </Link>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    儲存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    儲存設定
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
