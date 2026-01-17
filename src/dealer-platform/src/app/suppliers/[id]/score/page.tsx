'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSupplier, addSupplierScore } from '@/actions/suppliers'
import type { Supplier } from '@/types'

export default function AddSupplierScorePage({
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

  // 評分狀態
  const [scores, setScores] = useState({
    quality: 80,
    delivery: 80,
    price: 80,
    service: 80,
    compliance: 80,
  })

  const totalScore = (
    scores.quality * 0.3 +
    scores.delivery * 0.25 +
    scores.price * 0.2 +
    scores.service * 0.15 +
    scores.compliance * 0.1
  ).toFixed(1)

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

    const result = await addSupplierScore(supplierId, formData)

    if (result.success) {
      router.push(`/suppliers/${supplierId}`)
    } else {
      setError(result.error ?? '新增評分失敗')
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
            <div>
              <h1 className="text-xl font-bold text-gray-900">新增評分</h1>
              <p className="text-sm text-gray-500">{supplier.name}</p>
            </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 評分輸入 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  評分項目
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    評分日期
                  </label>
                  <Input
                    name="score_date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <ScoreSlider
                  name="quality_score"
                  label="品質分數"
                  description="產品不良率、驗收合格率、品質一致性"
                  weight="30%"
                  value={scores.quality}
                  onChange={(v) => setScores({ ...scores, quality: v })}
                />

                <ScoreSlider
                  name="delivery_score"
                  label="交貨分數"
                  description="準時交貨率、交期達成率、緊急訂單配合度"
                  weight="25%"
                  value={scores.delivery}
                  onChange={(v) => setScores({ ...scores, delivery: v })}
                />

                <ScoreSlider
                  name="price_score"
                  label="價格分數"
                  description="價格穩定性、降價配合度、付款條件"
                  weight="20%"
                  value={scores.price}
                  onChange={(v) => setScores({ ...scores, price: v })}
                />

                <ScoreSlider
                  name="service_score"
                  label="服務分數"
                  description="問題處理時效、溝通效率、售後服務"
                  weight="15%"
                  value={scores.service}
                  onChange={(v) => setScores({ ...scores, service: v })}
                />

                <ScoreSlider
                  name="compliance_score"
                  label="合規分數"
                  description="證照齊全、環保合規、ESG評等"
                  weight="10%"
                  value={scores.compliance}
                  onChange={(v) => setScores({ ...scores, compliance: v })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    評語
                  </label>
                  <textarea
                    name="comments"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="請輸入評分說明或建議..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* 總分預覽 */}
            <Card>
              <CardHeader>
                <CardTitle>總分預覽</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {totalScore}
                  </div>
                  <p className="text-gray-500">加權總分</p>
                  <div className="mt-4">
                    <GradeBadge score={parseFloat(totalScore)} />
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">品質 (30%)</span>
                    <span>{(scores.quality * 0.3).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">交貨 (25%)</span>
                    <span>{(scores.delivery * 0.25).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">價格 (20%)</span>
                    <span>{(scores.price * 0.2).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">服務 (15%)</span>
                    <span>{(scores.service * 0.15).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">合規 (10%)</span>
                    <span>{(scores.compliance * 0.1).toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 mt-6">
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
                  儲存評分
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

function ScoreSlider({
  name,
  label,
  description,
  weight,
  value,
  onChange,
}: {
  name: string
  label: string
  description: string
  weight: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">
          {label} <span className="text-gray-400">({weight})</span>
        </label>
        <span className="text-sm font-bold">{value}</span>
      </div>
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      <input
        type="range"
        name={name}
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  )
}

function GradeBadge({ score }: { score: number }) {
  let grade: string
  let color: string

  if (score >= 90) {
    grade = 'A'
    color = 'bg-green-500'
  } else if (score >= 75) {
    grade = 'B'
    color = 'bg-blue-500'
  } else if (score >= 60) {
    grade = 'C'
    color = 'bg-yellow-500'
  } else {
    grade = 'D'
    color = 'bg-red-500'
  }

  return (
    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white text-xl font-bold ${color}`}>
      {grade}
    </span>
  )
}
