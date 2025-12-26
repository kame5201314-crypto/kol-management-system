import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  DollarSign,
  Calendar
} from 'lucide-react';
import StatsCard from '../shared/StatsCard';
import StatusBadge from '../shared/StatusBadge';
import { invoiceDashboardService } from '../../services/invoiceFlowService';
import {
  InvoiceFlowStats,
  INVOICE_CATEGORY_LABELS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS
} from '../../types/invoiceFlow';

export default function InvoiceDashboard() {
  const [stats, setStats] = useState<InvoiceFlowStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setLoading(true);
    try {
      const data = invoiceDashboardService.getStats();
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
          <h1 className="text-2xl font-bold text-gray-900">Invoice Flow</h1>
          <p className="text-gray-500 mt-1">發票歸檔機器人</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/ecommerce/invoice/list"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            查看全部
          </Link>
          <Link
            to="/ecommerce/invoice/upload"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            上傳發票
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="本月發票數"
          value={stats.totalThisMonth}
          subtitle="累計張數"
          icon={<FileText className="w-6 h-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="本月支出"
          value={formatCurrency(stats.totalAmountThisMonth)}
          trend={{ value: -5.2, label: '較上月' }}
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="待審核"
          value={stats.pendingReview}
          subtitle="需人工確認"
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="處理中"
          value={stats.processingOCR}
          subtitle="OCR 識別中"
          icon={<AlertCircle className="w-6 h-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">支出分類</h2>
            <Link
              to="/ecommerce/invoice/archive"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              月度報表 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-600">
                  {INVOICE_CATEGORY_LABELS[cat.category]}
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 text-right text-sm font-medium text-gray-900">
                  {cat.percentage}%
                </div>
                <div className="w-28 text-right text-sm text-gray-500">
                  {formatCurrency(cat.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">近期上傳</h2>
            <Link
              to="/ecommerce/invoice/list"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.recentUploads.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {invoice.storeName || '未知商家'}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {invoice.invoiceNumber || '未識別'}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <StatusBadge
                      label={INVOICE_STATUS_LABELS[invoice.status]}
                      color={INVOICE_STATUS_COLORS[invoice.status]}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            {stats.recentUploads.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Upload className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>尚無上傳記錄</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/ecommerce/invoice/upload"
          className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <div className="p-3 bg-blue-100 rounded-lg">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">上傳發票</p>
            <p className="text-sm text-gray-500">拖放或選擇檔案上傳</p>
          </div>
        </Link>

        <Link
          to="/ecommerce/invoice/list?status=pending_review"
          className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors"
        >
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">待審核發票</p>
            <p className="text-sm text-gray-500">{stats.pendingReview} 張待確認</p>
          </div>
        </Link>

        <Link
          to="/ecommerce/invoice/archive"
          className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
        >
          <div className="p-3 bg-green-100 rounded-lg">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">月度歸檔</p>
            <p className="text-sm text-gray-500">查看歷史記錄</p>
          </div>
        </Link>
      </div>

      {/* Monthly Trend Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">支出趨勢</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
            <p>月度支出趨勢圖表</p>
            <p className="text-sm mt-1">(可整合 Recharts 繪製)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
