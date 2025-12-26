import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Copy,
  Download,
  Eye,
  Edit2,
  CheckCircle
} from 'lucide-react';
import {
  LegalCase,
  WarningLevel,
  WARNING_LEVEL_LABELS,
  WARNING_LEVEL_COLORS,
  PLATFORM_LABELS
} from '../../../types/imageGuardian';
import { imageGuardianService } from '../../../services/imageGuardianService';

interface LetterGeneratorProps {
  case_: LegalCase;
  onClose: () => void;
  onGenerate: () => void;
}

const LetterGenerator: React.FC<LetterGeneratorProps> = ({
  case_,
  onClose,
  onGenerate
}) => {
  const [selectedLevel, setSelectedLevel] = useState<WarningLevel>('friendly');
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [letterGenerated, setLetterGenerated] = useState(false);
  const [generatedLetterId, setGeneratedLetterId] = useState<string | null>(null);

  const templates = imageGuardianService.letters.getTemplates();
  const selectedTemplate = templates.find(t => t.level === selectedLevel);

  const getVariables = (): Record<string, string> => {
    const violation = case_.violations[0];
    return {
      sellerName: case_.infringer.sellerName,
      productTitle: violation?.listing.title || '',
      productUrl: violation?.listing.url || '',
      platformName: PLATFORM_LABELS[case_.infringer.platform],
      similarityScore: violation?.similarity.overall.toFixed(1) || '',
      companyName: 'APEX Lens',
      companyAddress: '台北市信義區信義路五段7號',
      contactPerson: '品牌保護部',
      contactPhone: '02-1234-5678',
      contactEmail: 'legal@apexlens.com',
      currentDate: new Date().toLocaleDateString('zh-TW'),
      caseNumber: case_.caseNumber,
      compensationAmount: '50,000',
      lawFirmName: '智慧財產權律師事務所',
      lawyerName: '王大明',
      lawyerPhone: '02-8765-4321',
      lawyerEmail: 'lawyer@iplaw.com'
    };
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);

    try {
      const variables = getVariables();
      const letter = imageGuardianService.letters.generate(
        case_.id,
        selectedLevel,
        variables
      );

      setContent(letter.content);
      setSubject(letter.subject);
      setGeneratedLetterId(letter.id);
      setLetterGenerated(true);
    } catch (error) {
      console.error('Failed to generate letter:', error);
      alert('生成失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!generatedLetterId) return;

    setIsSending(true);

    try {
      imageGuardianService.letters.send(generatedLetterId, 'platform_message');
      onGenerate();
    } catch (error) {
      console.error('Failed to send letter:', error);
      alert('發送失敗，請稍後再試');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('已複製到剪貼簿');
  };

  const levelDescriptions: Record<WarningLevel, string> = {
    friendly: '溫和勸導，適用於首次發現侵權的友善提醒',
    formal: '正式警告，引用著作權法，給予限期改正',
    legal: '律師函，威脅法律訴訟，要求賠償'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 標題 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-bold text-gray-900">生成警告信</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!letterGenerated ? (
            <div className="space-y-6">
              {/* 等級選擇 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">選擇警告等級</h3>
                <div className="grid grid-cols-3 gap-4">
                  {(['friendly', 'formal', 'legal'] as WarningLevel[]).map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedLevel === level
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${WARNING_LEVEL_COLORS[level]}`}>
                          {WARNING_LEVEL_LABELS[level]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {levelDescriptions[level]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 模板預覽 */}
              {selectedTemplate && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">模板預覽</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <p className="font-medium text-gray-900 mb-2">
                      {selectedTemplate.subject}
                    </p>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
                      {selectedTemplate.content}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    系統將自動填入：{selectedTemplate.variables.join('、')}
                  </p>
                </div>
              )}

              {/* 案件資訊摘要 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">案件資訊</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">賣家：</span>
                    <span className="font-medium">{case_.infringer.sellerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">平台：</span>
                    <span className="font-medium">{PLATFORM_LABELS[case_.infringer.platform]}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">侵權商品：</span>
                    <span className="font-medium">{case_.violations.length} 個</span>
                  </div>
                  <div>
                    <span className="text-gray-500">案件編號：</span>
                    <span className="font-medium">{case_.caseNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 編輯區 */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  {isEditing ? '編輯警告信' : '預覽警告信'}
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                >
                  {isEditing ? <Eye className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  {isEditing ? '預覽' : '編輯'}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      主旨
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      內容
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={15}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="font-medium text-gray-900 text-lg mb-4">
                    {subject}
                  </p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {content}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          {letterGenerated ? (
            <>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4" />
                  複製
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  匯出 PDF
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setLetterGenerated(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  返回
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {isSending ? (
                    <>處理中...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      發送警告信
                    </>
                  )}
                </button>
              </div>
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
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>處理中...</>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    生成警告信
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

export default LetterGenerator;
