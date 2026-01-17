'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrgId, getCurrentUserId } from '@/lib/supabase/queries'
import type { Delivery, DeliveryItem, ApiResponse } from '@/types'

/**
 * 產生交貨單號
 */
async function generateDeliveryNumber(supabase: any, orgId: string): Promise<string> {
  const today = new Date()
  const prefix = `DL${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`

  const { count } = await supabase
    .from('deliveries')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .like('delivery_number', `${prefix}%`)

  const sequence = String((count ?? 0) + 1).padStart(4, '0')
  return `${prefix}${sequence}`
}

/**
 * 取得交貨記錄列表
 */
export async function getDeliveries(): Promise<ApiResponse<Delivery[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        supplier:suppliers(id, name, code),
        purchase_order:purchase_orders(id, po_number)
      `)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data as Delivery[] }
  } catch (error) {
    console.error('getDeliveries error:', error)
    return { success: false, error: '取得交貨記錄失敗' }
  }
}

/**
 * 取得單一交貨記錄（含明細）
 */
export async function getDelivery(id: string): Promise<ApiResponse<Delivery & { items: DeliveryItem[] }>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .select(`
        *,
        supplier:suppliers(id, name, code),
        purchase_order:purchase_orders(id, po_number)
      `)
      .eq('id', id)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .single()

    if (deliveryError) throw deliveryError

    const { data: items, error: itemsError } = await supabase
      .from('delivery_items')
      .select('*')
      .eq('delivery_id', id)
      .eq('is_deleted', false)

    if (itemsError) throw itemsError

    return {
      success: true,
      data: { ...delivery, items } as Delivery & { items: DeliveryItem[] }
    }
  } catch (error) {
    console.error('getDelivery error:', error)
    return { success: false, error: '取得交貨記錄失敗' }
  }
}

/**
 * 建立交貨記錄
 */
export async function createDelivery(
  formData: FormData,
  items: Array<{
    po_item_id?: string
    product_code: string
    product_name: string
    quantity: number
  }>
): Promise<ApiResponse<Delivery>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const deliveryNumber = await generateDeliveryNumber(supabase, orgId)

    const deliveryData = {
      org_id: orgId,
      delivery_number: deliveryNumber,
      po_id: formData.get('po_id') as string,
      supplier_id: formData.get('supplier_id') as string,
      delivery_date: formData.get('delivery_date') as string || new Date().toISOString().split('T')[0],
      tracking_number: formData.get('tracking_number') as string || null,
      carrier: formData.get('carrier') as string || null,
      notes: formData.get('notes') as string || null,
      status: 'pending',
      created_by: userId,
      updated_by: userId,
    }

    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert(deliveryData)
      .select()
      .single()

    if (deliveryError) throw deliveryError

    // 新增明細
    const itemsData = items.map((item) => ({
      org_id: orgId,
      delivery_id: delivery.id,
      po_item_id: item.po_item_id || null,
      product_code: item.product_code,
      product_name: item.product_name,
      quantity: item.quantity,
      created_by: userId,
      updated_by: userId,
    }))

    const { error: itemsError } = await supabase
      .from('delivery_items')
      .insert(itemsData)

    if (itemsError) throw itemsError

    revalidatePath('/deliveries')
    return { success: true, data: delivery as Delivery, message: '交貨記錄建立成功' }
  } catch (error) {
    console.error('createDelivery error:', error)
    return { success: false, error: '建立交貨記錄失敗' }
  }
}

/**
 * 更新交貨狀態
 */
export async function updateDeliveryStatus(
  id: string,
  status: string
): Promise<ApiResponse<Delivery>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const updateData: Record<string, any> = {
      status,
      updated_by: userId,
    }

    // 如果是已收貨狀態
    if (status === 'delivered' || status === 'inspecting' || status === 'accepted') {
      updateData.received_at = new Date().toISOString()
      updateData.received_by = userId
    }

    const { data, error } = await supabase
      .from('deliveries')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/deliveries')
    revalidatePath(`/deliveries/${id}`)
    return { success: true, data: data as Delivery, message: '狀態更新成功' }
  } catch (error) {
    console.error('updateDeliveryStatus error:', error)
    return { success: false, error: '更新狀態失敗' }
  }
}

/**
 * 驗收交貨品項
 */
export async function inspectDeliveryItem(
  itemId: string,
  acceptedQty: number,
  rejectedQty: number,
  rejectionReason?: string
): Promise<ApiResponse<DeliveryItem>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('delivery_items')
      .update({
        accepted_qty: acceptedQty,
        rejected_qty: rejectedQty,
        rejection_reason: rejectionReason || null,
        updated_by: userId,
      })
      .eq('id', itemId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/deliveries')
    return { success: true, data: data as DeliveryItem, message: '驗收完成' }
  } catch (error) {
    console.error('inspectDeliveryItem error:', error)
    return { success: false, error: '驗收失敗' }
  }
}
