'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrgId, getCurrentUserId } from '@/lib/supabase/queries'
import type { PurchaseOrder, PurchaseOrderItem, ApiResponse } from '@/types'

/**
 * 產生採購單號
 */
async function generatePoNumber(supabase: any, orgId: string): Promise<string> {
  const today = new Date()
  const prefix = `PO${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`

  const { count } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .like('po_number', `${prefix}%`)

  const sequence = String((count ?? 0) + 1).padStart(4, '0')
  return `${prefix}${sequence}`
}

/**
 * 取得採購單列表
 */
export async function getPurchaseOrders(options?: {
  status?: string
  supplierId?: string
  search?: string
}): Promise<ApiResponse<PurchaseOrder[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    let query = supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(id, name, code)
      `)
      .eq('org_id', orgId)
      .eq('is_deleted', false)

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.supplierId) {
      query = query.eq('supplier_id', options.supplierId)
    }

    if (options?.search) {
      query = query.ilike('po_number', `%${options.search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data as PurchaseOrder[] }
  } catch (error) {
    console.error('getPurchaseOrders error:', error)
    return { success: false, error: '取得採購單列表失敗' }
  }
}

/**
 * 取得單一採購單（含明細）
 */
export async function getPurchaseOrder(id: string): Promise<ApiResponse<PurchaseOrder & { items: PurchaseOrderItem[] }>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(id, name, code)
      `)
      .eq('id', id)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .single()

    if (poError) throw poError

    const { data: items, error: itemsError } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('po_id', id)
      .eq('is_deleted', false)
      .order('line_number')

    if (itemsError) throw itemsError

    return {
      success: true,
      data: { ...po, items } as PurchaseOrder & { items: PurchaseOrderItem[] }
    }
  } catch (error) {
    console.error('getPurchaseOrder error:', error)
    return { success: false, error: '取得採購單資料失敗' }
  }
}

/**
 * 建立採購單
 */
export async function createPurchaseOrder(
  formData: FormData,
  items: Array<{
    product_code: string
    product_name: string
    unit: string
    quantity: number
    unit_price: number
  }>
): Promise<ApiResponse<PurchaseOrder>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const poNumber = await generatePoNumber(supabase, orgId)

    // 計算金額
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const taxAmount = subtotal * 0.05 // 5% 稅率
    const totalAmount = subtotal + taxAmount

    const poData = {
      org_id: orgId,
      po_number: poNumber,
      supplier_id: formData.get('supplier_id') as string,
      order_date: formData.get('order_date') as string || new Date().toISOString().split('T')[0],
      expected_date: formData.get('expected_date') as string || null,
      currency: formData.get('currency') as string || 'TWD',
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      payment_terms: parseInt(formData.get('payment_terms') as string) || 30,
      shipping_address: formData.get('shipping_address') as string || null,
      notes: formData.get('notes') as string || null,
      status: 'draft',
      created_by: userId,
      updated_by: userId,
    }

    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert(poData)
      .select()
      .single()

    if (poError) throw poError

    // 新增明細
    const itemsData = items.map((item, index) => ({
      org_id: orgId,
      po_id: po.id,
      line_number: index + 1,
      product_code: item.product_code,
      product_name: item.product_name,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
      created_by: userId,
      updated_by: userId,
    }))

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(itemsData)

    if (itemsError) throw itemsError

    revalidatePath('/purchase-orders')
    return { success: true, data: po as PurchaseOrder, message: '採購單建立成功' }
  } catch (error) {
    console.error('createPurchaseOrder error:', error)
    return { success: false, error: '建立採購單失敗' }
  }
}

/**
 * 更新採購單
 */
export async function updatePurchaseOrder(
  id: string,
  formData: FormData,
  items: Array<{
    id?: string
    product_code: string
    product_name: string
    unit: string
    quantity: number
    unit_price: number
  }>
): Promise<ApiResponse<PurchaseOrder>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 確認只能編輯草稿狀態
    const { data: existingPo } = await supabase
      .from('purchase_orders')
      .select('status')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (existingPo?.status !== 'draft') {
      return { success: false, error: '只能編輯草稿狀態的採購單' }
    }

    // 計算金額
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const taxAmount = subtotal * 0.05
    const totalAmount = subtotal + taxAmount

    const poData = {
      supplier_id: formData.get('supplier_id') as string,
      order_date: formData.get('order_date') as string || new Date().toISOString().split('T')[0],
      expected_date: formData.get('expected_date') as string || null,
      currency: formData.get('currency') as string || 'TWD',
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      payment_terms: parseInt(formData.get('payment_terms') as string) || 30,
      shipping_address: formData.get('shipping_address') as string || null,
      notes: formData.get('notes') as string || null,
      updated_by: userId,
    }

    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .update(poData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (poError) throw poError

    // 刪除舊明細
    await supabase
      .from('purchase_order_items')
      .update({ is_deleted: true, deleted_at: new Date().toISOString(), updated_by: userId })
      .eq('po_id', id)

    // 新增新明細
    const itemsData = items.map((item, index) => ({
      org_id: orgId,
      po_id: id,
      line_number: index + 1,
      product_code: item.product_code,
      product_name: item.product_name,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
      created_by: userId,
      updated_by: userId,
    }))

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(itemsData)

    if (itemsError) throw itemsError

    revalidatePath('/purchase-orders')
    revalidatePath(`/purchase-orders/${id}`)
    return { success: true, data: po as PurchaseOrder, message: '採購單更新成功' }
  } catch (error) {
    console.error('updatePurchaseOrder error:', error)
    return { success: false, error: '更新採購單失敗' }
  }
}

/**
 * 更新採購單狀態
 */
export async function updatePurchaseOrderStatus(
  id: string,
  status: string
): Promise<ApiResponse<PurchaseOrder>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const updateData: Record<string, any> = {
      status,
      updated_by: userId,
    }

    // 如果是核准狀態，記錄核准資訊
    if (status === 'approved') {
      updateData.approved_by = userId
      updateData.approved_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/purchase-orders')
    revalidatePath(`/purchase-orders/${id}`)
    return { success: true, data: data as PurchaseOrder, message: '狀態更新成功' }
  } catch (error) {
    console.error('updatePurchaseOrderStatus error:', error)
    return { success: false, error: '更新狀態失敗' }
  }
}

/**
 * 刪除採購單（軟刪除）
 */
export async function deletePurchaseOrder(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 只能刪除草稿狀態的採購單
    const { data: po } = await supabase
      .from('purchase_orders')
      .select('status')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (po?.status !== 'draft') {
      return { success: false, error: '只能刪除草稿狀態的採購單' }
    }

    const { error } = await supabase
      .from('purchase_orders')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error

    revalidatePath('/purchase-orders')
    return { success: true, message: '採購單已刪除' }
  } catch (error) {
    console.error('deletePurchaseOrder error:', error)
    return { success: false, error: '刪除採購單失敗' }
  }
}
