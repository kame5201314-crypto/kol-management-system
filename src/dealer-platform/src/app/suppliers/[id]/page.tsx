import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Star,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSupplier, getSupplierScores } from '@/actions/suppliers'
import { formatDate } from '@/lib/utils'

const gradeColors = {
  A: 'bg-green-500',
  B: 'bg-blue-500',
  C: 'bg-yellow-500',
  D: 'bg-red-500',
}

const statusLabels = {
  active: '啟用',
  inactive: '停用',
  blocked: '封鎖',
}

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getSupplier(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const supplier = result.data
  const scoresResult = await getSupplierScores(id)
  const scores = scoresResult.success ? scoresResult.data ?? [] : []
  const latestScore = scores[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/suppliers" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{supplier.name}</h1>
                <p className="text-sm text-gray-500">{supplier.code}</p>
              </div>
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${gradeColors[supplier.grade]}`}>
                {supplier.grade}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/suppliers/${id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  編輯
                </Button>
              </Link>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                刪除
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 基本資訊 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                基本資訊
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">供應商代碼</label>
                  <p className="font-medium">{supplier.code}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">簡稱</label>
                  <p className="font-medium">{supplier.short_name ?? '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">統一編號</label>
                  <p className="font-medium">{supplier.tax_id ?? '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">狀態</label>
                  <p>
                    <Badge variant={supplier.status === 'active' ? 'success' : 'secondary'}>
                      {statusLabels[supplier.status]}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">付款條件</label>
                  <p className="font-medium">{supplier.payment_terms} 天</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">交易幣別</label>
                  <p className="font-medium">{supplier.currency}</p>
                </div>
              </div>

              {/* 聯絡資訊 */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4">聯絡資訊</h4>
                <div className="space-y-3">
                  {supplier.contact_person && (
                    <div className="flex items-center text-gray-600">
                      <span className="w-24 text-sm text-gray-500">聯絡人</span>
                      <span>{supplier.contact_person}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.mobile && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{supplier.mobile} (手機)</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{supplier.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 備註 */}
              {supplier.notes && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-2">備註</h4>
                  <p className="text-gray-600">{supplier.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 評分資訊 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  評分總覽
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestScore ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">
                        {latestScore.total_score}
                      </div>
                      <p className="text-sm text-gray-500">總評分</p>
                    </div>
                    <div className="space-y-2">
                      <ScoreBar label="品質" score={latestScore.quality_score} />
                      <ScoreBar label="交貨" score={latestScore.delivery_score} />
                      <ScoreBar label="價格" score={latestScore.price_score} />
                      <ScoreBar label="服務" score={latestScore.service_score} />
                      <ScoreBar label="合規" score={latestScore.compliance_score} />
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      最後評分日期: {formatDate(latestScore.score_date)}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    尚無評分記錄
                  </div>
                )}
                <div className="mt-4">
                  <Link href={`/suppliers/${id}/score`}>
                    <Button className="w-full" variant="outline">
                      新增評分
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 評分歷史 */}
            <Card>
              <CardHeader>
                <CardTitle>評分歷史</CardTitle>
              </CardHeader>
              <CardContent>
                {scores.length > 0 ? (
                  <div className="space-y-3">
                    {scores.slice(0, 5).map((score, index) => (
                      <div
                        key={score.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{score.total_score} 分</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(score.score_date)}
                          </p>
                        </div>
                        {index > 0 && (
                          <div>
                            {score.total_score > scores[index - 1].total_score ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : score.total_score < scores[index - 1].total_score ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">尚無歷史記錄</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 90) return 'bg-green-500'
    if (s >= 75) return 'bg-blue-500'
    if (s >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex items-center">
      <span className="w-12 text-sm text-gray-500">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
        <div
          className={`h-2 rounded-full ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-sm text-right">{score}</span>
    </div>
  )
}
