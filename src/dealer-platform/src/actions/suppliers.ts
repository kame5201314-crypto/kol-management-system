'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrgId, getCurrentUserId } from '@/lib/supabase/queries'
import type { Supplier, SupplierScore, ApiResponse } from '@/types'

/**
 * 取得供應商列表
 */
export async function getSuppliers(): Promise<ApiResponse<Supplier[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data as Supplier[] }
  } catch (error) {
    console.error('getSuppliers error:', error)
    return { success: false, error: '取得供應商列表失敗' }
  }
}

/**
 * 取得單一供應商
 */
export async function getSupplier(id: string): Promise<ApiResponse<Supplier>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .single()

    if (error) throw error

    return { success: true, data: data as Supplier }
  } catch (error) {
    console.error('getSupplier error:', error)
    return { success: false, error: '取得供應商資料失敗' }
  }
}

/**
 * 建立供應商
 */
export async function createSupplier(
  formData: FormData
): Promise<ApiResponse<Supplier>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const supplierData = {
      org_id: orgId,
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      short_name: formData.get('short_name') as string || null,
      tax_id: formData.get('tax_id') as string || null,
      contact_person: formData.get('contact_person') as string || null,
      phone: formData.get('phone') as string || null,
      mobile: formData.get('mobile') as string || null,
      fax: formData.get('fax') as string || null,
      email: formData.get('email') as string || null,
      address: formData.get('address') as string || null,
      payment_terms: parseInt(formData.get('payment_terms') as string) || 30,
      currency: formData.get('currency') as string || 'TWD',
      notes: formData.get('notes') as string || null,
      created_by: userId,
      updated_by: userId,
    }

    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/suppliers')
    return { success: true, data: data as Supplier, message: '供應商建立成功' }
  } catch (error) {
    console.error('createSupplier error:', error)
    return { success: false, error: '建立供應商失敗' }
  }
}

/**
 * 更新供應商
 */
export async function updateSupplier(
  id: string,
  formData: FormData
): Promise<ApiResponse<Supplier>> {
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
      fax: formData.get('fax') as string || null,
      email: formData.get('email') as string || null,
      address: formData.get('address') as string || null,
      payment_terms: parseInt(formData.get('payment_terms') as string) || 30,
      currency: formData.get('currency') as string || 'TWD',
      status: formData.get('status') as string || 'active',
      notes: formData.get('notes') as string || null,
      updated_by: userId,
    }

    const { data, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/suppliers')
    revalidatePath(`/suppliers/${id}`)
    return { success: true, data: data as Supplier, message: '供應商更新成功' }
  } catch (error) {
    console.error('updateSupplier error:', error)
    return { success: false, error: '更新供應商失敗' }
  }
}

/**
 * 刪除供應商（軟刪除）
 */
export async function deleteSupplier(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('suppliers')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error

    revalidatePath('/suppliers')
    return { success: true, message: '供應商已刪除' }
  } catch (error) {
    console.error('deleteSupplier error:', error)
    return { success: false, error: '刪除供應商失敗' }
  }
}

/**
 * 更新供應商評等
 */
export async function updateSupplierGrade(
  id: string,
  grade: 'A' | 'B' | 'C' | 'D'
): Promise<ApiResponse<Supplier>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('suppliers')
      .update({
        grade,
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/suppliers')
    return { success: true, data: data as Supplier, message: '評等更新成功' }
  } catch (error) {
    console.error('updateSupplierGrade error:', error)
    return { success: false, error: '更新評等失敗' }
  }
}

/**
 * 新增供應商評分記錄
 */
export async function addSupplierScore(
  supplierId: string,
  formData: FormData
): Promise<ApiResponse<SupplierScore>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const qualityScore = parseFloat(formData.get('quality_score') as string) || 0
    const deliveryScore = parseFloat(formData.get('delivery_score') as string) || 0
    const priceScore = parseFloat(formData.get('price_score') as string) || 0
    const serviceScore = parseFloat(formData.get('service_score') as string) || 0
    const complianceScore = parseFloat(formData.get('compliance_score') as string) || 0

    // 加權計算總分
    const totalScore = (
      qualityScore * 0.3 +
      deliveryScore * 0.25 +
      priceScore * 0.2 +
      serviceScore * 0.15 +
      complianceScore * 0.1
    )

    const scoreData = {
      org_id: orgId,
      supplier_id: supplierId,
      score_date: formData.get('score_date') as string || new Date().toISOString().split('T')[0],
      quality_score: qualityScore,
      delivery_score: deliveryScore,
      price_score: priceScore,
      service_score: serviceScore,
      compliance_score: complianceScore,
      total_score: Math.round(totalScore * 100) / 100,
      comments: formData.get('comments') as string || null,
      created_by: userId,
      updated_by: userId,
    }

    const { data, error } = await supabase
      .from('supplier_scores')
      .insert(scoreData)
      .select()
      .single()

    if (error) throw error

    // 根據總分自動更新評等
    let newGrade: 'A' | 'B' | 'C' | 'D' = 'C'
    if (totalScore >= 90) newGrade = 'A'
    else if (totalScore >= 75) newGrade = 'B'
    else if (totalScore >= 60) newGrade = 'C'
    else newGrade = 'D'

    await updateSupplierGrade(supplierId, newGrade)

    revalidatePath('/suppliers')
    revalidatePath(`/suppliers/${supplierId}`)
    return { success: true, data: data as SupplierScore, message: '評分記錄新增成功' }
  } catch (error) {
    console.error('addSupplierScore error:', error)
    return { success: false, error: '新增評分記錄失敗' }
  }
}

/**
 * 取得供應商評分歷史
 */
export async function getSupplierScores(
  supplierId: string
): Promise<ApiResponse<SupplierScore[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data, error } = await supabase
      .from('supplier_scores')
      .select('*')
      .eq('supplier_id', supplierId)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .order('score_date', { ascending: false })

    if (error) throw error

    return { success: true, data: data as SupplierScore[] }
  } catch (error) {
    console.error('getSupplierScores error:', error)
    return { success: false, error: '取得評分歷史失敗' }
  }
}
