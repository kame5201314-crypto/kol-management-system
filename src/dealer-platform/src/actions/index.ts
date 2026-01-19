/**
 * Server Actions 導出
 * 統一管理所有 Server Actions
 */

// 供應商相關
export {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  addSupplierScore,
} from './suppliers'

// 採購單相關
export {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
} from './purchase-orders'

// 交貨相關
export {
  getDeliveries,
  getDelivery,
  createDelivery,
  updateDeliveryStatus,
  inspectDeliveryItem,
} from './deliveries'

// 報價單相關
export {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  updateQuotationStatus,
  deleteQuotation,
} from './quotations'

// 產品相關
export {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  getProductCategories,
} from './products'

// 客戶相關
export {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateCreditLimit,
  setCreditHold,
  getCreditAlertCustomers,
} from './customers'

// 信用交易相關
export {
  checkCredit,
  recordCreditTransaction,
  processPayment,
  getCreditTransactions,
  getCreditSummary,
  recalculateCustomerBalance,
} from './credit'

// 階梯定價相關
export {
  getPricingRules,
  getPricingRule,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  calculatePrice,
  togglePricingRuleActive,
} from './pricing'

// 合約管理相關
export {
  getContracts,
  getContract,
  createContract,
  updateContract,
  updateContractStatus,
  deleteContract,
  getExpiringContracts,
  getContractedPrice,
} from './contracts'

// 批發詢價相關
export {
  getWholesaleInquiries,
  getWholesaleInquiry,
  createWholesaleInquiry,
  updateInquiryStatus,
  submitQuoteResponse,
  respondToQuote,
  convertToQuotation,
  deleteWholesaleInquiry,
} from './wholesale-inquiries'
