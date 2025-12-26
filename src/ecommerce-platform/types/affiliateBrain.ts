// Affiliate Brain (KOL 結算自動化) 類型定義

// KOL 狀態
export type KOLStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// 傭金狀態
export type CommissionStatus = 'pending' | 'calculated' | 'approved' | 'paid' | 'disputed';

// 訂單狀態
export type OrderStatus = 'completed' | 'cancelled' | 'returned' | 'pending';

// KOL/團購主資料
export interface KOLProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  promoCode: string;
  commissionRate: number; // 百分比 (例如: 10 = 10%)
  status: KOLStatus;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    line?: string;
  };
  totalSales: number;
  totalCommission: number;
  pendingCommission: number;
  joinDate: string;
  lastActiveDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 折扣碼設定
export interface PromoCode {
  id: string;
  code: string;
  kolId: string;
  kolName: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  commissionRate: number;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

// 匯入訂單記錄
export interface ImportedOrder {
  id: string;
  orderId: string;
  orderDate: string;
  customerName?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  promoCodeUsed?: string;
  orderStatus: OrderStatus;
  matchedKolId?: string;
  matchedKolName?: string;
  commissionAmount?: number;
  importBatchId: string;
  importedAt: string;
}

// 匯入批次
export interface ImportBatch {
  id: string;
  fileName: string;
  totalOrders: number;
  matchedOrders: number;
  unmatchedOrders: number;
  cancelledOrders: number;
  totalSales: number;
  totalCommission: number;
  importedBy: string;
  importedAt: string;
  status: 'processing' | 'completed' | 'failed';
}

// 傭金記錄
export interface CommissionRecord {
  id: string;
  kolId: string;
  kolName: string;
  periodStart: string;
  periodEnd: string;
  totalOrders: number;
  validOrders: number; // 排除取消/退貨
  grossSales: number;
  netSales: number; // 扣除取消/退貨後
  commissionRate: number;
  commissionAmount: number;
  adjustments?: number;
  finalAmount: number;
  status: CommissionStatus;
  paidDate?: string;
  paidBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// KOL 儀表板統計 (KOL 自助查看)
export interface KOLDashboardStats {
  kolId: string;
  kolName: string;
  currentPeriod: {
    startDate: string;
    endDate: string;
    totalSales: number;
    orderCount: number;
    estimatedCommission: number;
  };
  lastPeriod: {
    startDate: string;
    endDate: string;
    totalSales: number;
    orderCount: number;
    paidCommission: number;
  };
  allTime: {
    totalSales: number;
    totalOrders: number;
    totalCommission: number;
    averageOrderValue: number;
  };
  recentOrders: ImportedOrder[];
}

// Affiliate Brain 儀表板統計
export interface AffiliateBrainStats {
  totalKOLs: number;
  activeKOLs: number;
  totalSalesThisMonth: number;
  totalCommissionThisMonth: number;
  pendingCommission: number;
  topPerformers: {
    kolId: string;
    kolName: string;
    sales: number;
    orders: number;
  }[];
  recentImports: ImportBatch[];
  salesTrend: {
    date: string;
    sales: number;
    orders: number;
  }[];
}

// CSV 欄位對應
export interface CSVColumnMapping {
  orderId: string;
  orderDate: string;
  customerName?: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  totalAmount: string;
  promoCode?: string;
  orderStatus?: string;
}

// 標籤中文對應
export const KOL_STATUS_LABELS: Record<KOLStatus, string> = {
  active: '活躍',
  inactive: '停用',
  pending: '待審核',
  suspended: '暫停'
};

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  pending: '待計算',
  calculated: '已計算',
  approved: '已核准',
  paid: '已發放',
  disputed: '爭議中'
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  completed: '已完成',
  cancelled: '已取消',
  returned: '已退貨',
  pending: '處理中'
};

// 狀態顏色對應
export const KOL_STATUS_COLORS: Record<KOLStatus, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700'
};

export const COMMISSION_STATUS_COLORS: Record<CommissionStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  calculated: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  paid: 'bg-emerald-100 text-emerald-700',
  disputed: 'bg-red-100 text-red-700'
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700'
};
