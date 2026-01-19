import Link from 'next/link'
import {
  Users,
  ShoppingCart,
  Truck,
  FileText,
  Package,
  BarChart3,
  ArrowRight,
  DollarSign,
  ScrollText,
  MessageSquare,
  CreditCard,
} from 'lucide-react'

const features = [
  {
    title: '供應商管理',
    description: '多維度評分、自動計算、分級管理、預警機制',
    icon: Users,
    href: '/suppliers',
    color: 'bg-blue-500',
  },
  {
    title: '客戶管理',
    description: '客戶分級、信用額度、交易記錄',
    icon: CreditCard,
    href: '/customers',
    color: 'bg-indigo-500',
  },
  {
    title: '產品管理',
    description: '產品目錄、分類管理、價格維護',
    icon: Package,
    href: '/products',
    color: 'bg-cyan-500',
  },
  {
    title: '階梯定價',
    description: '數量折扣、客戶等級、促銷活動',
    icon: DollarSign,
    href: '/pricing',
    color: 'bg-emerald-500',
  },
  {
    title: '採購單管理',
    description: '請購、審核、比價、下單、驗收全流程',
    icon: ShoppingCart,
    href: '/purchase-orders',
    color: 'bg-green-500',
  },
  {
    title: '交貨追蹤',
    description: '即時狀態追蹤、延遲預警、驗收管理',
    icon: Truck,
    href: '/deliveries',
    color: 'bg-orange-500',
  },
  {
    title: '報價單生成',
    description: '智慧定價、範本管理、追蹤轉換',
    icon: FileText,
    href: '/quotations',
    color: 'bg-purple-500',
  },
  {
    title: '合約管理',
    description: '合約條款、約定價格、到期提醒',
    icon: ScrollText,
    href: '/contracts',
    color: 'bg-rose-500',
  },
  {
    title: '批發詢價',
    description: '詢價流程、報價回覆、轉換訂單',
    icon: MessageSquare,
    href: '/wholesale-inquiries',
    color: 'bg-amber-500',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">經銷商管理平台</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link
                href="/customers"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                客戶
              </Link>
              <Link
                href="/contracts"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                合約
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                定價
              </Link>
              <Link
                href="/settings"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                設定
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            優化供應鏈，確保穩定貨源和品質
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            整合供應商評分、採購管理、交貨追蹤、報價生成，
            打造高效的經銷商管理流程
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {feature.description}
              </p>
              <div className="flex items-center text-primary text-sm font-medium">
                進入模組
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">快速統計</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">--</div>
              <div className="text-sm text-gray-600 mt-1">供應商</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">--</div>
              <div className="text-sm text-gray-600 mt-1">客戶</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-600">--</div>
              <div className="text-sm text-gray-600 mt-1">產品</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">--</div>
              <div className="text-sm text-gray-600 mt-1">採購單</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-600">--</div>
              <div className="text-sm text-gray-600 mt-1">有效合約</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">--</div>
              <div className="text-sm text-gray-600 mt-1">待處理詢價</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            經銷商管理平台 v1.0.0 | 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
