'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  RefreshCw,
  ShoppingCart,
  BarChart3,
  Settings,
  Link2,
  Warehouse,
} from 'lucide-react'

const navigation = [
  { name: '儀表板', href: '/auth/dashboard', icon: LayoutDashboard },
  { name: '商品管理', href: '/auth/products', icon: Package },
  { name: '平台連接', href: '/auth/platforms', icon: Link2 },
  { name: '庫存管理', href: '/auth/inventory', icon: Warehouse },
  { name: '訂單管理', href: '/auth/orders', icon: ShoppingCart },
  { name: '同步紀錄', href: '/auth/dashboard/sync', icon: RefreshCw },
  { name: '數據分析', href: '/auth/dashboard/analytics', icon: BarChart3 },
  { name: '設定', href: '/auth/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <RefreshCw className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">多平台同步器</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">使用者</p>
            <p className="text-xs text-muted-foreground truncate">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
