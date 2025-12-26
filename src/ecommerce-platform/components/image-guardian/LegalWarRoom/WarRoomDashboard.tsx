import React, { useState, useEffect } from 'react';
import {
  Scale,
  FileWarning,
  Mail,
  Flag,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  LegalCase,
  CaseStatus,
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS
} from '../../../types/imageGuardian';
import { imageGuardianService } from '../../../services/imageGuardianService';
import CaseList from './CaseList';
import CaseDetail from './CaseDetail';

interface WarRoomDashboardProps {
  onCreateCase?: () => void;
}

const WarRoomDashboard: React.FC<WarRoomDashboardProps> = ({
  onCreateCase
}) => {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<LegalCase[]>([]);
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, statusFilter]);

  const loadCases = () => {
    setIsLoading(true);
    const loaded = imageGuardianService.cases.getAll();
    setCases(loaded);
    setIsLoading(false);
  };

  const filterCases = () => {
    if (statusFilter === 'all') {
      setFilteredCases(cases);
    } else {
      setFilteredCases(cases.filter(c => c.status === statusFilter));
    }
  };

  const handleCaseUpdate = () => {
    loadCases();
    if (selectedCase) {
      const updated = imageGuardianService.cases.getById(selectedCase.id);
      if (updated) setSelectedCase(updated);
    }
  };

  const stats = {
    total: cases.length,
    active: cases.filter(c => !['resolved', 'dismissed'].includes(c.status)).length,
    resolved: cases.filter(c => c.status === 'resolved').length,
    warningsSent: cases.reduce((sum, c) => sum + c.letters.filter(l => l.status !== 'draft').length, 0),
    reported: cases.filter(c => c.status === 'reported').length,
    resolutionRate: cases.length > 0
      ? ((cases.filter(c => c.status === 'resolved').length / cases.length) * 100).toFixed(1)
      : 0
  };

  const statusCounts: Record<CaseStatus, number> = {
    detected: cases.filter(c => c.status === 'detected').length,
    reviewing: cases.filter(c => c.status === 'reviewing').length,
    warning_sent: cases.filter(c => c.status === 'warning_sent').length,
    reported: cases.filter(c => c.status === 'reported').length,
    resolved: cases.filter(c => c.status === 'resolved').length,
    dismissed: cases.filter(c => c.status === 'dismissed').length
  };

  return (
    <div className="space-y-6">
      {/* 標題區 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Scale className="w-7 h-7 text-indigo-600" />
            維權作戰中心
          </h1>
          <p className="text-gray-600 mt-1">管理侵權案件，一鍵發送警告信與檢舉</p>
        </div>
        <button
          onClick={onCreateCase}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          建立案件
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileWarning className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">總案件數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">進行中</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Mail className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已發警告</p>
              <p className="text-2xl font-bold text-gray-900">{stats.warningsSent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Flag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已檢舉</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reported}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已解決</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">解決率</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolutionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 狀態篩選 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            狀態篩選：
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              statusFilter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部 ({cases.length})
          </button>
          {(Object.keys(CASE_STATUS_LABELS) as CaseStatus[]).map(status => (
            statusCounts[status] > 0 && (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  statusFilter === status
                    ? `${CASE_STATUS_COLORS[status]} font-medium`
                    : `${CASE_STATUS_COLORS[status]} opacity-70 hover:opacity-100`
                }`}
              >
                {CASE_STATUS_LABELS[status]} ({statusCounts[status]})
              </button>
            )
          ))}

          <button
            onClick={loadCases}
            className="ml-auto p-2 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 案件列表 */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">載入中...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Scale className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {cases.length === 0 ? '尚無案件' : '沒有符合篩選條件的案件'}
          </h3>
          <p className="text-gray-500 mb-4">
            {cases.length === 0
              ? '發現侵權時會自動建立案件，或手動建立新案件'
              : '嘗試調整篩選條件'}
          </p>
          {cases.length === 0 && (
            <button
              onClick={onCreateCase}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              建立第一個案件
            </button>
          )}
        </div>
      ) : (
        <CaseList
          cases={filteredCases}
          onSelectCase={setSelectedCase}
        />
      )}

      {/* 案件詳情 Modal */}
      {selectedCase && (
        <CaseDetail
          case_={selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdate={handleCaseUpdate}
        />
      )}
    </div>
  );
};

export default WarRoomDashboard;
