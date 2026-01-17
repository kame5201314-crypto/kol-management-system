import Link from 'next/link'
import {
  ArrowLeft,
  Building,
  Users,
  Package,
  FileText,
  Bell,
  Shield,
  Database,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const settingsSections = [
  {
    title: '公司資訊',
    description: '管理公司基本資料、Logo、聯絡資訊',
    icon: Building,
    href: '/settings/company',
  },
  {
    title: '使用者管理',
    description: '管理使用者帳號、權限設定',
    icon: Users,
    href: '/settings/users',
  },
  {
    title: '產品管理',
    description: '管理產品目錄、分類、價格',
    icon: Package,
    href: '/settings/products',
  },
  {
    title: '文件範本',
    description: '自訂報價單、採購單範本',
    icon: FileText,
    href: '/settings/templates',
  },
  {
    title: '通知設定',
    description: '設定 Email、系統通知偏好',
    icon: Bell,
    href: '/settings/notifications',
  },
  {
    title: '安全設定',
    description: '密碼政策、雙因素驗證',
    icon: Shield,
    href: '/settings/security',
  },
  {
    title: '資料管理',
    description: '匯入/匯出資料、備份設定',
    icon: Database,
    href: '/settings/data',
  },
]

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">設定</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsSections.map((section) => (
            <Card key={section.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={section.href}>
                  <Button variant="outline" className="w-full">
                    管理
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 系統資訊 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>系統資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="text-gray-500">版本</label>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <label className="text-gray-500">環境</label>
                <p className="font-medium">Production</p>
              </div>
              <div>
                <label className="text-gray-500">資料庫</label>
                <p className="font-medium">Supabase</p>
              </div>
              <div>
                <label className="text-gray-500">最後更新</label>
                <p className="font-medium">2026-01-17</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
