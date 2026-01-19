'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrgId, getCurrentUserId } from '@/lib/supabase/queries'
import type { Contract, ContractItem, ApiResponse } from '@/types'

/**
 * 產生合約編號
 */
async function generateContractNumber(supabase: any, orgId: string): Promise<string> {
  const today = new Date()
  const prefix = `CT${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`

  const { count } = await supabase
    .from('contracts')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .like('contract_number', `${prefix}%`)

  const sequence = String((count ?? 0) + 1).padStart(4, '0')
  return `${prefix}${sequence}`
}

/**
 * 取得合約列表
 */
export async function getContracts(options?: {
  contractType?: string
  status?: string
  partyId?: string
  search?: string
  expiringWithinDays?: number
}): Promise<ApiResponse<Contract[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    let query = supabase
      .from('contracts')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)

    if (options?.contractType) {
      query = query.eq('contract_type', options.contractType)
    }

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.partyId) {
      query = query.eq('party_id', options.partyId)
    }

    if (options?.search) {
      query = query.or(`contract_number.ilike.%${options.search}%,title.ilike.%${options.search}%,party_name.ilike.%${options.search}%`)
    }

    if (options?.expiringWithinDays) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + options.expiringWithinDays)
      query = query
        .eq('status', 'active')
        .lte('end_date', futureDate.toISOString().split('T')[0])
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data as Contract[] }
  } catch (error) {
    console.error('getContracts error:', error)
    return { success: false, error: '取得合約列表失敗' }
  }
}

/**
 * 取得單一合約（含明細）
 */
export async function getContract(id: string): Promise<ApiResponse<Contract & { items: ContractItem[] }>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .single()

    if (contractError) throw contractError

    const { data: items, error: itemsError } = await supabase
      .from('contract_items')
      .select('*')
      .eq('contract_id', id)
      .eq('is_deleted', false)
      .order('line_number', { ascending: true })

    if (itemsError) throw itemsError

    return {
      success: true,
      data: { ...contract, items: items || [] } as Contract & { items: ContractItem[] }
    }
  } catch (error) {
    console.error('getContract error:', error)
    return { success: false, error: '取得合約失敗' }
  }
}

/**
 * 建立合約
 */
export async function createContract(
  formData: FormData,
  items: Array<{
    product_code: string
    product_name: string
    unit: string
    contracted_price: number
    min_quantity?: number
    max_quantity?: number
    notes?: string
  }>
): Promise<ApiResponse<Contract>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const contractNumber = await generateContractNumber(supabase, orgId)

    const contractData = {
      org_id: orgId,
      contract_number: contractNumber,
      contract_type: formData.get('contract_type') as string,
      title: formData.get('title') as string,
      party_type: formData.get('party_type') as string,
      party_id: formData.get('party_id') as string || null,
      party_name: formData.get('party_name') as string,
      party_contact: formData.get('party_contact') as string || null,
      party_email: formData.get('party_email') as string || null,
      party_phone: formData.get('party_phone') as string || null,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      auto_renew: formData.get('auto_renew') === 'true',
      renewal_notice_days: parseInt(formData.get('renewal_notice_days') as string) || 30,
      payment_terms: formData.get('payment_terms') as string || null,
      delivery_terms: formData.get('delivery_terms') as string || null,
      warranty_terms: formData.get('warranty_terms') as string || null,
      penalty_terms: formData.get('penalty_terms') as string || null,
      special_terms: formData.get('special_terms') as string || null,
      contract_value: parseFloat(formData.get('contract_value') as string) || null,
      currency: formData.get('currency') as string || 'TWD',
      status: 'draft',
      notes: formData.get('notes') as string || null,
      created_by: userId,
      updated_by: userId,
    }

    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert(contractData)
      .select()
      .single()

    if (contractError) throw contractError

    // 新增明細
    if (items.length > 0) {
      const itemsData = items.map((item, index) => ({
        org_id: orgId,
        contract_id: contract.id,
        line_number: index + 1,
        product_code: item.product_code,
        product_name: item.product_name,
        unit: item.unit,
        contracted_price: item.contracted_price,
        min_quantity: item.min_quantity || null,
        max_quantity: item.max_quantity || null,
        notes: item.notes || null,
        created_by: userId,
        updated_by: userId,
      }))

      const { error: itemsError } = await supabase
        .from('contract_items')
        .insert(itemsData)

      if (itemsError) throw itemsError
    }

    revalidatePath('/contracts')
    return { success: true, data: contract as Contract, message: '合約建立成功' }
  } catch (error) {
    console.error('createContract error:', error)
    return { success: false, error: '建立合約失敗' }
  }
}

/**
 * 更新合約
 */
export async function updateContract(
  id: string,
  formData: FormData,
  items: Array<{
    product_code: string
    product_name: string
    unit: string
    contracted_price: number
    min_quantity?: number
    max_quantity?: number
    notes?: string
  }>
): Promise<ApiResponse<Contract>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 檢查狀態
    const { data: current, error: fetchError } = await supabase
      .from('contracts')
      .select('status')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (fetchError) throw fetchError
    if (current.status !== 'draft' && current.status !== 'pending') {
      return { success: false, error: '只能編輯草稿或待核准狀態的合約' }
    }

    const updateData = {
      title: formData.get('title') as string,
      party_name: formData.get('party_name') as string,
      party_contact: formData.get('party_contact') as string || null,
      party_email: formData.get('party_email') as string || null,
      party_phone: formData.get('party_phone') as string || null,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      auto_renew: formData.get('auto_renew') === 'true',
      renewal_notice_days: parseInt(formData.get('renewal_notice_days') as string) || 30,
      payment_terms: formData.get('payment_terms') as string || null,
      delivery_terms: formData.get('delivery_terms') as string || null,
      warranty_terms: formData.get('warranty_terms') as string || null,
      penalty_terms: formData.get('penalty_terms') as string || null,
      special_terms: formData.get('special_terms') as string || null,
      contract_value: parseFloat(formData.get('contract_value') as string) || null,
      notes: formData.get('notes') as string || null,
      updated_by: userId,
    }

    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (contractError) throw contractError

    // 刪除舊明細
    await supabase
      .from('contract_items')
      .update({ is_deleted: true, deleted_at: new Date().toISOString(), updated_by: userId })
      .eq('contract_id', id)
      .eq('org_id', orgId)

    // 新增新明細
    if (items.length > 0) {
      const itemsData = items.map((item, index) => ({
        org_id: orgId,
        contract_id: id,
        line_number: index + 1,
        product_code: item.product_code,
        product_name: item.product_name,
        unit: item.unit,
        contracted_price: item.contracted_price,
        min_quantity: item.min_quantity || null,
        max_quantity: item.max_quantity || null,
        notes: item.notes || null,
        created_by: userId,
        updated_by: userId,
      }))

      const { error: itemsError } = await supabase
        .from('contract_items')
        .insert(itemsData)

      if (itemsError) throw itemsError
    }

    revalidatePath('/contracts')
    revalidatePath(`/contracts/${id}`)
    return { success: true, data: contract as Contract, message: '合約更新成功' }
  } catch (error) {
    console.error('updateContract error:', error)
    return { success: false, error: '更新合約失敗' }
  }
}

/**
 * 更新合約狀態
 */
export async function updateContractStatus(
  id: string,
  status: string,
  reason?: string
): Promise<ApiResponse<Contract>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const updateData: Record<string, any> = {
      status,
      updated_by: userId,
    }

    if (status === 'active') {
      updateData.approved_by = userId
      updateData.approved_at = new Date().toISOString()
    }

    if (status === 'terminated') {
      updateData.terminated_by = userId
      updateData.terminated_at = new Date().toISOString()
      updateData.termination_reason = reason
    }

    const { data, error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/contracts')
    revalidatePath(`/contracts/${id}`)
    return { success: true, data: data as Contract, message: '合約狀態更新成功' }
  } catch (error) {
    console.error('updateContractStatus error:', error)
    return { success: false, error: '更新狀態失敗' }
  }
}

/**
 * 刪除合約
 */
export async function deleteContract(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 檢查狀態
    const { data: current, error: fetchError } = await supabase
      .from('contracts')
      .select('status')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (fetchError) throw fetchError
    if (current.status === 'active') {
      return { success: false, error: '無法刪除生效中的合約' }
    }

    const { error } = await supabase
      .from('contracts')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error

    revalidatePath('/contracts')
    return { success: true, message: '合約已刪除' }
  } catch (error) {
    console.error('deleteContract error:', error)
    return { success: false, error: '刪除合約失敗' }
  }
}

/**
 * 取得即將到期合約
 */
export async function getExpiringContracts(days: number = 30): Promise<ApiResponse<Contract[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + days)

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .eq('status', 'active')
      .gte('end_date', today.toISOString().split('T')[0])
      .lte('end_date', futureDate.toISOString().split('T')[0])
      .order('end_date', { ascending: true })

    if (error) throw error

    return { success: true, data: data as Contract[] }
  } catch (error) {
    console.error('getExpiringContracts error:', error)
    return { success: false, error: '取得即將到期合約失敗' }
  }
}

/**
 * 取得產品的合約價格
 */
export async function getContractedPrice(
  productCode: string,
  partyId: string,
  partyType: 'supplier' | 'customer'
): Promise<ApiResponse<{ price: number; contractId: string; contractNumber: string } | null>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const today = new Date().toISOString().split('T')[0]

    // 找出有效的合約
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, contract_number')
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .eq('status', 'active')
      .eq('party_type', partyType)
      .eq('party_id', partyId)
      .lte('start_date', today)
      .gte('end_date', today)

    if (contractsError) throw contractsError
    if (!contracts || contracts.length === 0) {
      return { success: true, data: null }
    }

    // 找出合約中的產品價格
    for (const contract of contracts) {
      const { data: item, error: itemError } = await supabase
        .from('contract_items')
        .select('contracted_price')
        .eq('contract_id', contract.id)
        .eq('product_code', productCode)
        .eq('is_deleted', false)
        .single()

      if (!itemError && item) {
        return {
          success: true,
          data: {
            price: item.contracted_price,
            contractId: contract.id,
            contractNumber: contract.contract_number,
          }
        }
      }
    }

    return { success: true, data: null }
  } catch (error) {
    console.error('getContractedPrice error:', error)
    return { success: false, error: '取得合約價格失敗' }
  }
}
