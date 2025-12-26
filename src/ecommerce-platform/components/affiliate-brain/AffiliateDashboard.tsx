import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  DollarSign,
  TrendingUp,
  FileUp,
  Calculator,
  UserPlus,
  ArrowRight,
  Clock
} from 'lucide-react';
import StatsCard, { GradientStatsCard } from '../shared/StatsCard';
import { affiliateDashboardService } from '../../services/affiliateBrainService';
import { AffiliateBrainStats } from '../../types/affiliateBrain';

export default function AffiliateDashboard() {
  const [stats, setStats] = useState<AffiliateBrainStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setLoading(true);
    try {
      const data = affiliateDashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Brain</h1>
          <p className="text-gray-500 mt-1">KOL/團購主結算自動化</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/ecommerce/affiliate/import"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileUp className="w-4 h-4" />
            匯入訂單
          </Link>
          <Link
            to="/ecommerce/affiliate/kols"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            新增 KOL
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="活躍 KOL"
          value={stats.activeKOLs}
          subtitle={`共 ${stats.totalKOLs} 位合作夥伴`}
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatsCard
          title="本月銷售額"
          value={formatCurrency(stats.totalSalesThisMonth)}
          trend={{ value: 12.5, label: '較上月' }}
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="本月傭金"
          value={formatCurrency(stats.totalCommissionThisMonth)}
          trend={{ value: 8.3, label: '較上月' }}
          icon={<Calculator className="w-6 h-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatsCard
          title="待發放傭金"
          value={formatCurrency(stats.pendingCommission)}
          subtitle="需確認發放"
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">頂尖 KOL</h2>
            <Link
              to="/ecommerce/affiliate/kols"
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats.topPerformers.map((performer, index) => (
              <div
                key={performer.kolId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{performer.kolName}</p>
                    <p className="text-sm text-gray-500">{performer.orders} 筆訂單</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(performer.sales)}
                  </p>
                  <p className="text-sm text-gray-500">累計銷售</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Imports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">近期匯入</h2>
            <Link
              to="/ecommerce/affiliate/import"
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              匯入 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.recentImports.map((batch) => (
              <div key={batch.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[180px]">
                      {batch.fileName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {batch.matchedOrders}/{batch.totalOrders} 筆匹配
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    batch.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {batch.status === 'completed' ? '已完成' : '處理中'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(batch.importedAt).toLocaleString('zh-TW')}
                </p>
              </div>
            ))}

            {stats.recentImports.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileUp className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>尚無匯入記錄</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/ecommerce/affiliate/import"
          className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">匯入訂單報表</p>
            <p className="text-sm text-gray-500">上傳 CSV/Excel 訂單資料</p>
          </div>
        </Link>

        <Link
          to="/ecommerce/affiliate/commissions"
          className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
        >
          <div className="p-3 bg-purple-100 rounded-lg">
            <Calculator className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">傭金結算</p>
            <p className="text-sm text-gray-500">計算並審核傭金報表</p>
          </div>
        </Link>

        <Link
          to="/ecommerce/affiliate/portal"
          className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
        >
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">KOL Portal</p>
            <p className="text-sm text-gray-500">KOL 自助查詢頁面</p>
          </div>
        </Link>
      </div>

      {/* Sales Trend Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">銷售趨勢</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
            <p>銷售趨勢圖表</p>
            <p className="text-sm mt-1">（可整合 Recharts 繪製）</p>
          </div>
        </div>
      </div>
    </div>
  );
}
