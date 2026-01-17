/**
 * Server Actions Index
 * Export all server actions for easy importing
 */

// Products
export {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  syncProductToPlatforms,
  bulkSyncProducts,
  importFromPlatform,
} from './products'

// Platforms
export {
  fetchPlatformConnections,
  fetchPlatformById,
  connectPlatform,
  updatePlatformSettings,
  disconnectPlatform,
  removePlatformConnection,
  triggerPlatformSync,
  refreshPlatformToken,
} from './platforms'

// Inventory
export {
  fetchInventory,
  fetchInventoryByProduct,
  fetchLowStockItems,
  adjustInventoryStock,
  updateLowStockThreshold,
  updateWarehouseLocation,
  fetchInventoryLogs,
  syncInventoryToPlatforms as syncAllInventory,
  fetchInventoryStats,
} from './inventory'

// Orders
export {
  fetchOrders,
  fetchOrderById,
  updateOrderStatus,
  addOrderNote,
  syncOrdersFromPlatforms,
  fetchOrderStats,
  exportOrders,
} from './orders'

// Dashboard
export {
  fetchDashboardStats,
  fetchPlatformStats,
  fetchRecentActivity,
  fetchSalesChartData,
  fetchPlatformDistribution,
  fetchTopProducts,
} from './dashboard'
