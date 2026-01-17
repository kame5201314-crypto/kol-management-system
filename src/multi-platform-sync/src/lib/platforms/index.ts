/**
 * Platform API Factory
 * Creates platform-specific API clients
 */

import { BasePlatformClient, PlatformConfig } from './base'
import { ShopeeClient, createShopeeClient } from './shopee'
import { MomoClient, createMomoClient } from './momo'
import { ShoplineClient, createShoplineClient } from './shopline'

export type PlatformType = 'shopee' | 'momo' | 'shopline' | 'ruten' | 'pchome' | 'yahoo'

export interface PlatformCredentials {
  platform: PlatformType
  shopId: string
  accessToken?: string
  refreshToken?: string
  apiKey?: string
  apiSecret?: string
  partnerId?: string
  merchantId?: string
  storeId?: string
}

/**
 * Create a platform API client based on platform type
 */
export function createPlatformClient(credentials: PlatformCredentials): BasePlatformClient {
  const baseConfig: PlatformConfig = {
    shopId: credentials.shopId,
    accessToken: credentials.accessToken,
    refreshToken: credentials.refreshToken,
    baseUrl: '',
  }

  switch (credentials.platform) {
    case 'shopee':
      if (!credentials.partnerId || !credentials.apiSecret) {
        throw new Error('Shopee requires partnerId and apiSecret (partnerKey)')
      }
      return createShopeeClient({
        ...baseConfig,
        partnerId: credentials.partnerId,
        partnerKey: credentials.apiSecret,
        shopId: credentials.shopId,
        baseUrl: 'https://partner.shopeemobile.com',
      })

    case 'momo':
      if (!credentials.merchantId || !credentials.apiKey || !credentials.apiSecret) {
        throw new Error('Momo requires merchantId, apiKey, and apiSecret')
      }
      return createMomoClient({
        ...baseConfig,
        merchantId: credentials.merchantId,
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        baseUrl: 'https://api.momoshop.com.tw',
      })

    case 'shopline':
      if (!credentials.storeId || !credentials.apiKey) {
        throw new Error('Shopline requires storeId and apiKey')
      }
      return createShoplineClient({
        ...baseConfig,
        storeId: credentials.storeId,
        apiKey: credentials.apiKey,
        baseUrl: 'https://api.shoplineapp.com',
      })

    case 'yahoo':
    case 'pchome':
    case 'ruten':
      throw new Error(`Platform ${credentials.platform} is not yet implemented`)

    default:
      throw new Error(`Unknown platform: ${credentials.platform}`)
  }
}

/**
 * Test connection for a platform
 */
export async function testPlatformConnection(
  credentials: PlatformCredentials
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createPlatformClient(credentials)
    const result = await client.testConnection()
    return { success: result.success, error: result.error }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    }
  }
}

// Re-export types and classes
export { BasePlatformClient } from './base'
export type { PlatformConfig, PlatformProduct, PlatformOrder, SyncResult } from './base'
export { ShopeeClient } from './shopee'
export { MomoClient } from './momo'
export { ShoplineClient } from './shopline'
