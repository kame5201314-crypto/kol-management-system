import React from 'react';
import {
  X,
  ExternalLink,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Calendar,
  FileWarning,
  Target
} from 'lucide-react';
import {
  InfringerProfile as InfringerProfileType,
  Violation,
  PLATFORM_LABELS,
  PLATFORM_COLORS,
  RISK_LEVEL_COLORS
} from '../../../types/imageGuardian';
import ViolationCard from './ViolationCard';

interface InfringerProfileProps {
  infringer: InfringerProfileType;
  onClose: () => void;
  onViewViolation?: (violation: Violation) => void;
  onCreateCase?: (violations: Violation[]) => void;
}

const InfringerProfile: React.FC<InfringerProfileProps> = ({
  infringer,
  onClose,
  onViewViolation,
  onCreateCase
}) => {
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const getRiskLabel = (level: string): string => {
    switch (level) {
      case 'critical': return '極高風險';
      case 'high': return '高風險';
      case 'medium': return '中風險';
      default: return '低風險';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 標題 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">盜圖者畫像</h2>
              <p className="text-sm text-gray-500">{infringer.sellerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 賣家資訊卡 */}
          <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {infringer.sellerName}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${RISK_LEVEL_COLORS[infringer.riskLevel]}`}>
                    {getRiskLabel(infringer.riskLevel)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <span className={`px-2 py-1 rounded text-sm ${PLATFORM_COLORS[infringer.platform]}`}>
                    {PLATFORM_LABELS[infringer.platform]}
                  </span>
                  <a
                    href={infringer.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-600 hover:underline text-sm"
                  >
                    查看賣場
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* 風險分數 */}
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  infringer.riskScore >= 80 ? 'bg-red-100' :
                  infringer.riskScore >= 60 ? 'bg-orange-100' :
                  infringer.riskScore >= 40 ? 'bg-yellow-100' :
                  'bg-green-100'
                }`}>
                  <span className={`text-3xl font-bold ${
                    infringer.riskScore >= 80 ? 'text-red-600' :
                    infringer.riskScore >= 60 ? 'text-orange-600' :
                    infringer.riskScore >= 40 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {infringer.riskScore}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">風險分數</p>
              </div>
            </div>

            {/* 統計數據 */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <FileWarning className="w-4 h-4" />
                  <span className="text-xs">侵權商品</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {infringer.stats.violatingListings}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">估計營收</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(infringer.stats.estimatedRevenue)}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-xs">總銷量</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {infringer.stats.totalSales.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">平均單價</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(infringer.stats.averagePrice)}
                </p>
              </div>
            </div>

            {/* 偵測時間 */}
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>首次偵測：{formatDate(infringer.stats.firstDetectedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>最近偵測：{formatDate(infringer.stats.lastDetectedAt)}</span>
              </div>
            </div>
          </div>

          {/* 侵權記錄 */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                侵權記錄 ({infringer.violations.length})
              </h3>
              {infringer.violations.length > 0 && (
                <button
                  onClick={() => onCreateCase?.(infringer.violations)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <FileWarning className="w-4 h-4" />
                  一鍵建立案件
                </button>
              )}
            </div>

            {infringer.violations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暫無詳細侵權記錄</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {infringer.violations.map(violation => (
                  <ViolationCard
                    key={violation.id}
                    violation={violation}
                    onViewDetail={() => onViewViolation?.(violation)}
                    compact
                  />
                ))}
              </div>
            )}
          </div>

          {/* 備註 */}
          {infringer.notes && (
            <div className="px-6 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">備註</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-600">
                {infringer.notes}
              </div>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfringerProfile;
