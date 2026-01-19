'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrgId, getCurrentUserId } from '@/lib/supabase/queries'
import type { WholesaleInquiry, WholesaleInquiryItem, ApiResponse } from '@/types'

/**
 * 產生詢價單號
 */
async function generateInquiryNumber(supabase: any, orgId: string): Promise<string> {
  const today = new Date()
  const prefix = `WI${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`

  const { count } = await supabase
    .from('wholesale_inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .like('inquiry_number', `${prefix}%`)

  const sequence = String((count ?? 0) + 1).padStart(4, '0')
  return `${prefix}${sequence}`
}

/**
 * 取得詢價單列表
 */
export async function getWholesaleInquiries(options?: {
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}): Promise<ApiResponse<WholesaleInquiry[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    let query = supabase
      .from('wholesale_inquiries')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.search) {
      query = query.or(`inquiry_number.ilike.%${options.search}%,customer_name.ilike.%${options.search}%,customer_company.ilike.%${options.search}%`)
    }

    if (options?.dateFrom) {
      query = query.gte('inquiry_date', options.dateFrom)
    }

    if (options?.dateTo) {
      query = query.lte('inquiry_date', options.dateTo)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data as WholesaleInquiry[] }
  } catch (error) {
    console.error('getWholesaleInquiries error:', error)
    return { success: false, error: '取得詢價單列表失敗' }
  }
}

/**
 * 取得單一詢價單（含明細）
 */
export async function getWholesaleInquiry(id: string): Promise<ApiResponse<WholesaleInquiry & { items: WholesaleInquiryItem[] }>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data: inquiry, error: inquiryError } = await supabase
      .from('wholesale_inquiries')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .single()

    if (inquiryError) throw inquiryError

    const { data: items, error: itemsError } = await supabase
      .from('wholesale_inquiry_items')
      .select('*')
      .eq('inquiry_id', id)
      .eq('is_deleted', false)
      .order('line_number', { ascending: true })

    if (itemsError) throw itemsError

    return {
      success: true,
      data: { ...inquiry, items: items || [] } as WholesaleInquiry & { items: WholesaleInquiryItem[] }
    }
  } catch (error) {
    console.error('getWholesaleInquiry error:', error)
    return { success: false, error: '取得詢價單失敗' }
  }
}

/**
 * 建立詢價單
 */
export async function createWholesaleInquiry(
  formData: FormData,
  items: Array<{
    product_code: string
    product_name: string
    requested_quantity: number
    unit: string
    target_price?: number
    notes?: string
  }>
): Promise<ApiResponse<WholesaleInquiry>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const inquiryNumber = await generateInquiryNumber(supabase, orgId)

    const inquiryData = {
      org_id: orgId,
      inquiry_number: inquiryNumber,
      customer_name: formData.get('customer_name') as string,
      customer_contact: formData.get('customer_contact') as string || null,
      customer_email: formData.get('customer_email') as string,
      customer_phone: formData.get('customer_phone') as string || null,
      customer_company: formData.get('customer_company') as string || null,
      customer_grade: formData.get('customer_grade') as string || null,
      status: 'submitted',
      inquiry_date: formData.get('inquiry_date') as string || new Date().toISOString().split('T')[0],
      expected_delivery_date: formData.get('expected_delivery_date') as string || null,
      notes: formData.get('notes') as string || null,
      submitted_at: new Date().toISOString(),
      created_by: userId,
      updated_by: userId,
    }

    const { data: inquiry, error: inquiryError } = await supabase
      .from('wholesale_inquiries')
      .insert(inquiryData)
      .select()
      .single()

    if (inquiryError) throw inquiryError

    // 新增明細
    if (items.length > 0) {
      const itemsData = items.map((item, index) => ({
        org_id: orgId,
        inquiry_id: inquiry.id,
        line_number: index + 1,
        product_code: item.product_code,
        product_name: item.product_name,
        requested_quantity: item.requested_quantity,
        unit: item.unit,
        target_price: item.target_price || null,
        notes: item.notes || null,
        created_by: userId,
        updated_by: userId,
      }))

      const { error: itemsError } = await supabase
        .from('wholesale_inquiry_items')
        .insert(itemsData)

      if (itemsError) throw itemsError
    }

    revalidatePath('/wholesale-inquiries')
    return { success: true, data: inquiry as WholesaleInquiry, message: '詢價單建立成功' }
  } catch (error) {
    console.error('createWholesaleInquiry error:', error)
    return { success: false, error: '建立詢價單失敗' }
  }
}

/**
 * 更新詢價狀態
 */
export async function updateInquiryStatus(
  id: string,
  status: string
): Promise<ApiResponse<WholesaleInquiry>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const updateData: Record<string, any> = {
      status,
      updated_by: userId,
    }

    if (status === 'reviewing') {
      updateData.reviewed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('wholesale_inquiries')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/wholesale-inquiries')
    revalidatePath(`/wholesale-inquiries/${id}`)
    return { success: true, data: data as WholesaleInquiry, message: '狀態更新成功' }
  } catch (error) {
    console.error('updateInquiryStatus error:', error)
    return { success: false, error: '更新狀態失敗' }
  }
}

/**
 * 提交報價回覆
 */
export async function submitQuoteResponse(
  id: string,
  formData: FormData,
  items: Array<{
    item_id: string
    quoted_unit_price: number
    availability?: string
    lead_time_days?: number
    notes?: string
  }>
): Promise<ApiResponse<WholesaleInquiry>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 更新明細報價
    let totalQuotedAmount = 0
    for (const item of items) {
      // 取得數量
      const { data: itemData, error: itemFetchError } = await supabase
        .from('wholesale_inquiry_items')
        .select('requested_quantity')
        .eq('id', item.item_id)
        .single()

      if (itemFetchError) {
        console.error('Failed to fetch inquiry item:', itemFetchError)
        continue // 跳過此項目，繼續處理其他項目
      }

      const quotedAmount = item.quoted_unit_price * (itemData?.requested_quantity || 0)
      totalQuotedAmount += quotedAmount

      const { error: updateError } = await supabase
        .from('wholesale_inquiry_items')
        .update({
          quoted_unit_price: item.quoted_unit_price,
          quoted_amount: quotedAmount,
          availability: item.availability || null,
          lead_time_days: item.lead_time_days || null,
          notes: item.notes || null,
          updated_by: userId,
        })
        .eq('id', item.item_id)
        .eq('org_id', orgId)

      if (updateError) {
        console.error('Failed to update inquiry item:', updateError)
        throw new Error(`更新品項失敗: ${item.item_id}`)
      }
    }

    // 計算有效期限
    const validDays = parseInt(formData.get('valid_days') as string) || 7
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + validDays)

    // 更新詢價單
    const { data, error } = await supabase
      .from('wholesale_inquiries')
      .update({
        status: 'quoted',
        quoted_amount: totalQuotedAmount,
        valid_until: validUntil.toISOString().split('T')[0],
        response_notes: formData.get('response_notes') as string || null,
        quoted_at: new Date().toISOString(),
        quoted_by: userId,
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/wholesale-inquiries')
    revalidatePath(`/wholesale-inquiries/${id}`)
    return { success: true, data: data as WholesaleInquiry, message: '報價回覆成功' }
  } catch (error) {
    console.error('submitQuoteResponse error:', error)
    return { success: false, error: '提交報價失敗' }
  }
}

/**
 * 客戶回應報價
 */
export async function respondToQuote(
  id: string,
  response: 'accepted' | 'rejected',
  notes?: string
): Promise<ApiResponse<WholesaleInquiry>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('wholesale_inquiries')
      .update({
        status: response,
        internal_notes: notes || null,
        responded_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/wholesale-inquiries')
    revalidatePath(`/wholesale-inquiries/${id}`)
    return {
      success: true,
      data: data as WholesaleInquiry,
      message: response === 'accepted' ? '報價已接受' : '報價已拒絕'
    }
  } catch (error) {
    console.error('respondToQuote error:', error)
    return { success: false, error: '回應失敗' }
  }
}

/**
 * 將詢價轉換為報價單
 */
export async function convertToQuotation(id: string): Promise<ApiResponse<{ quotationId: string }>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 取得詢價單資料
    const { data: inquiry, error: inquiryError } = await supabase
      .from('wholesale_inquiries')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (inquiryError) throw inquiryError

    // 取得明細
    const { data: items, error: itemsError } = await supabase
      .from('wholesale_inquiry_items')
      .select('*')
      .eq('inquiry_id', id)
      .eq('is_deleted', false)

    if (itemsError) throw itemsError

    // 產生報價單號
    const today = new Date()
    const prefix = `QT${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`
    const { count } = await supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .like('quote_number', `${prefix}%`)
    const quoteNumber = `${prefix}${String((count ?? 0) + 1).padStart(4, '0')}`

    // 計算金額
    const subtotal = items?.reduce((sum, item) => sum + (item.quoted_amount || 0), 0) || 0
    const taxRate = 5
    const taxAmount = subtotal * taxRate / 100
    const totalAmount = subtotal + taxAmount

    // 建立報價單
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert({
        org_id: orgId,
        quote_number: quoteNumber,
        customer_name: inquiry.customer_name,
        customer_contact: inquiry.customer_contact,
        customer_email: inquiry.customer_email,
        customer_phone: inquiry.customer_phone,
        customer_address: null,
        quote_date: new Date().toISOString().split('T')[0],
        valid_until: inquiry.valid_until,
        status: 'draft',
        currency: 'TWD',
        subtotal,
        discount_percent: 0,
        discount_amount: 0,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: `由詢價單 ${inquiry.inquiry_number} 轉換`,
        internal_notes: inquiry.internal_notes,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single()

    if (quotationError) throw quotationError

    // 建立報價單明細
    if (items && items.length > 0) {
      const quotationItems = items.map((item, index) => ({
        org_id: orgId,
        quotation_id: quotation.id,
        line_number: index + 1,
        product_code: item.product_code,
        product_name: item.product_name,
        unit: item.unit,
        quantity: item.requested_quantity,
        unit_price: item.quoted_unit_price || 0,
        discount_percent: 0,
        amount: item.quoted_amount || 0,
        notes: item.notes,
        created_by: userId,
        updated_by: userId,
      }))

      const { error: itemsInsertError } = await supabase
        .from('quotation_items')
        .insert(quotationItems)

      if (itemsInsertError) throw itemsInsertError
    }

    // 更新詢價單
    const { error: linkError } = await supabase
      .from('wholesale_inquiries')
      .update({
        quotation_id: quotation.id,
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (linkError) throw linkError

    revalidatePath('/wholesale-inquiries')
    revalidatePath('/quotations')
    return { success: true, data: { quotationId: quotation.id }, message: '已轉換為報價單' }
  } catch (error) {
    console.error('convertToQuotation error:', error)
    return { success: false, error: '轉換報價單失敗' }
  }
}

/**
 * 刪除詢價單
 */
export async function deleteWholesaleInquiry(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('wholesale_inquiries')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error

    revalidatePath('/wholesale-inquiries')
    return { success: true, message: '詢價單已刪除' }
  } catch (error) {
    console.error('deleteWholesaleInquiry error:', error)
    return { success: false, error: '刪除詢價單失敗' }
  }
}
