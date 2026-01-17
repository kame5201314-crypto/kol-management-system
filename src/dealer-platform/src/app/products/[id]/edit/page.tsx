'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProduct, updateProduct, deleteProduct } from '@/actions/products'
import type { Product } from '@/types'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      const result = await getProduct(id)
      if (result.success && result.data) {
        setProduct(result.data)
      } else {
        setError('找不到產品資料')
      }
      setIsLoading(false)
    }
    fetchProduct()
  }, [id])

  async function handleSubmit(formData: FormData) {
    setIsSaving(true)
    setError(null)

    const result = await updateProduct(id, formData)

    if (result.success) {
      router.push(`/products/${id}`)
    } else {
      setError(result.error ?? '更新失敗')
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('確定要刪除這個產品嗎？此操作無法復原。')) return

    setIsDeleting(true)
    const result = await deleteProduct(id)

    if (result.success) {
      router.push('/products')
    } else {
      setError(result.error ?? '刪除失敗')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || '找不到產品'}</p>
          <Link href="/products">
            <Button>返回產品列表</Button>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href={`/products/${id}`} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">編輯產品</h1>
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              刪除產品
            </Button>
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
                  <Input name="code" required defaultValue={product.code} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    產品名稱 <span className="text-red-500">*</span>
                  </label>
                  <Input name="name" required defaultValue={product.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分類
                  </label>
                  <Input name="category" defaultValue={product.category ?? ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    單位
                  </label>
                  <select
                    name="unit"
                    defaultValue={product.unit}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="PCS">PCS (個)</option>
                    <option value="SET">SET (組)</option>
                    <option value="BOX">BOX (盒)</option>
                    <option value="KG">KG (公斤)</option>
                    <option value="M">M (公尺)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    狀態
                  </label>
                  <select
                    name="status"
                    defaultValue={product.status}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="active">上架中</option>
                    <option value="inactive">已下架</option>
                    <option value="discontinued">已停產</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    產品描述
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={product.description ?? ''}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                    defaultValue={product.base_price}
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
                    defaultValue={product.cost_price ?? ''}
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
                    defaultValue={product.min_order_qty}
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
                    defaultValue={product.lead_time_days ?? ''}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link href={`/products/${id}`}>
                <Button type="button" variant="outline">
                  取消
                </Button>
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
