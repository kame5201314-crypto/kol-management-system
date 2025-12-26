import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  Search,
  Send,
  Eye
} from 'lucide-react';
import StatsCard from '../shared/StatsCard';
import StatusBadge from '../shared/StatusBadge';
import { ConfirmModal } from '../shared/Modal';
import { commissionRecordService, kolProfileService } from '../../services/affiliateBrainService';
import {
  CommissionRecord,
  CommissionStatus,
  COMMISSION_STATUS_LABELS,
  COMMISSION_STATUS_COLORS
} from '../../types/affiliateBrain';

export default function CommissionReport() {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [filteredCommissions, setFilteredCommissions] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [approveModal, setApproveModal] = useState(false);
  const [payModal, setPayModal] = useState(false);

  useEffect(() => {
    loadCommissions();
  }, [selectedMonth]);

  useEffect(() => {
    filterCommissions();
  }, [commissions, statusFilter, searchQuery]);

  const loadCommissions = () => {
    setLoading(true);
    try {
      const data = commissionRecordService.getByMonth(selectedMonth);
      setCommissions(data);
    } catch (error) {
      console.error('Failed to load commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCommissions = () => {
    let filtered = [...commissions];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.kolName.toLowerCase().includes(query)
      );
    }

    setFilteredCommissions(filtered);
  };

  const handleApprove = () => {
    selectedIds.forEach(id => {
      commissionRecordService.approve(id, '王小明');
    });
    setSelectedIds(new Set());
    loadCommissions();
    setApproveModal(false);
  };

  const handlePay = () => {
    selectedIds.forEach(id => {
      commissionRecordService.markAsPaid(id, '王小明');
    });
    setSelectedIds(new Set());
    loadCommissions();
    setPayModal(false);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCommissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCommissions.map(c => c.id)));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(value);
  };

  // 統計
  const stats = {
    totalCommission: commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
    pendingApproval: commissions.filter(c => c.status === 'pending').length,
    approved: commissions.filter(c => c.status === 'approved').length,
    paid: commissions.filter(c => c.status === 'paid').length,
    pendingAmount: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0),
    approvedAmount: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.commissionAmount, 0)
  };

  const selectedPendingIds = Array.from(selectedIds).filter(id =>
    commissions.find(c => c.id === id)?.status === 'pending'
  );
  const selectedApprovedIds = Array.from(selectedIds).filter(id =>
    commissions.find(c => c.id === id)?.status === 'approved'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/ecommerce/affiliate"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">傭金報表</h1>
            <p className="text-gray-500 mt-1">計算、審核並發放 KOL 傭金</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            匯出報表
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="本月傭金總額"
          value={formatCurrency(stats.totalCommission)}
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="待審核"
          value={stats.pendingApproval}
          subtitle={formatCurrency(stats.pendingAmount)}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="已審核待發放"
          value={stats.approved}
          subtitle={formatCurrency(stats.approvedAmount)}
          icon={<CheckCircle className="w-6 h-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="已發放"
          value={stats.paid}
          subtitle="本月完成"
          icon={<Send className="w-6 h-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋 KOL 名稱..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'paid'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '全部' : COMMISSION_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-600">已選擇 {selectedIds.size} 筆</span>
            {selectedPendingIds.length > 0 && (
              <button
                onClick={() => setApproveModal(true)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                審核通過 ({selectedPendingIds.length})
              </button>
            )}
            {selectedApprovedIds.length > 0 && (
              <button
                onClick={() => setPayModal(true)}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                確認發放 ({selectedApprovedIds.length})
              </button>
            )}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              取消選擇
            </button>
          </div>
        )}
      </div>

      {/* Commission Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredCommissions.length && filteredCommissions.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">KOL</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">銷售額</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">訂單數</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">分潤率</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">傭金</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">狀態</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(commission.id)}
                        onChange={() => toggleSelect(commission.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                          {commission.kolName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{commission.kolName}</p>
                          <p className="text-sm text-gray-500">{commission.period}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(commission.totalSales)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {commission.ordersCount}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {commission.commissionRate}%
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {formatCurrency(commission.commissionAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={COMMISSION_STATUS_LABELS[commission.status]}
                        color={COMMISSION_STATUS_COLORS[commission.status]}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {commission.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedIds(new Set([commission.id]));
                              setApproveModal(true);
                            }}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            審核
                          </button>
                        )}
                        {commission.status === 'approved' && (
                          <button
                            onClick={() => {
                              setSelectedIds(new Set([commission.id]));
                              setPayModal(true);
                            }}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            發放
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCommissions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>此月份尚無傭金記錄</p>
            </div>
          )}
        </div>
      )}

      {/* Approve Modal */}
      <ConfirmModal
        isOpen={approveModal}
        onClose={() => setApproveModal(false)}
        onConfirm={handleApprove}
        title="審核通過"
        message={`確定要審核通過 ${selectedPendingIds.length} 筆傭金記錄嗎？`}
        confirmText="確認審核"
        confirmColor="primary"
      />

      {/* Pay Modal */}
      <ConfirmModal
        isOpen={payModal}
        onClose={() => setPayModal(false)}
        onConfirm={handlePay}
        title="確認發放"
        message={`確定要發放 ${selectedApprovedIds.length} 筆傭金嗎？此操作將標記為已發放。`}
        confirmText="確認發放"
        confirmColor="primary"
      />
    </div>
  );
}
