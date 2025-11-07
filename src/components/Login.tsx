import React, { useState } from 'react';
import { Users, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, role: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // 預設帳號
  const defaultAccounts = [
    { username: 'admin', password: 'admin123', role: 'admin', name: '系統管理員' },
    { username: 'manager', password: 'manager123', role: 'manager', name: '經理' },
    { username: 'sales', password: 'sales123', role: 'sales', name: '業務人員' },
    { username: 'dealer', password: 'dealer123', role: 'dealer', name: '經銷商' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('請輸入帳號和密碼');
      return;
    }

    // 驗證帳號密碼
    const account = defaultAccounts.find(
      acc => acc.username === username && acc.password === password
    );

    if (account) {
      // 儲存登入資訊到 localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', account.username);
      localStorage.setItem('userRole', account.role);
      localStorage.setItem('userName', account.name);

      onLogin(account.username, account.role);
    } else {
      setError('帳號或密碼錯誤');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo 和標題 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Users className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">經銷商管理系統</h1>
          <p className="text-gray-600">請登入以繼續使用</p>
        </div>

        {/* 登入表單 */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 帳號輸入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                帳號
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="請輸入帳號"
                />
              </div>
            </div>

            {/* 密碼輸入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
                  placeholder="請輸入密碼"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 登入按鈕 */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Lock size={20} />
              登入
            </button>
          </form>

          {/* 測試帳號說明 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 font-medium">測試帳號：</p>
            <div className="space-y-2 text-sm">
              {defaultAccounts.map((acc, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                  <div>
                    <span className="font-medium text-gray-700">{acc.name}</span>
                    <span className="text-gray-500 ml-2">({acc.role})</span>
                  </div>
                  <div className="text-gray-600">
                    <code className="bg-white px-2 py-1 rounded text-xs">
                      {acc.username} / {acc.password}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 頁尾 */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2025 經銷商管理系統. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
