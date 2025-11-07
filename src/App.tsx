import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import DealerSystemMain from './components/DealerSystemMain'
import KOLManagementSystem from './components/KOLManagementSystem'
import Login from './components/Login'
import { Users, UserSquare, LogOut } from 'lucide-react'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')

  // 檢查登入狀態
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const name = localStorage.getItem('userName') || ''
    const role = localStorage.getItem('userRole') || ''

    setIsLoggedIn(loggedIn)
    setUserName(name)
    setUserRole(role)
  }, [])

  // 處理登入
  const handleLogin = (username: string, role: string) => {
    setIsLoggedIn(true)
    setUserName(localStorage.getItem('userName') || username)
    setUserRole(role)
  }

  // 處理登出
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    setIsLoggedIn(false)
    setUserName('')
    setUserRole('')
  }

  // 如果未登入，顯示登入頁面
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-gray-800">系統導航</h1>
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Users size={18} />
                  經銷商系統
                </Link>
                <Link
                  to="/kol"
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <UserSquare size={18} />
                  KOL 管理系統
                </Link>

                {/* 使用者資訊和登出按鈕 */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">{userName}</div>
                    <div className="text-gray-500 text-xs">{userRole}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                    title="登出"
                  >
                    <LogOut size={18} />
                    登出
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<DealerSystemMain />} />
          <Route path="/kol" element={<KOLManagementSystem />} />
        </Routes>
      </div>
    </Router>
  )
}
