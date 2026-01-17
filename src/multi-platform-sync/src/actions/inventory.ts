'use server'

/**
 * Inventory Management Server Actions
 * Handles all inventory-related operations
 */

import { revalidatePath } from 'next/cache'
import {
  getInventory,
  getInventoryByProduct,
  adjustInventory,
  getInventoryLogs,
} from '@/lib/supabase/database'
import { createSyncService } from '@/lib/sync/sync-service'
import type { Inventory, InventoryLog } from '@/types/database'

// Default org/user for development
const DEFAULT_ORG_ID = 'default'
const DEFAULT_USER_ID = 'system'

// Response types
interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

interface InventoryWithProduct extends Inventory {
  product_name?: string
  product_sku?: string
}

// Mock inventory data
const mockInventory: InventoryWithProduct[] = [
  {
    id: '1',
    org_id: DEFAULT_ORG_ID,
    product_id: '1',
    variant_id: null,
    sku: 'SKU-001',
    total_stock: 150,
    reserved_stock: 20,
    available_stock: 130,
    low_stock_threshold: 10,
    warehouse_location: 'A-01-01',
    product_name: 'Premium Wireless Earbuds',
    product_sku: 'SKU-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
    is_deleted: false,
    deleted_at: null,
    metadata: {},
    version: 1,
  },
  {
    id: '2',
    org_id: DEFAULT_ORG_ID,
    product_id: '2',
    variant_id: null,
    sku: 'SKU-002',
    total_stock: 85,
    reserved_stock: 5,
    available_stock: 80,
    low_stock_threshold: 20,
    warehouse_location: 'A-02-03',
    product_name: 'Smart Watch Pro',
    product_sku: 'SKU-002',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
    is_deleted: false,
    deleted_at: null,
    metadata: {},
    version: 1,
  },
  {
    id: '3',
    org_id: DEFAULT_ORG_ID,
    product_id: '3',
    variant_id: null,
    sku: 'SKU-003',
    total_stock: 8,
    reserved_stock: 3,
    available_stock: 5,
    low_stock_threshold: 15,
    warehouse_location: 'B-01-02',
    product_name: 'Portable Charger 20000mAh',
    product_sku: 'SKU-003',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
    is_deleted: false,
    deleted_at: null,
    metadata: {},
    version: 1,
  },
  {
    id: '4',
    org_id: DEFAULT_ORG_ID,
    product_id: '4',
    variant_id: null,
    sku: 'SKU-004',
    total_stock: 200,
    reserved_stock: 45,
    available_stock: 155,
    low_stock_threshold: 30,
    warehouse_location: 'C-03-01',
    product_name: 'USB-C Cable 2m',
    product_sku: 'SKU-004',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
    is_deleted: false,
    deleted_at: null,
    metadata: {},
    version: 1,
  },
]

// Mock inventory logs
const mockLogs: InventoryLog[] = [
  {
    id: '1',
    org_id: DEFAULT_ORG_ID,
    inventory_id: '1',
    product_id: '1',
    change_type: 'sale',
    change_quantity: -2,
    previous_quantity: 132,
    new_quantity: 130,
    reference_type: 'order',
    reference_id: 'ORD-001',
    notes: 'Order fulfilled',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    created_by: null,
    updated_by: null,
    is_deleted: false,
    deleted_at: null,
    metadata: {},
    version: 1,
  },
  {
    id: '2',
    org_id: DEFAULT_ORG_ID,
    inventory_id: '3',
    product_id: '3',
    change_type: 'restock',
    change_quantity: 50,
    previous_quantity: 5,
    new_quantity: 55,
    reference_type: 'manual',
    reference_id: null,
    notes: 'Weekly restock',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    created_by: null,
    updated_by: null,
    is_deleted: false,
    deleted_at: null,
    metadata: {},
    version: 1,
  },
]

function isUsingMockData(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo')
}

/**
 * Get all inventory items
 */
export async function fetchInventory(): Promise<ActionResponse<InventoryWithProduct[]>> {
  try {
    if (isUsingMockData()) {
      return { success: true, data: mockInventory }
    }

    const { data, error } = await getInventory(DEFAULT_ORG_ID)
    if (error) throw new Error(error)

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch inventory',
    }
  }
}

/**
 * Get inventory by product ID
 */
export async function fetchInventoryByProduct(
  productId: string
): Promise<ActionResponse<Inventory>> {
  try {
    if (isUsingMockData()) {
      const inventory = mockInventory.find((i) => i.product_id === productId)
      if (!inventory) throw new Error('Inventory not found')
      return { success: true, data: inventory }
    }

    const { data, error } = await getInventoryByProduct(DEFAULT_ORG_ID, productId)
    if (error) throw new Error(error)
    if (!data) throw new Error('Inventory not found')

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching inventory by product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch inventory',
    }
  }
}

/**
 * Get low stock items
 */
export async function fetchLowStockItems(): Promise<ActionResponse<InventoryWithProduct[]>> {
  try {
    if (isUsingMockData()) {
      const lowStock = mockInventory.filter(
        (i) => i.available_stock <= i.low_stock_threshold
      )
      return { success: true, data: lowStock }
    }

    const { data, error } = await getInventory(DEFAULT_ORG_ID)
    if (error) throw new Error(error)

    const lowStock = (data || []).filter(
      (i) => i.available_stock <= i.low_stock_threshold
    )

    return { success: true, data: lowStock }
  } catch (error) {
    console.error('Error fetching low stock items:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch low stock items',
    }
  }
}

/**
 * Adjust inventory stock
 */
export async function adjustInventoryStock(input: {
  inventoryId: string
  adjustment: number
  reason: 'restock' | 'adjustment' | 'return' | 'damage'
  notes?: string
}): Promise<ActionResponse<Inventory>> {
  try {
    if (isUsingMockData()) {
      const index = mockInventory.findIndex((i) => i.id === input.inventoryId)
      if (index === -1) throw new Error('Inventory not found')

      const current = mockInventory[index]
      const newStock = current.available_stock + input.adjustment

      if (newStock < 0) {
        throw new Error('Insufficient stock')
      }

      mockInventory[index] = {
        ...current,
        total_stock: current.total_stock + input.adjustment,
        available_stock: newStock,
        updated_at: new Date().toISOString(),
      }

      // Add log entry
      mockLogs.unshift({
        id: `log-${Date.now()}`,
        org_id: DEFAULT_ORG_ID,
        inventory_id: input.inventoryId,
        product_id: current.product_id,
        change_type: input.reason,
        change_quantity: input.adjustment,
        previous_quantity: current.available_stock,
        new_quantity: newStock,
        reference_type: 'manual',
        reference_id: null,
        notes: input.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: DEFAULT_USER_ID,
        updated_by: DEFAULT_USER_ID,
        is_deleted: false,
        deleted_at: null,
        metadata: {},
        version: 1,
      })

      return { success: true, data: mockInventory[index] }
    }

    // Determine action based on adjustment value
    const action: 'add' | 'remove' = input.adjustment >= 0 ? 'add' : 'remove'
    const quantity = Math.abs(input.adjustment)

    const { data, error } = await adjustInventory(
      DEFAULT_ORG_ID,
      input.inventoryId,
      action,
      quantity,
      input.reason,
      DEFAULT_USER_ID
    )

    if (error) throw new Error(error)
    if (!data) throw new Error('Failed to adjust inventory')

    revalidatePath('/auth/inventory')
    return { success: true, data }
  } catch (error) {
    console.error('Error adjusting inventory:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to adjust inventory',
    }
  }
}

/**
 * Update low stock threshold
 */
export async function updateLowStockThreshold(
  inventoryId: string,
  threshold: number
): Promise<ActionResponse<Inventory>> {
  try {
    if (isUsingMockData()) {
      const index = mockInventory.findIndex((i) => i.id === inventoryId)
      if (index === -1) throw new Error('Inventory not found')

      mockInventory[index] = {
        ...mockInventory[index],
        low_stock_threshold: threshold,
        updated_at: new Date().toISOString(),
      }

      return { success: true, data: mockInventory[index] }
    }

    // In production, use updateInventory function
    revalidatePath('/auth/inventory')
    return { success: true }
  } catch (error) {
    console.error('Error updating threshold:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update threshold',
    }
  }
}

/**
 * Update warehouse location
 */
export async function updateWarehouseLocation(
  inventoryId: string,
  location: string
): Promise<ActionResponse<Inventory>> {
  try {
    if (isUsingMockData()) {
      const index = mockInventory.findIndex((i) => i.id === inventoryId)
      if (index === -1) throw new Error('Inventory not found')

      mockInventory[index] = {
        ...mockInventory[index],
        warehouse_location: location,
        updated_at: new Date().toISOString(),
      }

      return { success: true, data: mockInventory[index] }
    }

    revalidatePath('/auth/inventory')
    return { success: true }
  } catch (error) {
    console.error('Error updating location:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update location',
    }
  }
}

/**
 * Get inventory logs
 */
export async function fetchInventoryLogs(
  inventoryId?: string
): Promise<ActionResponse<InventoryLog[]>> {
  try {
    if (isUsingMockData()) {
      const logs = inventoryId
        ? mockLogs.filter((l) => l.inventory_id === inventoryId)
        : mockLogs
      return { success: true, data: logs }
    }

    const { data, error } = await getInventoryLogs(DEFAULT_ORG_ID, inventoryId)
    if (error) throw new Error(error)

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching inventory logs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch logs',
    }
  }
}

/**
 * Sync inventory to all platforms
 */
export async function syncInventoryToPlatforms(
  productId?: string
): Promise<ActionResponse<{ jobId: string }>> {
  try {
    if (isUsingMockData()) {
      return { success: true, data: { jobId: `job-${Date.now()}` } }
    }

    const syncService = createSyncService(DEFAULT_ORG_ID, DEFAULT_USER_ID)
    const result = await syncService.syncInventory(productId)

    revalidatePath('/auth/inventory')
    return { success: true, data: { jobId: result.jobId } }
  } catch (error) {
    console.error('Error syncing inventory:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync inventory',
    }
  }
}

/**
 * Get inventory statistics
 */
export async function fetchInventoryStats(): Promise<ActionResponse<{
  totalItems: number
  totalStock: number
  lowStockCount: number
  outOfStockCount: number
}>> {
  try {
    if (isUsingMockData()) {
      const stats = {
        totalItems: mockInventory.length,
        totalStock: mockInventory.reduce((sum, i) => sum + i.available_stock, 0),
        lowStockCount: mockInventory.filter(
          (i) => i.available_stock <= i.low_stock_threshold && i.available_stock > 0
        ).length,
        outOfStockCount: mockInventory.filter((i) => i.available_stock === 0).length,
      }
      return { success: true, data: stats }
    }

    const { data, error } = await getInventory(DEFAULT_ORG_ID)
    if (error) throw new Error(error)

    const inventory = data || []
    const stats = {
      totalItems: inventory.length,
      totalStock: inventory.reduce((sum, i) => sum + i.available_stock, 0),
      lowStockCount: inventory.filter(
        (i) => i.available_stock <= i.low_stock_threshold && i.available_stock > 0
      ).length,
      outOfStockCount: inventory.filter((i) => i.available_stock === 0).length,
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching inventory stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    }
  }
}
