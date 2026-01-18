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
