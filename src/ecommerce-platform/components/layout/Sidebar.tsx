import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Truck,
  ChevronDown,
  ChevronRight,
  Settings,
  Cog,
  ShoppingCart,
  X,
  Sparkles,
  BookOpen,
  Upload,
  List,
  Archive,
  Shield,
  Image,
  Target,
  Gavel
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  subItems?: NavItem[];  // 子選單
}

interface ModuleGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// 導航結構
const modules: ModuleGroup[] = [
  {
    id: 'operations',
    label: '營運自動化',
    icon: <Cog className="w-5 h-5" />,
    items: [
      {
        path: '/ecommerce/affiliate',
        label: 'Affiliate Brain',
        icon: <Users className="w-5 h-5" />
      },
      {
        path: '/ecommerce/invoice',
        label: 'Invoice Flow',
        icon: <FileText className="w-5 h-5" />,
        subItems: [
          {
            path: '/ecommerce/invoice/upload',
            label: '上傳發票',
            icon: <Upload className="w-4 h-4" />
          },
          {
            path: '/ecommerce/invoice/list',
            label: '發票列表',
            icon: <List className="w-4 h-4" />
          },
          {
            path: '/ecommerce/invoice/archive',
            label: '月度歸檔',
            icon: <Archive className="w-4 h-4" />
          },
          {
            path: '/ecommerce/invoice/vendor-rules',
            label: '供應商學習',
            icon: <BookOpen className="w-4 h-4" />
          }
        ]
      },
      {
        path: '/ecommerce/logistics',
        label: 'Logistics Radar',
        icon: <Truck className="w-5 h-5" />
      }
    ]
  },
  {
    id: 'protection',
    label: '競爭防禦',
    icon: <Shield className="w-5 h-5" />,
    items: [
      {
        path: '/ecommerce/image-guardian',
        label: 'Image Guardian',
        icon: <Shield className="w-5 h-5" />,
        subItems: [
          {
            path: '/ecommerce/image-guardian/vault',
            label: '數位資產庫',
            icon: <Image className="w-4 h-4" />
          },
          {
            path: '/ecommerce/image-guardian/hunter',
            label: '全網巡邏獵人',
            icon: <Target className="w-4 h-4" />
          },
          {
            path: '/ecommerce/image-guardian/warroom',
            label: '維權作戰中心',
            icon: <Gavel className="w-4 h-4" />
          }
        ]
      }
    ]
  }
];

// 未來模組預留
const futureModules: ModuleGroup[] = [
  {
    id: 'cash-flow',
    label: '現金流管理',
    icon: <ShoppingCart className="w-5 h-5" />,
    items: [
      {
        path: '/ecommerce/price-monitor',
        label: 'Smart Price Monitor',
        icon: <span className="w-5 h-5 flex items-center justify-center text-gray-400">$</span>
      }
    ]
  }
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [expandedModules, setExpandedModules] = useState<string[]>(['operations', 'protection']);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isItemActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const renderModuleGroup = (module: ModuleGroup, disabled = false) => {
    const isExpanded = expandedModules.includes(module.id);
    const hasActiveItem = module.items.some(item => isItemActive(item.path));

    return (
      <div key={module.id} className="mb-2">
        <button
          onClick={() => !disabled && toggleModule(module.id)}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : hasActiveItem
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={hasActiveItem ? 'text-indigo-600' : 'text-gray-400'}>
              {module.icon}
            </span>
            <span className="text-sm font-medium">{module.label}</span>
          </div>
          {!disabled && (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          )}
          {disabled && (
            <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
              即將推出
            </span>
          )}
        </button>

        {isExpanded && !disabled && (
          <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1">
            {module.items.map((item) => (
              <div key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isItemActive(item.path)
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className={isItemActive(item.path) ? 'text-indigo-600' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
                {/* 子選單 */}
                {item.subItems && isItemActive(item.path) && (
                  <div className="ml-4 mt-1 pl-3 border-l border-gray-200 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        onClick={onClose}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                          location.pathname === subItem.path
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <span className={location.pathname === subItem.path ? 'text-purple-600' : 'text-gray-400'}>
                          {subItem.icon}
                        </span>
                        <span className="text-xs">{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link to="/ecommerce/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">MEFU</h1>
                <p className="text-xs text-gray-500 -mt-0.5">電商營運平台</p>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {/* Dashboard Link */}
            <Link
              to="/ecommerce/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-4 ${
                location.pathname === '/ecommerce/dashboard'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 ${
                location.pathname === '/ecommerce/dashboard' ? 'text-indigo-600' : 'text-gray-400'
              }`} />
              <span className="font-medium">儀表板</span>
            </Link>

            {/* Module Groups */}
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                模組
              </p>
              {modules.map(module => renderModuleGroup(module))}

              {/* Future Modules (disabled) */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  即將推出
                </p>
                {futureModules.map(module => renderModuleGroup(module, true))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/ecommerce/settings"
              className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="font-medium">設定</span>
            </Link>

            {/* Plan Info */}
            <div className="mt-3 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
              <p className="text-xs opacity-80">目前方案</p>
              <p className="font-semibold">Pro Plan</p>
              <p className="text-xs opacity-70 mt-1">有效期至 2025/12/31</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
