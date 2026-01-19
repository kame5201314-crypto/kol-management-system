'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrgId, getCurrentUserId } from '@/lib/supabase/queries'
import type { Customer, ApiResponse } from '@/types'

/**
 * 產生客戶代碼
 */
async function generateCustomerCode(supabase: any, orgId: string): Promise<string> {
  const { count } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)

  const sequence = String((count ?? 0) + 1).padStart(5, '0')
  return `C${sequence}`
}

/**
 * 取得客戶列表
 */
export async function getCustomers(options?: {
  grade?: string
  status?: string
  search?: string
  creditHold?: boolean
}): Promise<ApiResponse<Customer[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    let query = supabase
      .from('customers')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)

    if (options?.grade) {
      query = query.eq('grade', options.grade)
    }

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.creditHold !== undefined) {
      query = query.eq('credit_hold', options.creditHold)
    }

    if (options?.search) {
      query = query.or(`code.ilike.%${options.search}%,name.ilike.%${options.search}%,contact_person.ilike.%${options.search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data as Customer[] }
  } catch (error) {
    console.error('getCustomers error:', error)
    return { success: false, error: '取得客戶列表失敗' }
  }
}

/**
 * 取得單一客戶
 */
export async function getCustomer(id: string): Promise<ApiResponse<Customer>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .single()

    if (error) throw error

    return { success: true, data: data as Customer }
  } catch (error) {
    console.error('getCustomer error:', error)
    return { success: false, error: '取得客戶資料失敗' }
  }
}

/**
 * 建立客戶
 */
export async function createCustomer(formData: FormData): Promise<ApiResponse<Customer>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const code = await generateCustomerCode(supabase, orgId)

    const customerData = {
      org_id: orgId,
      code,
      name: formData.get('name') as string,
      short_name: formData.get('short_name') as string || null,
      tax_id: formData.get('tax_id') as string || null,
      contact_person: formData.get('contact_person') as string || null,
      phone: formData.get('phone') as string || null,
      mobile: formData.get('mobile') as string || null,
      email: formData.get('email') as string || null,
      address: formData.get('address') as string || null,
      billing_address: formData.get('billing_address') as string || null,
      shipping_address: formData.get('shipping_address') as string || null,
      credit_limit: parseFloat(formData.get('credit_limit') as string) || 0,
      current_balance: 0,
      available_credit: parseFloat(formData.get('credit_limit') as string) || 0,
      payment_terms: parseInt(formData.get('payment_terms') as string) || 30,
      credit_hold: false,
      credit_hold_reason: null,
      grade: (formData.get('grade') as string) || 'NEW',
      status: 'active',
      total_orders: 0,
      total_amount: 0,
      last_order_date: null,
      notes: formData.get('notes') as string || null,
      created_by: userId,
      updated_by: userId,
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/customers')
    return { success: true, data: data as Customer, message: '客戶建立成功' }
  } catch (error) {
    console.error('createCustomer error:', error)
    return { success: false, error: '建立客戶失敗' }
  }
}

/**
 * 更新客戶
 */
export async function updateCustomer(id: string, formData: FormData): Promise<ApiResponse<Customer>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const updateData = {
      name: formData.get('name') as string,
      short_name: formData.get('short_name') as string || null,
      tax_id: formData.get('tax_id') as string || null,
      contact_person: formData.get('contact_person') as string || null,
      phone: formData.get('phone') as string || null,
      mobile: formData.get('mobile') as string || null,
      email: formData.get('email') as string || null,
      address: formData.get('address') as string || null,
      billing_address: formData.get('billing_address') as string || null,
      shipping_address: formData.get('shipping_address') as string || null,
      payment_terms: parseInt(formData.get('payment_terms') as string) || 30,
      grade: formData.get('grade') as string,
      status: formData.get('status') as string,
      notes: formData.get('notes') as string || null,
      updated_by: userId,
    }

    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/customers')
    revalidatePath(`/customers/${id}`)
    return { success: true, data: data as Customer, message: '客戶更新成功' }
  } catch (error) {
    console.error('updateCustomer error:', error)
    return { success: false, error: '更新客戶失敗' }
  }
}

/**
 * 刪除客戶（軟刪除）
 */
export async function deleteCustomer(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('customers')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error

    revalidatePath('/customers')
    return { success: true, message: '客戶已刪除' }
  } catch (error) {
    console.error('deleteCustomer error:', error)
    return { success: false, error: '刪除客戶失敗' }
  }
}

/**
 * 更新客戶信用額度
 */
export async function updateCreditLimit(
  id: string,
  newLimit: number,
  reason: string
): Promise<ApiResponse<Customer>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 取得目前客戶資料
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (fetchError) throw fetchError

    const currentBalance = customer.current_balance || 0
    const newAvailableCredit = newLimit - currentBalance

    const { data, error } = await supabase
      .from('customers')
      .update({
        credit_limit: newLimit,
        available_credit: newAvailableCredit,
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    // 記錄信用交易
    await supabase.from('credit_transactions').insert({
      org_id: orgId,
      customer_id: id,
      transaction_type: 'adjustment',
      amount: 0,
      balance_before: customer.current_balance,
      balance_after: customer.current_balance,
      transaction_date: new Date().toISOString(),
      description: `信用額度調整：${customer.credit_limit} → ${newLimit}，原因：${reason}`,
      processed_by: userId,
      created_by: userId,
      updated_by: userId,
    })

    revalidatePath('/customers')
    revalidatePath(`/customers/${id}`)
    return { success: true, data: data as Customer, message: '信用額度更新成功' }
  } catch (error) {
    console.error('updateCreditLimit error:', error)
    return { success: false, error: '更新信用額度失敗' }
  }
}

/**
 * 設定信用凍結
 */
export async function setCreditHold(
  id: string,
  hold: boolean,
  reason?: string
): Promise<ApiResponse<Customer>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('customers')
      .update({
        credit_hold: hold,
        credit_hold_reason: hold ? reason : null,
        status: hold ? 'suspended' : 'active',
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/customers')
    revalidatePath(`/customers/${id}`)
    return {
      success: true,
      data: data as Customer,
      message: hold ? '客戶信用已凍結' : '客戶信用凍結已解除'
    }
  } catch (error) {
    console.error('setCreditHold error:', error)
    return { success: false, error: '設定信用凍結失敗' }
  }
}

/**
 * 取得信用警示客戶
 */
export async function getCreditAlertCustomers(): Promise<ApiResponse<Customer[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .or('credit_hold.eq.true,available_credit.lt.0')
      .order('available_credit', { ascending: true })

    if (error) throw error

    return { success: true, data: data as Customer[] }
  } catch (error) {
    console.error('getCreditAlertCustomers error:', error)
    return { success: false, error: '取得信用警示客戶失敗' }
  }
}
