import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  User,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

// 麵包屑路徑對應
const pathLabels: Record<string, string> = {
  'ecommerce': '電商平台',
  'dashboard': '儀表板',
  'affiliate': 'Affiliate Brain',
  'invoice': 'Invoice Flow',
  'logistics': 'Logistics Radar',
  'image-guardian': 'Image Guardian',
  'overview': '總覽',
  'kols': 'KOL 管理',
  'import': '訂單匯入',
  'commissions': '傭金報表',
  'portal': 'KOL Portal',
  'upload': '上傳',
  'list': '列表',
  'archive': '歸檔',
  'monitor': '異常監控',
  'rules': '規則設定',
  'notifications': '通知歷史',
  'settings': '設定',
  'vault': '數位資產庫',
  'hunter': '全網巡邏獵人',
  'warroom': '維權作戰中心'
};

export default function Header({ onMenuClick, user }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 產生麵包屑
  const breadcrumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => {
      const path = '/' + array.slice(0, index + 1).join('/');
      const label = pathLabels[segment] || segment;
      return { path, label };
    });

  // 模擬通知
  const notifications = [
    { id: '1', title: '新訂單匯入完成', message: '成功匯入 156 筆訂單', time: '5 分鐘前', unread: true },
    { id: '2', title: '物流異常警報', message: '3 個包裹超過 72 小時未送達', time: '1 小時前', unread: true },
    { id: '3', title: '傭金計算完成', message: '12月傭金已計算完成，待審核', time: '3 小時前', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    // TODO: Implement logout
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-1 text-sm overflow-hidden max-w-xl">
            {breadcrumbs.slice(0, 4).map((crumb, index) => (
              <React.Fragment key={`${crumb.path}-${index}`}>
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
                {index === breadcrumbs.length - 1 || index === 3 ? (
                  <span className="text-gray-900 font-medium truncate">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-gray-500 hover:text-gray-700 whitespace-nowrap"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Help */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">通知</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                          notification.unread ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notification.unread && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          )}
                          <div className={notification.unread ? '' : 'ml-5'}>
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                      查看全部通知
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.name || '使用者'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || '使用者'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/ecommerce/settings/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" />
                      個人資料
                    </Link>
                    <Link
                      to="/ecommerce/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" />
                      設定
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      登出
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
