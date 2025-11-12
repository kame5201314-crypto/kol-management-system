import { useState, useEffect } from 'react'
import KOLManagementSystem from './components/KOLManagementSystem'
import Login from './components/Login'
import { LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const { user, loading, signOut } = useAuth()

  // 處理登入
  const handleLogin = (username: string, role: string) => {
    setUserName(username)
    setUserRole(role)
  }

  // 處理登出
  const handleLogout = async () => {
    await signOut()
    setUserName('')
    setUserRole('')
  }

  // 載入中顯示
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  // 如果未登入，顯示登入頁面
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-end h-20 pb-3">
            <div className="flex items-center gap-4">
              <div className="text-xl">
                <div className="font-bold text-gray-800">
                  {userName || user?.user_metadata?.username || user?.email?.split('@')[0]}
                </div>
                <div className="text-gray-500 text-base">{userRole || 'user'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 transition-colors text-lg"
                title="登出"
              >
                <LogOut size={22} />
                登出
              </button>
            </div>
          </div>
        </div>
      </nav>

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
