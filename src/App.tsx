import KOLManagementSystem from './components/KOLManagementSystem'
import Login from './components/Login'
import { LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const { user, signOut } = useAuth()

  if (!user) {
    return <Login onLogin={() => {}} />
  }

  // 取得用戶顯示名稱
  const displayName = 'username' in user ? user.username : user.email

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 頂部導航列 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">KOL 管理系統</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">歡迎，{displayName}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              登出
            </button>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <KOLManagementSystem />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
