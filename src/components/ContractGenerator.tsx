import React, { useState } from 'react';
import { KOL } from '../types/kol';
import { ContractVariables } from '../types/contract';
import { X, FileText, Download, Copy } from 'lucide-react';

interface ContractGeneratorProps {
  kol: KOL;
  onClose: () => void;
}

const ContractGenerator: React.FC<ContractGeneratorProps> = ({ kol, onClose }) => {
  const [variables, setVariables] = useState<ContractVariables>({
    kolName: kol.name,
    kolNickname: kol.nickname,
    kolEmail: kol.email,
    kolPhone: kol.phone,
    companyName: '貴公司名稱',
    projectName: '',
    startDate: '',
    endDate: '',
    budget: '',
    profitShareRate: '',
    paymentTerms: '合作結束後 30 日內支付',
    deliverables: '',
    additionalTerms: '',
    signDate: new Date().toISOString().split('T')[0]
  });

  // 預設合約範本
  const defaultTemplate = `KOL 合作協議書

甲方（委託方）：{{companyName}}
乙方（KOL）：{{kolName}}（藝名/暱稱：{{kolNickname}}）

聯絡資訊：
Email: {{kolEmail}}
電話: {{kolPhone}}

一、合作專案
專案名稱：{{projectName}}
合作期間：{{startDate}} 至 {{endDate}}

二、合作內容
交付內容：
{{deliverables}}

三、費用與付款
合作預算：NT$ {{budget}}
分潤比例：{{profitShareRate}}%
付款條件：{{paymentTerms}}

四、雙方權利與義務
1. 乙方需按時完成約定的內容創作與發布
2. 甲方需按約定支付合作費用
3. 雙方應保守商業機密
4. 內容需符合相關法規與平台規範

五、其他條款
{{additionalTerms}}

六、合約效力
本合約一式兩份，雙方各執一份，自簽署之日起生效。

簽約日期：{{signDate}}

甲方簽章：_______________    乙方簽章：_______________

甲方代表：_______________    乙方：{{kolName}}
`;

  const [contractContent, setContractContent] = useState(defaultTemplate);

  // 替換合約變數
  const generateContract = () => {
    let result = contractContent;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || `[請填寫${key}]`);
    });
    return result;
  };

  const finalContract = generateContract();

  // 複製到剪貼簿
  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalContract);
    alert('合約已複製到剪貼簿！');
  };

  // 下載為文字檔
  const downloadContract = () => {
    const blob = new Blob([finalContract], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `合作合約_${kol.name}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={28} className="text-blue-600" />
            合約生成器 - {kol.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側：變數輸入 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">填寫合約資訊</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">公司名稱 *</label>
                <input
                  type="text"
                  value={variables.companyName}
                  onChange={(e) => setVariables({ ...variables, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">專案名稱 *</label>
                <input
                  type="text"
                  value={variables.projectName}
                  onChange={(e) => setVariables({ ...variables, projectName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：秋季美妝產品推廣"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">開始日期 *</label>
                  <input
                    type="date"
                    value={variables.startDate}
                    onChange={(e) => setVariables({ ...variables, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">結束日期 *</label>
                  <input
                    type="date"
                    value={variables.endDate}
                    onChange={(e) => setVariables({ ...variables, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">合作預算 *</label>
                <input
                  type="text"
                  value={variables.budget}
                  onChange={(e) => setVariables({ ...variables, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：100,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分潤比例 (%)</label>
                <input
                  type="text"
                  value={variables.profitShareRate}
                  onChange={(e) => setVariables({ ...variables, profitShareRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">付款條件</label>
                <input
                  type="text"
                  value={variables.paymentTerms}
                  onChange={(e) => setVariables({ ...variables, paymentTerms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">交付內容 *</label>
                <textarea
                  value={variables.deliverables}
                  onChange={(e) => setVariables({ ...variables, deliverables: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：
- Instagram 貼文 3 則
- YouTube 影片 1 支（5-8 分鐘）
- IG 限時動態 5 則"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">其他條款</label>
                <textarea
                  value={variables.additionalTerms}
                  onChange={(e) => setVariables({ ...variables, additionalTerms: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="選填：其他需要註明的條款"
                />
              </div>
            </div>

            {/* 右側：合約預覽 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">合約預覽</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Copy size={16} />
                    複製
                  </button>
                  <button
                    onClick={downloadContract}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    <Download size={16} />
                    下載
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 min-h-[600px]">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {finalContract}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractGenerator;
