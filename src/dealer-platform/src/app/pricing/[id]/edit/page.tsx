'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPricingRule, updatePricingRule } from '@/actions/pricing'

interface PriceTier {
  id: string
  tier_number: number
  min_quantity: number
  max_quantity: number | null
  discount_percent: number | null
  fixed_unit_price: number | null
  description: string
}

export default function EditPricingRulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [ruleId, setRuleId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    rule_type: 'customer_grade',
    priority: 1,
    customer_grade: '',
    discount_percent: '',
    discount_amount: '',
    fixed_price: '',
    min_quantity: '',
    max_quantity: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
    notes: '',
  })

  const [tiers, setTiers] = useState<PriceTier[]>([])

  useEffect(() => {
    async function loadData() {
      const { id } = await params
      setRuleId(id)

      const result = await getPricingRule(id)
      if (result.success && result.data) {
        const rule = result.data
        setFormData({
          name: rule.name,
          rule_type: rule.rule_type,
          priority: rule.priority,
          customer_grade: rule.customer_grade || '',
          discount_percent: rule.discount_percent?.toString() || '',
          discount_amount: rule.discount_amount?.toString() || '',
          fixed_price: rule.fixed_price?.toString() || '',
          min_quantity: rule.min_quantity?.toString() || '',
          max_quantity: rule.max_quantity?.toString() || '',
          valid_from: rule.valid_from || '',
          valid_until: rule.valid_until || '',
          is_active: rule.is_active,
          notes: rule.notes || '',
        })

        if (rule.tiers && rule.tiers.length > 0) {
          setTiers(rule.tiers.map((t: any) => ({
            id: t.id,
            tier_number: t.tier_number,
            min_quantity: t.min_quantity,
            max_quantity: t.max_quantity,
            discount_percent: t.discount_percent,
            fixed_unit_price: t.fixed_unit_price,
            description: t.description || '',
          })))
        }
      } else {
        setError(result.error || '載入規則失敗')
      }
      setIsLoading(false)
    }
    loadData()
  }, [params])

  function addTier() {
    const nextNumber = tiers.length + 1
    const lastTier = tiers[tiers.length - 1]
    setTiers([...tiers, {
      id: `new-${Date.now()}`,
      tier_number: nextNumber,
      min_quantity: lastTier ? (lastTier.max_quantity || lastTier.min_quantity) + 1 : 1,
      max_quantity: null,
      discount_percent: null,
      fixed_unit_price: null,
      description: '',
    }])
  }

  function removeTier(id: string) {
    if (tiers.length > 0) {
      const newTiers = tiers.filter(t => t.id !== id)
      setTiers(newTiers.map((t, i) => ({ ...t, tier_number: i + 1 })))
    }
  }

  function updateTier(id: string, field: keyof PriceTier, value: any) {
    setTiers(tiers.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const tierData = tiers.map(t => ({
      tier_number: t.tier_number,
      min_quantity: t.min_quantity,
      max_quantity: t.max_quantity,
      discount_percent: t.discount_percent,
      discount_amount: null,
      fixed_unit_price: t.fixed_unit_price,
      description: t.description || null,
    }))

    // Create FormData object
    const submitData = new FormData()
    submitData.set('name', formData.name)
    submitData.set('rule_type', formData.rule_type)
    submitData.set('priority', formData.priority.toString())
    submitData.set('customer_grade', formData.customer_grade)
    submitData.set('discount_percent', formData.discount_percent)
    submitData.set('discount_amount', formData.discount_amount)
    submitData.set('fixed_price', formData.fixed_price)
    submitData.set('min_quantity', formData.min_quantity)
    submitData.set('max_quantity', formData.max_quantity)
    submitData.set('valid_from', formData.valid_from)
    submitData.set('valid_until', formData.valid_until)
    submitData.set('is_active', formData.is_active ? 'true' : 'false')
    submitData.set('notes', formData.notes)

    const result = await updatePricingRule(ruleId, submitData, tierData)

    if (result.success) {
      router.push(`/pricing/${ruleId}`)
    } else {
      setError(result.error || '更新規則失敗')
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
            <Link href={`/pricing/${ruleId}`} className="mr-4">
              <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </Link>
            <DollarSign className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">編輯價格規則</h1>
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
                  規則名稱 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="例：VIP客戶專屬折扣"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  規則類型
                </label>
                <select
                  value={formData.rule_type}
                  onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="customer_grade">客戶等級</option>
                  <option value="quantity">數量階梯</option>
                  <option value="promotion">促銷活動</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  優先順序
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  適用客戶等級
                </label>
                <select
                  value={formData.customer_grade}
                  onChange={(e) => setFormData({ ...formData, customer_grade: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">全部客戶</option>
                  <option value="VIP">VIP</option>
                  <option value="A">A級</option>
                  <option value="B">B級</option>
                  <option value="C">C級</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                  />
                  啟用此規則
                </label>
              </div>
            </CardContent>
          </Card>

          {formData.rule_type === 'quantity' && (
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>階梯價格</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addTier}>
                  <Plus className="w-4 h-4 mr-1" />
                  新增階層
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {tiers.map((tier) => (
                  <div key={tier.id} className="grid grid-cols-12 gap-2 items-end p-4 bg-gray-50 rounded-lg">
                    <div className="col-span-1 text-center font-medium text-gray-600">
                      {tier.tier_number}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">最小數量</label>
                      <Input
                        type="number"
                        min="1"
                        value={tier.min_quantity}
                        onChange={(e) => updateTier(tier.id, 'min_quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">最大數量</label>
                      <Input
                        type="number"
                        min="0"
                        value={tier.max_quantity ?? ''}
                        placeholder="無上限"
                        onChange={(e) => updateTier(tier.id, 'max_quantity', e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">折扣%</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={tier.discount_percent ?? ''}
                        onChange={(e) => updateTier(tier.id, 'discount_percent', e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">固定單價</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={tier.fixed_unit_price ?? ''}
                        onChange={(e) => updateTier(tier.id, 'fixed_unit_price', e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">說明</label>
                      <Input
                        value={tier.description}
                        onChange={(e) => updateTier(tier.id, 'description', e.target.value)}
                        placeholder="選填"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTier(tier.id)}
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                ))}
                {tiers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    點擊「新增階層」來建立階梯價格
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {formData.rule_type !== 'quantity' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>折扣設定</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    折扣百分比 (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    placeholder="例：10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    折扣金額
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                    placeholder="例：100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    固定價格
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.fixed_price}
                    onChange={(e) => setFormData({ ...formData, fixed_price: e.target.value })}
                    placeholder="例：999"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>有效期間</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開始日期
                </label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  結束日期
                </label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder="其他備註..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Link href={`/pricing/${ruleId}`}>
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
