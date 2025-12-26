import React from 'react';
import {
  ChevronRight,
  AlertTriangle,
  Mail,
  Flag,
  Calendar,
  User,
  DollarSign
} from 'lucide-react';
import {
  LegalCase,
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
  PLATFORM_LABELS
} from '../../../types/imageGuardian';

interface CaseListProps {
  cases: LegalCase[];
  onSelectCase: (case_: LegalCase) => void;
}

const CaseList: React.FC<CaseListProps> = ({ cases, onSelectCase }) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'urgent': return '緊急';
      case 'high': return '高';
      case 'medium': return '中';
      default: return '低';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              案件資訊
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              狀態
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              盜圖者
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              侵權商品
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              估計損失
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              處理進度
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">操作</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cases.map((case_) => (
            <tr
              key={case_.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectCase(case_)}
            >
              <td className="px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-medium text-indigo-600">
                      {case_.caseNumber}
                    </code>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(case_.priority)}`}>
                      {getPriorityLabel(case_.priority)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(case_.createdAt)}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CASE_STATUS_COLORS[case_.status]}`}>
                  {CASE_STATUS_LABELS[case_.status]}
                </span>
              </td>
              <td className="px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {case_.infringer.sellerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {PLATFORM_LABELS[case_.infringer.platform]}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {case_.violations.length}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-red-600">
                  {formatPrice(case_.infringer.stats.estimatedRevenue)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3 text-xs">
                  {case_.letters.filter(l => l.status !== 'draft').length > 0 && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <Mail className="w-3 h-3" />
                      {case_.letters.filter(l => l.status !== 'draft').length}
                    </span>
                  )}
                  {case_.reports.filter(r => r.status !== 'draft').length > 0 && (
                    <span className="flex items-center gap-1 text-purple-600">
                      <Flag className="w-3 h-3" />
                      {case_.reports.filter(r => r.status !== 'draft').length}
                    </span>
                  )}
                  {case_.letters.filter(l => l.status !== 'draft').length === 0 &&
                   case_.reports.filter(r => r.status !== 'draft').length === 0 && (
                    <span className="text-gray-400">尚未處理</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CaseList;
