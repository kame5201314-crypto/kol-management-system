import React, { useState } from 'react';
import { Users, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onLogin: (username: string, role: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  // 載入記住的帳號
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password) {
      setError('請輸入電子郵件和密碼');
      setLoading(false);
      return;
    }

    if (isSignUp) {
      // 註冊新帳號
      if (!username) {
        setError('請輸入使用者名稱');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('密碼長度至少需要 6 個字元');
        setLoading(false);
        return;
      }

      const { error: signUpError } = await signUp(email, password, username);

      if (signUpError) {
        setError(`註冊失敗：${signUpError.message}`);
        setLoading(false);
        return;
      }

      setSuccess('註冊成功！正在自動登入...');

      // 註冊成功後自動登入
      setTimeout(() => {
        onLogin(username, 'user');
        setLoading(false);
      }, 1000);
    } else {
      // 登入
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(`登入失敗：${signInError.message}`);
        setLoading(false);
        return;
      }

      // 處理「記住我」功能
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      // 登入成功，使用 email 作為 username
      const displayName = email.split('@')[0];
      onLogin(displayName, 'user');
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">KOL 管理系統</h1>
          <p className="text-gray-600">
            {isSignUp ? '建立新帳號' : '請登入以繼續使用'}
          </p>
        </div>

        {/* 登入/註冊表單 */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 註冊時顯示使用者名稱 */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  使用者名稱
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="請輸入使用者名稱"
                  />
                </div>
              </div>
            )}

            {/* 帳號輸入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isSignUp ? '電子郵件' : '帳號'}
              </label>
              <div className="relative">
                <input
                  type={isSignUp ? 'email' : 'text'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder={isSignUp ? '請輸入電子郵件' : '請輸入帳號（例如：admin）'}
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
                  placeholder={isSignUp ? '至少 6 個字元' : '請輸入密碼'}
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

            {/* 記住我 (僅登入時顯示) */}
            {!isSignUp && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 cursor-pointer">
                  記住我的密碼
                </label>
              </div>
            )}

            {/* 成功訊息 */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* 錯誤訊息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 提交按鈕 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  處理中...
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus size={20} /> : <Lock size={20} />}
                  {isSignUp ? '註冊' : '登入'}
                </>
              )}
            </button>

            {/* 切換登入/註冊 */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {isSignUp ? '已有帳號？點此登入' : '還沒有帳號？點此註冊'}
              </button>
            </div>

          </form>
        </div>

        {/* 頁尾 */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2025 KOL 管理系統. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
