import React, { useState } from 'react';
import {
  User,
  Bell,
  Lock,
  Globe,
  Palette,
  Database,
  Mail,
  MessageSquare,
  CreditCard,
  Shield,
  HelpCircle,
  ChevronRight,
  Save,
  Check,
  Moon,
  Sun
} from 'lucide-react';

interface SettingSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export default function PlatformSettings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  // Form states
  const [profile, setProfile] = useState({
    name: '王小明',
    email: 'admin@company.com',
    phone: '0912-345-678',
    role: '系統管理員',
    department: '營運部'
  });

  const [notifications, setNotifications] = useState({
    emailNotify: true,
    smsNotify: true,
    lineNotify: false,
    pushNotify: true,
    dailyReport: true,
    weeklyReport: true,
    anomalyAlert: true,
    commissionAlert: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'light' as 'light' | 'dark' | 'system',
    language: 'zh-TW',
    dateFormat: 'YYYY-MM-DD',
    currencyFormat: 'TWD'
  });

  const sections: SettingSection[] = [
    { id: 'profile', label: '個人資料', icon: <User className="w-5 h-5" />, description: '管理您的帳號資訊' },
    { id: 'notifications', label: '通知設定', icon: <Bell className="w-5 h-5" />, description: '設定通知偏好' },
    { id: 'appearance', label: '外觀設定', icon: <Palette className="w-5 h-5" />, description: '自訂介面外觀' },
    { id: 'security', label: '安全性', icon: <Lock className="w-5 h-5" />, description: '密碼和雙重驗證' },
    { id: 'integrations', label: 'API 整合', icon: <Database className="w-5 h-5" />, description: '管理 API 金鑰和連接' },
    { id: 'billing', label: '帳單設定', icon: <CreditCard className="w-5 h-5" />, description: '付款方式和發票' }
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">個人資料</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">部門</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">角色由系統管理員設定</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">頭像</h4>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    更換頭像
                  </button>
                  <p className="text-xs text-gray-400 mt-2">建議尺寸 200x200 像素</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">通知管道</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotify', label: 'Email 通知', icon: <Mail className="w-5 h-5" />, desc: '接收 Email 通知' },
                  { key: 'smsNotify', label: '簡訊通知', icon: <MessageSquare className="w-5 h-5" />, desc: '接收簡訊通知' },
                  { key: 'lineNotify', label: 'LINE 通知', icon: <MessageSquare className="w-5 h-5" />, desc: '透過 LINE 接收通知' },
                  { key: 'pushNotify', label: '推播通知', icon: <Bell className="w-5 h-5" />, desc: '瀏覽器推播通知' }
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{item.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications] as boolean}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">通知類型</h4>
              <div className="space-y-3">
                {[
                  { key: 'dailyReport', label: '每日報表', desc: '每天早上 9:00 發送' },
                  { key: 'weeklyReport', label: '每週報表', desc: '每週一早上發送' },
                  { key: 'anomalyAlert', label: '異常警報', desc: '物流異常即時通知' },
                  { key: 'commissionAlert', label: '傭金通知', desc: '傭金計算完成通知' }
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications] as boolean}
                      onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">主題設定</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light', label: '淺色', icon: <Sun className="w-5 h-5" /> },
                  { value: 'dark', label: '深色', icon: <Moon className="w-5 h-5" /> },
                  { value: 'system', label: '跟隨系統', icon: <Globe className="w-5 h-5" /> }
                ].map(theme => (
                  <button
                    key={theme.value}
                    onClick={() => setAppearance({ ...appearance, theme: theme.value as typeof appearance.theme })}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                      appearance.theme === theme.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={appearance.theme === theme.value ? 'text-indigo-600' : 'text-gray-500'}>
                      {theme.icon}
                    </span>
                    <span className={`text-sm ${appearance.theme === theme.value ? 'text-indigo-600 font-medium' : 'text-gray-600'}`}>
                      {theme.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">區域設定</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">語言</label>
                  <select
                    value={appearance.language}
                    onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="zh-TW">繁體中文</option>
                    <option value="zh-CN">簡體中文</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期格式</label>
                  <select
                    value={appearance.dateFormat}
                    onChange={(e) => setAppearance({ ...appearance, dateFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">貨幣格式</label>
                  <select
                    value={appearance.currencyFormat}
                    onChange={(e) => setAppearance({ ...appearance, currencyFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="TWD">新台幣 (TWD)</option>
                    <option value="USD">美元 (USD)</option>
                    <option value="CNY">人民幣 (CNY)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">密碼設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">目前密碼</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="輸入目前密碼"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">新密碼</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="輸入新密碼"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">確認新密碼</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="再次輸入新密碼"
                  />
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  更新密碼
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">雙重驗證</h4>
              <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">雙重驗證</p>
                    <p className="text-sm text-gray-500">使用 Authenticator App 進行雙重驗證</p>
                  </div>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100">
                  設定
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">登入活動</h4>
              <div className="space-y-3">
                {[
                  { device: 'Chrome on Windows', location: '台北市', time: '目前登入中', current: true },
                  { device: 'Safari on iPhone', location: '新北市', time: '2小時前', current: false },
                  { device: 'Chrome on MacBook', location: '台中市', time: '昨天', current: false }
                ].map((session, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">目前</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{session.location} · {session.time}</p>
                    </div>
                    {!session.current && (
                      <button className="text-sm text-red-600 hover:text-red-700">登出</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API 金鑰</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-900">API Key</p>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700">重新產生</button>
                </div>
                <code className="block p-3 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto">
                  your-api-key-here
                </code>
                <p className="text-xs text-gray-500 mt-2">請妥善保管此金鑰，不要分享給他人</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">已連接的服務</h4>
              <div className="space-y-3">
                {[
                  { name: 'LINE Notify', status: 'connected', lastSync: '10 分鐘前' },
                  { name: '蝦皮 API', status: 'connected', lastSync: '5 分鐘前' },
                  { name: 'Google Sheets', status: 'disconnected', lastSync: '-' },
                  { name: 'Slack', status: 'disconnected', lastSync: '-' }
                ].map((service, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-500">
                        {service.status === 'connected' ? `最後同步：${service.lastSync}` : '尚未連接'}
                      </p>
                    </div>
                    <button className={`px-4 py-2 rounded-lg ${
                      service.status === 'connected'
                        ? 'border border-red-300 text-red-600 hover:bg-red-50'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}>
                      {service.status === 'connected' ? '中斷連接' : '連接'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">目前方案</h3>
              <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">專業版</span>
                  <span className="text-2xl font-bold">NT$ 2,999/月</span>
                </div>
                <p className="text-white/80 mb-4">包含所有功能，無限制使用量</p>
                <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100">
                  升級方案
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">付款方式</h4>
              <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Visa **** 4242</p>
                    <p className="text-sm text-gray-500">到期日：12/25</p>
                  </div>
                </div>
                <button className="text-sm text-indigo-600 hover:text-indigo-700">變更</button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">帳單歷史</h4>
              <div className="space-y-2">
                {[
                  { date: '2024-12-01', amount: 2999, status: '已付款' },
                  { date: '2024-11-01', amount: 2999, status: '已付款' },
                  { date: '2024-10-01', amount: 2999, status: '已付款' }
                ].map((bill, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">NT$ {bill.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{bill.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">{bill.status}</span>
                      <button className="text-sm text-indigo-600 hover:text-indigo-700">下載</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">設定</h1>
          <p className="text-gray-500 mt-1">管理您的帳號和平台設定</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              已儲存
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              儲存變更
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <nav className="divide-y divide-gray-100">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className={activeSection === section.id ? 'text-indigo-600' : 'text-gray-400'}>
                    {section.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{section.label}</p>
                    <p className="text-xs text-gray-500 truncate">{section.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeSection === section.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                </button>
              ))}
            </nav>
          </div>

          {/* Help Section */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">需要協助？</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              如有任何問題，請聯繫我們的支援團隊
            </p>
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors">
              聯繫客服
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
