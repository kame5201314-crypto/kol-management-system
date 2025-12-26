import {
  KOLProfile,
  PromoCode,
  ImportedOrder,
  ImportBatch,
  CommissionRecord,
  AffiliateBrainStats,
  KOLDashboardStats,
  KOLStatus,
  CommissionStatus
} from '../types/affiliateBrain';
import {
  mockKOLs,
  mockPromoCodes,
  mockOrders,
  mockImportBatches,
  mockCommissions,
  getAffiliateBrainStats
} from '../data/affiliateBrainMockData';

// Storage keys
const STORAGE_KEYS = {
  KOLS: 'affiliateBrain_kols',
  PROMO_CODES: 'affiliateBrain_promoCodes',
  ORDERS: 'affiliateBrain_orders',
  IMPORT_BATCHES: 'affiliateBrain_importBatches',
  COMMISSIONS: 'affiliateBrain_commissions'
};

// Initialize storage with mock data
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.KOLS)) {
    localStorage.setItem(STORAGE_KEYS.KOLS, JSON.stringify(mockKOLs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROMO_CODES)) {
    localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(mockPromoCodes));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(mockOrders));
  }
  if (!localStorage.getItem(STORAGE_KEYS.IMPORT_BATCHES)) {
    localStorage.setItem(STORAGE_KEYS.IMPORT_BATCHES, JSON.stringify(mockImportBatches));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(mockCommissions));
  }
}

// Initialize on load
initializeStorage();

// Generic storage helpers
function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== KOL Profile Service ====================

export const kolProfileService = {
  getAll: (): KOLProfile[] => {
    return getFromStorage<KOLProfile>(STORAGE_KEYS.KOLS);
  },

  getById: (id: string): KOLProfile | undefined => {
    const kols = getFromStorage<KOLProfile>(STORAGE_KEYS.KOLS);
    return kols.find(k => k.id === id);
  },

  getByPromoCode: (code: string): KOLProfile | undefined => {
    const kols = getFromStorage<KOLProfile>(STORAGE_KEYS.KOLS);
    return kols.find(k => k.promoCode.toLowerCase() === code.toLowerCase());
  },

  create: (kol: Omit<KOLProfile, 'id' | 'createdAt' | 'updatedAt' | 'totalSales' | 'totalCommission' | 'pendingCommission'>): KOLProfile => {
    const kols = getFromStorage<KOLProfile>(STORAGE_KEYS.KOLS);
    const newKOL: KOLProfile = {
      ...kol,
      id: generateId('kol'),
      totalSales: 0,
      totalCommission: 0,
      pendingCommission: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    kols.push(newKOL);
    saveToStorage(STORAGE_KEYS.KOLS, kols);
    return newKOL;
  },

  update: (id: string, data: Partial<KOLProfile>): KOLProfile | null => {
    const kols = getFromStorage<KOLProfile>(STORAGE_KEYS.KOLS);
    const index = kols.findIndex(k => k.id === id);
    if (index === -1) return null;

    kols[index] = {
      ...kols[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.KOLS, kols);
    return kols[index];
  },

  delete: (id: string): boolean => {
    const kols = getFromStorage<KOLProfile>(STORAGE_KEYS.KOLS);
    const filtered = kols.filter(k => k.id !== id);
    if (filtered.length === kols.length) return false;
    saveToStorage(STORAGE_KEYS.KOLS, filtered);
    return true;
  },

  getByStatus: (status: KOLStatus): KOLProfile[] => {
    const kols = getFromStorage<KOLProfile>(STORAGE_KEYS.KOLS);
    return kols.filter(k => k.status === status);
  },

  getActive: (): KOLProfile[] => {
    return kolProfileService.getByStatus('active');
  },

  getTopPerformers: (limit: number = 5): KOLProfile[] => {
    const kols = getFromStorage<KOLProfile>(STORAGE_KEYS.KOLS);
    return kols
      .filter(k => k.status === 'active')
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit);
  },

  search: (query: string): KOLProfile[] => {
    const kols = getFromStorage<KOLProfile>(STORAGE_KEYS.KOLS);
    const lowerQuery = query.toLowerCase();
    return kols.filter(k =>
      k.name.toLowerCase().includes(lowerQuery) ||
      k.email.toLowerCase().includes(lowerQuery) ||
      k.promoCode.toLowerCase().includes(lowerQuery)
    );
  }
};

// ==================== Promo Code Service ====================

export const promoCodeService = {
  getAll: (): PromoCode[] => {
    return getFromStorage<PromoCode>(STORAGE_KEYS.PROMO_CODES);
  },

  getByCode: (code: string): PromoCode | undefined => {
    const codes = getFromStorage<PromoCode>(STORAGE_KEYS.PROMO_CODES);
    return codes.find(c => c.code.toLowerCase() === code.toLowerCase());
  },

  getByKOL: (kolId: string): PromoCode[] => {
    const codes = getFromStorage<PromoCode>(STORAGE_KEYS.PROMO_CODES);
    return codes.filter(c => c.kolId === kolId);
  },

  create: (promoCode: Omit<PromoCode, 'id' | 'createdAt' | 'usageCount'>): PromoCode => {
    const codes = getFromStorage<PromoCode>(STORAGE_KEYS.PROMO_CODES);
    const newCode: PromoCode = {
      ...promoCode,
      id: generateId('pc'),
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    codes.push(newCode);
    saveToStorage(STORAGE_KEYS.PROMO_CODES, codes);
    return newCode;
  },

  update: (id: string, data: Partial<PromoCode>): PromoCode | null => {
    const codes = getFromStorage<PromoCode>(STORAGE_KEYS.PROMO_CODES);
    const index = codes.findIndex(c => c.id === id);
    if (index === -1) return null;

    codes[index] = { ...codes[index], ...data };
    saveToStorage(STORAGE_KEYS.PROMO_CODES, codes);
    return codes[index];
  },

  toggleActive: (id: string): boolean => {
    const codes = getFromStorage<PromoCode>(STORAGE_KEYS.PROMO_CODES);
    const index = codes.findIndex(c => c.id === id);
    if (index === -1) return false;

    codes[index].isActive = !codes[index].isActive;
    saveToStorage(STORAGE_KEYS.PROMO_CODES, codes);
    return true;
  },

  getActive: (): PromoCode[] => {
    const codes = getFromStorage<PromoCode>(STORAGE_KEYS.PROMO_CODES);
    return codes.filter(c => c.isActive);
  }
};

// ==================== Order Import Service ====================

export const orderImportService = {
  getAllOrders: (): ImportedOrder[] => {
    return getFromStorage<ImportedOrder>(STORAGE_KEYS.ORDERS);
  },

  getOrdersByBatch: (batchId: string): ImportedOrder[] => {
    const orders = getFromStorage<ImportedOrder>(STORAGE_KEYS.ORDERS);
    return orders.filter(o => o.importBatchId === batchId);
  },

  getOrdersByKOL: (kolId: string, dateRange?: { startDate: string; endDate: string }): ImportedOrder[] => {
    const orders = getFromStorage<ImportedOrder>(STORAGE_KEYS.ORDERS);
    let filtered = orders.filter(o => o.matchedKolId === kolId);

    if (dateRange) {
      filtered = filtered.filter(o =>
        o.orderDate >= dateRange.startDate && o.orderDate <= dateRange.endDate
      );
    }

    return filtered;
  },

  getUnmatchedOrders: (): ImportedOrder[] => {
    const orders = getFromStorage<ImportedOrder>(STORAGE_KEYS.ORDERS);
    return orders.filter(o => !o.matchedKolId && o.promoCodeUsed);
  },

  importOrders: (orders: Omit<ImportedOrder, 'id' | 'matchedKolId' | 'matchedKolName' | 'commissionAmount' | 'importBatchId' | 'importedAt'>[], fileName: string): ImportBatch => {
    const existingOrders = getFromStorage<ImportedOrder>(STORAGE_KEYS.ORDERS);
    const existingBatches = getFromStorage<ImportBatch>(STORAGE_KEYS.IMPORT_BATCHES);
    const promoCodes = getFromStorage<PromoCode>(STORAGE_KEYS.PROMO_CODES);

    const batchId = generateId('batch');
    let matchedCount = 0;
    let totalSales = 0;
    let totalCommission = 0;
    let cancelledCount = 0;

    const newOrders: ImportedOrder[] = orders.map(order => {
      const newOrder: ImportedOrder = {
        ...order,
        id: generateId('ord'),
        importBatchId: batchId,
        importedAt: new Date().toISOString()
      };

      // Match with promo code
      if (order.promoCodeUsed) {
        const promoCode = promoCodes.find(
          pc => pc.code.toLowerCase() === order.promoCodeUsed?.toLowerCase() && pc.isActive
        );

        if (promoCode) {
          newOrder.matchedKolId = promoCode.kolId;
          newOrder.matchedKolName = promoCode.kolName;

          if (order.orderStatus === 'completed') {
            newOrder.commissionAmount = Math.round(order.totalAmount * (promoCode.commissionRate / 100));
            totalCommission += newOrder.commissionAmount;
            totalSales += order.totalAmount;
          }
          matchedCount++;
        }
      }

      if (order.orderStatus === 'cancelled' || order.orderStatus === 'returned') {
        cancelledCount++;
      }

      return newOrder;
    });

    // Save orders
    saveToStorage(STORAGE_KEYS.ORDERS, [...existingOrders, ...newOrders]);

    // Create batch record
    const newBatch: ImportBatch = {
      id: batchId,
      fileName,
      totalOrders: orders.length,
      matchedOrders: matchedCount,
      unmatchedOrders: orders.filter(o => o.promoCodeUsed).length - matchedCount,
      cancelledOrders: cancelledCount,
      totalSales,
      totalCommission,
      importedBy: '系統使用者',
      importedAt: new Date().toISOString(),
      status: 'completed'
    };

    saveToStorage(STORAGE_KEYS.IMPORT_BATCHES, [...existingBatches, newBatch]);

    return newBatch;
  },

  getAllBatches: (): ImportBatch[] => {
    return getFromStorage<ImportBatch>(STORAGE_KEYS.IMPORT_BATCHES);
  },

  getBatchById: (id: string): ImportBatch | undefined => {
    const batches = getFromStorage<ImportBatch>(STORAGE_KEYS.IMPORT_BATCHES);
    return batches.find(b => b.id === id);
  }
};

// ==================== Commission Service ====================

export const commissionService = {
  getAll: (): CommissionRecord[] => {
    return getFromStorage<CommissionRecord>(STORAGE_KEYS.COMMISSIONS);
  },

  getById: (id: string): CommissionRecord | undefined => {
    const commissions = getFromStorage<CommissionRecord>(STORAGE_KEYS.COMMISSIONS);
    return commissions.find(c => c.id === id);
  },

  getByKOL: (kolId: string): CommissionRecord[] => {
    const commissions = getFromStorage<CommissionRecord>(STORAGE_KEYS.COMMISSIONS);
    return commissions.filter(c => c.kolId === kolId).sort((a, b) =>
      new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime()
    );
  },

  getByStatus: (status: CommissionStatus): CommissionRecord[] => {
    const commissions = getFromStorage<CommissionRecord>(STORAGE_KEYS.COMMISSIONS);
    return commissions.filter(c => c.status === status);
  },

  getByPeriod: (periodStart: string, periodEnd: string): CommissionRecord[] => {
    const commissions = getFromStorage<CommissionRecord>(STORAGE_KEYS.COMMISSIONS);
    return commissions.filter(c =>
      c.periodStart >= periodStart && c.periodEnd <= periodEnd
    );
  },

  calculateCommissions: (periodStart: string, periodEnd: string): CommissionRecord[] => {
    const orders = getFromStorage<ImportedOrder>(STORAGE_KEYS.ORDERS);
    const kols = getFromStorage<KOLProfile>(STORAGE_KEYS.KOLS);
    const existingCommissions = getFromStorage<CommissionRecord>(STORAGE_KEYS.COMMISSIONS);

    // Get orders in period
    const periodOrders = orders.filter(o =>
      o.orderDate >= periodStart && o.orderDate <= periodEnd
    );

    // Group by KOL
    const kolOrdersMap = new Map<string, ImportedOrder[]>();
    periodOrders.forEach(order => {
      if (order.matchedKolId) {
        const existing = kolOrdersMap.get(order.matchedKolId) || [];
        existing.push(order);
        kolOrdersMap.set(order.matchedKolId, existing);
      }
    });

    const newCommissions: CommissionRecord[] = [];

    kolOrdersMap.forEach((kolOrders, kolId) => {
      const kol = kols.find(k => k.id === kolId);
      if (!kol) return;

      const totalOrders = kolOrders.length;
      const validOrders = kolOrders.filter(o => o.orderStatus === 'completed');
      const grossSales = kolOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const netSales = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const commissionAmount = validOrders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);

      const commission: CommissionRecord = {
        id: generateId('comm'),
        kolId,
        kolName: kol.name,
        periodStart,
        periodEnd,
        totalOrders,
        validOrders: validOrders.length,
        grossSales,
        netSales,
        commissionRate: kol.commissionRate,
        commissionAmount,
        finalAmount: commissionAmount,
        status: 'calculated',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      newCommissions.push(commission);
    });

    // Save new commissions
    saveToStorage(STORAGE_KEYS.COMMISSIONS, [...existingCommissions, ...newCommissions]);

    return newCommissions;
  },

  updateStatus: (id: string, status: CommissionStatus, notes?: string): boolean => {
    const commissions = getFromStorage<CommissionRecord>(STORAGE_KEYS.COMMISSIONS);
    const index = commissions.findIndex(c => c.id === id);
    if (index === -1) return false;

    commissions[index].status = status;
    commissions[index].updatedAt = new Date().toISOString();
    if (notes) commissions[index].notes = notes;

    saveToStorage(STORAGE_KEYS.COMMISSIONS, commissions);
    return true;
  },

  markAsPaid: (ids: string[], paidBy: string): boolean => {
    const commissions = getFromStorage<CommissionRecord>(STORAGE_KEYS.COMMISSIONS);
    const paidDate = new Date().toISOString().split('T')[0];

    ids.forEach(id => {
      const index = commissions.findIndex(c => c.id === id);
      if (index !== -1) {
        commissions[index].status = 'paid';
        commissions[index].paidDate = paidDate;
        commissions[index].paidBy = paidBy;
        commissions[index].updatedAt = new Date().toISOString();
      }
    });

    saveToStorage(STORAGE_KEYS.COMMISSIONS, commissions);
    return true;
  }
};

// ==================== Dashboard Service ====================

export const affiliateDashboardService = {
  getStats: (): AffiliateBrainStats => {
    const kols = getFromStorage<KOLProfile>(STORAGE_KEYS.KOLS);
    const commissions = getFromStorage<CommissionRecord>(STORAGE_KEYS.COMMISSIONS);
    const batches = getFromStorage<ImportBatch>(STORAGE_KEYS.IMPORT_BATCHES);

    const now = new Date();
    const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const currentMonthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;

    const activeKOLs = kols.filter(k => k.status === 'active');
    const currentMonthCommissions = commissions.filter(c =>
      c.periodStart >= currentMonthStart && c.periodEnd <= currentMonthEnd
    );

    return {
      totalKOLs: kols.length,
      activeKOLs: activeKOLs.length,
      totalSalesThisMonth: currentMonthCommissions.reduce((sum, c) => sum + c.netSales, 0),
      totalCommissionThisMonth: currentMonthCommissions.reduce((sum, c) => sum + c.finalAmount, 0),
      pendingCommission: kols.reduce((sum, k) => sum + k.pendingCommission, 0),
      topPerformers: activeKOLs
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5)
        .map(k => ({
          kolId: k.id,
          kolName: k.name,
          sales: k.totalSales,
          orders: Math.floor(k.totalSales / 1500)
        })),
      recentImports: batches.slice(-3).reverse(),
      salesTrend: getAffiliateBrainStats().salesTrend
    };
  },

  getKOLDashboard: (kolId: string): KOLDashboardStats | null => {
    const kol = kolProfileService.getById(kolId);
    if (!kol) return null;

    const orders = orderImportService.getOrdersByKOL(kolId);
    const commissions = commissionService.getByKOL(kolId);

    const now = new Date();
    const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentPeriodOrders = orders.filter(o =>
      o.orderDate >= currentMonthStart && o.orderStatus === 'completed'
    );

    const lastPeriodCommission = commissions.find(c =>
      c.periodStart >= `${lastMonthStart.getFullYear()}-${String(lastMonthStart.getMonth() + 1).padStart(2, '0')}-01`
    );

    return {
      kolId,
      kolName: kol.name,
      currentPeriod: {
        startDate: currentMonthStart,
        endDate: new Date().toISOString().split('T')[0],
        totalSales: currentPeriodOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        orderCount: currentPeriodOrders.length,
        estimatedCommission: currentPeriodOrders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0)
      },
      lastPeriod: {
        startDate: `${lastMonthStart.getFullYear()}-${String(lastMonthStart.getMonth() + 1).padStart(2, '0')}-01`,
        endDate: `${lastMonthEnd.getFullYear()}-${String(lastMonthEnd.getMonth() + 1).padStart(2, '0')}-${lastMonthEnd.getDate()}`,
        totalSales: lastPeriodCommission?.netSales || 0,
        orderCount: lastPeriodCommission?.validOrders || 0,
        paidCommission: lastPeriodCommission?.status === 'paid' ? lastPeriodCommission.finalAmount : 0
      },
      allTime: {
        totalSales: kol.totalSales,
        totalOrders: orders.filter(o => o.orderStatus === 'completed').length,
        totalCommission: kol.totalCommission,
        averageOrderValue: orders.length > 0
          ? Math.round(orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length)
          : 0
      },
      recentOrders: orders
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .slice(0, 10)
    };
  }
};

// ==================== Alias Services for Components ====================

// Import Batch Service (alias for component compatibility)
export const importBatchService = {
  getAll: (): ImportBatch[] => {
    return orderImportService.getAllBatches();
  },

  getById: (id: string): ImportBatch | undefined => {
    return orderImportService.getBatchById(id);
  },

  create: (fileName: string, totalOrders: number, importedBy: string): ImportBatch => {
    const batches = getFromStorage<ImportBatch>(STORAGE_KEYS.IMPORT_BATCHES);
    const newBatch: ImportBatch = {
      id: generateId('batch'),
      fileName,
      totalOrders,
      matchedOrders: 0,
      unmatchedOrders: 0,
      cancelledOrders: 0,
      totalSales: 0,
      totalCommission: 0,
      importedBy,
      importedAt: new Date().toISOString(),
      status: 'processing'
    };
    batches.unshift(newBatch);
    saveToStorage(STORAGE_KEYS.IMPORT_BATCHES, batches);
    return newBatch;
  },

  updateProgress: (id: string, processedOrders: number, matchedOrders: number, unmatchedOrders: number): ImportBatch | null => {
    const batches = getFromStorage<ImportBatch>(STORAGE_KEYS.IMPORT_BATCHES);
    const index = batches.findIndex(b => b.id === id);
    if (index === -1) return null;

    batches[index].matchedOrders = matchedOrders;
    batches[index].unmatchedOrders = unmatchedOrders;
    batches[index].status = 'completed';
    saveToStorage(STORAGE_KEYS.IMPORT_BATCHES, batches);
    return batches[index];
  }
};

// Imported Order Service (alias for component compatibility)
export const importedOrderService = {
  getAll: (): ImportedOrder[] => {
    return orderImportService.getAllOrders();
  },

  getByKOL: (kolId: string): ImportedOrder[] => {
    return orderImportService.getOrdersByKOL(kolId);
  },

  create: (order: Omit<ImportedOrder, 'id' | 'matchedKOLId' | 'matchedKOLName' | 'commissionAmount' | 'importedAt'>): ImportedOrder => {
    const orders = getFromStorage<ImportedOrder>(STORAGE_KEYS.ORDERS);
    const promoCodes = getFromStorage<PromoCode>(STORAGE_KEYS.PROMO_CODES);

    const newOrder: ImportedOrder = {
      ...order,
      id: generateId('ord'),
      importedAt: new Date().toISOString(),
      orderStatus: 'completed'
    };

    // Match with promo code
    if (order.promoCode) {
      const promoCode = promoCodes.find(
        pc => pc.code.toLowerCase() === order.promoCode?.toLowerCase() && pc.isActive
      );

      if (promoCode) {
        newOrder.matchedKOLId = promoCode.kolId;
        newOrder.matchedKOLName = promoCode.kolName;
        newOrder.commissionAmount = Math.round(order.totalAmount * (promoCode.commissionRate / 100));
      }
    }

    orders.push(newOrder);
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  }
};

// Commission Record Service (alias for component compatibility)
export const commissionRecordService = {
  getAll: (): CommissionRecord[] => {
    return commissionService.getAll();
  },

  getByKOL: (kolId: string): CommissionRecord[] => {
    return commissionService.getByKOL(kolId);
  },

  getByMonth: (month: string): CommissionRecord[] => {
    const commissions = commissionService.getAll();
    return commissions.filter(c => c.period === month || c.periodStart.startsWith(month));
  },

  approve: (id: string, approvedBy: string): boolean => {
    const commissions = getFromStorage<CommissionRecord>(STORAGE_KEYS.COMMISSIONS);
    const index = commissions.findIndex(c => c.id === id);
    if (index === -1) return false;

    commissions[index].status = 'approved';
    commissions[index].approvedBy = approvedBy;
    commissions[index].approvedAt = new Date().toISOString();
    commissions[index].updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.COMMISSIONS, commissions);
    return true;
  },

  markAsPaid: (id: string, paidBy: string): boolean => {
    const commissions = getFromStorage<CommissionRecord>(STORAGE_KEYS.COMMISSIONS);
    const index = commissions.findIndex(c => c.id === id);
    if (index === -1) return false;

    commissions[index].status = 'paid';
    commissions[index].paidBy = paidBy;
    commissions[index].paidDate = new Date().toISOString().split('T')[0];
    commissions[index].updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.COMMISSIONS, commissions);
    return true;
  }
};

// Reset all data (for testing)
export const resetAffiliateBrainData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  initializeStorage();
};
