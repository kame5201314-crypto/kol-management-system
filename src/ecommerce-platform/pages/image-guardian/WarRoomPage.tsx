import React, { useState, useEffect } from 'react';
import {
  Gavel,
  Plus,
  RefreshCw,
  Filter,
  FileText,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Flag
} from 'lucide-react';
import { imageGuardianService } from '../../services/imageGuardianService';
import type { LegalCase, Violation, WarningLetter } from '../../types/imageGuardian';
import {
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
  PLATFORM_LABELS
} from '../../types/imageGuardian';
import CaseList from '../../components/image-guardian/LegalWarRoom/CaseList';
import CaseDetail from '../../components/image-guardian/LegalWarRoom/CaseDetail';
import LetterGenerator from '../../components/image-guardian/LegalWarRoom/LetterGenerator';
import ReportSubmitter from '../../components/image-guardian/LegalWarRoom/ReportSubmitter';

type Tab = 'overview' | 'cases' | 'letters' | 'reports';

export default function WarRoomPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    try {
      const casesData = imageGuardianService.cases.getAll();
      const violationsData = imageGuardianService.violations.getAll();
      setCases(casesData);
      setViolations(violationsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCaseStatus = (caseId: string, newStatus: LegalCase['status']) => {
    try {
      const updated = imageGuardianService.cases.updateStatus(caseId, newStatus);
      if (updated) {
        setCases(prev => prev.map(c => c.id === caseId ? updated : c));
        if (selectedCase?.id === caseId) {
          setSelectedCase(updated);
        }
      }
    } catch (error) {
      console.error('Failed to update case status:', error);
    }
  };

  const handleGenerateLetter = (letter: Omit<WarningLetter, 'id' | 'createdAt'>) => {
    try {
      const newLetter = imageGuardianService.letters.generate(letter);
      // 更新相關案件
      if (selectedCase) {
        const updatedCase = {
          ...selectedCase,
          letters: [...selectedCase.letters, newLetter]
        };
        setCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));
        setSelectedCase(updatedCase);
      }
      setShowLetterModal(false);
    } catch (error) {
      console.error('Failed to generate letter:', error);
    }
  };

  // 統計
  const stats = {
    total: cases.length,
    active: cases.filter(c => !['resolved', 'dismissed'].includes(c.status)).length,
    resolved: cases.filter(c => c.status === 'resolved').length,
    lettersSent: cases.reduce((sum, c) => sum + c.letters.filter(l => l.status === 'sent').length, 0),
    reportsFiled: cases.reduce((sum, c) => sum + c.reports.filter(r => r.status === 'submitted').length, 0)
  };

  // 過濾案件
  const filteredCases = cases.filter(c =>
    statusFilter === 'all' || c.status === statusFilter
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
            <Gavel className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">維權作戰中心</h1>
            <p className="text-sm text-gray-500">案件管理、警告信發送、官方檢舉</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">總案件數</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">進行中</p>
          <p className="text-2xl font-bold text-orange-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">已解決</p>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">已發警告信</p>
          <p className="text-2xl font-bold text-blue-600">{stats.lettersSent}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">已提檢舉</p>
          <p className="text-2xl font-bold text-purple-600">{stats.reportsFiled}</p>
        </div>
      </div>

      {/* 標籤頁 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b">
          <div className="flex items-center justify-between px-4">
            <div className="flex">
              {[
                { id: 'overview', label: '作戰概覽' },
                { id: 'cases', label: `案件列表 (${cases.length})` },
                { id: 'letters', label: '警告信範本' },
                { id: 'reports', label: '檢舉指南' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'cases' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">所有狀態</option>
                {Object.entries(CASE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 內容區 */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* 案件狀態流 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">案件處理流程</h3>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  {[
                    { status: 'detected', icon: AlertTriangle, color: 'red' },
                    { status: 'reviewing', icon: Clock, color: 'yellow' },
                    { status: 'warning_sent', icon: MessageSquare, color: 'blue' },
                    { status: 'reported', icon: Flag, color: 'purple' },
                    { status: 'resolved', icon: CheckCircle, color: 'green' }
                  ].map((step, index, arr) => (
                    <React.Fragment key={step.status}>
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${step.color}-100`}>
                          <step.icon className={`w-6 h-6 text-${step.color}-600`} />
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {CASE_STATUS_LABELS[step.status as keyof typeof CASE_STATUS_LABELS]}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {cases.filter(c => c.status === step.status).length}
                        </p>
                      </div>
                      {index < arr.length - 1 && (
                        <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* 需要處理的案件 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">待處理案件</h3>
                  <button
                    onClick={() => setActiveTab('cases')}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    查看全部
                  </button>
                </div>
                {cases.filter(c => !['resolved', 'dismissed'].includes(c.status)).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                    <p>所有案件已處理完畢</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cases
                      .filter(c => !['resolved', 'dismissed'].includes(c.status))
                      .slice(0, 5)
                      .map(caseItem => (
                        <div
                          key={caseItem.id}
                          onClick={() => setSelectedCase(caseItem)}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              caseItem.status === 'detected' ? 'bg-red-100' :
                              caseItem.status === 'reviewing' ? 'bg-yellow-100' :
                              caseItem.status === 'warning_sent' ? 'bg-blue-100' :
                              'bg-purple-100'
                            }`}>
                              <AlertTriangle className={`w-5 h-5 ${
                                caseItem.status === 'detected' ? 'text-red-600' :
                                caseItem.status === 'reviewing' ? 'text-yellow-600' :
                                caseItem.status === 'warning_sent' ? 'text-blue-600' :
                                'text-purple-600'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  CASE_STATUS_COLORS[caseItem.status]
                                }`}>
                                  {CASE_STATUS_LABELS[caseItem.status]}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {caseItem.infringer.sellerName || caseItem.infringer.sellerId}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {PLATFORM_LABELS[caseItem.infringer.platform]} • {caseItem.violations.length} 項侵權
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatDate(caseItem.createdAt)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* 快速操作 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowLetterModal(true)}
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">生成警告信</p>
                    <p className="text-sm text-gray-500">三級警告信範本</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Flag className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">官方檢舉</p>
                    <p className="text-sm text-gray-500">各平台檢舉格式</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('cases')}
                  className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Gavel className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">案件管理</p>
                    <p className="text-sm text-gray-500">追蹤所有維權案件</p>
                  </div>
                </button>
              </div>
            </div>
          ) : activeTab === 'cases' ? (
            <CaseList
              cases={filteredCases}
              onCaseSelect={setSelectedCase}
            />
          ) : activeTab === 'letters' ? (
            <LetterGenerator
              case_={selectedCase}
              onGenerate={handleGenerateLetter}
            />
          ) : (
            <ReportSubmitter
              case_={selectedCase}
            />
          )}
        </div>
      </div>

      {/* 案件詳情模態框 */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CaseDetail
              case_={selectedCase}
              onClose={() => setSelectedCase(null)}
              onUpdateStatus={handleUpdateCaseStatus}
              onGenerateLetter={() => setShowLetterModal(true)}
              onFileReport={() => setShowReportModal(true)}
            />
          </div>
        </div>
      )}

      {/* 警告信生成模態框 */}
      {showLetterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">生成警告信</h2>
              <button
                onClick={() => setShowLetterModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <LetterGenerator
                case_={selectedCase}
                onGenerate={handleGenerateLetter}
              />
            </div>
          </div>
        </div>
      )}

      {/* 檢舉提交模態框 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">提交官方檢舉</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <ReportSubmitter
                case_={selectedCase}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
