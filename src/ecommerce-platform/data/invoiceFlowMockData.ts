import { Invoice, UploadBatch, MonthlyArchive, InvoiceCategory, InvoiceStatus, OCRStatus, InvoiceType } from '../types/invoiceFlow';

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    taxId: '12345678',
    invoiceNumber: 'AB-12345678',
    invoiceDate: '2024-12-20',
    amount: 1500,
    storeName: 'PChome 24h購物',
    items: [
      { name: '辦公文具', quantity: 5, unitPrice: 300, amount: 1500 }
    ],
    category: 'office_supplies',
    invoiceType: 'e-invoice',
    tags: ['辦公用品', 'PChome'],
    originalFileName: 'pchome_receipt_1220.jpg',
    fileUrl: '/uploads/invoices/pchome_receipt_1220.jpg',
    fileType: 'image',
    ocrStatus: 'completed',
    ocrConfidence: 0.95,
    status: 'confirmed',
    archiveMonth: '2024-12',
    uploadedBy: '王小明',
    uploadedAt: '2024-12-20T10:30:00Z',
    createdAt: '2024-12-20T10:30:00Z',
    updatedAt: '2024-12-20T11:00:00Z'
  },
  {
    id: 'inv-002',
    taxId: '87654321',
    invoiceNumber: 'CD-87654321',
    invoiceDate: '2024-12-19',
    amount: 3200,
    storeName: '中油加油站',
    category: 'transportation',
    invoiceType: 'invoice',
    originalFileName: 'gas_receipt.pdf',
    fileUrl: '/uploads/invoices/gas_receipt.pdf',
    fileType: 'pdf',
    ocrStatus: 'completed',
    ocrConfidence: 0.88,
    status: 'pending_review',
    archiveMonth: '2024-12',
    uploadedBy: '王小明',
    uploadedAt: '2024-12-19T15:00:00Z',
    createdAt: '2024-12-19T15:00:00Z',
    updatedAt: '2024-12-19T15:00:00Z'
  },
  {
    id: 'inv-003',
    taxId: '11223344',
    invoiceNumber: 'EF-11223344',
    invoiceDate: '2024-12-18',
    amount: 850,
    storeName: '7-ELEVEN',
    category: 'meals',
    invoiceType: 'receipt',
    originalFileName: 'seven_lunch.jpg',
    fileUrl: '/uploads/invoices/seven_lunch.jpg',
    fileType: 'image',
    ocrStatus: 'completed',
    ocrConfidence: 0.92,
    status: 'confirmed',
    archiveMonth: '2024-12',
    uploadedBy: '李小華',
    uploadedAt: '2024-12-18T12:30:00Z',
    createdAt: '2024-12-18T12:30:00Z',
    updatedAt: '2024-12-18T13:00:00Z'
  },
  {
    id: 'inv-004',
    taxId: '99887766',
    invoiceNumber: 'GH-99887766',
    invoiceDate: '2024-12-17',
    amount: 15000,
    storeName: 'Meta 廣告',
    category: 'marketing',
    invoiceType: 'e-invoice',
    originalFileName: 'meta_ads_dec.pdf',
    fileUrl: '/uploads/invoices/meta_ads_dec.pdf',
    fileType: 'pdf',
    ocrStatus: 'completed',
    ocrConfidence: 0.98,
    status: 'confirmed',
    archiveMonth: '2024-12',
    uploadedBy: '王小明',
    uploadedAt: '2024-12-17T09:00:00Z',
    createdAt: '2024-12-17T09:00:00Z',
    updatedAt: '2024-12-17T09:30:00Z'
  },
  {
    id: 'inv-005',
    taxId: '',
    invoiceNumber: '',
    invoiceDate: '2024-12-16',
    amount: 0,
    storeName: '',
    category: 'other',
    invoiceType: 'other',
    originalFileName: 'blurry_receipt.jpg',
    fileUrl: '/uploads/invoices/blurry_receipt.jpg',
    fileType: 'image',
    ocrStatus: 'manual_required',
    ocrConfidence: 0.35,
    status: 'draft',
    archiveMonth: '2024-12',
    uploadedBy: '李小華',
    uploadedAt: '2024-12-16T14:00:00Z',
    createdAt: '2024-12-16T14:00:00Z',
    updatedAt: '2024-12-16T14:00:00Z'
  }
];

// Mock Upload Batches
export const mockUploadBatches: UploadBatch[] = [
  {
    id: 'batch-001',
    totalFiles: 15,
    processedFiles: 15,
    successCount: 14,
    failedCount: 1,
    status: 'completed',
    uploadedBy: '王小明',
    uploadedAt: '2024-12-20T10:00:00Z'
  },
  {
    id: 'batch-002',
    totalFiles: 8,
    processedFiles: 8,
    successCount: 8,
    failedCount: 0,
    status: 'completed',
    uploadedBy: '李小華',
    uploadedAt: '2024-12-18T14:30:00Z'
  }
];

// Mock Monthly Archives
export const mockMonthlyArchives: MonthlyArchive[] = [
  {
    month: '2024-12',
    totalInvoices: 45,
    totalAmount: 156800,
    byCategory: [
      { category: 'office_supplies', count: 12, amount: 18500 },
      { category: 'transportation', count: 8, amount: 32000 },
      { category: 'meals', count: 15, amount: 12800 },
      { category: 'marketing', count: 5, amount: 85000 },
      { category: 'utilities', count: 3, amount: 6500 },
      { category: 'other', count: 2, amount: 2000 }
    ],
    byStatus: [
      { status: 'confirmed', count: 38 },
      { status: 'pending_review', count: 5 },
      { status: 'draft', count: 2 }
    ],
    lastUpdated: '2024-12-21T00:00:00Z'
  },
  {
    month: '2024-11',
    totalInvoices: 52,
    totalAmount: 198500,
    byCategory: [
      { category: 'office_supplies', count: 15, amount: 22000 },
      { category: 'transportation', count: 10, amount: 45000 },
      { category: 'meals', count: 18, amount: 15500 },
      { category: 'marketing', count: 4, amount: 95000 },
      { category: 'utilities', count: 3, amount: 8000 },
      { category: 'inventory', count: 2, amount: 13000 }
    ],
    byStatus: [
      { status: 'archived', count: 52 }
    ],
    lastUpdated: '2024-12-01T00:00:00Z'
  }
];

// Helper function to get stats
export function getInvoiceFlowStats() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthInvoices = mockInvoices.filter(inv => inv.archiveMonth === currentMonth);
  const pendingReview = currentMonthInvoices.filter(inv => inv.status === 'pending_review');
  const processingOCR = currentMonthInvoices.filter(inv => inv.ocrStatus === 'processing');

  return {
    totalThisMonth: currentMonthInvoices.length,
    totalAmountThisMonth: currentMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    pendingReview: pendingReview.length,
    processingOCR: processingOCR.length,
    recentUploads: mockInvoices.slice(0, 5),
    categoryBreakdown: mockMonthlyArchives[0]?.byCategory.map(cat => ({
      ...cat,
      percentage: Math.round((cat.amount / mockMonthlyArchives[0].totalAmount) * 100)
    })) || [],
    monthlyTrend: [
      { month: '2024-07', count: 38, amount: 125000 },
      { month: '2024-08', count: 42, amount: 145000 },
      { month: '2024-09', count: 48, amount: 168000 },
      { month: '2024-10', count: 45, amount: 155000 },
      { month: '2024-11', count: 52, amount: 198500 },
      { month: '2024-12', count: 45, amount: 156800 }
    ]
  };
}
