import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { ocrService, invoiceService, uploadBatchService } from '../../services/invoiceFlowService';
import { Invoice, InvoiceCategory, INVOICE_CATEGORY_LABELS } from '../../types/invoiceFlow';

interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  result?: Partial<Invoice>;
  error?: string;
}

export default function InvoiceUpload() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'pending',
      progress: 0
    }));
    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const batch = uploadBatchService.create(files.length, '王小明');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Update status to processing
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'processing', progress: 50 } : f
      ));

      try {
        // Call OCR service
        const ocrResult = file.file.type === 'application/pdf'
          ? await ocrService.processPDF(file.file)
          : await ocrService.processImage(file.file);

        if (ocrResult.success && ocrResult.result) {
          // Create invoice
          const now = new Date();
          const archiveMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

          const invoice = invoiceService.create({
            taxId: ocrResult.result.taxId,
            invoiceNumber: ocrResult.result.invoiceNumber,
            invoiceDate: ocrResult.result.date,
            amount: ocrResult.result.amount,
            storeName: ocrResult.result.storeName,
            category: 'other' as InvoiceCategory,
            invoiceType: file.file.type === 'application/pdf' ? 'e-invoice' : 'receipt',
            originalFileName: file.file.name,
            fileUrl: `/uploads/invoices/${file.file.name}`,
            fileType: file.file.type === 'application/pdf' ? 'pdf' : 'image',
            ocrStatus: ocrResult.result.confidence > 0.8 ? 'completed' : 'manual_required',
            ocrConfidence: ocrResult.result.confidence,
            status: ocrResult.result.confidence > 0.8 ? 'pending_review' : 'draft',
            archiveMonth,
            uploadedBy: '王小明',
            uploadedAt: now.toISOString()
          });

          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, status: 'success', progress: 100, result: invoice } : f
          ));
        } else {
          setFiles(prev => prev.map(f =>
            f.id === file.id ? {
              ...f,
              status: 'error',
              progress: 100,
              error: ocrResult.error || 'OCR 處理失敗'
            } : f
          ));
        }
      } catch (error) {
        setFiles(prev => prev.map(f =>
          f.id === file.id ? {
            ...f,
            status: 'error',
            progress: 100,
            error: '處理過程發生錯誤'
          } : f
        ));
      }

      // Update batch progress
      const successCount = files.filter(f => f.status === 'success').length;
      const failedCount = files.filter(f => f.status === 'error').length;
      uploadBatchService.updateProgress(batch.id, i + 1, successCount, failedCount);
    }

    setIsProcessing(false);
  };

  const completedCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/ecommerce/invoice')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">上傳發票</h1>
            <p className="text-gray-500 mt-1">支援 JPG, PNG, PDF 格式</p>
          </div>
        </div>
        {files.length > 0 && (
          <button
            onClick={processFiles}
            disabled={isProcessing || pendingCount === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                處理中...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                開始處理 ({pendingCount})
              </>
            )}
          </button>
        )}
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center">
            <div className={`p-4 rounded-full mb-4 ${
              isDragging ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Upload className={`w-8 h-8 ${
                isDragging ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              {isDragging ? '放開以上傳檔案' : '拖放檔案至此處'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              或點擊選擇檔案
            </p>
            <p className="text-xs text-gray-400">
              支援 JPG, PNG, PDF 格式，單檔最大 10MB
            </p>
          </div>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Summary */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-900 font-medium">
                共 {files.length} 個檔案
              </span>
              {completedCount > 0 && (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {completedCount} 已完成
                </span>
              )}
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errorCount} 失敗
                </span>
              )}
            </div>
            {!isProcessing && (
              <button
                onClick={() => setFiles([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                清除全部
              </button>
            )}
          </div>

          {/* File Items */}
          <div className="divide-y divide-gray-100">
            {files.map((file) => (
              <div key={file.id} className="px-6 py-4 flex items-center gap-4">
                {/* Preview */}
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {file.file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.file.size / 1024).toFixed(1)} KB
                  </p>
                  {file.result && (
                    <p className="text-sm text-green-600 mt-1">
                      {file.result.storeName} - NT$ {file.result.amount?.toLocaleString()}
                    </p>
                  )}
                  {file.error && (
                    <p className="text-sm text-red-600 mt-1">{file.error}</p>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  {file.status === 'pending' && (
                    <span className="text-sm text-gray-500">等待處理</span>
                  )}
                  {file.status === 'processing' && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="text-sm text-blue-600">處理中...</span>
                    </div>
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}

                  {!isProcessing && file.status !== 'processing' && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">上傳提示</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 確保發票/收據清晰可辨識，避免模糊或反光</li>
          <li>• 電子發票 PDF 通常有更高的識別準確度</li>
          <li>• 識別完成後請確認金額和商家資訊是否正確</li>
          <li>• 低信心度的識別結果需要人工審核確認</li>
        </ul>
      </div>
    </div>
  );
}
