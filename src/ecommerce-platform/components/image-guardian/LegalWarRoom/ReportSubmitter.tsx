import React, { useState } from 'react';
import {
  X,
  Flag,
  Send,
  Copy,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import {
  LegalCase,
  PlatformType,
  PLATFORM_LABELS
} from '../../../types/imageGuardian';
import { imageGuardianService } from '../../../services/imageGuardianService';

interface ReportSubmitterProps {
  case_: LegalCase;
  onClose: () => void;
  onSubmit: () => void;
}

const ReportSubmitter: React.FC<ReportSubmitterProps> = ({
  case_,
  onClose,
  onSubmit
}) => {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);

  const platform = case_.infringer.platform;
  const template = imageGuardianService.reports.getTemplateByPlatform(platform as 'shopee' | 'ruten' | 'yahoo');

  const getVariables = (): Record<string, string> => {
    const violation = case_.violations[0];
    return {
      productUrl: violation?.listing.url || '',
      sellerName: case_.infringer.sellerName,
      productTitle: violation?.listing.title || '',
      listingId: violation?.listing.listingId || '',
      companyName: 'APEX Lens',
      taxId: '12345678',
      contactPerson: '品牌保護部',
      contactPhone: '02-1234-5678',
      contactEmail: 'legal@apexlens.com',
      originalDate: '2024-01-01',
      originalUrl: 'https://apexlens.com/original-images',
      similarityScore: violation?.similarity.overall.toFixed(1) || ''
    };
  };

  const handleGenerate = async () => {
    if (!template) return;

    setIsGenerating(true);

    try {
      const variables = getVariables();
      const report = imageGuardianService.reports.generate(
        case_.id,
        platform as 'shopee' | 'ruten' | 'yahoo',
        variables
      );

      setContent(report.reportContent);
      setGeneratedReportId(report.id);
      setReportGenerated(true);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('生成失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!generatedReportId) return;

    setIsSubmitting(true);

    try {
      imageGuardianService.reports.submit(generatedReportId);
      onSubmit();
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('提交失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('已複製到剪貼簿');
  };

  const getReportUrl = (): string => {
    switch (platform) {
      case 'shopee':
        return 'https://help.shopee.tw/portal/article/77227';
      case 'ruten':
        return 'https://www.ruten.com.tw/help/report';
      case 'yahoo':
        return 'https://tw.help.yahoo.com/kb/report';
      default:
        return '#';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 標題 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">提交官方檢舉</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!reportGenerated ? (
            <div className="space-y-6">
              {/* 平台資訊 */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-medium">
                    {PLATFORM_LABELS[platform]}
                  </span>
                  <span className="text-gray-600">著作權侵權檢舉</span>
                </div>
                <p className="text-sm text-gray-600">
                  系統將根據平台要求生成標準格式的檢舉內容，您可以直接複製到平台的檢舉表單中提交。
                </p>
              </div>

              {/* 檢舉須知 */}
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">檢舉須知</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>請準備好原創作品的證明文件</li>
                      <li>侵權商品截圖建議在提交前再次確認</li>
                      <li>平台處理時間通常為 3-7 個工作天</li>
                      <li>重複檢舉可能被標記為惡意舉報</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 案件摘要 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">案件摘要</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">案件編號</span>
                    <span className="font-medium">{case_.caseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">被檢舉賣家</span>
                    <span className="font-medium">{case_.infringer.sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">侵權商品數</span>
                    <span className="font-medium text-red-600">{case_.violations.length} 個</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均相似度</span>
                    <span className="font-medium">
                      {(case_.violations.reduce((sum, v) => sum + v.similarity.overall, 0) / case_.violations.length).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 模板說明 */}
              {template && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">檢舉模板</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {template.instructions}
                    </p>
                    <p className="text-xs text-gray-500">
                      必填欄位：{template.requiredFields.join('、')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* 成功提示 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">檢舉內容已生成</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  請複製以下內容到平台的檢舉表單中
                </p>
              </div>

              {/* 檢舉內容 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">檢舉內容</h3>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                  >
                    <Copy className="w-4 h-4" />
                    複製全部
                  </button>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
              </div>

              {/* 平台檢舉連結 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">提交檢舉</h4>
                <p className="text-sm text-gray-600 mb-3">
                  點擊下方連結前往 {PLATFORM_LABELS[platform]} 的官方檢舉頁面
                </p>
                <a
                  href={getReportUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  前往 {PLATFORM_LABELS[platform]} 檢舉頁面
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          {reportGenerated ? (
            <>
              <button
                onClick={() => setReportGenerated(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                返回
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>處理中...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    標記為已提交
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !template}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>處理中...</>
                ) : (
                  <>
                    <Flag className="w-4 h-4" />
                    生成檢舉內容
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportSubmitter;
