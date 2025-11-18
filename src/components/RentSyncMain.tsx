import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Wrench,
  ShoppingBag,
  Bell,
  Home,
  Menu,
  X
} from 'lucide-react'
import RentSyncDashboard from '../pages/rentsync/Dashboard'
import RentContracts from '../pages/rentsync/RentContracts'
import RentCollection from '../pages/rentsync/RentCollection'
import RepairRequests from '../pages/rentsync/RepairRequests'
import ServiceMarketplace from '../pages/rentsync/ServiceMarketplace'
import RentSyncNotifications from '../pages/rentsync/Notifications'

export default function RentSyncMain() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const location = useLocation()

  const menuItems = [
    { path: '/rentsync', icon: LayoutDashboard, label: '儀表板', exact: true },
    { path: '/rentsync/contracts', icon: FileText, label: '租約管理' },
    { path: '/rentsync/rent', icon: DollarSign, label: '收租模組' },
    { path: '/rentsync/repairs', icon: Wrench, label: '報修管理' },
    { path: '/rentsync/services', icon: ShoppingBag, label: '服務市集' },
    { path: '/rentsync/notifications', icon: Bell, label: '通知公告' },
  ]

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 側邊導航欄 */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-800 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-indigo-700">
          {sidebarOpen && <h1 className="text-xl font-bold">RentSync 好住管家</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-indigo-700 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Home size={20} />
            {sidebarOpen && <span>返回主選單</span>}
          </Link>

          <div className="border-t border-indigo-700 my-4"></div>

          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                isActive(item.path, item.exact)
                  ? 'bg-indigo-900 font-semibold'
                  : 'hover:bg-indigo-700'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-700">
          <div className="text-xs text-indigo-300">
            {sidebarOpen && <p>© 2025 RentSync Platform</p>}
          </div>
        </div>
      </aside>

      {/* 主要內容區 */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<RentSyncDashboard />} />
          <Route path="/contracts" element={<RentContracts />} />
          <Route path="/rent" element={<RentCollection />} />
          <Route path="/repairs" element={<RepairRequests />} />
          <Route path="/services" element={<ServiceMarketplace />} />
          <Route path="/notifications" element={<RentSyncNotifications />} />
        </Routes>
      </main>
    </div>
  )
}
