import {
  KOLProfile,
  PromoCode,
  ImportedOrder,
  ImportBatch,
  CommissionRecord
} from '../types/affiliateBrain';

// Mock KOL Profiles
export const mockKOLs: KOLProfile[] = [
  {
    id: 'kol-001',
    name: '美妝達人小芳',
    email: 'xiaofang@example.com',
    phone: '0912-345-678',
    promoCode: 'FANG10',
    commissionRate: 10,
    status: 'active',
    bankAccount: {
      bankName: '中國信託',
      accountNumber: '1234567890123',
      accountName: '王小芳'
    },
    socialMedia: {
      instagram: '@beautyfang',
      youtube: 'BeautyFang',
      facebook: 'beautyfang.tw'
    },
    totalSales: 1250000,
    totalCommission: 125000,
    pendingCommission: 15000,
    joinDate: '2024-01-15',
    lastActiveDate: '2024-12-20',
    notes: '主打美妝產品，粉絲互動率高',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-20T15:30:00Z'
  },
  {
    id: 'kol-002',
    name: '3C評測王阿明',
    email: 'aming@example.com',
    phone: '0923-456-789',
    promoCode: 'MING15',
    commissionRate: 15,
    status: 'active',
    bankAccount: {
      bankName: '國泰世華',
      accountNumber: '9876543210987',
      accountName: '李阿明'
    },
    socialMedia: {
      youtube: 'TechMing',
      facebook: 'techming.tw'
    },
    totalSales: 2450000,
    totalCommission: 367500,
    pendingCommission: 45000,
    joinDate: '2023-06-20',
    lastActiveDate: '2024-12-22',
    notes: '專業3C評測，轉換率高',
    createdAt: '2023-06-20T08:00:00Z',
    updatedAt: '2024-12-22T10:00:00Z'
  },
  {
    id: 'kol-003',
    name: '親子部落客小安媽',
    email: 'anmom@example.com',
    phone: '0934-567-890',
    promoCode: 'ANMOM',
    commissionRate: 8,
    status: 'active',
    bankAccount: {
      bankName: '台新銀行',
      accountNumber: '5555666677778888',
      accountName: '陳安安'
    },
    socialMedia: {
      instagram: '@anmom_life',
      facebook: 'anmom.life'
    },
    totalSales: 890000,
    totalCommission: 71200,
    pendingCommission: 8500,
    joinDate: '2024-03-01',
    lastActiveDate: '2024-12-18',
    notes: '親子用品推廣',
    createdAt: '2024-03-01T14:00:00Z',
    updatedAt: '2024-12-18T09:00:00Z'
  },
  {
    id: 'kol-004',
    name: '運動健身教練阿傑',
    email: 'jie.fitness@example.com',
    phone: '0945-678-901',
    promoCode: 'FIT20',
    commissionRate: 20,
    status: 'active',
    bankAccount: {
      bankName: '富邦銀行',
      accountNumber: '1111222233334444',
      accountName: '張阿傑'
    },
    socialMedia: {
      instagram: '@jie_fitness',
      youtube: 'JieFitness'
    },
    totalSales: 1680000,
    totalCommission: 336000,
    pendingCommission: 28000,
    joinDate: '2024-02-10',
    lastActiveDate: '2024-12-21',
    notes: '健身器材及營養品推廣',
    createdAt: '2024-02-10T11:00:00Z',
    updatedAt: '2024-12-21T16:00:00Z'
  },
  {
    id: 'kol-005',
    name: '美食評論家老饕',
    email: 'foodie@example.com',
    phone: '0956-789-012',
    promoCode: 'YUMMY',
    commissionRate: 12,
    status: 'inactive',
    totalSales: 320000,
    totalCommission: 38400,
    pendingCommission: 0,
    joinDate: '2024-05-15',
    lastActiveDate: '2024-09-30',
    notes: '已暫停合作',
    createdAt: '2024-05-15T09:00:00Z',
    updatedAt: '2024-10-01T10:00:00Z'
  },
  {
    id: 'kol-006',
    name: '時尚穿搭達人小琪',
    email: 'chiqi.fashion@example.com',
    phone: '0967-890-123',
    promoCode: 'CHIQI',
    commissionRate: 10,
    status: 'pending',
    socialMedia: {
      instagram: '@chiqi_style',
      line: 'chiqi_fashion'
    },
    totalSales: 0,
    totalCommission: 0,
    pendingCommission: 0,
    joinDate: '2024-12-20',
    notes: '新加入，待審核',
    createdAt: '2024-12-20T14:00:00Z',
    updatedAt: '2024-12-20T14:00:00Z'
  }
];

// Mock Promo Codes
export const mockPromoCodes: PromoCode[] = [
  {
    id: 'pc-001',
    code: 'FANG10',
    kolId: 'kol-001',
    kolName: '美妝達人小芳',
    discountType: 'percentage',
    discountValue: 10,
    commissionRate: 10,
    isActive: true,
    usageCount: 1250,
    startDate: '2024-01-15',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'pc-002',
    code: 'MING15',
    kolId: 'kol-002',
    kolName: '3C評測王阿明',
    discountType: 'percentage',
    discountValue: 15,
    commissionRate: 15,
    isActive: true,
    usageCount: 980,
    startDate: '2023-06-20',
    createdAt: '2023-06-20T08:00:00Z'
  },
  {
    id: 'pc-003',
    code: 'ANMOM',
    kolId: 'kol-003',
    kolName: '親子部落客小安媽',
    discountType: 'fixed',
    discountValue: 100,
    commissionRate: 8,
    isActive: true,
    usageCount: 456,
    startDate: '2024-03-01',
    createdAt: '2024-03-01T14:00:00Z'
  },
  {
    id: 'pc-004',
    code: 'FIT20',
    kolId: 'kol-004',
    kolName: '運動健身教練阿傑',
    discountType: 'percentage',
    discountValue: 20,
    commissionRate: 20,
    isActive: true,
    usageCount: 672,
    startDate: '2024-02-10',
    createdAt: '2024-02-10T11:00:00Z'
  },
  {
    id: 'pc-005',
    code: 'YUMMY',
    kolId: 'kol-005',
    kolName: '美食評論家老饕',
    discountType: 'percentage',
    discountValue: 12,
    commissionRate: 12,
    isActive: false,
    usageCount: 128,
    startDate: '2024-05-15',
    endDate: '2024-09-30',
    createdAt: '2024-05-15T09:00:00Z'
  }
];

// Mock Imported Orders
export const mockOrders: ImportedOrder[] = [
  {
    id: 'ord-001',
    orderId: 'SH2024122001',
    orderDate: '2024-12-20',
    customerName: '林小姐',
    productName: 'APEXEL 手機鏡頭套組',
    quantity: 2,
    unitPrice: 1500,
    totalAmount: 3000,
    promoCodeUsed: 'FANG10',
    orderStatus: 'completed',
    matchedKolId: 'kol-001',
    matchedKolName: '美妝達人小芳',
    commissionAmount: 300,
    importBatchId: 'batch-001',
    importedAt: '2024-12-21T10:00:00Z'
  },
  {
    id: 'ord-002',
    orderId: 'SH2024122002',
    orderDate: '2024-12-20',
    customerName: '陳先生',
    productName: '藍牙耳機 Pro',
    quantity: 1,
    unitPrice: 2500,
    totalAmount: 2500,
    promoCodeUsed: 'MING15',
    orderStatus: 'completed',
    matchedKolId: 'kol-002',
    matchedKolName: '3C評測王阿明',
    commissionAmount: 375,
    importBatchId: 'batch-001',
    importedAt: '2024-12-21T10:00:00Z'
  },
  {
    id: 'ord-003',
    orderId: 'SH2024122003',
    orderDate: '2024-12-20',
    customerName: '王媽媽',
    productName: '兒童學習桌椅組',
    quantity: 1,
    unitPrice: 4500,
    totalAmount: 4500,
    promoCodeUsed: 'ANMOM',
    orderStatus: 'completed',
    matchedKolId: 'kol-003',
    matchedKolName: '親子部落客小安媽',
    commissionAmount: 360,
    importBatchId: 'batch-001',
    importedAt: '2024-12-21T10:00:00Z'
  },
  {
    id: 'ord-004',
    orderId: 'SH2024121901',
    orderDate: '2024-12-19',
    customerName: '張先生',
    productName: '健身阻力帶套組',
    quantity: 3,
    unitPrice: 800,
    totalAmount: 2400,
    promoCodeUsed: 'FIT20',
    orderStatus: 'completed',
    matchedKolId: 'kol-004',
    matchedKolName: '運動健身教練阿傑',
    commissionAmount: 480,
    importBatchId: 'batch-001',
    importedAt: '2024-12-21T10:00:00Z'
  },
  {
    id: 'ord-005',
    orderId: 'SH2024121902',
    orderDate: '2024-12-19',
    customerName: '李小姐',
    productName: '手機殼限定款',
    quantity: 1,
    unitPrice: 590,
    totalAmount: 590,
    orderStatus: 'completed',
    importBatchId: 'batch-001',
    importedAt: '2024-12-21T10:00:00Z'
  },
  {
    id: 'ord-006',
    orderId: 'SH2024121801',
    orderDate: '2024-12-18',
    customerName: '黃先生',
    productName: '手機鏡頭清潔組',
    quantity: 2,
    unitPrice: 350,
    totalAmount: 700,
    promoCodeUsed: 'FANG10',
    orderStatus: 'cancelled',
    matchedKolId: 'kol-001',
    matchedKolName: '美妝達人小芳',
    importBatchId: 'batch-001',
    importedAt: '2024-12-21T10:00:00Z'
  },
  {
    id: 'ord-007',
    orderId: 'SH2024121802',
    orderDate: '2024-12-18',
    customerName: '周小姐',
    productName: '運動水壺',
    quantity: 1,
    unitPrice: 450,
    totalAmount: 450,
    promoCodeUsed: 'FIT20',
    orderStatus: 'returned',
    matchedKolId: 'kol-004',
    matchedKolName: '運動健身教練阿傑',
    importBatchId: 'batch-001',
    importedAt: '2024-12-21T10:00:00Z'
  }
];

// Mock Import Batches
export const mockImportBatches: ImportBatch[] = [
  {
    id: 'batch-001',
    fileName: '蝦皮訂單_202412月.csv',
    totalOrders: 156,
    matchedOrders: 142,
    unmatchedOrders: 14,
    cancelledOrders: 8,
    totalSales: 485600,
    totalCommission: 52800,
    importedBy: '王小明',
    importedAt: '2024-12-21T10:00:00Z',
    status: 'completed'
  },
  {
    id: 'batch-002',
    fileName: 'momo訂單_202411月.csv',
    totalOrders: 89,
    matchedOrders: 78,
    unmatchedOrders: 11,
    cancelledOrders: 3,
    totalSales: 298000,
    totalCommission: 32500,
    importedBy: '王小明',
    importedAt: '2024-11-25T14:30:00Z',
    status: 'completed'
  },
  {
    id: 'batch-003',
    fileName: '蝦皮訂單_202411月.csv',
    totalOrders: 203,
    matchedOrders: 189,
    unmatchedOrders: 14,
    cancelledOrders: 12,
    totalSales: 623400,
    totalCommission: 68200,
    importedBy: '李小華',
    importedAt: '2024-11-20T09:15:00Z',
    status: 'completed'
  }
];

// Mock Commission Records
export const mockCommissions: CommissionRecord[] = [
  {
    id: 'comm-001',
    kolId: 'kol-001',
    kolName: '美妝達人小芳',
    periodStart: '2024-12-01',
    periodEnd: '2024-12-31',
    totalOrders: 125,
    validOrders: 118,
    grossSales: 156000,
    netSales: 148500,
    commissionRate: 10,
    commissionAmount: 14850,
    finalAmount: 14850,
    status: 'calculated',
    createdAt: '2024-12-21T00:00:00Z',
    updatedAt: '2024-12-21T00:00:00Z'
  },
  {
    id: 'comm-002',
    kolId: 'kol-002',
    kolName: '3C評測王阿明',
    periodStart: '2024-12-01',
    periodEnd: '2024-12-31',
    totalOrders: 98,
    validOrders: 95,
    grossSales: 312000,
    netSales: 298000,
    commissionRate: 15,
    commissionAmount: 44700,
    finalAmount: 44700,
    status: 'calculated',
    createdAt: '2024-12-21T00:00:00Z',
    updatedAt: '2024-12-21T00:00:00Z'
  },
  {
    id: 'comm-003',
    kolId: 'kol-003',
    kolName: '親子部落客小安媽',
    periodStart: '2024-12-01',
    periodEnd: '2024-12-31',
    totalOrders: 45,
    validOrders: 43,
    grossSales: 89000,
    netSales: 85000,
    commissionRate: 8,
    commissionAmount: 6800,
    finalAmount: 6800,
    status: 'pending',
    createdAt: '2024-12-21T00:00:00Z',
    updatedAt: '2024-12-21T00:00:00Z'
  },
  {
    id: 'comm-004',
    kolId: 'kol-004',
    kolName: '運動健身教練阿傑',
    periodStart: '2024-12-01',
    periodEnd: '2024-12-31',
    totalOrders: 67,
    validOrders: 64,
    grossSales: 168000,
    netSales: 156000,
    commissionRate: 20,
    commissionAmount: 31200,
    finalAmount: 31200,
    status: 'approved',
    createdAt: '2024-12-21T00:00:00Z',
    updatedAt: '2024-12-22T10:00:00Z'
  },
  {
    id: 'comm-005',
    kolId: 'kol-001',
    kolName: '美妝達人小芳',
    periodStart: '2024-11-01',
    periodEnd: '2024-11-30',
    totalOrders: 142,
    validOrders: 135,
    grossSales: 178000,
    netSales: 165000,
    commissionRate: 10,
    commissionAmount: 16500,
    finalAmount: 16500,
    status: 'paid',
    paidDate: '2024-12-05',
    paidBy: '王小明',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-05T14:00:00Z'
  },
  {
    id: 'comm-006',
    kolId: 'kol-002',
    kolName: '3C評測王阿明',
    periodStart: '2024-11-01',
    periodEnd: '2024-11-30',
    totalOrders: 112,
    validOrders: 108,
    grossSales: 356000,
    netSales: 342000,
    commissionRate: 15,
    commissionAmount: 51300,
    finalAmount: 51300,
    status: 'paid',
    paidDate: '2024-12-05',
    paidBy: '王小明',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-05T14:00:00Z'
  }
];

// Dashboard stats helper
export function getAffiliateBrainStats() {
  const activeKOLs = mockKOLs.filter(k => k.status === 'active');
  const currentMonthCommissions = mockCommissions.filter(c =>
    c.periodStart >= '2024-12-01' && c.periodEnd <= '2024-12-31'
  );

  return {
    totalKOLs: mockKOLs.length,
    activeKOLs: activeKOLs.length,
    totalSalesThisMonth: currentMonthCommissions.reduce((sum, c) => sum + c.netSales, 0),
    totalCommissionThisMonth: currentMonthCommissions.reduce((sum, c) => sum + c.finalAmount, 0),
    pendingCommission: mockKOLs.reduce((sum, k) => sum + k.pendingCommission, 0),
    topPerformers: activeKOLs
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5)
      .map(k => ({
        kolId: k.id,
        kolName: k.name,
        sales: k.totalSales,
        orders: Math.floor(k.totalSales / 1500) // 估算訂單數
      })),
    recentImports: mockImportBatches.slice(0, 3),
    salesTrend: [
      { date: '2024-12-15', sales: 45000, orders: 32 },
      { date: '2024-12-16', sales: 52000, orders: 38 },
      { date: '2024-12-17', sales: 48000, orders: 35 },
      { date: '2024-12-18', sales: 61000, orders: 42 },
      { date: '2024-12-19', sales: 55000, orders: 40 },
      { date: '2024-12-20', sales: 68000, orders: 48 },
      { date: '2024-12-21', sales: 72000, orders: 52 }
    ]
  };
}
