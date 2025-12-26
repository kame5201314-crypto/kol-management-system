import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  FileText,
  Filter,
  Eye
} from 'lucide-react';
import {
  ScanTask,
  Violation,
  SCAN_STATUS_LABELS,
  SCAN_STATUS_COLORS,
  PLATFORM_LABELS,
  SIMILARITY_LEVEL_LABELS,
  SimilarityLevel
} from '../../../types/imageGuardian';
import { imageGuardianService } from '../../../services/imageGuardianService';
import ViolationCard from './ViolationCard';

interface ScanResultsProps {
  task: ScanTask;
  onClose: () => void;
  onViewViolation?: (violation: Violation) => void;
  onCreateCase?: (violations: Violation[]) => void;
}

const ScanResults: React.FC<ScanResultsProps> = ({
  task,
  onClose,
  onViewViolation,
  onCreateCase
}) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [filteredViolations, setFilteredViolations] = useState<Violation[]>([]);
  const [similarityFilter, setSimilarityFilter] = useState<SimilarityLevel | 'all'>('all');
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadViolations();
  }, [task.id]);

  useEffect(() => {
    filterViolations();
  }, [violations, similarityFilter]);

  const loadViolations = () => {
    setIsLoading(true);
    const loaded = imageGuardianService.violations.getByTaskId(task.id);
    setViolations(loaded);
    setIsLoading(false);
  };

  const filterViolations = () => {
    if (similarityFilter === 'all') {
      setFilteredViolations(violations);
    } else {
      setFilteredViolations(violations.filter(v => v.similarity.level === similarityFilter));
    }
  };

  const toggleSelection = (violationId: string) => {
    setSelectedViolations(prev =>
      prev.includes(violationId)
        ? prev.filter(id => id !== violationId)
        : [...prev, violationId]
    );
  };

  const selectAll = () => {
    if (selectedViolations.length === filteredViolations.length) {
      setSelectedViolations([]);
    } else {
      setSelectedViolations(filteredViolations.map(v => v.id));
    }
  };

  const handleCreateCase = () => {
    const selected = violations.filter(v => selectedViolations.includes(v.id));
    onCreateCase?.(selected);
  };

  const formatDuration = (ms?: number): string => {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}分${seconds % 60}秒`;
    }
    return `${seconds}秒`;
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'running':
        return <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const similarityCounts = {
    exact: violations.filter(v => v.similarity.level === 'exact').length,
    high: violations.filter(v => v.similarity.level === 'high').length,
    medium: violations.filter(v => v.similarity.level === 'medium').length,
    low: violations.filter(v => v.similarity.level === 'low').length
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 標題 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h2 className="text-lg font-bold text-gray-900">掃描結果</h2>
              <p className="text-sm text-gray-500">
                任務 ID: {task.id.substring(0, 12)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 掃描摘要 */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{task.totalScanned}</p>
              <p className="text-xs text-gray-500">掃描商品數</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${task.violationsFound > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {task.violationsFound}
              </p>
              <p className="text-xs text-gray-500">侵權數</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {((task.violationsFound / Math.max(1, task.totalScanned)) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">侵權率</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(task.executionTimeMs)}
              </p>
              <p className="text-xs text-gray-500">耗時</p>
            </div>
            <div className="text-center">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${SCAN_STATUS_COLORS[task.status]}`}>
                {SCAN_STATUS_LABELS[task.status]}
              </span>
            </div>
          </div>

          {/* 進度條（進行中時顯示） */}
          {task.status === 'running' && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                掃描中... {task.progress}%
              </p>
            </div>
          )}
        </div>

        {/* 相似度分佈 */}
        {violations.length > 0 && (
          <div className="px-6 py-3 border-b flex items-center gap-4">
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              篩選：
            </span>
            <button
              onClick={() => setSimilarityFilter('all')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                similarityFilter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部 ({violations.length})
            </button>
            {similarityCounts.exact > 0 && (
              <button
                onClick={() => setSimilarityFilter('exact')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  similarityFilter === 'exact'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                完全相同 ({similarityCounts.exact})
              </button>
            )}
            {similarityCounts.high > 0 && (
              <button
                onClick={() => setSimilarityFilter('high')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  similarityFilter === 'high'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                高度相似 ({similarityCounts.high})
              </button>
            )}
            {similarityCounts.medium > 0 && (
              <button
                onClick={() => setSimilarityFilter('medium')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  similarityFilter === 'medium'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                中度相似 ({similarityCounts.medium})
              </button>
            )}
          </div>
        )}

        {/* 侵權列表 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">載入中...</p>
            </div>
          ) : filteredViolations.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {violations.length === 0 ? '未發現侵權' : '沒有符合篩選條件的結果'}
              </h3>
              <p className="text-gray-500">
                {violations.length === 0
                  ? '掃描完成，您的圖片資產暫未被盜用'
                  : '嘗試調整篩選條件'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 批次操作列 */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedViolations.length === filteredViolations.length && filteredViolations.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    已選擇 {selectedViolations.length} / {filteredViolations.length}
                  </span>
                </div>
                {selectedViolations.length > 0 && (
                  <button
                    onClick={handleCreateCase}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    建立維權案件
                  </button>
                )}
              </div>

              {/* 侵權卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredViolations.map(violation => (
                  <div key={violation.id} className="relative">
                    <input
                      type="checkbox"
                      checked={selectedViolations.includes(violation.id)}
                      onChange={() => toggleSelection(violation.id)}
                      className="absolute top-4 left-4 z-10 w-4 h-4 text-indigo-600 rounded"
                    />
                    <ViolationCard
                      violation={violation}
                      onViewDetail={() => onViewViolation?.(violation)}
                      compact
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            平台：{task.config.platforms.map(p => PLATFORM_LABELS[p]).join('、')}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              關閉
            </button>
            {violations.length > 0 && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                匯出報告
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanResults;
