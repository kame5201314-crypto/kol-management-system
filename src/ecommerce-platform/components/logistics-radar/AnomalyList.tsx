import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { ConfirmModal } from '../shared/Modal';
import { NoDataEmpty } from '../shared/EmptyState';
import { anomalyService } from '../../services/logisticsRadarService';
import {
  Anomaly,
  AnomalyStatus,
  AnomalySeverity,
  ANOMALY_TYPE_LABELS,
  ANOMALY_SEVERITY_LABELS,
  ANOMALY_SEVERITY_COLORS,
  ANOMALY_STATUS_LABELS,
  ANOMALY_STATUS_COLORS,
  CARRIER_LABELS
} from '../../types/logisticsRadar';

export default function AnomalyList() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [filteredAnomalies, setFilteredAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AnomalyStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity | 'all'>('all');
  const [resolveModal, setResolveModal] = useState<{ isOpen: boolean; anomalyId: string | null }>({
    isOpen: false,
    anomalyId: null
  });
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    loadAnomalies();
  }, []);

  useEffect(() => {
    filterAnomalies();
  }, [anomalies, searchQuery, statusFilter, severityFilter]);

  const loadAnomalies = () => {
    setLoading(true);
    try {
      const data = anomalyService.getAll();
      setAnomalies(data);
    } catch (error) {
      console.error('Failed to load anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAnomalies = () => {
    let filtered = [...anomalies];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.trackingNumber.toLowerCase().includes(query) ||
        a.orderId.toLowerCase().includes(query) ||
        a.customerName.toLowerCase().includes(query) ||
        a.title.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(a => a.severity === severityFilter);
    }

    // Sort by severity and then by date
    filtered.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
    });

    setFilteredAnomalies(filtered);
  };

  const handleAcknowledge = (id: string) => {
    anomalyService.acknowledge(id);
    loadAnomalies();
  };

  const handleInvestigate = (id: string) => {
    anomalyService.investigate(id);
    loadAnomalies();
  };

  const handleResolve = () => {
    if (!resolveModal.anomalyId || !resolution.trim()) return;
    anomalyService.resolve(resolveModal.anomalyId, resolution, '王小明');
    loadAnomalies();
    setResolveModal({ isOpen: false, anomalyId: null });
    setResolution('');
  };

  const handleDismiss = (id: string) => {
    anomalyService.dismiss(id);
    loadAnomalies();
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} 分鐘前`;
    if (diffHours < 24) return `${diffHours} 小時前`;
    return `${diffDays} 天前`;
  };

  const statusCounts = {
    all: anomalies.length,
    new: anomalies.filter(a => a.status === 'new').length,
    acknowledged: anomalies.filter(a => a.status === 'acknowledged').length,
    investigating: anomalies.filter(a => a.status === 'investigating').length,
    resolved: anomalies.filter(a => a.status === 'resolved').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/ecommerce/logistics"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">異常監控</h1>
            <p className="text-gray-500 mt-1">管理所有物流異常警報</p>
          </div>
        </div>
        <button
          onClick={loadAnomalies}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重新整理
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋追蹤編號、訂單編號或客戶名稱..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as AnomalySeverity | 'all')}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
          >
            <option value="all">所有嚴重程度</option>
            <option value="critical">緊急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {(['all', 'new', 'acknowledged', 'investigating'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '全部' : ANOMALY_STATUS_LABELS[status]}
                <span className="ml-1.5 opacity-70">({statusCounts[status]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Anomaly List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredAnomalies.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <NoDataEmpty
            title="沒有找到異常"
            description={searchQuery ? '嘗試使用不同的搜尋條件' : '目前沒有異常警報，系統運作正常'}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-shadow hover:shadow-md ${
                anomaly.severity === 'critical' ? 'border-red-200' :
                anomaly.severity === 'high' ? 'border-orange-200' : 'border-gray-100'
              }`}
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Side */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      anomaly.severity === 'critical' ? 'bg-red-100' :
                      anomaly.severity === 'high' ? 'bg-orange-100' :
                      anomaly.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      <AlertTriangle className={`w-6 h-6 ${
                        anomaly.severity === 'critical' ? 'text-red-600' :
                        anomaly.severity === 'high' ? 'text-orange-600' :
                        anomaly.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{anomaly.title}</h3>
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
                      <p className="text-sm text-gray-500 mt-1">{anomaly.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="font-mono">{anomaly.trackingNumber}</span>
                        <span>·</span>
                        <span>{anomaly.customerName}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTimeAgo(anomaly.detectedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    {anomaly.status === 'new' && (
                      <button
                        onClick={() => handleAcknowledge(anomaly.id)}
                        className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                      >
                        確認
                      </button>
                    )}
                    {anomaly.status === 'acknowledged' && (
                      <button
                        onClick={() => handleInvestigate(anomaly.id)}
                        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        調查
                      </button>
                    )}
                    {['new', 'acknowledged', 'investigating'].includes(anomaly.status) && (
                      <>
                        <button
                          onClick={() => setResolveModal({ isOpen: true, anomalyId: anomaly.id })}
                          className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          解決
                        </button>
                        <button
                          onClick={() => handleDismiss(anomaly.id)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          忽略
                        </button>
                      </>
                    )}
                    {anomaly.status === 'resolved' && anomaly.resolution && (
                      <div className="text-sm text-green-600">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        已解決
                      </div>
                    )}
                  </div>
                </div>

                {/* Notification Info */}
                {anomaly.notificationsSent.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MessageSquare className="w-4 h-4" />
                      已發送 {anomaly.notificationsSent.length} 則通知給客戶
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setResolveModal({ isOpen: false, anomalyId: null })} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">解決異常</h3>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="請輸入解決方案描述..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setResolveModal({ isOpen: false, anomalyId: null })}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleResolve}
                disabled={!resolution.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                確認解決
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
