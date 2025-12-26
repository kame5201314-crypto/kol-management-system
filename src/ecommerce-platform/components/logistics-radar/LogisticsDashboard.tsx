import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  ArrowRight,
  Package,
  TrendingUp,
  Settings
} from 'lucide-react';
import StatsCard from '../shared/StatsCard';
import StatusBadge from '../shared/StatusBadge';
import { logisticsDashboardService } from '../../services/logisticsRadarService';
import {
  LogisticsRadarStats,
  CARRIER_LABELS,
  ANOMALY_TYPE_LABELS,
  ANOMALY_SEVERITY_LABELS,
  ANOMALY_SEVERITY_COLORS,
  ANOMALY_STATUS_LABELS,
  ANOMALY_STATUS_COLORS
} from '../../types/logisticsRadar';

export default function LogisticsDashboard() {
  const [stats, setStats] = useState<LogisticsRadarStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setLoading(true);
    try {
      const data = logisticsDashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logistics Radar</h1>
          <p className="text-gray-500 mt-1">物流異常偵測系統</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/ecommerce/logistics/rules"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            規則設定
          </Link>
          <Link
            to="/ecommerce/logistics/monitor"
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            異常監控
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="運送中包裹"
          value={stats.shipmentsInTransit}
          subtitle={`共 ${stats.totalActiveShipments} 個活躍包裹`}
          icon={<Truck className="w-6 h-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="今日送達"
          value={stats.deliveredToday}
          trend={{ value: 8.5, label: '較昨日' }}
          icon={<CheckCircle className="w-6 h-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="異常警報"
          value={stats.unresolvedAnomalies}
          subtitle={`${stats.criticalAnomalies} 個緊急`}
          icon={<AlertTriangle className="w-6 h-6" />}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />
        <StatsCard
          title="今日通知"
          value={stats.notificationsSentToday}
          subtitle="已發送給客戶"
          icon={<Bell className="w-6 h-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Anomalies */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">近期異常</h2>
            <Link
              to="/ecommerce/logistics/monitor"
              className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentAnomalies.slice(0, 5).map((anomaly) => (
              <div
                key={anomaly.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    anomaly.severity === 'critical' ? 'bg-red-100' :
                    anomaly.severity === 'high' ? 'bg-orange-100' :
                    anomaly.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${
                      anomaly.severity === 'critical' ? 'text-red-600' :
                      anomaly.severity === 'high' ? 'text-orange-600' :
                      anomaly.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{anomaly.title}</p>
                    <p className="text-sm text-gray-500">
                      {anomaly.trackingNumber} · {anomaly.customerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge
                    label={ANOMALY_SEVERITY_LABELS[anomaly.severity]}
                    color={ANOMALY_SEVERITY_COLORS[anomaly.severity]}
                    size="sm"
                  />
                  <StatusBadge
                    label={ANOMALY_STATUS_LABELS[anomaly.status]}
                    color={ANOMALY_STATUS_COLORS[anomaly.status]}
                    size="sm"
                  />
                </div>
              </div>
            ))}

            {stats.recentAnomalies.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto text-green-300 mb-2" />
                <p>目前沒有異常警報</p>
              </div>
            )}
          </div>
        </div>

        {/* Carrier Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">物流商績效</h2>
          </div>

          <div className="space-y-4">
            {stats.carrierPerformance.slice(0, 5).map((carrier) => (
              <div key={carrier.carrier} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {CARRIER_LABELS[carrier.carrier]}
                  </span>
                  <span className="text-sm text-gray-500">
                    {carrier.performanceScore}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      carrier.performanceScore >= 90 ? 'bg-green-500' :
                      carrier.performanceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${carrier.performanceScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{carrier.totalShipments} 件</span>
                  <span>平均 {carrier.avgDeliveryDays} 天</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/ecommerce/logistics/monitor"
          className="flex items-center gap-4 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
        >
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">異常監控</p>
            <p className="text-sm text-gray-500">{stats.unresolvedAnomalies} 個待處理</p>
          </div>
        </Link>

        <Link
          to="/ecommerce/logistics/rules"
          className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <div className="p-3 bg-blue-100 rounded-lg">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">規則設定</p>
            <p className="text-sm text-gray-500">配置異常偵測規則</p>
          </div>
        </Link>

        <Link
          to="/ecommerce/logistics/notifications"
          className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
        >
          <div className="p-3 bg-purple-100 rounded-lg">
            <Bell className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">通知歷史</p>
            <p className="text-sm text-gray-500">查看發送記錄</p>
          </div>
        </Link>
      </div>

      {/* Trend Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">異常趨勢</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
            <p>異常趨勢圖表</p>
            <p className="text-sm mt-1">(可整合 Recharts 繪製)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
