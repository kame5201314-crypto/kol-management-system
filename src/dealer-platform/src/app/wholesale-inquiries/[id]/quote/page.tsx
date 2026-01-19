'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getWholesaleInquiry, submitQuoteResponse } from '@/actions/wholesale-inquiries'

interface QuoteItem {
  id: string
  line_number: number
  product_code: string
  product_name: string
  requested_quantity: number
  unit: string
  target_price: number | null
  quoted_unit_price: number
  quoted_amount: number
}

export default function QuoteResponsePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [inquiryId, setInquiryId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inquiry, setInquiry] = useState<any>(null)
  const [items, setItems] = useState<QuoteItem[]>([])
  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function loadData() {
      const { id } = await params
      setInquiryId(id)

      const result = await getWholesaleInquiry(id)
      if (result.success && result.data) {
        setInquiry(result.data)
        setItems(result.data.items?.map((item: any) => ({
          id: item.id,
          line_number: item.line_number,
          product_code: item.product_code,
          product_name: item.product_name,
          requested_quantity: item.requested_quantity,
          unit: item.unit,
          target_price: item.target_price,
          quoted_unit_price: item.target_price || 0,
          quoted_amount: (item.target_price || 0) * item.requested_quantity,
        })) || [])

        // 預設報價有效期為 14 天
        const defaultValidDate = new Date()
        defaultValidDate.setDate(defaultValidDate.getDate() + 14)
        setValidUntil(defaultValidDate.toISOString().split('T')[0])
      } else {
        setError(result.error || '載入詢價單失敗')
      }
      setIsLoading(false)
    }
    loadData()
  }, [params])

  function updateItemPrice(itemId: string, unitPrice: number) {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quoted_unit_price: unitPrice,
          quoted_amount: unitPrice * item.requested_quantity,
        }
      }
      return item
    }))
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quoted_amount, 0)

  async function handleSubmit() {
    setIsSubmitting(true)
    setError(null)

    // Create FormData object
    const formData = new FormData()
    formData.set('valid_until', validUntil)
    formData.set('notes', notes)
    formData.set('quoted_amount', totalAmount.toString())

    const result = await submitQuoteResponse(
      inquiryId,
      formData,
      items.map(item => ({
        item_id: item.id,
        quoted_unit_price: item.quoted_unit_price,
      }))
    )

    if (result.success) {
      router.push(`/wholesale-inquiries/${inquiryId}`)
    } else {
      setError(result.error || '提交報價失敗')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">找不到詢價單</p>
          <Link href="/wholesale-inquiries">
            <Button>返回列表</Button>
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
            <Link href={`/wholesale-inquiries/${inquiryId}`} className="mr-4">
              <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </Link>
            <Calculator className="w-6 h-6 text-primary mr-2" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">填寫報價</h1>
              <p className="text-sm text-gray-500">{inquiry.inquiry_number}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 客戶資訊 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>客戶資訊</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">客戶名稱</div>
              <div className="font-medium">{inquiry.customer_name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">公司</div>
              <div className="font-medium">{inquiry.customer_company || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium">{inquiry.customer_email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">客戶等級</div>
              <div className="font-medium">{inquiry.customer_grade || '未分級'}</div>
            </div>
          </CardContent>
        </Card>

        {/* 報價品項 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>報價品項</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>產品代碼</TableHead>
                  <TableHead>產品名稱</TableHead>
                  <TableHead className="text-right">數量</TableHead>
                  <TableHead>單位</TableHead>
                  <TableHead className="text-right">目標價格</TableHead>
                  <TableHead className="text-right w-32">報價單價</TableHead>
                  <TableHead className="text-right">報價金額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-gray-500">{item.line_number}</TableCell>
                    <TableCell className="font-medium">{item.product_code}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell className="text-right">{item.requested_quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right text-gray-500">
                      {item.target_price ? `$${item.target_price.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quoted_unit_price}
                        onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                        className="w-28 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.quoted_amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4 pt-4 border-t">
              <div className="text-right">
                <div className="text-sm text-gray-500">報價總金額</div>
                <div className="text-2xl font-bold text-primary">
                  ${totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 報價設定 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>報價設定</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                報價有效期限 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備註說明
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="可以說明報價條件、交貨時間等資訊..."
              />
            </div>
          </CardContent>
        </Card>

        {/* 操作按鈕 */}
        <div className="flex justify-end space-x-4">
          <Link href={`/wholesale-inquiries/${inquiryId}`}>
            <Button type="button" variant="outline">
              取消
            </Button>
          </Link>
          <Button onClick={handleSubmit} disabled={isSubmitting || totalAmount <= 0}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            送出報價
          </Button>
        </div>
      </main>
    </div>
  )
}
