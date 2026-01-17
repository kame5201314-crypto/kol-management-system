'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrgId, getCurrentUserId } from '@/lib/supabase/queries'
import type { Quotation, QuotationItem, ApiResponse } from '@/types'

/**
 * 產生報價單號
 */
async function generateQuoteNumber(supabase: any, orgId: string): Promise<string> {
  const today = new Date()
  const prefix = `QT${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`

  const { count } = await supabase
    .from('quotations')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .like('quote_number', `${prefix}%`)

  const sequence = String((count ?? 0) + 1).padStart(4, '0')
  return `${prefix}${sequence}`
}

/**
 * 取得報價單列表
 */
export async function getQuotations(): Promise<ApiResponse<Quotation[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data as Quotation[] }
  } catch (error) {
    console.error('getQuotations error:', error)
    return { success: false, error: '取得報價單列表失敗' }
  }
}

/**
 * 取得單一報價單（含明細）
 */
export async function getQuotation(id: string): Promise<ApiResponse<Quotation & { items: QuotationItem[] }>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .single()

    if (quotationError) throw quotationError

    const { data: items, error: itemsError } = await supabase
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', id)
      .eq('is_deleted', false)
      .order('line_number')

    if (itemsError) throw itemsError

    return {
      success: true,
      data: { ...quotation, items } as Quotation & { items: QuotationItem[] }
    }
  } catch (error) {
    console.error('getQuotation error:', error)
    return { success: false, error: '取得報價單資料失敗' }
  }
}

/**
 * 建立報價單
 */
export async function createQuotation(
  formData: FormData,
  items: Array<{
    product_code: string
    product_name: string
    description?: string
    unit: string
    quantity: number
    unit_price: number
    discount_percent?: number
  }>
): Promise<ApiResponse<Quotation>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const quoteNumber = await generateQuoteNumber(supabase, orgId)

    // 計算金額
    const subtotal = items.reduce((sum, item) => {
      const discountMultiplier = 1 - (item.discount_percent ?? 0) / 100
      return sum + (item.quantity * item.unit_price * discountMultiplier)
    }, 0)

    const discountPercent = parseFloat(formData.get('discount_percent') as string) || 0
    const discountAmount = subtotal * (discountPercent / 100)
    const taxRate = parseFloat(formData.get('tax_rate') as string) || 5
    const taxableAmount = subtotal - discountAmount
    const taxAmount = taxableAmount * (taxRate / 100)
    const totalAmount = taxableAmount + taxAmount

    const quotationData = {
      org_id: orgId,
      quote_number: quoteNumber,
      customer_name: formData.get('customer_name') as string,
      customer_contact: formData.get('customer_contact') as string || null,
      customer_email: formData.get('customer_email') as string || null,
      customer_phone: formData.get('customer_phone') as string || null,
      customer_address: formData.get('customer_address') as string || null,
      quote_date: formData.get('quote_date') as string || new Date().toISOString().split('T')[0],
      valid_until: formData.get('valid_until') as string || null,
      currency: formData.get('currency') as string || 'TWD',
      subtotal,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      payment_terms: formData.get('payment_terms') as string || null,
      delivery_terms: formData.get('delivery_terms') as string || null,
      notes: formData.get('notes') as string || null,
      internal_notes: formData.get('internal_notes') as string || null,
      status: 'draft',
      created_by: userId,
      updated_by: userId,
    }

    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert(quotationData)
      .select()
      .single()

    if (quotationError) throw quotationError

    // 新增明細
    const itemsData = items.map((item, index) => {
      const discountMultiplier = 1 - (item.discount_percent ?? 0) / 100
      const amount = item.quantity * item.unit_price * discountMultiplier

      return {
        org_id: orgId,
        quotation_id: quotation.id,
        line_number: index + 1,
        product_code: item.product_code,
        product_name: item.product_name,
        description: item.description || null,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent ?? 0,
        amount,
        created_by: userId,
        updated_by: userId,
      }
    })

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsData)

    if (itemsError) throw itemsError

    revalidatePath('/quotations')
    return { success: true, data: quotation as Quotation, message: '報價單建立成功' }
  } catch (error) {
    console.error('createQuotation error:', error)
    return { success: false, error: '建立報價單失敗' }
  }
}

/**
 * 更新報價單
 */
export async function updateQuotation(
  id: string,
  formData: FormData,
  items: Array<{
    product_code: string
    product_name: string
    description?: string
    unit: string
    quantity: number
    unit_price: number
    discount_percent?: number
  }>
): Promise<ApiResponse<Quotation>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 確認只能編輯草稿狀態
    const { data: existingQuotation } = await supabase
      .from('quotations')
      .select('status')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (existingQuotation?.status !== 'draft') {
      return { success: false, error: '只能編輯草稿狀態的報價單' }
    }

    // 計算金額
    const subtotal = items.reduce((sum, item) => {
      const discountMultiplier = 1 - (item.discount_percent ?? 0) / 100
      return sum + (item.quantity * item.unit_price * discountMultiplier)
    }, 0)

    const discountPercent = parseFloat(formData.get('discount_percent') as string) || 0
    const discountAmount = subtotal * (discountPercent / 100)
    const taxRate = parseFloat(formData.get('tax_rate') as string) || 5
    const taxableAmount = subtotal - discountAmount
    const taxAmount = taxableAmount * (taxRate / 100)
    const totalAmount = taxableAmount + taxAmount

    const quotationData = {
      customer_name: formData.get('customer_name') as string,
      customer_contact: formData.get('customer_contact') as string || null,
      customer_email: formData.get('customer_email') as string || null,
      customer_phone: formData.get('customer_phone') as string || null,
      customer_address: formData.get('customer_address') as string || null,
      quote_date: formData.get('quote_date') as string || new Date().toISOString().split('T')[0],
      valid_until: formData.get('valid_until') as string || null,
      currency: formData.get('currency') as string || 'TWD',
      subtotal,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      payment_terms: formData.get('payment_terms') as string || null,
      delivery_terms: formData.get('delivery_terms') as string || null,
      notes: formData.get('notes') as string || null,
      internal_notes: formData.get('internal_notes') as string || null,
      updated_by: userId,
    }

    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .update(quotationData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (quotationError) throw quotationError

    // 刪除舊明細
    await supabase
      .from('quotation_items')
      .update({ is_deleted: true, deleted_at: new Date().toISOString(), updated_by: userId })
      .eq('quotation_id', id)

    // 新增新明細
    const itemsData = items.map((item, index) => {
      const discountMultiplier = 1 - (item.discount_percent ?? 0) / 100
      const amount = item.quantity * item.unit_price * discountMultiplier

      return {
        org_id: orgId,
        quotation_id: id,
        line_number: index + 1,
        product_code: item.product_code,
        product_name: item.product_name,
        description: item.description || null,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent ?? 0,
        amount,
        created_by: userId,
        updated_by: userId,
      }
    })

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsData)

    if (itemsError) throw itemsError

    revalidatePath('/quotations')
    revalidatePath(`/quotations/${id}`)
    return { success: true, data: quotation as Quotation, message: '報價單更新成功' }
  } catch (error) {
    console.error('updateQuotation error:', error)
    return { success: false, error: '更新報價單失敗' }
  }
}

/**
 * 更新報價單狀態
 */
export async function updateQuotationStatus(
  id: string,
  status: string
): Promise<ApiResponse<Quotation>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const updateData: Record<string, any> = {
      status,
      updated_by: userId,
    }

    // 記錄時間戳
    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString()
    } else if (status === 'viewed') {
      updateData.viewed_at = new Date().toISOString()
    } else if (status === 'accepted' || status === 'rejected') {
      updateData.responded_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('quotations')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/quotations')
    revalidatePath(`/quotations/${id}`)
    return { success: true, data: data as Quotation, message: '狀態更新成功' }
  } catch (error) {
    console.error('updateQuotationStatus error:', error)
    return { success: false, error: '更新狀態失敗' }
  }
}

/**
 * 複製報價單
 */
export async function duplicateQuotation(id: string): Promise<ApiResponse<Quotation>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 取得原報價單
    const result = await getQuotation(id)
    if (!result.success || !result.data) {
      return { success: false, error: '找不到原報價單' }
    }

    const original = result.data
    const quoteNumber = await generateQuoteNumber(supabase, orgId)

    // 建立新報價單
    const newQuotationData = {
      org_id: orgId,
      quote_number: quoteNumber,
      customer_name: original.customer_name,
      customer_contact: original.customer_contact,
      customer_email: original.customer_email,
      customer_phone: original.customer_phone,
      customer_address: original.customer_address,
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: null,
      currency: original.currency,
      subtotal: original.subtotal,
      discount_percent: original.discount_percent,
      discount_amount: original.discount_amount,
      tax_rate: original.tax_rate,
      tax_amount: original.tax_amount,
      total_amount: original.total_amount,
      payment_terms: original.payment_terms,
      delivery_terms: original.delivery_terms,
      notes: original.notes,
      internal_notes: original.internal_notes,
      status: 'draft',
      created_by: userId,
      updated_by: userId,
    }

    const { data: newQuotation, error: quotationError } = await supabase
      .from('quotations')
      .insert(newQuotationData)
      .select()
      .single()

    if (quotationError) throw quotationError

    // 複製明細
    const itemsData = original.items.map((item, index) => ({
      org_id: orgId,
      quotation_id: newQuotation.id,
      line_number: index + 1,
      product_code: item.product_code,
      product_name: item.product_name,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent,
      amount: item.amount,
      created_by: userId,
      updated_by: userId,
    }))

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsData)

    if (itemsError) throw itemsError

    revalidatePath('/quotations')
    return { success: true, data: newQuotation as Quotation, message: '報價單複製成功' }
  } catch (error) {
    console.error('duplicateQuotation error:', error)
    return { success: false, error: '複製報價單失敗' }
  }
}

/**
 * 刪除報價單（軟刪除）
 */
export async function deleteQuotation(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('quotations')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error

    revalidatePath('/quotations')
    return { success: true, message: '報價單已刪除' }
  } catch (error) {
    console.error('deleteQuotation error:', error)
    return { success: false, error: '刪除報價單失敗' }
  }
}
