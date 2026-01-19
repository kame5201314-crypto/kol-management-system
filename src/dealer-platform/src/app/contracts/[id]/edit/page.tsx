'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getContract, updateContract } from '@/actions/contracts'

interface ContractItem {
  id: string
  product_code: string
  product_name: string
  unit: string
  contracted_price: number
  min_quantity?: number
  max_quantity?: number
}

export default function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [contractId, setContractId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    contract_type: 'supplier',
    party_type: 'supplier',
    party_name: '',
    party_contact: '',
    party_phone: '',
    party_email: '',
    start_date: '',
    end_date: '',
    renewal_notice_days: 30,
    auto_renew: false,
    contract_value: '',
    currency: 'TWD',
    payment_terms: '',
    delivery_terms: '',
    warranty_terms: '',
    notes: '',
  })

  const [items, setItems] = useState<ContractItem[]>([])

  useEffect(() => {
    async function loadData() {
      const { id } = await params
      setContractId(id)

      const result = await getContract(id)
      if (result.success && result.data) {
        const contract = result.data
        setFormData({
          title: contract.title,
          contract_type: contract.contract_type,
          party_type: contract.party_type,
          party_name: contract.party_name,
          party_contact: contract.party_contact || '',
          party_phone: contract.party_phone || '',
          party_email: contract.party_email || '',
          start_date: contract.start_date,
          end_date: contract.end_date,
          renewal_notice_days: contract.renewal_notice_days,
          auto_renew: contract.auto_renew,
          contract_value: contract.contract_value?.toString() || '',
          currency: contract.currency,
          payment_terms: contract.payment_terms || '',
          delivery_terms: contract.delivery_terms || '',
          warranty_terms: contract.warranty_terms || '',
          notes: contract.notes || '',
        })

        if (contract.items && contract.items.length > 0) {
          setItems(contract.items.map((item: any) => ({
            id: item.id,
            product_code: item.product_code,
            product_name: item.product_name,
            unit: item.unit,
            contracted_price: item.contracted_price,
            min_quantity: item.min_quantity,
            max_quantity: item.max_quantity,
          })))
        }
      } else {
        setError(result.error || '載入合約失敗')
      }
      setIsLoading(false)
    }
    loadData()
  }, [params])

  function addItem() {
    setItems([...items, {
      id: `new-${Date.now()}`,
      product_code: '',
      product_name: '',
      unit: '個',
      contracted_price: 0,
    }])
  }

  function removeItem(id: string) {
    if (items.length > 0) {
      setItems(items.filter(i => i.id !== id))
    }
  }

  function updateItem(id: string, field: keyof ContractItem, value: any) {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const itemData = items.map(i => ({
      product_code: i.product_code,
      product_name: i.product_name,
      unit: i.unit,
      contracted_price: i.contracted_price,
      min_quantity: i.min_quantity,
      max_quantity: i.max_quantity,
    }))

    // Create FormData object
    const submitData = new FormData()
    submitData.set('title', formData.title)
    submitData.set('contract_type', formData.contract_type)
    submitData.set('party_type', formData.party_type)
    submitData.set('party_name', formData.party_name)
    submitData.set('party_contact', formData.party_contact)
    submitData.set('party_phone', formData.party_phone)
    submitData.set('party_email', formData.party_email)
    submitData.set('start_date', formData.start_date)
    submitData.set('end_date', formData.end_date)
    submitData.set('renewal_notice_days', formData.renewal_notice_days.toString())
    submitData.set('auto_renew', formData.auto_renew ? 'true' : 'false')
    submitData.set('contract_value', formData.contract_value)
    submitData.set('currency', formData.currency)
    submitData.set('payment_terms', formData.payment_terms)
    submitData.set('delivery_terms', formData.delivery_terms)
    submitData.set('warranty_terms', formData.warranty_terms)
    submitData.set('notes', formData.notes)

    const result = await updateContract(contractId, submitData, itemData)

    if (result.success) {
      router.push(`/contracts/${contractId}`)
    } else {
      setError(result.error || '更新合約失敗')
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href={`/contracts/${contractId}`} className="mr-4">
              <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </Link>
            <FileText className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">編輯合約</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
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
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="例：2026年度供貨合約"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  合約類型
                </label>
                <select
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
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
                  value={formData.party_type}
                  onChange={(e) => setFormData({ ...formData, party_type: e.target.value })}
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
                <Input
                  value={formData.party_name}
                  onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
                  required
                  placeholder="請輸入供應商或客戶名稱"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡人
                </label>
                <Input
                  value={formData.party_contact}
                  onChange={(e) => setFormData({ ...formData, party_contact: e.target.value })}
                  placeholder="請輸入聯絡人"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡電話
                </label>
                <Input
                  value={formData.party_phone}
                  onChange={(e) => setFormData({ ...formData, party_phone: e.target.value })}
                  placeholder="請輸入電話"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.party_email}
                  onChange={(e) => setFormData({ ...formData, party_email: e.target.value })}
                  placeholder="請輸入Email"
                />
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
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  結束日期 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  到期前提醒天數
                </label>
                <Input
                  type="number"
                  value={formData.renewal_notice_days}
                  onChange={(e) => setFormData({ ...formData, renewal_notice_days: parseInt(e.target.value) || 30 })}
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.auto_renew}
                    onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                  />
                  自動續約
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  合約金額
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.contract_value}
                  onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                  placeholder="選填"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  幣別
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
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
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  點擊「新增品項」來添加約定產品
                </div>
              )}
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
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
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
                  value={formData.delivery_terms}
                  onChange={(e) => setFormData({ ...formData, delivery_terms: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder="例：訂單後7個工作天內出貨"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  保固條款
                </label>
                <textarea
                  value={formData.warranty_terms}
                  onChange={(e) => setFormData({ ...formData, warranty_terms: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder="保固條款..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder="其他備註事項..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Link href={`/contracts/${contractId}`}>
              <Button type="button" variant="outline">
                取消
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
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
