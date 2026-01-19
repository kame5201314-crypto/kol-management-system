import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, DollarSign, Edit, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getPricingRule } from '@/actions/pricing'

const ruleTypeLabels: Record<string, string> = {
  customer_grade: '客戶等級',
  quantity: '數量階梯',
  promotion: '促銷活動',
}

export default async function PricingRuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getPricingRule(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const rule = result.data

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/pricing" className="mr-4">
                <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </Link>
              <DollarSign className="w-6 h-6 text-primary mr-2" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{rule.name}</h1>
                <p className="text-sm text-gray-500">{ruleTypeLabels[rule.rule_type]}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {rule.is_active ? (
                <Badge variant="success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  啟用中
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  已停用
                </Badge>
              )}
              <Link href={`/pricing/${id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  編輯
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側內容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本資料 */}
            <Card>
              <CardHeader>
                <CardTitle>基本資料</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">規則名稱</div>
                  <div className="font-medium">{rule.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">規則類型</div>
                  <div className="font-medium">{ruleTypeLabels[rule.rule_type]}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">優先順序</div>
                  <div className="font-medium">{rule.priority}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">客戶等級</div>
                  <div className="font-medium">{rule.customer_grade || '全部客戶'}</div>
                </div>
              </CardContent>
            </Card>

            {/* 階梯價格 */}
            {rule.tiers && rule.tiers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>階梯價格</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>階層</TableHead>
                        <TableHead>數量範圍</TableHead>
                        <TableHead>折扣百分比</TableHead>
                        <TableHead>固定單價</TableHead>
                        <TableHead>說明</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rule.tiers.map((tier) => (
                        <TableRow key={tier.id}>
                          <TableCell className="font-medium">第 {tier.tier_number} 階</TableCell>
                          <TableCell>
                            {tier.min_quantity} ~ {tier.max_quantity || '無上限'}
                          </TableCell>
                          <TableCell>
                            {tier.discount_percent ? `${tier.discount_percent}%` : '-'}
                          </TableCell>
                          <TableCell>
                            {tier.fixed_unit_price ? `$${tier.fixed_unit_price}` : '-'}
                          </TableCell>
                          <TableCell>{tier.description || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* 非階梯規則的折扣 */}
            {(!rule.tiers || rule.tiers.length === 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>折扣設定</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">折扣百分比</div>
                    <div className="text-xl font-semibold">
                      {rule.discount_percent ? `${rule.discount_percent}%` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">折扣金額</div>
                    <div className="text-xl font-semibold">
                      {rule.discount_amount ? `$${rule.discount_amount}` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">固定價格</div>
                    <div className="text-xl font-semibold">
                      {rule.fixed_price ? `$${rule.fixed_price}` : '-'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右側欄位 */}
          <div className="space-y-6">
            {/* 有效期間 */}
            <Card>
              <CardHeader>
                <CardTitle>有效期間</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">開始日期</div>
                  <div className="font-medium">{rule.valid_from || '無限制'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">結束日期</div>
                  <div className="font-medium">{rule.valid_until || '無限制'}</div>
                </div>
              </CardContent>
            </Card>

            {/* 數量範圍 */}
            {(rule.min_quantity || rule.max_quantity) && (
              <Card>
                <CardHeader>
                  <CardTitle>適用數量</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">最小數量</div>
                    <div className="font-medium">{rule.min_quantity || '無限制'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">最大數量</div>
                    <div className="font-medium">{rule.max_quantity || '無限制'}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 備註 */}
            {rule.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>備註</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{rule.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
