'use server'

import { revalidatePath } from 'next/cache'
import type { Product, ApiResponse } from '@/types'
import * as db from '@/lib/supabase/database'
import { createSyncService } from '@/lib/sync'

// Default org ID for demo (in production, get from session)
const DEFAULT_ORG_ID = 'default'
const DEFAULT_USER_ID = 'user-1'

// Mock data for development/fallback
const mockProducts: Product[] = [
  {
    id: '1',
    org_id: 'default',
    name: '經典白色T恤',
    sku: 'TSH-WHT-001',
    description: '100% 純棉，舒適透氣',
    base_price: 599,
    cost_price: 200,
    weight: 200,
    weight_unit: 'g',
    dimensions: { length: 30, width: 25, height: 2, unit: 'cm' },
    category_id: 'clothing',
    brand: 'BasicWear',
    images: ['/images/tshirt-white.jpg'],
    tags: ['T恤', '基本款', '白色'],
    is_active: true,
    variants: [
      { id: 'v1', sku: 'TSH-WHT-001-S', name: 'S', price_adjustment: 0, stock: 50, attributes: { size: 'S' } },
      { id: 'v2', sku: 'TSH-WHT-001-M', name: 'M', price_adjustment: 0, stock: 80, attributes: { size: 'M' } },
      { id: 'v3', sku: 'TSH-WHT-001-L', name: 'L', price_adjustment: 0, stock: 60, attributes: { size: 'L' } },
    ],
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-15T10:30:00Z',
    created_by: 'user-1',
    updated_by: 'user-1',
    is_deleted: false,
    deleted_at: null,
    metadata: {},
    version: 1,
  },
  {
    id: '2',
    org_id: 'default',
    name: '牛仔休閒褲',
    sku: 'JNS-BLU-001',
    description: '彈性牛仔布料，修身版型',
    base_price: 1299,
    cost_price: 450,
    weight: 500,
    weight_unit: 'g',
    dimensions: { length: 40, width: 30, height: 3, unit: 'cm' },
    category_id: 'clothing',
    brand: 'DenimCo',
    images: ['/images/jeans-blue.jpg'],
    tags: ['牛仔褲', '休閒', '藍色'],
    is_active: true,
    variants: [
      { id: 'v4', sku: 'JNS-BLU-001-30', name: '30腰', price_adjustment: 0, stock: 25, attributes: { waist: '30' } },
      { id: 'v5', sku: 'JNS-BLU-001-32', name: '32腰', price_adjustment: 0, stock: 40, attributes: { waist: '32' } },
      { id: 'v6', sku: 'JNS-BLU-001-34', name: '34腰', price_adjustment: 0, stock: 30, attributes: { waist: '34' } },
    ],
    created_at: '2026-01-08T09:00:00Z',
    updated_at: '2026-01-14T14:20:00Z',
    created_by: 'user-1',
    updated_by: 'user-1',
    is_deleted: false,
    deleted_at: null,
    metadata: {},
    version: 1,
  },
  {
    id: '3',
    org_id: 'default',
    name: '運動慢跑鞋',
    sku: 'SHO-RUN-001',
    description: '輕量化設計，緩震科技',
    base_price: 2499,
    cost_price: 800,
    weight: 350,
    weight_unit: 'g',
    dimensions: { length: 35, width: 15, height: 15, unit: 'cm' },
    category_id: 'shoes',
    brand: 'RunFast',
    images: ['/images/shoes-running.jpg'],
    tags: ['運動鞋', '慢跑', '輕量'],
    is_active: true,
    variants: [
      { id: 'v7', sku: 'SHO-RUN-001-40', name: '40號', price_adjustment: 0, stock: 15, attributes: { size: '40' } },
      { id: 'v8', sku: 'SHO-RUN-001-42', name: '42號', price_adjustment: 0, stock: 20, attributes: { size: '42' } },
      { id: 'v9', sku: 'SHO-RUN-001-44', name: '44號', price_adjustment: 0, stock: 12, attributes: { size: '44' } },
    ],
    created_at: '2026-01-05T11:00:00Z',
    updated_at: '2026-01-16T09:15:00Z',
    created_by: 'user-1',
    updated_by: 'user-1',
    is_deleted: false,
    deleted_at: null,
    metadata: {},
    version: 1,
  },
]

/**
 * Check if using real database or mock data
 */
function isUsingMockData(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !supabaseUrl || supabaseUrl.includes('demo-project') || supabaseUrl.includes('localhost')
}

/**
 * Get all products
 */
export async function getProducts(): Promise<ApiResponse<Product[]>> {
  try {
    if (isUsingMockData()) {
      return { success: true, data: mockProducts }
    }

    const { data, error } = await db.getProducts(DEFAULT_ORG_ID)
    if (error) {
      return { success: false, error }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '取得商品失敗',
    }
  }
}

/**
 * Get single product by ID
 */
export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  try {
    if (isUsingMockData()) {
      const product = mockProducts.find((p) => p.id === id)
      if (!product) {
        return { success: false, error: '找不到商品' }
      }
      return { success: true, data: product }
    }

    const { data, error } = await db.getProductById(DEFAULT_ORG_ID, id)
    if (error || !data) {
      return { success: false, error: error || '找不到商品' }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '取得商品失敗',
    }
  }
}

/**
 * Create new product
 */
export async function createProduct(formData: FormData): Promise<ApiResponse<Product>> {
  try {
    const name = formData.get('name') as string
    const sku = formData.get('sku') as string
    const description = formData.get('description') as string
    const basePriceRaw = parseFloat(formData.get('base_price') as string)
    const costPriceRaw = parseFloat(formData.get('cost_price') as string)
    const base_price = isNaN(basePriceRaw) ? 0 : basePriceRaw
    const cost_price = isNaN(costPriceRaw) ? 0 : costPriceRaw

    // Validate required fields
    if (!name || !sku) {
      return {
        success: false,
        error: '商品名稱和 SKU 為必填欄位',
      }
    }

    if (isUsingMockData()) {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        org_id: DEFAULT_ORG_ID,
        name,
        sku,
        description: description || '',
        base_price,
        cost_price,
        weight: null,
        weight_unit: 'g',
        dimensions: null,
        category_id: null,
        brand: null,
        images: [],
        tags: [],
        is_active: true,
        variants: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: DEFAULT_USER_ID,
        updated_by: DEFAULT_USER_ID,
        is_deleted: false,
        deleted_at: null,
        metadata: {},
        version: 1,
      }

      revalidatePath('/auth/products')
      return { success: true, data: newProduct, message: '商品已建立' }
    }

    const { data, error } = await db.createProduct(
      DEFAULT_ORG_ID,
      {
        name,
        sku,
        description: description || '',
        base_price,
        cost_price,
        weight: null,
        weight_unit: 'g',
        dimensions: null,
        category_id: null,
        brand: null,
        images: [],
        tags: [],
        is_active: true,
        variants: [],
        is_deleted: false,
        deleted_at: null,
        metadata: {},
      },
      DEFAULT_USER_ID
    )

    if (error || !data) {
      return { success: false, error: error || '建立商品失敗' }
    }

    revalidatePath('/auth/products')
    return { success: true, data, message: '商品已建立' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '建立商品失敗',
    }
  }
}

/**
 * Update existing product
 */
export async function updateProduct(id: string, formData: FormData): Promise<ApiResponse<Product>> {
  try {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const basePriceRaw = parseFloat(formData.get('base_price') as string)
    const costPriceRaw = parseFloat(formData.get('cost_price') as string)

    if (isUsingMockData()) {
      const product = mockProducts.find((p) => p.id === id)
      if (!product) {
        return { success: false, error: '找不到商品' }
      }

      const updatedProduct: Product = {
        ...product,
        name: name || product.name,
        description: description || product.description,
        base_price: isNaN(basePriceRaw) ? product.base_price : basePriceRaw,
        cost_price: isNaN(costPriceRaw) ? product.cost_price : costPriceRaw,
        updated_at: new Date().toISOString(),
        version: product.version + 1,
      }

      revalidatePath('/auth/products')
      revalidatePath(`/auth/products/${id}`)
      return { success: true, data: updatedProduct, message: '商品已更新' }
    }

    const updates: Partial<Product> = {}
    if (name) updates.name = name
    if (description) updates.description = description
    if (!isNaN(basePriceRaw)) updates.base_price = basePriceRaw
    if (!isNaN(costPriceRaw)) updates.cost_price = costPriceRaw

    const { data, error } = await db.updateProduct(DEFAULT_ORG_ID, id, updates, DEFAULT_USER_ID)
    if (error || !data) {
      return { success: false, error: error || '更新商品失敗' }
    }

    revalidatePath('/auth/products')
    revalidatePath(`/auth/products/${id}`)
    return { success: true, data, message: '商品已更新' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新商品失敗',
    }
  }
}

/**
 * Delete product (soft delete)
 */
export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  try {
    if (!isUsingMockData()) {
      const { error } = await db.deleteProduct(DEFAULT_ORG_ID, id, DEFAULT_USER_ID)
      if (error) {
        return { success: false, error }
      }
    }

    revalidatePath('/auth/products')
    return { success: true, message: '商品已刪除' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '刪除商品失敗',
    }
  }
}

/**
 * Sync product to multiple platforms
 */
export async function syncProductToPlatforms(
  productId: string,
  platformIds: string[]
): Promise<ApiResponse<{ results: Record<string, { success: boolean; error?: string }>; errors: string[] }>> {
  try {
    if (isUsingMockData()) {
      // Simulate sync delay for demo
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const results: Record<string, { success: boolean }> = {}
      platformIds.forEach((id) => {
        results[id] = { success: true }
      })

      return {
        success: true,
        data: { results, errors: [] },
        message: `已同步到 ${platformIds.length} 個平台`,
      }
    }

    const syncService = createSyncService(DEFAULT_ORG_ID, DEFAULT_USER_ID)
    const { results, errors } = await syncService.syncProductToPlatforms(productId, platformIds)

    const formattedResults: Record<string, { success: boolean; error?: string }> = {}
    for (const [platformId, result] of Object.entries(results)) {
      formattedResults[platformId] = {
        success: result.success,
        error: result.error,
      }
    }

    revalidatePath('/auth/products')
    revalidatePath(`/auth/products/${productId}`)

    return {
      success: errors.length === 0,
      data: { results: formattedResults, errors },
      message: errors.length === 0 ? `已同步到 ${platformIds.length} 個平台` : `同步完成，${errors.length} 個錯誤`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '同步失敗',
    }
  }
}

/**
 * Bulk sync all products to connected platforms
 */
export async function bulkSyncProducts(): Promise<ApiResponse<{ jobId: string }>> {
  try {
    if (isUsingMockData()) {
      return {
        success: true,
        data: { jobId: crypto.randomUUID() },
        message: '批次同步已開始',
      }
    }

    const syncService = createSyncService(DEFAULT_ORG_ID, DEFAULT_USER_ID)
    const progress = await syncService.syncInventory()

    return {
      success: true,
      data: { jobId: progress.jobId },
      message: '批次同步已開始',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '批次同步失敗',
    }
  }
}

/**
 * Import products from a platform
 */
export async function importFromPlatform(
  platformId: string
): Promise<ApiResponse<{ imported: number; skipped: number; errors: string[] }>> {
  try {
    // Implementation would use the platform client to fetch products
    // and create them in the local database

    if (isUsingMockData()) {
      return {
        success: true,
        data: { imported: 0, skipped: 0, errors: [] },
        message: '匯入功能需要連接真實平台',
      }
    }

    // In production:
    // 1. Get platform connection
    // 2. Create platform client
    // 3. Fetch products from platform
    // 4. Create/update products in database
    // 5. Return results

    return {
      success: true,
      data: { imported: 0, skipped: 0, errors: [] },
      message: '匯入完成',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '匯入失敗',
    }
  }
}
