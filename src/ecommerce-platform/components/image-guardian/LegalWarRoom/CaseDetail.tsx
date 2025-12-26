import React, { useState } from 'react';
import {
  X,
  Scale,
  Mail,
  Flag,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Send,
  ChevronRight,
  ExternalLink,
  Eye,
  Edit,
  XCircle
} from 'lucide-react';
import {
  LegalCase,
  CaseStatus,
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
  PLATFORM_LABELS,
  WARNING_LEVEL_LABELS
} from '../../../types/imageGuardian';
import { imageGuardianService } from '../../../services/imageGuardianService';
import LetterGenerator from './LetterGenerator';
import ReportSubmitter from './ReportSubmitter';

interface CaseDetailProps {
  case_: LegalCase;
  onClose: () => void;
  onUpdate: () => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({
  case_,
  onClose,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'violations' | 'letters' | 'reports' | 'timeline'>('overview');
  const [showLetterGenerator, setShowLetterGenerator] = useState(false);
  const [showReportSubmitter, setShowReportSubmitter] = useState(false);
  const [note, setNote] = useState(case_.notes);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('zh-TW');
  };

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleStatusChange = (newStatus: CaseStatus) => {
    imageGuardianService.cases.updateStatus(case_.id, newStatus);
    onUpdate();
  };

  const handleSaveNote = () => {
    imageGuardianService.cases.addNote(case_.id, note);
    onUpdate();
  };

  const statusFlow: CaseStatus[] = ['detected', 'reviewing', 'warning_sent', 'reported', 'resolved'];
  const currentStatusIndex = statusFlow.indexOf(case_.status);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'created': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'status_changed': return <Edit className="w-4 h-4 text-yellow-600" />;
      case 'letter_sent': return <Mail className="w-4 h-4 text-orange-600" />;
      case 'report_filed': return <Flag className="w-4 h-4 text-purple-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 標題 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">{case_.caseNumber}</h2>
              <p className="text-sm text-gray-500">
                {case_.infringer.sellerName} • {PLATFORM_LABELS[case_.infringer.platform]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${CASE_STATUS_COLORS[case_.status]}`}>
              {CASE_STATUS_LABELS[case_.status]}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 狀態流程 */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {statusFlow.map((status, index) => (
              <React.Fragment key={status}>
                <button
                  onClick={() => handleStatusChange(status)}
                  className={`flex flex-col items-center gap-1 ${
                    index <= currentStatusIndex ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                  disabled={index > currentStatusIndex + 1}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < currentStatusIndex
                      ? 'bg-green-500 text-white'
                      : index === currentStatusIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {index < currentStatusIndex ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs ${
                    index <= currentStatusIndex ? 'text-gray-900 font-medium' : 'text-gray-400'
                  }`}>
                    {CASE_STATUS_LABELS[status]}
                  </span>
                </button>
                {index < statusFlow.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 標籤頁 */}
        <div className="px-6 border-b">
          <div className="flex gap-4">
            {[
              { key: 'overview', label: '概覽' },
              { key: 'violations', label: `侵權商品 (${case_.violations.length})` },
              { key: 'letters', label: `警告信 (${case_.letters.length})` },
              { key: 'reports', label: `檢舉 (${case_.reports.length})` },
              { key: 'timeline', label: '時間線' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 概覽 */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-6">
              {/* 盜圖者資訊 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">盜圖者資訊</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">賣家名稱</span>
                    <span className="font-medium">{case_.infringer.sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平台</span>
                    <span className="font-medium">{PLATFORM_LABELS[case_.infringer.platform]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">侵權商品數</span>
                    <span className="font-medium text-red-600">{case_.infringer.stats.violatingListings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">估計營收</span>
                    <span className="font-medium text-red-600">
                      {formatPrice(case_.infringer.stats.estimatedRevenue)}
                    </span>
                  </div>
                  <a
                    href={case_.infringer.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 mt-2 text-indigo-600 hover:underline"
                  >
                    查看賣場
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* 快速操作 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">快速操作</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowLetterGenerator(true)}
                    className="w-full flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-orange-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">發送警告信</p>
                        <p className="text-sm text-gray-500">選擇等級：友善、正式、法律</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => setShowReportSubmitter(true)}
                    className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Flag className="w-5 h-5 text-purple-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">提交官方檢舉</p>
                        <p className="text-sm text-gray-500">向平台提交著作權檢舉</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>

                  {case_.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusChange('resolved')}
                      className="w-full flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">標記為已解決</p>
                          <p className="text-sm text-gray-500">對方已移除侵權內容</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  )}

                  {case_.status !== 'dismissed' && (
                    <button
                      onClick={() => handleStatusChange('dismissed')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-gray-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">排除案件</p>
                          <p className="text-sm text-gray-500">誤判或已授權</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* 備註 */}
              <div className="col-span-2">
                <h3 className="font-semibold text-gray-900 mb-2">備註</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="輸入案件備註..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    儲存備註
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 侵權商品 */}
          {activeTab === 'violations' && (
            <div className="space-y-4">
              {case_.violations.map(violation => (
                <div key={violation.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={violation.listing.thumbnailUrl}
                    alt={violation.listing.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{violation.listing.title}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="text-red-600 font-medium">
                        {formatPrice(violation.listing.price)}
                      </span>
                      <span>已售 {violation.listing.salesCount}</span>
                      <span>相似度 {violation.similarity.overall}%</span>
                    </div>
                  </div>
                  <a
                    href={violation.listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* 警告信 */}
          {activeTab === 'letters' && (
            <div className="space-y-4">
              <button
                onClick={() => setShowLetterGenerator(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                + 建立新警告信
              </button>

              {case_.letters.map(letter => (
                <div key={letter.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        letter.level === 'friendly' ? 'bg-green-100 text-green-700' :
                        letter.level === 'formal' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {WARNING_LEVEL_LABELS[letter.level]}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        letter.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        letter.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {letter.status === 'draft' ? '草稿' : letter.status === 'sent' ? '已發送' : '已讀'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(letter.createdAt)}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{letter.subject}</h4>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {letter.content.substring(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 檢舉 */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <button
                onClick={() => setShowReportSubmitter(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                + 建立新檢舉
              </button>

              {case_.reports.map(report => (
                <div key={report.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        {PLATFORM_LABELS[report.platform]}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        report.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        report.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {report.status === 'draft' ? '草稿' :
                         report.status === 'submitted' ? '已提交' :
                         report.status === 'resolved' ? '已處理' : '被拒絕'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(report.createdAt)}
                    </span>
                  </div>
                  {report.confirmationNumber && (
                    <p className="text-sm text-gray-600">
                      確認編號：{report.confirmationNumber}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 時間線 */}
          {activeTab === 'timeline' && (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-6">
                {case_.timeline.map((event, index) => (
                  <div key={event.id} className="relative flex gap-4 ml-4">
                    <div className="absolute -left-4 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                      {getEventIcon(event.eventType)}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 ml-6">
                      <p className="font-medium text-gray-900">{event.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(event.createdAt)} • {event.createdBy}
                      </p>
                    </div>
                  </div>
                ))}
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

        {/* 警告信生成器 */}
        {showLetterGenerator && (
          <LetterGenerator
            case_={case_}
            onClose={() => setShowLetterGenerator(false)}
            onGenerate={() => {
              setShowLetterGenerator(false);
              onUpdate();
            }}
          />
        )}

        {/* 檢舉提交器 */}
        {showReportSubmitter && (
          <ReportSubmitter
            case_={case_}
            onClose={() => setShowReportSubmitter(false)}
            onSubmit={() => {
              setShowReportSubmitter(false);
              onUpdate();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CaseDetail;
