import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  FolderArchive,
  TrendingUp,
  TrendingDown,
  Eye,
  Filter
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { monthlyArchiveService, invoiceService } from '../../services/invoiceFlowService';
import { MonthlyArchive as MonthlyArchiveType, Invoice, INVOICE_CATEGORY_LABELS, INVOICE_STATUS_LABELS } from '../../types/invoiceFlow';

export default function MonthlyArchive() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const archives = useMemo(() => monthlyArchiveService.getAll(), []);

  const monthlyInvoices = useMemo(() => {
    if (!selectedMonth) return [];
    return invoiceService.getByMonth(selectedMonth);
  }, [selectedMonth]);

  const yearlyArchives = useMemo(() => {
    return archives.filter(a => a.month.startsWith(String(selectedYear)));
  }, [archives, selectedYear]);

  const yearlyTotal = useMemo(() => {
    return yearlyArchives.reduce((sum, a) => sum + a.totalAmount, 0);
  }, [yearlyArchives]);

  const months = [
    { value: '01', label: '一月' },
    { value: '02', label: '二月' },
    { value: '03', label: '三月' },
    { value: '04', label: '四月' },
    { value: '05', label: '五月' },
    { value: '06', label: '六月' },
    { value: '07', label: '七月' },
    { value: '08', label: '八月' },
    { value: '09', label: '九月' },
    { value: '10', label: '十月' },
    { value: '11', label: '十一月' },
    { value: '12', label: '十二月' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getMonthArchive = (monthValue: string): MonthlyArchiveType | undefined => {
    return archives.find(a => a.month === `${selectedYear}-${monthValue}`);
  };

  const handleMonthClick = (monthValue: string) => {
    const monthKey = `${selectedYear}-${monthValue}`;
    setSelectedMonth(monthKey);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      advertising: 'bg-blue-100 text-blue-700',
      software: 'bg-purple-100 text-purple-700',
      hardware: 'bg-orange-100 text-orange-700',
      office: 'bg-green-100 text-green-700',
      travel: 'bg-cyan-100 text-cyan-700',
      meal: 'bg-yellow-100 text-yellow-700',
      communication: 'bg-indigo-100 text-indigo-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.other;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      archived: 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/ecommerce/invoice"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">月度歸檔</h1>
            <p className="text-gray-500 mt-1">按月份查看發票歸檔和統計資料</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          匯出年度報表
        </button>
      </div>

      {/* Year Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedYear(y => y - 1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{selectedYear} 年度</h2>
            <p className="text-gray-500 mt-1">年度總金額：{formatCurrency(yearlyTotal)}</p>
          </div>
          <button
            onClick={() => setSelectedYear(y => y + 1)}
            disabled={selectedYear >= currentYear}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {months.map((month) => {
            const archive = getMonthArchive(month.value);
            const isFuture = selectedYear === currentYear && parseInt(month.value) > new Date().getMonth() + 1;

            return (
              <button
                key={month.value}
                onClick={() => !isFuture && handleMonthClick(month.value)}
                disabled={isFuture}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedMonth === `${selectedYear}-${month.value}`
                    ? 'border-indigo-500 bg-indigo-50'
                    : archive
                    ? 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    : isFuture
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{month.label}</span>
                  {archive && (
                    <FolderArchive className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                {archive ? (
                  <>
                    <p className="text-lg font-semibold text-indigo-600">
                      {formatCurrency(archive.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {archive.totalInvoices} 張發票
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">
                    {isFuture ? '尚未到來' : '無資料'}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Month Detail */}
      {selectedMonth && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">
                {selectedMonth.replace('-', ' 年 ')} 月發票明細
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <FileText className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                匯出
              </button>
            </div>
          </div>

          {/* Statistics Summary */}
          {(() => {
            const archive = archives.find(a => a.month === selectedMonth);
            if (!archive) return null;

            return (
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{archive.totalInvoices}</p>
                    <p className="text-sm text-gray-500">發票總數</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{formatCurrency(archive.totalAmount)}</p>
                    <p className="text-sm text-gray-500">總金額</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {archive.byStatus.find(s => s.status === 'confirmed')?.count || 0}
                    </p>
                    <p className="text-sm text-gray-500">已確認</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {archive.byStatus.find(s => s.status === 'pending')?.count || 0}
                    </p>
                    <p className="text-sm text-gray-500">待審核</p>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">依分類統計</p>
                  <div className="flex flex-wrap gap-2">
                    {archive.byCategory.map((cat) => (
                      <span
                        key={cat.category}
                        className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(cat.category)}`}
                      >
                        {INVOICE_CATEGORY_LABELS[cat.category]}: {cat.count} 張 ({formatCurrency(cat.amount)})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Invoice List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">發票號碼</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">商店名稱</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">日期</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">分類</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">金額</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">狀態</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyInvoices.length > 0 ? (
                  monthlyInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <code className="text-sm font-mono text-gray-900">{invoice.invoiceNumber}</code>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{invoice.storeName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{invoice.invoiceDate}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={INVOICE_CATEGORY_LABELS[invoice.category]}
                          color={getCategoryColor(invoice.category)}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={INVOICE_STATUS_LABELS[invoice.status]}
                          color={getStatusColor(invoice.status)}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      此月份無發票記錄
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yearly Trend Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">年度趨勢分析</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">圖表區域</p>
            <p className="text-sm text-gray-400">整合 Recharts 後可顯示年度支出趨勢</p>
          </div>
        </div>
      </div>
    </div>
  );
}
