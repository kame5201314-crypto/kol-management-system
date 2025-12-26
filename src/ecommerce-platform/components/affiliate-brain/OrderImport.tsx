import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  ArrowLeft,
  Download,
  Eye,
  Loader2
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { importBatchService, importedOrderService } from '../../services/affiliateBrainService';
import { ImportBatch, ImportedOrder } from '../../types/affiliateBrain';

interface ParsedOrder {
  orderId: string;
  orderDate: string;
  productName: string;
  quantity: number;
  amount: number;
  promoCode?: string;
  customerName?: string;
}

export default function OrderImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedOrders, setParsedOrders] = useState<ParsedOrder[]>([]);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    matched: number;
    unmatched: number;
    total: number;
  } | null>(null);
  const [recentBatches, setRecentBatches] = useState<ImportBatch[]>(() =>
    importBatchService.getAll().slice(0, 5)
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
      parseFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    // 模擬解析 CSV/Excel 檔案
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 產生模擬資料
    const mockOrders: ParsedOrder[] = [
      { orderId: 'ORD-20241220-001', orderDate: '2024-12-20', productName: '精華液套組', quantity: 2, amount: 2980, promoCode: 'BEAUTY10', customerName: '林小姐' },
      { orderId: 'ORD-20241220-002', orderDate: '2024-12-20', productName: '面膜禮盒', quantity: 1, amount: 1280, promoCode: 'SKIN20', customerName: '王先生' },
      { orderId: 'ORD-20241220-003', orderDate: '2024-12-20', productName: '保濕乳液', quantity: 3, amount: 1770, promoCode: 'BEAUTY10', customerName: '陳小姐' },
      { orderId: 'ORD-20241220-004', orderDate: '2024-12-20', productName: '防曬噴霧', quantity: 2, amount: 1180, customerName: '張先生' },
      { orderId: 'ORD-20241220-005', orderDate: '2024-12-20', productName: '卸妝油', quantity: 1, amount: 680, promoCode: 'NEWUSER', customerName: '李小姐' },
      { orderId: 'ORD-20241219-006', orderDate: '2024-12-19', productName: '精華液套組', quantity: 1, amount: 1490, promoCode: 'BEAUTY10', customerName: '黃先生' },
      { orderId: 'ORD-20241219-007', orderDate: '2024-12-19', productName: '眼霜', quantity: 2, amount: 2560, promoCode: 'SKIN20', customerName: '吳小姐' },
      { orderId: 'ORD-20241219-008', orderDate: '2024-12-19', productName: '洗面乳', quantity: 4, amount: 1160, customerName: '趙先生' },
    ];

    setParsedOrders(mockOrders);
    setIsProcessing(false);
  };

  const handleImport = async () => {
    if (parsedOrders.length === 0) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 建立匯入批次
    const batch = importBatchService.create(file?.name || 'orders.csv', parsedOrders.length, '王小明');

    // 匯入訂單並匹配 KOL
    let matched = 0;
    let unmatched = 0;

    parsedOrders.forEach(order => {
      const importedOrder = importedOrderService.create({
        orderId: order.orderId,
        orderDate: order.orderDate,
        customerName: order.customerName || '',
        productName: order.productName,
        quantity: order.quantity,
        unitPrice: order.amount / order.quantity,
        totalAmount: order.amount,
        promoCode: order.promoCode,
        importBatchId: batch.id
      });

      if (importedOrder.matchedKOLId) {
        matched++;
      } else {
        unmatched++;
      }
    });

    // 更新批次狀態
    importBatchService.updateProgress(batch.id, parsedOrders.length, matched, unmatched);

    setImportResult({
      success: true,
      matched,
      unmatched,
      total: parsedOrders.length
    });

    setRecentBatches(importBatchService.getAll().slice(0, 5));
    setIsProcessing(false);
  };

  const resetImport = () => {
    setFile(null);
    setParsedOrders([]);
    setImportResult(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/ecommerce/affiliate"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">訂單匯入</h1>
            <p className="text-gray-500 mt-1">上傳訂單報表並自動匹配 KOL 折扣碼</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          下載範本
        </button>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className={`p-6 rounded-xl ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${importResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
              {importResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${importResult.success ? 'text-green-900' : 'text-red-900'}`}>
                匯入完成
              </h3>
              <p className={`mt-1 ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                共 {importResult.total} 筆訂單，{importResult.matched} 筆成功匹配 KOL，{importResult.unmatched} 筆未匹配
              </p>
              <div className="flex gap-3 mt-4">
                <Link
                  to="/ecommerce/affiliate/commissions"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  查看傭金報表
                </Link>
                <button
                  onClick={resetImport}
                  className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  繼續匯入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!importResult && (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50'
                : file
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center">
                <div className="p-4 bg-green-100 rounded-full mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-1">{file.name}</p>
                <p className="text-sm text-gray-500 mb-4">
                  {(file.size / 1024).toFixed(1)} KB · {parsedOrders.length} 筆訂單
                </p>
                <button
                  onClick={resetImport}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  移除檔案
                </button>
              </div>
            ) : (
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`} />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    {isDragging ? '放開以上傳檔案' : '拖放檔案至此處'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">或點擊選擇檔案</p>
                  <p className="text-xs text-gray-400">支援 CSV, Excel (.xlsx, .xls) 格式</p>
                </div>
              </label>
            )}
          </div>

          {/* Preview Table */}
          {parsedOrders.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">預覽訂單 ({parsedOrders.length} 筆)</h3>
                <button
                  onClick={handleImport}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      匯入中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      確認匯入
                    </>
                  )}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">訂單編號</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">日期</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">商品</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">數量</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">金額</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">折扣碼</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedOrders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{order.orderId}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.orderDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{order.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{order.quantity}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="px-4 py-3">
                          {order.promoCode ? (
                            <code className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded">
                              {order.promoCode}
                            </code>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {order.promoCode ? (
                            <StatusBadge label="可匹配" color="bg-green-100 text-green-700" size="sm" />
                          ) : (
                            <StatusBadge label="無折扣碼" color="bg-gray-100 text-gray-600" size="sm" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Recent Imports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">近期匯入記錄</h3>
        <div className="space-y-3">
          {recentBatches.map((batch) => (
            <div key={batch.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{batch.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {batch.matchedOrders}/{batch.totalOrders} 筆匹配 · {new Date(batch.importedAt).toLocaleDateString('zh-TW')}
                  </p>
                </div>
              </div>
              <StatusBadge
                label={batch.status === 'completed' ? '已完成' : batch.status === 'processing' ? '處理中' : '部分失敗'}
                color={batch.status === 'completed' ? 'bg-green-100 text-green-700' : batch.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}
                size="sm"
              />
            </div>
          ))}
          {recentBatches.length === 0 && (
            <p className="text-center text-gray-500 py-4">尚無匯入記錄</p>
          )}
        </div>
      </div>
    </div>
  );
}
