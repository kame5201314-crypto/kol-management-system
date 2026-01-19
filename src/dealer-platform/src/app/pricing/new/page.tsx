'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createPricingRule } from '@/actions/pricing'

interface Tier {
  id: string
  tier_number: number
  min_quantity: number
  max_quantity: number | null
  discount_percent: number | null
  discount_amount: number | null
  fixed_unit_price: number | null
  description: string | null
}

export default function NewPricingRulePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ruleType, setRuleType] = useState('quantity')
  const [tiers, setTiers] = useState<Tier[]>([
    { id: '1', tier_number: 1, min_quantity: 1, max_quantity: 9, discount_percent: null, discount_amount: null, fixed_unit_price: null, description: null },
  ])

  function addTier() {
    const lastTier = tiers[tiers.length - 1]
    const newTier: Tier = {
      id: Date.now().toString(),
      tier_number: tiers.length + 1,
      min_quantity: (lastTier?.max_quantity || 0) + 1,
      max_quantity: null,
      discount_percent: null,
      discount_amount: null,
      fixed_unit_price: null,
      description: null,
    }
    setTiers([...tiers, newTier])
  }

  function removeTier(id: string) {
    if (tiers.length > 1) {
      setTiers(tiers.filter(t => t.id !== id).map((t, i) => ({ ...t, tier_number: i + 1 })))
    }
  }

  function updateTier(id: string, field: keyof Tier, value: any) {
    setTiers(tiers.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const tiersData = ruleType === 'quantity' ? tiers.map(t => ({
      tier_number: t.tier_number,
      min_quantity: t.min_quantity,
      max_quantity: t.max_quantity,
      discount_percent: t.discount_percent,
      discount_amount: t.discount_amount,
      fixed_unit_price: t.fixed_unit_price,
      description: t.description,
    })) : []

    const result = await createPricingRule(formData, tiersData)

    if (result.success) {
      router.push('/pricing')
    } else {
      setError(result.error ?? '建立價格規則失敗')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/pricing" className="mr-4">
              <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </Link>
            <DollarSign className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">新增價格規則</h1>
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
                  規則名稱 <span className="text-red-500">*</span>
                </label>
                <Input name="name" required placeholder="例：大量採購折扣" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  規則類型
                </label>
                <select
                  name="rule_type"
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="quantity">數量階梯</option>
                  <option value="customer_grade">客戶等級</option>
                  <option value="promotion">促銷活動</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  優先順序
                </label>
                <Input name="priority" type="number" defaultValue="0" />
                <p className="text-xs text-gray-500 mt-1">數字越大優先順序越高</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客戶等級（選填）
                </label>
                <select
                  name="customer_grade"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">全部客戶</option>
                  <option value="VIP">VIP</option>
                  <option value="A">A級</option>
                  <option value="B">B級</option>
                  <option value="C">C級</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>有效期間</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開始日期
                </label>
                <Input name="valid_from" type="date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  結束日期
                </label>
                <Input name="valid_until" type="date" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked
                    className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                  />
                  啟用此規則
                </label>
              </div>
            </CardContent>
          </Card>

          {ruleType === 'quantity' && (
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>階梯定價</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addTier}>
                  <Plus className="w-4 h-4 mr-1" />
                  新增階層
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {tiers.map((tier) => (
                  <div key={tier.id} className="grid grid-cols-12 gap-2 items-end p-4 bg-gray-50 rounded-lg">
                    <div className="col-span-1">
                      <label className="block text-xs text-gray-500 mb-1">階層</label>
                      <div className="text-center font-medium">{tier.tier_number}</div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">最小數量</label>
                      <Input
                        type="number"
                        min="1"
                        value={tier.min_quantity}
                        onChange={(e) => updateTier(tier.id, 'min_quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">最大數量</label>
                      <Input
                        type="number"
                        min="1"
                        value={tier.max_quantity ?? ''}
                        placeholder="無上限"
                        onChange={(e) => updateTier(tier.id, 'max_quantity', e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">折扣 %</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={tier.discount_percent ?? ''}
                        placeholder="0"
                        onChange={(e) => updateTier(tier.id, 'discount_percent', e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">固定單價</label>
                      <Input
                        type="number"
                        min="0"
                        value={tier.fixed_unit_price ?? ''}
                        placeholder="選填"
                        onChange={(e) => updateTier(tier.id, 'fixed_unit_price', e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">說明</label>
                      <Input
                        value={tier.description ?? ''}
                        placeholder="選填"
                        onChange={(e) => updateTier(tier.id, 'description', e.target.value || null)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTier(tier.id)}
                        disabled={tiers.length <= 1}
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {ruleType !== 'quantity' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>折扣設定</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    折扣百分比
                  </label>
                  <Input name="discount_percent" type="number" min="0" max="100" step="0.1" placeholder="例：10" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    折扣金額
                  </label>
                  <Input name="discount_amount" type="number" min="0" placeholder="例：100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    固定價格
                  </label>
                  <Input name="fixed_price" type="number" min="0" placeholder="例：999" />
                </div>
              </CardContent>
            </Card>
          )}

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
            <Link href="/pricing">
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
              建立規則
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
