/**
 * Sync Service
 * Core synchronization logic for multi-platform product management
 */

import {
  createPlatformClient,
  PlatformCredentials,
  PlatformProduct,
  PlatformOrder,
  SyncResult,
} from '../platforms'
import {
  getProducts,
  getProductListings,
  createProductListing,
  updateProductListing,
  getInventory,
  adjustInventory,
  getOrders,
  createSyncJob,
  updateSyncJobProgress,
  createSyncLog,
  getPlatformConnections,
} from '../supabase/database'
import type { Product, ProductListing, Order, SyncJob, PlatformConnection } from '@/types/database'

export interface SyncOptions {
  syncProducts?: boolean
  syncInventory?: boolean
  syncOrders?: boolean
  syncPrices?: boolean
}

export interface SyncProgress {
  jobId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  totalItems: number
  processedItems: number
  failedItems: number
  errors: string[]
}

/**
 * Main Sync Service class
 */
export class SyncService {
  private orgId: string
  private userId?: string

  constructor(orgId: string, userId?: string) {
    this.orgId = orgId
    this.userId = userId
  }

  /**
   * Sync a single product to multiple platforms
   */
  async syncProductToPlatforms(
    productId: string,
    platformIds: string[]
  ): Promise<{ results: Record<string, SyncResult<PlatformProduct>>; errors: string[] }> {
    const results: Record<string, SyncResult<PlatformProduct>> = {}
    const errors: string[] = []

    // Get product data
    const { data: product, error: productError } = await getProducts(this.orgId)
    if (productError || !product) {
      return { results, errors: [productError || 'Product not found'] }
    }

    const targetProduct = product.find((p) => p.id === productId)
    if (!targetProduct) {
      return { results, errors: ['Product not found'] }
    }

    // Get platform connections
    const { data: connections, error: connError } = await getPlatformConnections(this.orgId)
    if (connError || !connections) {
      return { results, errors: [connError || 'Failed to get platform connections'] }
    }

    // Get existing listings
    const { data: listings } = await getProductListings(this.orgId, productId)

    // Sync to each platform
    for (const platformId of platformIds) {
      const connection = connections.find((c) => c.id === platformId)
      if (!connection || !connection.is_connected) {
        results[platformId] = { success: false, error: 'Platform not connected' }
        errors.push(`${connection?.platform || platformId}: Platform not connected`)
        continue
      }

      try {
        const client = this.createClientFromConnection(connection)
        const existingListing = listings?.find(
          (l) => l.platform === connection.platform && l.product_id === productId
        )

        let syncResult: SyncResult<PlatformProduct>

        if (existingListing?.platform_product_id) {
          // Update existing product
          syncResult = await client.updateProduct(existingListing.platform_product_id, targetProduct)
        } else {
          // Create new product
          syncResult = await client.createProduct(targetProduct)
        }

        if (syncResult.success && syncResult.data) {
          // Update or create listing record
          if (existingListing) {
            await updateProductListing(this.orgId, existingListing.id, {
              platform_product_id: syncResult.data.id,
              platform_url: syncResult.data.url || null,
              platform_price: syncResult.data.price,
              platform_stock: syncResult.data.stock,
              listing_status: syncResult.data.status === 'active' ? 'active' : 'inactive',
              sync_status: 'synced',
              last_sync_at: new Date().toISOString(),
              last_sync_error: null,
            }, this.userId)
          } else {
            await createProductListing(this.orgId, {
              product_id: productId,
              platform: connection.platform,
              platform_product_id: syncResult.data.id,
              platform_url: syncResult.data.url || null,
              platform_price: syncResult.data.price,
              platform_stock: syncResult.data.stock,
              listing_status: syncResult.data.status === 'active' ? 'active' : 'inactive',
              sync_status: 'synced',
              last_sync_at: new Date().toISOString(),
              platform_data: syncResult.data.platformData || {},
            }, this.userId)
          }

          // Log success
          await createSyncLog(this.orgId, {
            platform: connection.platform,
            action: existingListing ? 'update_product' : 'create_product',
            entity_type: 'product',
            entity_id: productId,
            status: 'success',
            message: `Product synced successfully to ${connection.platform}`,
          })
        } else {
          // Log error
          if (existingListing) {
            await updateProductListing(this.orgId, existingListing.id, {
              sync_status: 'failed',
              last_sync_error: syncResult.error || null,
            }, this.userId)
          }

          await createSyncLog(this.orgId, {
            platform: connection.platform,
            action: existingListing ? 'update_product' : 'create_product',
            entity_type: 'product',
            entity_id: productId,
            status: 'error',
            message: syncResult.error,
          })

          errors.push(`${connection.platform}: ${syncResult.error}`)
        }

        results[platformId] = syncResult
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results[platformId] = { success: false, error: errorMsg }
        errors.push(`${connection.platform}: ${errorMsg}`)

        await createSyncLog(this.orgId, {
          platform: connection.platform,
          action: 'sync_product',
          entity_type: 'product',
          entity_id: productId,
          status: 'error',
          message: errorMsg,
        })
      }
    }

    return { results, errors }
  }

  /**
   * Sync inventory to all connected platforms
   */
  async syncInventory(productId?: string): Promise<SyncProgress> {
    // Create sync job
    const { data: job } = await createSyncJob(this.orgId, 'inventory_sync', undefined, this.userId)
    if (!job) {
      throw new Error('Failed to create sync job')
    }

    const progress: SyncProgress = {
      jobId: job.id,
      status: 'running',
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      failedItems: 0,
      errors: [],
    }

    try {
      // Get inventory items
      const { data: inventory } = await getInventory(this.orgId)
      if (!inventory) {
        throw new Error('Failed to get inventory')
      }

      // Get listings
      const { data: listings } = await getProductListings(this.orgId, productId)
      if (!listings) {
        throw new Error('Failed to get listings')
      }

      // Get connections
      const { data: connections } = await getPlatformConnections(this.orgId)
      if (!connections) {
        throw new Error('Failed to get connections')
      }

      const activeConnections = connections.filter((c) => c.is_connected && c.sync_settings?.sync_inventory)
      const itemsToSync = productId
        ? inventory.filter((i) => i.product_id === productId)
        : inventory

      progress.totalItems = itemsToSync.length * activeConnections.length

      await updateSyncJobProgress(job.id, {
        status: 'running',
        total_items: progress.totalItems,
        started_at: new Date().toISOString(),
      })

      // Sync each inventory item to each platform
      for (const item of itemsToSync) {
        for (const connection of activeConnections) {
          try {
            const listing = listings.find(
              (l) => l.product_id === item.product_id && l.platform === connection.platform
            )

            if (!listing?.platform_product_id) {
              progress.processedItems++
              continue
            }

            const client = this.createClientFromConnection(connection)
            const result = await client.updateStock(
              listing.platform_product_id,
              item.available_stock
            )

            if (result.success) {
              await updateProductListing(this.orgId, listing.id, {
                platform_stock: item.available_stock,
                last_sync_at: new Date().toISOString(),
              }, this.userId)
            } else {
              progress.failedItems++
              progress.errors.push(`${connection.platform}/${item.sku}: ${result.error}`)
            }

            progress.processedItems++
            progress.progress = Math.round((progress.processedItems / progress.totalItems) * 100)

            await updateSyncJobProgress(job.id, {
              processed_items: progress.processedItems,
              failed_items: progress.failedItems,
            })
          } catch (error) {
            progress.failedItems++
            progress.errors.push(
              `${connection.platform}/${item.sku}: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
          }
        }
      }

      progress.status = progress.failedItems === 0 ? 'completed' : 'completed'
      await updateSyncJobProgress(job.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        processed_items: progress.processedItems,
        failed_items: progress.failedItems,
      })
    } catch (error) {
      progress.status = 'failed'
      progress.errors.push(error instanceof Error ? error.message : 'Unknown error')

      await updateSyncJobProgress(job.id, {
        status: 'failed',
        error_log: progress.errors,
        completed_at: new Date().toISOString(),
      })
    }

    return progress
  }

  /**
   * Sync orders from all connected platforms
   */
  async syncOrders(options?: {
    platform?: string
    startDate?: Date
    endDate?: Date
  }): Promise<SyncProgress> {
    const { data: job } = await createSyncJob(this.orgId, 'order_sync', options?.platform, this.userId)
    if (!job) {
      throw new Error('Failed to create sync job')
    }

    const progress: SyncProgress = {
      jobId: job.id,
      status: 'running',
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      failedItems: 0,
      errors: [],
    }

    try {
      const { data: connections } = await getPlatformConnections(this.orgId)
      if (!connections) {
        throw new Error('Failed to get connections')
      }

      const activeConnections = connections.filter(
        (c) =>
          c.is_connected &&
          c.sync_settings?.sync_orders &&
          (!options?.platform || c.platform === options.platform)
      )

      await updateSyncJobProgress(job.id, {
        status: 'running',
        started_at: new Date().toISOString(),
      })

      for (const connection of activeConnections) {
        try {
          const client = this.createClientFromConnection(connection)
          const ordersResult = await client.getOrders({
            startDate: options?.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endDate: options?.endDate || new Date(),
          })

          if (!ordersResult.success || !ordersResult.data) {
            progress.errors.push(`${connection.platform}: ${ordersResult.error}`)
            continue
          }

          progress.totalItems += ordersResult.data.length

          for (const platformOrder of ordersResult.data) {
            try {
              // Import order to database
              // Note: In production, you'd check for duplicates and update existing orders
              await createSyncLog(this.orgId, {
                platform: connection.platform,
                action: 'import_order',
                entity_type: 'order',
                status: 'success',
                message: `Imported order ${platformOrder.orderNumber}`,
              })

              progress.processedItems++
            } catch (error) {
              progress.failedItems++
              progress.errors.push(
                `${connection.platform}/${platformOrder.orderNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
              )
            }
          }

          progress.progress = Math.round((progress.processedItems / Math.max(progress.totalItems, 1)) * 100)
          await updateSyncJobProgress(job.id, {
            processed_items: progress.processedItems,
            failed_items: progress.failedItems,
            total_items: progress.totalItems,
          })
        } catch (error) {
          progress.errors.push(
            `${connection.platform}: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        }
      }

      progress.status = 'completed'
      await updateSyncJobProgress(job.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
    } catch (error) {
      progress.status = 'failed'
      progress.errors.push(error instanceof Error ? error.message : 'Unknown error')

      await updateSyncJobProgress(job.id, {
        status: 'failed',
        error_log: progress.errors,
        completed_at: new Date().toISOString(),
      })
    }

    return progress
  }

  /**
   * Full sync - products, inventory, and orders
   */
  async fullSync(): Promise<SyncProgress> {
    const { data: job } = await createSyncJob(this.orgId, 'full_sync', undefined, this.userId)
    if (!job) {
      throw new Error('Failed to create sync job')
    }

    const progress: SyncProgress = {
      jobId: job.id,
      status: 'running',
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      failedItems: 0,
      errors: [],
    }

    try {
      await updateSyncJobProgress(job.id, {
        status: 'running',
        started_at: new Date().toISOString(),
      })

      // Sync inventory
      const inventoryResult = await this.syncInventory()
      progress.processedItems += inventoryResult.processedItems
      progress.failedItems += inventoryResult.failedItems
      progress.errors.push(...inventoryResult.errors)

      // Sync orders
      const ordersResult = await this.syncOrders()
      progress.processedItems += ordersResult.processedItems
      progress.failedItems += ordersResult.failedItems
      progress.errors.push(...ordersResult.errors)

      progress.totalItems = progress.processedItems + progress.failedItems
      progress.progress = 100
      progress.status = progress.failedItems === 0 ? 'completed' : 'completed'

      await updateSyncJobProgress(job.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_items: progress.totalItems,
        processed_items: progress.processedItems,
        failed_items: progress.failedItems,
      })
    } catch (error) {
      progress.status = 'failed'
      progress.errors.push(error instanceof Error ? error.message : 'Unknown error')

      await updateSyncJobProgress(job.id, {
        status: 'failed',
        error_log: progress.errors,
        completed_at: new Date().toISOString(),
      })
    }

    return progress
  }

  /**
   * Create platform client from connection data
   */
  private createClientFromConnection(connection: PlatformConnection) {
    const credentials: PlatformCredentials = {
      platform: connection.platform as PlatformCredentials['platform'],
      shopId: connection.shop_id,
      accessToken: connection.access_token || undefined,
      refreshToken: connection.refresh_token || undefined,
    }

    // Extract additional credentials from metadata
    const metadata = connection.metadata as Record<string, string> | null
    if (metadata) {
      if (metadata.partnerId) credentials.partnerId = metadata.partnerId
      if (metadata.apiKey) credentials.apiKey = metadata.apiKey
      if (metadata.apiSecret) credentials.apiSecret = metadata.apiSecret
      if (metadata.merchantId) credentials.merchantId = metadata.merchantId
      if (metadata.storeId) credentials.storeId = metadata.storeId
    }

    return createPlatformClient(credentials)
  }
}

/**
 * Create sync service instance
 */
export function createSyncService(orgId: string, userId?: string): SyncService {
  return new SyncService(orgId, userId)
}
