/**
 * Supabase Database Operations
 * Complete data access layer with multi-tenancy support
 */

import { createClient } from './server'
import { createClient as createBrowserClient } from './client'
import type {
  Product,
  PlatformConnection,
  ProductListing,
  Inventory,
  InventoryLog,
  Order,
  OrderItem,
  SyncJob,
  SyncLog,
} from '@/types/database'

// =============================================
// Helper Functions
// =============================================

function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// =============================================
// Products Operations
// =============================================

export async function getProducts(orgId: string): Promise<{ data: Product[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function getProductById(
  orgId: string,
  productId: string
): Promise<{ data: Product | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('org_id', orgId)
      .eq('id', productId)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function createProduct(
  orgId: string,
  product: Omit<Product, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'version' | 'created_by' | 'updated_by'>,
  userId?: string
): Promise<{ data: Product | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        org_id: orgId,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function updateProduct(
  orgId: string,
  productId: string,
  updates: Partial<Product>,
  userId?: string
): Promise<{ data: Product | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_by: userId,
      })
      .eq('org_id', orgId)
      .eq('id', productId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function deleteProduct(
  orgId: string,
  productId: string,
  userId?: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('products')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('org_id', orgId)
      .eq('id', productId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: handleError(error) }
  }
}

// =============================================
// Platform Connections Operations
// =============================================

export async function getPlatformConnections(
  orgId: string
): Promise<{ data: PlatformConnection[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .order('platform')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function createPlatformConnection(
  orgId: string,
  connection: Omit<PlatformConnection, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'version' | 'created_by' | 'updated_by'>,
  userId?: string
): Promise<{ data: PlatformConnection | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('platform_connections')
      .insert({
        ...connection,
        org_id: orgId,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function updatePlatformConnection(
  orgId: string,
  connectionId: string,
  updates: Partial<PlatformConnection>,
  userId?: string
): Promise<{ data: PlatformConnection | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('platform_connections')
      .update({
        ...updates,
        updated_by: userId,
      })
      .eq('org_id', orgId)
      .eq('id', connectionId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function disconnectPlatform(
  orgId: string,
  connectionId: string,
  userId?: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('platform_connections')
      .update({
        is_connected: false,
        access_token: null,
        refresh_token: null,
        token_expires_at: null,
        updated_by: userId,
      })
      .eq('org_id', orgId)
      .eq('id', connectionId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: handleError(error) }
  }
}

export async function deletePlatformConnection(
  orgId: string,
  connectionId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('platform_connections')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('org_id', orgId)
      .eq('id', connectionId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: handleError(error) }
  }
}

// =============================================
// Product Listings Operations
// =============================================

export async function getProductListings(
  orgId: string,
  productId?: string
): Promise<{ data: ProductListing[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('product_listings')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)

    if (productId) {
      query = query.eq('product_id', productId)
    }

    const { data, error } = await query.order('platform')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function createProductListing(
  orgId: string,
  listing: Partial<Omit<ProductListing, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'version' | 'created_by' | 'updated_by'>> & {
    product_id: string
    platform: ProductListing['platform']
  },
  userId?: string
): Promise<{ data: ProductListing | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('product_listings')
      .insert({
        ...listing,
        org_id: orgId,
        created_by: userId,
        updated_by: userId,
        is_deleted: false,
        metadata: listing.metadata || {},
        platform_connection_id: listing.platform_connection_id || '',
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function updateProductListing(
  orgId: string,
  listingId: string,
  updates: Partial<ProductListing>,
  userId?: string
): Promise<{ data: ProductListing | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('product_listings')
      .update({
        ...updates,
        updated_by: userId,
      })
      .eq('org_id', orgId)
      .eq('id', listingId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

// =============================================
// Inventory Operations
// =============================================

export async function getInventory(
  orgId: string
): Promise<{ data: Inventory[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(name, sku, images)
      `)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .order('sku')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function getLowStockItems(
  orgId: string
): Promise<{ data: Inventory[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    // For low stock items, we filter where available_stock <= low_stock_threshold
    const { data: allInventory, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(name, sku, images)
      `)
      .eq('org_id', orgId)
      .eq('is_deleted', false)

    if (error) throw error

    // Filter low stock items client-side since we can't use the threshold column in query
    const lowStock = allInventory?.filter(
      (item) => item.available_stock <= item.low_stock_threshold
    ) || []

    return { data: lowStock, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function getInventoryByProduct(
  orgId: string,
  productId: string
): Promise<{ data: Inventory | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(name, sku, images)
      `)
      .eq('org_id', orgId)
      .eq('product_id', productId)
      .eq('is_deleted', false)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function getInventoryLogs(
  orgId: string,
  inventoryId?: string
): Promise<{ data: InventoryLog[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('inventory_logs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (inventoryId) {
      query = query.eq('inventory_id', inventoryId)
    }

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function adjustInventory(
  orgId: string,
  inventoryId: string,
  action: 'add' | 'remove' | 'set',
  quantity: number,
  reason?: string,
  userId?: string
): Promise<{ data: Inventory | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // Get current inventory
    const { data: current, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('org_id', orgId)
      .eq('id', inventoryId)
      .single()

    if (fetchError) throw fetchError
    if (!current) throw new Error('Inventory not found')

    // Calculate new stock
    let newTotalStock: number
    switch (action) {
      case 'add':
        newTotalStock = current.total_stock + quantity
        break
      case 'remove':
        newTotalStock = Math.max(0, current.total_stock - quantity)
        break
      case 'set':
        newTotalStock = Math.max(0, quantity)
        break
    }

    // Update inventory
    const { data, error: updateError } = await supabase
      .from('inventory')
      .update({
        total_stock: newTotalStock,
        updated_by: userId,
      })
      .eq('org_id', orgId)
      .eq('id', inventoryId)
      .select()
      .single()

    if (updateError) throw updateError

    // Log the adjustment
    await supabase.from('inventory_logs').insert({
      org_id: orgId,
      inventory_id: inventoryId,
      action,
      quantity,
      previous_stock: current.total_stock,
      new_stock: newTotalStock,
      reason,
      created_by: userId,
    })

    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

// =============================================
// Orders Operations
// =============================================

export async function getOrders(
  orgId: string,
  options?: {
    platform?: string
    status?: string
    limit?: number
    offset?: number
  }
): Promise<{ data: Order[] | null; error: string | null; count: number | null }> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .eq('is_deleted', false)

    if (options?.platform) {
      query = query.eq('platform', options.platform)
    }
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
    }

    const { data, error, count } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null, count }
  } catch (error) {
    return { data: null, error: handleError(error), count: null }
  }
}

export async function updateOrderStatus(
  orgId: string,
  orderId: string,
  status: string,
  userId?: string
): Promise<{ data: Order | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_by: userId,
      })
      .eq('org_id', orgId)
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function getOrderById(
  orgId: string,
  orderId: string
): Promise<{ data: Order | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('org_id', orgId)
      .eq('id', orderId)
      .eq('is_deleted', false)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function updateOrder(
  orgId: string,
  orderId: string,
  updates: Partial<Order>,
  userId?: string
): Promise<{ data: Order | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_by: userId,
      })
      .eq('org_id', orgId)
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function getOrderItems(
  orgId: string,
  orderId: string
): Promise<{ data: OrderItem[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('org_id', orgId)
      .eq('order_id', orderId)
      .eq('is_deleted', false)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

// =============================================
// Sync Jobs Operations
// =============================================

export async function createSyncJob(
  orgId: string,
  jobType: 'product_sync' | 'inventory_sync' | 'order_sync' | 'full_sync',
  platform?: string,
  userId?: string
): Promise<{ data: SyncJob | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('sync_jobs')
      .insert({
        org_id: orgId,
        job_type: jobType,
        platform,
        status: 'pending',
        created_by: userId,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function updateSyncJobProgress(
  jobId: string,
  updates: Partial<SyncJob>
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('sync_jobs')
      .update(updates)
      .eq('id', jobId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: handleError(error) }
  }
}

export async function getSyncJobs(
  orgId: string,
  options?: {
    status?: string
    limit?: number
  }
): Promise<{ data: SyncJob[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('sync_jobs')
      .select('*')
      .eq('org_id', orgId)

    if (options?.status) {
      query = query.eq('status', options.status)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

// =============================================
// Sync Logs Operations
// =============================================

export async function createSyncLog(
  orgId: string,
  log: Partial<Omit<SyncLog, 'id' | 'org_id' | 'created_at'>> & {
    platform: SyncLog['platform']
    action: string
    entity_type: string
    status: SyncLog['status']
  }
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('sync_logs')
      .insert({
        ...log,
        org_id: orgId,
        job_id: log.job_id || null,
      })

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: handleError(error) }
  }
}

export async function getSyncLogs(
  orgId: string,
  options?: {
    jobId?: string
    platform?: string
    status?: string
    limit?: number
  }
): Promise<{ data: SyncLog[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('sync_logs')
      .select('*')
      .eq('org_id', orgId)

    if (options?.jobId) {
      query = query.eq('job_id', options.jobId)
    }
    if (options?.platform) {
      query = query.eq('platform', options.platform)
    }
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

// =============================================
// Dashboard Statistics
// =============================================

export async function getDashboardStats(orgId: string): Promise<{
  data: {
    totalProducts: number
    activeListings: number
    pendingOrders: number
    lowStockItems: number
    syncStatus: {
      synced: number
      pending: number
      error: number
    }
  } | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get product count
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .eq('is_active', true)

    // Get active listings count
    const { count: activeListings } = await supabase
      .from('product_listings')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .eq('status', 'active')

    // Get pending orders count
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .in('status', ['pending', 'confirmed'])

    // Get low stock items count
    const { data: lowStockData } = await supabase
      .from('inventory')
      .select('id')
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .lte('total_stock', 10) // Simple threshold check

    // Get sync status counts
    const { data: syncedData } = await supabase
      .from('product_listings')
      .select('id')
      .eq('org_id', orgId)
      .eq('sync_status', 'synced')

    const { data: pendingSyncData } = await supabase
      .from('product_listings')
      .select('id')
      .eq('org_id', orgId)
      .eq('sync_status', 'pending')

    const { data: errorSyncData } = await supabase
      .from('product_listings')
      .select('id')
      .eq('org_id', orgId)
      .eq('sync_status', 'error')

    return {
      data: {
        totalProducts: totalProducts || 0,
        activeListings: activeListings || 0,
        pendingOrders: pendingOrders || 0,
        lowStockItems: lowStockData?.length || 0,
        syncStatus: {
          synced: syncedData?.length || 0,
          pending: pendingSyncData?.length || 0,
          error: errorSyncData?.length || 0,
        },
      },
      error: null,
    }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}
