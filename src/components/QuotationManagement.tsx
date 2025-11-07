import React, { useState } from 'react';
import { FileText, Plus, Edit2, Trash2, Eye, Send, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { Quotation, QuotationItem, Dealer } from '../types/dealer';

interface QuotationManagementProps {
  quotations: Quotation[];
  dealers: Dealer[];
  onCreateQuotation: () => void;
  onEditQuotation: (id: number) => void;
  onDeleteQuotation: (id: number) => void;
  onUpdateStatus: (id: number, status: Quotation['status']) => void;
}

const QuotationManagement: React.FC<QuotationManagementProps> = ({
  quotations,
  dealers,
  onCreateQuotation,
  onEditQuotation,
  onDeleteQuotation,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // 狀態標籤配置
  const statusConfig = {
    draft: { label: '草稿', color: 'bg-gray-100 text-gray-700' },
    sent: { label: '已送出', color: 'bg-blue-100 text-blue-700' },
    confirmed: { label: '已確認', color: 'bg-green-100 text-green-700' },
    rejected: { label: '已拒絕', color: 'bg-red-100 text-red-700' },
    expired: { label: '已過期', color: 'bg-orange-100 text-orange-700' }
  };

  // 篩選報價單
  const filteredQuotations = quotations.filter(q => {
    const matchSearch = q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       q.dealerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // 統計資料
  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'draft').length,
    sent: quotations.filter(q => q.status === 'sent').length,
    confirmed: quotations.filter(q => q.status === 'confirmed').length,
    totalAmount: quotations
      .filter(q => q.status === 'confirmed')
      .reduce((sum, q) => sum + q.totalAmount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 標題與新增按鈕 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">報價單管理</h1>
            <p className="text-gray-600">管理所有客戶報價單</p>
          </div>
          <button
            onClick={onCreateQuotation}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            新增報價單
          </button>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-blue-600" size={24} />
              <span className="text-gray-600">總報價單</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.total} 筆</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Edit2 className="text-gray-600" size={24} />
              <span className="text-gray-600">草稿</span>
            </div>
            <p className="text-2xl font-bold text-gray-600">{stats.draft} 筆</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Send className="text-indigo-600" size={24} />
              <span className="text-gray-600">已送出</span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{stats.sent} 筆</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-green-600" size={24} />
              <span className="text-gray-600">確認金額</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              NT$ {stats.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 搜尋與篩選 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="搜尋報價單號或經銷商..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部狀態</option>
              <option value="draft">草稿</option>
              <option value="sent">已送出</option>
              <option value="confirmed">已確認</option>
              <option value="rejected">已拒絕</option>
              <option value="expired">已過期</option>
            </select>
          </div>
        </div>

        {/* 報價單列表 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredQuotations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="mx-auto mb-4" size={64} />
              <p className="text-lg">目前沒有報價單</p>
              <button
                onClick={onCreateQuotation}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                建立第一份報價單
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">報價單號</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">經銷商</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">總金額</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">狀態</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">有效期限</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">建立日期</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredQuotations.map(quotation => (
                    <tr key={quotation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{quotation.quotationNo}</div>
                        <div className="text-xs text-gray-500">{quotation.items.length} 項產品</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{quotation.dealerName}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-gray-900">
                          NT$ {quotation.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          小計: {quotation.subtotal.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[quotation.status].color}`}>
                          {statusConfig[quotation.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {quotation.validUntil}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {quotation.createdAt}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedQuotation(quotation)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="查看"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => onEditQuotation(quotation.id)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="編輯"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('確定要刪除此報價單嗎？')) {
                                onDeleteQuotation(quotation.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="刪除"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 報價單詳情 Modal */}
        {selectedQuotation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* 標題 */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedQuotation.quotationNo}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      經銷商: {selectedQuotation.dealerName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedQuotation(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                {/* 報價單資訊 */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-600">建立日期</span>
                    <p className="font-medium">{selectedQuotation.createdAt}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">有效期限</span>
                    <p className="font-medium">{selectedQuotation.validUntil}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">狀態</span>
                    <p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[selectedQuotation.status].color}`}>
                        {statusConfig[selectedQuotation.status].label}
                      </span>
                    </p>
                  </div>
                </div>

                {/* 產品明細 */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">產品明細</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">產品編號</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">產品名稱</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">數量</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">單價</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">小計</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedQuotation.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm">{item.productCode}</td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium">{item.productName}</div>
                              <div className="text-xs text-gray-500">{item.specification}</div>
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              NT$ {item.unitPrice.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium">
                              NT$ {item.lineTotal.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 金額匯總 */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2 max-w-md ml-auto">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">小計</span>
                      <span className="font-medium">NT$ {selectedQuotation.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">折扣</span>
                      <span className="font-medium text-red-600">
                        -NT$ {selectedQuotation.discountAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">稅額 (5%)</span>
                      <span className="font-medium">NT$ {selectedQuotation.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>總計</span>
                      <span className="text-blue-600">
                        NT$ {selectedQuotation.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 備註 */}
                {selectedQuotation.notes && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">備註</h4>
                    <p className="text-sm text-gray-700">{selectedQuotation.notes}</p>
                  </div>
                )}

                {/* 操作按鈕 */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      alert('PDF 下載功能開發中...');
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="inline mr-2" size={18} />
                    下載 PDF
                  </button>
                  {selectedQuotation.status === 'draft' && (
                    <button
                      onClick={() => {
                        onUpdateStatus(selectedQuotation.id, 'sent');
                        setSelectedQuotation(null);
                      }}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Send className="inline mr-2" size={18} />
                      送出報價
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationManagement;
