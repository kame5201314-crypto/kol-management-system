'use server'

/**
 * Platform Connection Server Actions
 * Handles all platform connection and sync operations
 */

import { revalidatePath } from 'next/cache'
import {
  getPlatformConnections,
  createPlatformConnection,
  updatePlatformConnection,
  deletePlatformConnection,
} from '@/lib/supabase/database'
import { createSyncService } from '@/lib/sync/sync-service'
import { testPlatformConnection } from '@/lib/platforms'
import type { PlatformConnection, PlatformType } from '@/types/database'

// Default org/user for development
const DEFAULT_ORG_ID = 'default'
const DEFAULT_USER_ID = 'system'

// Response types
interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

// Mock data for development fallback
const mockPlatforms: PlatformConnection[] = [
  {
    id: '1',
    org_id: DEFAULT_ORG_ID,
    platform: 'shopee',
    shop_id: 'shop_123',
    shop_name: 'My Shopee Store',
    access_token: null,
    refresh_token: null,
    token_expires_at: null,
    is_connected: true,
    last_sync_at: new Date(Date.now() - 3600000).toISOString(),
    sync_settings: {
      auto_sync: true,
      sync_interval_minutes: 30,
      sync_inventory: true,
      sync_orders: true,
      sync_prices: true,
    },
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
    platform: 'momo',
    shop_id: 'momo_456',
    shop_name: 'Momo Mall Shop',
    access_token: null,
    refresh_token: null,
    token_expires_at: null,
    is_connected: true,
    last_sync_at: new Date(Date.now() - 7200000).toISOString(),
    sync_settings: {
      auto_sync: true,
      sync_interval_minutes: 60,
      sync_inventory: true,
      sync_orders: true,
      sync_prices: false,
    },
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
    platform: 'shopline',
    shop_id: 'shopline_789',
    shop_name: 'Shopline Store',
    access_token: null,
    refresh_token: null,
    token_expires_at: null,
    is_connected: false,
    last_sync_at: null,
    sync_settings: {
      auto_sync: false,
      sync_interval_minutes: 30,
      sync_inventory: true,
      sync_orders: true,
      sync_prices: true,
    },
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

function isUsingMockData(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo')
}

/**
 * Get all platform connections
 */
export async function fetchPlatformConnections(): Promise<ActionResponse<PlatformConnection[]>> {
  try {
    if (isUsingMockData()) {
      return { success: true, data: mockPlatforms }
    }

    const { data, error } = await getPlatformConnections(DEFAULT_ORG_ID)
    if (error) throw new Error(error)

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching platform connections:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch platforms',
    }
  }
}

/**
 * Get a single platform connection by ID
 */
export async function fetchPlatformById(id: string): Promise<ActionResponse<PlatformConnection>> {
  try {
    if (isUsingMockData()) {
      const platform = mockPlatforms.find((p) => p.id === id)
      if (!platform) throw new Error('Platform not found')
      return { success: true, data: platform }
    }

    const { data, error } = await getPlatformConnections(DEFAULT_ORG_ID)
    if (error) throw new Error(error)

    const platform = data?.find((p) => p.id === id)
    if (!platform) throw new Error('Platform not found')

    return { success: true, data: platform }
  } catch (error) {
    console.error('Error fetching platform:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch platform',
    }
  }
}

/**
 * Connect a new platform
 */
export async function connectPlatform(input: {
  platform: PlatformType
  shopId: string
  shopName: string
  accessToken?: string
  refreshToken?: string
  apiKey?: string
  apiSecret?: string
  partnerId?: string
}): Promise<ActionResponse<PlatformConnection>> {
  try {
    // Test the connection first
    const testResult = await testPlatformConnection({
      platform: input.platform,
      shopId: input.shopId,
      accessToken: input.accessToken,
      apiKey: input.apiKey,
      apiSecret: input.apiSecret,
      partnerId: input.partnerId,
    })

    if (!testResult.success) {
      throw new Error(testResult.error || 'Connection test failed')
    }

    if (isUsingMockData()) {
      const newPlatform: PlatformConnection = {
        id: `mock-${Date.now()}`,
        org_id: DEFAULT_ORG_ID,
        platform: input.platform,
        shop_id: input.shopId,
        shop_name: input.shopName,
        access_token: input.accessToken || null,
        refresh_token: input.refreshToken || null,
        token_expires_at: null,
        is_connected: true,
        last_sync_at: null,
        sync_settings: {
          auto_sync: true,
          sync_interval_minutes: 30,
          sync_inventory: true,
          sync_orders: true,
          sync_prices: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: DEFAULT_USER_ID,
        updated_by: DEFAULT_USER_ID,
        is_deleted: false,
        deleted_at: null,
        metadata: {
          apiKey: input.apiKey,
          apiSecret: input.apiSecret,
          partnerId: input.partnerId,
        },
        version: 1,
      }
      mockPlatforms.push(newPlatform)
      return { success: true, data: newPlatform }
    }

    const { data, error } = await createPlatformConnection(
      DEFAULT_ORG_ID,
      {
        platform: input.platform,
        shop_id: input.shopId,
        shop_name: input.shopName,
        access_token: input.accessToken || null,
        refresh_token: input.refreshToken || null,
        token_expires_at: null,
        is_connected: true,
        last_sync_at: null,
        sync_settings: {
          auto_sync: true,
          sync_interval_minutes: 30,
          sync_inventory: true,
          sync_orders: true,
          sync_prices: true,
        },
        is_deleted: false,
        deleted_at: null,
        metadata: {
          apiKey: input.apiKey,
          apiSecret: input.apiSecret,
          partnerId: input.partnerId,
        },
      },
      DEFAULT_USER_ID
    )

    if (error) throw new Error(error)
    if (!data) throw new Error('Failed to create platform connection')

    revalidatePath('/auth/platforms')
    return { success: true, data }
  } catch (error) {
    console.error('Error connecting platform:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect platform',
    }
  }
}

/**
 * Update platform connection settings
 */
export async function updatePlatformSettings(
  id: string,
  settings: Partial<PlatformConnection['sync_settings']>
): Promise<ActionResponse<PlatformConnection>> {
  try {
    if (isUsingMockData()) {
      const index = mockPlatforms.findIndex((p) => p.id === id)
      if (index === -1) throw new Error('Platform not found')

      mockPlatforms[index] = {
        ...mockPlatforms[index],
        sync_settings: {
          ...mockPlatforms[index].sync_settings,
          ...settings,
        },
        updated_at: new Date().toISOString(),
      }
      return { success: true, data: mockPlatforms[index] }
    }

    const { data: platforms } = await getPlatformConnections(DEFAULT_ORG_ID)
    const platform = platforms?.find((p) => p.id === id)
    if (!platform) throw new Error('Platform not found')

    const { data, error } = await updatePlatformConnection(
      DEFAULT_ORG_ID,
      id,
      {
        sync_settings: {
          ...platform.sync_settings,
          ...settings,
        },
      },
      DEFAULT_USER_ID
    )

    if (error) throw new Error(error)
    if (!data) throw new Error('Failed to update platform')

    revalidatePath('/auth/platforms')
    return { success: true, data }
  } catch (error) {
    console.error('Error updating platform settings:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update settings',
    }
  }
}

/**
 * Disconnect a platform
 */
export async function disconnectPlatform(id: string): Promise<ActionResponse> {
  try {
    if (isUsingMockData()) {
      const index = mockPlatforms.findIndex((p) => p.id === id)
      if (index === -1) throw new Error('Platform not found')

      mockPlatforms[index] = {
        ...mockPlatforms[index],
        is_connected: false,
        access_token: null,
        refresh_token: null,
        updated_at: new Date().toISOString(),
      }
      return { success: true }
    }

    const { error } = await updatePlatformConnection(
      DEFAULT_ORG_ID,
      id,
      {
        is_connected: false,
        access_token: null,
        refresh_token: null,
      },
      DEFAULT_USER_ID
    )

    if (error) throw new Error(error)

    revalidatePath('/auth/platforms')
    return { success: true }
  } catch (error) {
    console.error('Error disconnecting platform:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to disconnect platform',
    }
  }
}

/**
 * Delete a platform connection
 */
export async function removePlatformConnection(id: string): Promise<ActionResponse> {
  try {
    if (isUsingMockData()) {
      const index = mockPlatforms.findIndex((p) => p.id === id)
      if (index === -1) throw new Error('Platform not found')
      mockPlatforms.splice(index, 1)
      return { success: true }
    }

    const { error } = await deletePlatformConnection(DEFAULT_ORG_ID, id)
    if (error) throw new Error(error)

    revalidatePath('/auth/platforms')
    return { success: true }
  } catch (error) {
    console.error('Error removing platform:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove platform',
    }
  }
}

/**
 * Trigger sync for a platform
 */
export async function triggerPlatformSync(
  platformId: string,
  syncType: 'inventory' | 'orders' | 'full'
): Promise<ActionResponse<{ jobId: string }>> {
  try {
    if (isUsingMockData()) {
      // Simulate sync job creation
      const jobId = `job-${Date.now()}`
      const index = mockPlatforms.findIndex((p) => p.id === platformId)
      if (index !== -1) {
        mockPlatforms[index] = {
          ...mockPlatforms[index],
          last_sync_at: new Date().toISOString(),
        }
      }
      return { success: true, data: { jobId } }
    }

    const syncService = createSyncService(DEFAULT_ORG_ID, DEFAULT_USER_ID)

    let result
    switch (syncType) {
      case 'inventory':
        result = await syncService.syncInventory()
        break
      case 'orders':
        result = await syncService.syncOrders({ platform: platformId })
        break
      case 'full':
        result = await syncService.fullSync()
        break
    }

    revalidatePath('/auth/platforms')
    return { success: true, data: { jobId: result.jobId } }
  } catch (error) {
    console.error('Error triggering sync:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger sync',
    }
  }
}

/**
 * Refresh platform OAuth token
 */
export async function refreshPlatformToken(platformId: string): Promise<ActionResponse> {
  try {
    // In production, this would call the platform's OAuth refresh endpoint
    // For now, just update the last sync time
    if (isUsingMockData()) {
      return { success: true }
    }

    // TODO: Implement actual token refresh logic per platform
    const { error } = await updatePlatformConnection(
      DEFAULT_ORG_ID,
      platformId,
      {
        token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      DEFAULT_USER_ID
    )

    if (error) throw new Error(error)

    revalidatePath('/auth/platforms')
    return { success: true }
  } catch (error) {
    console.error('Error refreshing token:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh token',
    }
  }
}
