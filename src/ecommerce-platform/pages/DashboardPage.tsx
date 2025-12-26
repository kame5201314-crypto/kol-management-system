import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Truck,
  TrendingUp,
  ArrowRight,
  DollarSign,
  AlertCircle,
  Package
} from 'lucide-react';
import StatsCard, { GradientStatsCard } from '../components/shared/StatsCard';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
        <p className="text-gray-500 mt-1">電商營運平台總覽</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientStatsCard
          title="本月營收"
          value="NT$ 2,450,000"
          subtitle="+12.5% 較上月"
          icon={<DollarSign className="w-6 h-6" />}
          gradient="from-green-500 to-emerald-600"
        />
        <StatsCard
          title="活躍 KOL"
          value={12}
          trend={{ value: 8.3, label: '較上月' }}
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatsCard
          title="待處理發票"
          value={45}
          subtitle="需審核確認"
          icon={<FileText className="w-6 h-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="物流異常"
          value={3}
          subtitle="需立即處理"
          icon={<AlertCircle className="w-6 h-6" />}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Affiliate Brain */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Affiliate Brain</h3>
                <p className="text-sm opacity-80">KOL 結算自動化</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">待發放傭金</span>
                <span className="font-semibold text-gray-900">NT$ 96,500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">本月訂單匹配</span>
                <span className="font-semibold text-gray-900">1,256 筆</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">本月 KOL 銷售</span>
                <span className="font-semibold text-gray-900">NT$ 1,850,000</span>
              </div>
            </div>
            <Link
              to="/ecommerce/affiliate"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
            >
              進入模組 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Invoice Flow */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Invoice Flow</h3>
                <p className="text-sm opacity-80">發票歸檔機器人</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">本月發票數</span>
                <span className="font-semibold text-gray-900">342 張</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">待審核</span>
                <span className="font-semibold text-orange-600">45 張</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">本月支出</span>
                <span className="font-semibold text-gray-900">NT$ 156,800</span>
              </div>
            </div>
            <Link
              to="/ecommerce/invoice"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              進入模組 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Logistics Radar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6 bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Logistics Radar</h3>
                <p className="text-sm opacity-80">物流異常偵測</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">運送中包裹</span>
                <span className="font-semibold text-gray-900">89 件</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">異常警報</span>
                <span className="font-semibold text-red-600">3 件</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">今日送達</span>
                <span className="font-semibold text-green-600">28 件</span>
              </div>
            </div>
            <Link
              to="/ecommerce/logistics"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium"
            >
              進入模組 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">近期活動</h2>
        <div className="space-y-4">
          {[
            { icon: Package, text: '訂單批次匯入完成：156 筆訂單已處理', time: '5 分鐘前', color: 'bg-green-100 text-green-600' },
            { icon: AlertCircle, text: '物流異常：3 個包裹超過 72 小時未送達', time: '1 小時前', color: 'bg-red-100 text-red-600' },
            { icon: FileText, text: '發票 OCR 識別完成：15 張發票待審核', time: '2 小時前', color: 'bg-blue-100 text-blue-600' },
            { icon: DollarSign, text: '傭金計算完成：12月份傭金待核准', time: '3 小時前', color: 'bg-purple-100 text-purple-600' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`p-2 rounded-lg ${activity.color}`}>
                <activity.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
