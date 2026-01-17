import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  RefreshCw,
  ShoppingCart,
  BarChart3,
  Zap,
  Shield,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">多平台同步器</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/dashboard">
              <Button>開始使用</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 text-center">
        <Badge variant="secondary" className="mb-4">
          節省 80% 上架時間
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          一鍵上架到
          <span className="text-shopee"> 蝦皮</span>、
          <span className="text-momo">momo</span>、
          <span className="text-shopline">Shopline</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          統一管理商品資訊，即時同步庫存，避免超賣問題。
          讓您專注於銷售，把繁瑣的上架工作交給我們。
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/auth/dashboard">
            <Button size="lg" className="gap-2">
              免費開始 <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            觀看演示
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <h2 className="text-center text-3xl font-bold mb-12">核心功能</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Package className="h-10 w-10 text-primary mb-2" />
              <CardTitle>統一商品管理</CardTitle>
              <CardDescription>
                一個後台管理所有平台商品，修改一次同步全平台
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 批量商品匯入/匯出</li>
                <li>• 智慧欄位轉換</li>
                <li>• 多規格商品支援</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <RefreshCw className="h-10 w-10 text-primary mb-2" />
              <CardTitle>即時庫存同步</CardTitle>
              <CardDescription>
                訂單成立秒級扣庫存，避免超賣風險
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 秒級庫存同步</li>
                <li>• 低庫存預警</li>
                <li>• 庫存異動紀錄</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShoppingCart className="h-10 w-10 text-primary mb-2" />
              <CardTitle>訂單統一管理</CardTitle>
              <CardDescription>
                所有平台訂單集中處理，提升出貨效率
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 訂單自動匯入</li>
                <li>• 批量列印出貨單</li>
                <li>• 出貨狀態同步</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>數據分析報表</CardTitle>
              <CardDescription>
                跨平台銷售數據一目了然
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 銷售趨勢分析</li>
                <li>• 平台業績對比</li>
                <li>• 熱銷商品排行</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>智慧定價策略</CardTitle>
              <CardDescription>
                根據平台特性設定不同售價
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 平台差異定價</li>
                <li>• 促銷活動管理</li>
                <li>• 競品價格監控</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>安全可靠</CardTitle>
              <CardDescription>
                企業級資料安全保護
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 資料加密傳輸</li>
                <li>• 多租戶隔離</li>
                <li>• 操作日誌追蹤</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="container py-24">
        <h2 className="text-center text-3xl font-bold mb-12">支援平台</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { name: '蝦皮購物', color: 'bg-shopee' },
            { name: 'momo購物', color: 'bg-momo' },
            { name: 'SHOPLINE', color: 'bg-shopline' },
            { name: '露天拍賣', color: 'bg-orange-500' },
            { name: 'PChome', color: 'bg-pink-500' },
            { name: 'Yahoo購物', color: 'bg-purple-600' },
          ].map((platform) => (
            <div
              key={platform.name}
              className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className={`h-10 w-10 rounded-lg ${platform.color}`} />
              <span className="font-medium">{platform.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">準備好提升您的電商效率了嗎？</h2>
            <p className="text-lg opacity-90 mb-8">
              立即開始使用，享受 14 天免費試用
            </p>
            <Link href="/auth/dashboard">
              <Button size="lg" variant="secondary" className="gap-2">
                免費開始使用 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">多平台商品同步器</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Multi-Platform Sync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
