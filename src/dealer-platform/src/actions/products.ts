'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrgId, getCurrentUserId } from '@/lib/supabase/queries'
import type { Product, ApiResponse } from '@/types'

/**
 * 取得產品列表
 */
export async function getProducts(options?: {
  category?: string
  status?: string
  search?: string
}): Promise<ApiResponse<Product[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    let query = supabase
      .from('products')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)

    if (options?.category) {
      query = query.eq('category', options.category)
    }

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.search) {
      query = query.or(`code.ilike.%${options.search}%,name.ilike.%${options.search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data as Product[] }
  } catch (error) {
    console.error('getProducts error:', error)
    return { success: false, error: '取得產品列表失敗' }
  }
}

/**
 * 取得單一產品
 */
export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .single()

    if (error) throw error

    return { success: true, data: data as Product }
  } catch (error) {
    console.error('getProduct error:', error)
    return { success: false, error: '取得產品資料失敗' }
  }
}

/**
 * 建立產品
 */
export async function createProduct(formData: FormData): Promise<ApiResponse<Product>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const productData = {
      org_id: orgId,
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      category: formData.get('category') as string || null,
      unit: formData.get('unit') as string || 'PCS',
      list_price: parseFloat(formData.get('list_price') as string) || 0,
      cost_price: parseFloat(formData.get('cost_price') as string) || null,
      status: 'active',
      created_by: userId,
      updated_by: userId,
    }

    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/products')
    return { success: true, data: data as Product, message: '產品建立成功' }
  } catch (error) {
    console.error('createProduct error:', error)
    return { success: false, error: '建立產品失敗' }
  }
}

/**
 * 更新產品
 */
export async function updateProduct(id: string, formData: FormData): Promise<ApiResponse<Product>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const updateData = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      category: formData.get('category') as string || null,
      unit: formData.get('unit') as string || 'PCS',
      list_price: parseFloat(formData.get('list_price') as string) || 0,
      cost_price: parseFloat(formData.get('cost_price') as string) || null,
      status: formData.get('status') as string || 'active',
      updated_by: userId,
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/products')
    revalidatePath(`/products/${id}`)
    return { success: true, data: data as Product, message: '產品更新成功' }
  } catch (error) {
    console.error('updateProduct error:', error)
    return { success: false, error: '更新產品失敗' }
  }
}

/**
 * 更新產品狀態
 */
export async function updateProductStatus(id: string, status: string): Promise<ApiResponse<Product>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('products')
      .update({
        status,
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/products')
    revalidatePath(`/products/${id}`)
    return { success: true, data: data as Product, message: '狀態更新成功' }
  } catch (error) {
    console.error('updateProductStatus error:', error)
    return { success: false, error: '更新狀態失敗' }
  }
}

/**
 * 刪除產品（軟刪除）
 */
export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('products')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error

    revalidatePath('/products')
    return { success: true, message: '產品已刪除' }
  } catch (error) {
    console.error('deleteProduct error:', error)
    return { success: false, error: '刪除產品失敗' }
  }
}

/**
 * 取得產品分類列表
 */
export async function getProductCategories(): Promise<ApiResponse<string[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .not('category', 'is', null)

    if (error) throw error

    const allCategories = data.map(p => p.category).filter(Boolean)
    const categories = allCategories.filter((cat, idx) => allCategories.indexOf(cat) === idx)
    return { success: true, data: categories as string[] }
  } catch (error) {
    console.error('getProductCategories error:', error)
    return { success: false, error: '取得分類列表失敗' }
  }
}
