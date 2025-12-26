// Invoice Flow 服務層
import {
  Invoice,
  UploadBatch,
  MonthlyArchive,
  InvoiceFlowStats,
  InvoiceCategory,
  InvoiceStatus,
  OCRStatus,
  VendorLookupResult
} from '../types/invoiceFlow';
import {
  mockInvoices,
  mockUploadBatches,
  mockMonthlyArchives,
  getInvoiceFlowStats
} from '../data/invoiceFlowMockData';
import { vendorLearningService } from './vendorLearningService';

// localStorage Keys
const STORAGE_KEYS = {
  INVOICES: 'ecommerce_invoices',
  UPLOAD_BATCHES: 'ecommerce_upload_batches',
  MONTHLY_ARCHIVES: 'ecommerce_monthly_archives'
};

// 發票服務
export const invoiceService = {
  getAll: (): Invoice[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (stored) {
      return JSON.parse(stored);
    }
    // 初始化 mock 資料
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(mockInvoices));
    return mockInvoices;
  },

  getById: (id: string): Invoice | undefined => {
    const invoices = invoiceService.getAll();
    return invoices.find(inv => inv.id === id);
  },

  getByMonth: (month: string): Invoice[] => {
    const invoices = invoiceService.getAll();
    return invoices.filter(inv => inv.archiveMonth === month);
  },

  getByStatus: (status: InvoiceStatus): Invoice[] => {
    const invoices = invoiceService.getAll();
    return invoices.filter(inv => inv.status === status);
  },

  getByCategory: (category: InvoiceCategory): Invoice[] => {
    const invoices = invoiceService.getAll();
    return invoices.filter(inv => inv.category === category);
  },

  create: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice => {
    const invoices = invoiceService.getAll();
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    invoices.push(newInvoice);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    return newInvoice;
  },

  update: (id: string, data: Partial<Invoice>): Invoice | undefined => {
    const invoices = invoiceService.getAll();
    const index = invoices.findIndex(inv => inv.id === id);
    if (index === -1) return undefined;

    invoices[index] = {
      ...invoices[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    return invoices[index];
  },

  delete: (id: string): boolean => {
    const invoices = invoiceService.getAll();
    const filtered = invoices.filter(inv => inv.id !== id);
    if (filtered.length === invoices.length) return false;
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filtered));
    return true;
  },

  confirm: (id: string, reviewedBy: string, notes?: string): Invoice | undefined => {
    return invoiceService.update(id, {
      status: 'confirmed',
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes
    });
  },

  reject: (id: string, reviewedBy: string, notes: string): Invoice | undefined => {
    return invoiceService.update(id, {
      status: 'rejected',
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes
    });
  },

  archive: (id: string): Invoice | undefined => {
    return invoiceService.update(id, { status: 'archived' });
  },

  search: (query: string): Invoice[] => {
    const invoices = invoiceService.getAll();
    const lowerQuery = query.toLowerCase();
    return invoices.filter(inv =>
      inv.storeName.toLowerCase().includes(lowerQuery) ||
      inv.invoiceNumber.toLowerCase().includes(lowerQuery) ||
      inv.taxId.includes(lowerQuery) ||
      inv.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
};

// 上傳批次服務
export const uploadBatchService = {
  getAll: (): UploadBatch[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.UPLOAD_BATCHES);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEYS.UPLOAD_BATCHES, JSON.stringify(mockUploadBatches));
    return mockUploadBatches;
  },

  getById: (id: string): UploadBatch | undefined => {
    const batches = uploadBatchService.getAll();
    return batches.find(b => b.id === id);
  },

  create: (totalFiles: number, uploadedBy: string): UploadBatch => {
    const batches = uploadBatchService.getAll();
    const newBatch: UploadBatch = {
      id: `batch-${Date.now()}`,
      totalFiles,
      processedFiles: 0,
      successCount: 0,
      failedCount: 0,
      status: 'uploading',
      uploadedBy,
      uploadedAt: new Date().toISOString()
    };
    batches.unshift(newBatch);
    localStorage.setItem(STORAGE_KEYS.UPLOAD_BATCHES, JSON.stringify(batches));
    return newBatch;
  },

  updateProgress: (id: string, processed: number, success: number, failed: number): UploadBatch | undefined => {
    const batches = uploadBatchService.getAll();
    const index = batches.findIndex(b => b.id === id);
    if (index === -1) return undefined;

    const batch = batches[index];
    batch.processedFiles = processed;
    batch.successCount = success;
    batch.failedCount = failed;

    if (processed >= batch.totalFiles) {
      batch.status = failed > 0 ? 'partial_failed' : 'completed';
    } else {
      batch.status = 'processing';
    }

    localStorage.setItem(STORAGE_KEYS.UPLOAD_BATCHES, JSON.stringify(batches));
    return batch;
  }
};

// 月度歸檔服務
export const monthlyArchiveService = {
  getAll: (): MonthlyArchive[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.MONTHLY_ARCHIVES);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEYS.MONTHLY_ARCHIVES, JSON.stringify(mockMonthlyArchives));
    return mockMonthlyArchives;
  },

  getByMonth: (month: string): MonthlyArchive | undefined => {
    const archives = monthlyArchiveService.getAll();
    return archives.find(a => a.month === month);
  },

  recalculate: (month: string): MonthlyArchive => {
    const invoices = invoiceService.getByMonth(month);

    // 按分類統計
    const categoryMap = new Map<InvoiceCategory, { count: number; amount: number }>();
    invoices.forEach(inv => {
      const current = categoryMap.get(inv.category) || { count: 0, amount: 0 };
      categoryMap.set(inv.category, {
        count: current.count + 1,
        amount: current.amount + inv.amount
      });
    });

    // 按狀態統計
    const statusMap = new Map<InvoiceStatus, number>();
    invoices.forEach(inv => {
      statusMap.set(inv.status, (statusMap.get(inv.status) || 0) + 1);
    });

    const archive: MonthlyArchive = {
      month,
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
      byCategory: Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        ...data
      })),
      byStatus: Array.from(statusMap.entries()).map(([status, count]) => ({
        status,
        count
      })),
      lastUpdated: new Date().toISOString()
    };

    // 更新或新增歸檔
    const archives = monthlyArchiveService.getAll();
    const index = archives.findIndex(a => a.month === month);
    if (index >= 0) {
      archives[index] = archive;
    } else {
      archives.unshift(archive);
    }
    localStorage.setItem(STORAGE_KEYS.MONTHLY_ARCHIVES, JSON.stringify(archives));

    return archive;
  }
};

// 儀表板服務
export const invoiceDashboardService = {
  getStats: (): InvoiceFlowStats => {
    return getInvoiceFlowStats();
  }
};

// ============================================
// OCR 處理結果類型（含供應商學習）
// ============================================

export interface OCRProcessResult {
  success: boolean;
  result?: {
    taxId: string;
    invoiceNumber: string;
    date: string;
    amount: number;
    storeName: string;
    confidence: number;
    // 供應商學習結果
    vendorLearning: VendorLookupResult;
    suggestedCategory: InvoiceCategory;
    categoryConfidence: number;
    isAutoClassified: boolean;  // 是否自動分類成功
  };
  error?: string;
}

// 模擬 OCR 處理（含供應商學習整合）
export const ocrService = {

  /**
   * 處理圖片發票
   * 整合供應商學習：OCR 識別後自動查詢供應商規則
   */
  processImage: async (file: File): Promise<OCRProcessResult> => {
    // 模擬 OCR 處理延遲
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 模擬成功率 85%
    if (Math.random() > 0.15) {
      // 模擬 OCR 識別的供應商名稱
      const recognizedVendors = ['7-ELEVEN', 'PChome', '全聯福利中心', 'momo購物', 'IKEA', 'Uber Eats', 'foodpanda', '全家'];
      const storeName = recognizedVendors[Math.floor(Math.random() * recognizedVendors.length)];

      // 🔥 核心功能：供應商學習查詢
      const vendorLearning = vendorLearningService.lookupVendor(storeName);

      return {
        success: true,
        result: {
          taxId: String(Math.floor(10000000 + Math.random() * 90000000)),
          invoiceNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${String(Math.floor(10000000 + Math.random() * 90000000))}`,
          date: new Date().toISOString().split('T')[0],
          amount: Math.floor(100 + Math.random() * 9900),
          storeName,
          confidence: 0.7 + Math.random() * 0.3,
          // 供應商學習結果
          vendorLearning,
          suggestedCategory: vendorLearning.suggestedCategory,
          categoryConfidence: vendorLearning.confidence,
          isAutoClassified: vendorLearning.found
        }
      };
    }

    return {
      success: false,
      error: '無法識別發票內容，請手動輸入'
    };
  },

  /**
   * 處理 PDF 發票
   * 整合供應商學習：OCR 識別後自動查詢供應商規則
   */
  processPDF: async (file: File): Promise<OCRProcessResult> => {
    // 模擬 PDF 處理延遲
    await new Promise(resolve => setTimeout(resolve, 2000));

    // PDF 通常有更高的成功率
    if (Math.random() > 0.1) {
      // 模擬 OCR 識別的供應商名稱（PDF 通常是商業發票）
      const recognizedVendors = ['AWS', 'Google Cloud', 'Microsoft Azure', 'Meta 廣告', 'LINE 廣告', 'Google Ads', '中華電信'];
      const storeName = recognizedVendors[Math.floor(Math.random() * recognizedVendors.length)];

      // 🔥 核心功能：供應商學習查詢
      const vendorLearning = vendorLearningService.lookupVendor(storeName);

      return {
        success: true,
        result: {
          taxId: String(Math.floor(10000000 + Math.random() * 90000000)),
          invoiceNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${String(Math.floor(10000000 + Math.random() * 90000000))}`,
          date: new Date().toISOString().split('T')[0],
          amount: Math.floor(100 + Math.random() * 9900),
          storeName,
          confidence: 0.85 + Math.random() * 0.15,
          // 供應商學習結果
          vendorLearning,
          suggestedCategory: vendorLearning.suggestedCategory,
          categoryConfidence: vendorLearning.confidence,
          isAutoClassified: vendorLearning.found
        }
      };
    }

    return {
      success: false,
      error: 'PDF 格式不支援或檔案損壞'
    };
  },

  /**
   * 從手動分類學習新供應商規則
   * 當使用者手動分類一張發票時呼叫
   */
  learnFromManualClassification: (
    storeName: string,
    category: InvoiceCategory
  ): void => {
    vendorLearningService.learnFromInvoice(storeName, category);
  }
};
