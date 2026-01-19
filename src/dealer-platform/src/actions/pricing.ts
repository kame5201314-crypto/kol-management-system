'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrgId, getCurrentUserId } from '@/lib/supabase/queries'
import type { PricingRule, PricingTier, PriceCalculationResult, ApiResponse } from '@/types'

/**
 * 取得價格規則列表
 */
export async function getPricingRules(options?: {
  ruleType?: string
  productId?: string
  isActive?: boolean
}): Promise<ApiResponse<PricingRule[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    let query = supabase
      .from('pricing_rules')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)

    if (options?.ruleType) {
      query = query.eq('rule_type', options.ruleType)
    }

    if (options?.productId) {
      query = query.eq('product_id', options.productId)
    }

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive)
    }

    const { data, error } = await query.order('priority', { ascending: false })

    if (error) throw error

    return { success: true, data: data as PricingRule[] }
  } catch (error) {
    console.error('getPricingRules error:', error)
    return { success: false, error: '取得價格規則失敗' }
  }
}

/**
 * 取得單一價格規則（含階梯）
 */
export async function getPricingRule(id: string): Promise<ApiResponse<PricingRule & { tiers: PricingTier[] }>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data: rule, error: ruleError } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .single()

    if (ruleError) throw ruleError

    // 取得階梯
    const { data: tiers, error: tiersError } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('pricing_rule_id', id)
      .eq('is_deleted', false)
      .order('tier_number', { ascending: true })

    if (tiersError) throw tiersError

    return {
      success: true,
      data: { ...rule, tiers: tiers || [] } as PricingRule & { tiers: PricingTier[] }
    }
  } catch (error) {
    console.error('getPricingRule error:', error)
    return { success: false, error: '取得價格規則失敗' }
  }
}

/**
 * 建立價格規則
 */
export async function createPricingRule(
  formData: FormData,
  tiers: Array<{
    tier_number: number
    min_quantity: number
    max_quantity: number | null
    discount_percent: number | null
    discount_amount: number | null
    fixed_unit_price: number | null
    description: string | null
  }>
): Promise<ApiResponse<PricingRule>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const ruleData = {
      org_id: orgId,
      name: formData.get('name') as string,
      rule_type: formData.get('rule_type') as string,
      priority: parseInt(formData.get('priority') as string) || 0,
      product_id: formData.get('product_id') as string || null,
      product_category: formData.get('product_category') as string || null,
      customer_grade: formData.get('customer_grade') as string || null,
      min_quantity: parseInt(formData.get('min_quantity') as string) || null,
      max_quantity: parseInt(formData.get('max_quantity') as string) || null,
      discount_percent: parseFloat(formData.get('discount_percent') as string) || null,
      discount_amount: parseFloat(formData.get('discount_amount') as string) || null,
      fixed_price: parseFloat(formData.get('fixed_price') as string) || null,
      valid_from: formData.get('valid_from') as string || null,
      valid_until: formData.get('valid_until') as string || null,
      is_active: formData.get('is_active') === 'true',
      notes: formData.get('notes') as string || null,
      created_by: userId,
      updated_by: userId,
    }

    const { data: rule, error: ruleError } = await supabase
      .from('pricing_rules')
      .insert(ruleData)
      .select()
      .single()

    if (ruleError) throw ruleError

    // 新增階梯
    if (tiers.length > 0) {
      const tiersData = tiers.map(tier => ({
        org_id: orgId,
        pricing_rule_id: rule.id,
        ...tier,
        created_by: userId,
        updated_by: userId,
      }))

      const { error: tiersError } = await supabase
        .from('pricing_tiers')
        .insert(tiersData)

      if (tiersError) throw tiersError
    }

    revalidatePath('/pricing')
    return { success: true, data: rule as PricingRule, message: '價格規則建立成功' }
  } catch (error) {
    console.error('createPricingRule error:', error)
    return { success: false, error: '建立價格規則失敗' }
  }
}

/**
 * 更新價格規則
 */
export async function updatePricingRule(
  id: string,
  formData: FormData,
  tiers: Array<{
    tier_number: number
    min_quantity: number
    max_quantity: number | null
    discount_percent: number | null
    discount_amount: number | null
    fixed_unit_price: number | null
    description: string | null
  }>
): Promise<ApiResponse<PricingRule>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    const updateData = {
      name: formData.get('name') as string,
      rule_type: formData.get('rule_type') as string,
      priority: parseInt(formData.get('priority') as string) || 0,
      product_id: formData.get('product_id') as string || null,
      product_category: formData.get('product_category') as string || null,
      customer_grade: formData.get('customer_grade') as string || null,
      min_quantity: parseInt(formData.get('min_quantity') as string) || null,
      max_quantity: parseInt(formData.get('max_quantity') as string) || null,
      discount_percent: parseFloat(formData.get('discount_percent') as string) || null,
      discount_amount: parseFloat(formData.get('discount_amount') as string) || null,
      fixed_price: parseFloat(formData.get('fixed_price') as string) || null,
      valid_from: formData.get('valid_from') as string || null,
      valid_until: formData.get('valid_until') as string || null,
      is_active: formData.get('is_active') === 'true',
      notes: formData.get('notes') as string || null,
      updated_by: userId,
    }

    const { data: rule, error: ruleError } = await supabase
      .from('pricing_rules')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (ruleError) throw ruleError

    // 刪除舊階梯
    await supabase
      .from('pricing_tiers')
      .update({ is_deleted: true, deleted_at: new Date().toISOString(), updated_by: userId })
      .eq('pricing_rule_id', id)
      .eq('org_id', orgId)

    // 新增新階梯
    if (tiers.length > 0) {
      const tiersData = tiers.map(tier => ({
        org_id: orgId,
        pricing_rule_id: id,
        ...tier,
        created_by: userId,
        updated_by: userId,
      }))

      const { error: tiersError } = await supabase
        .from('pricing_tiers')
        .insert(tiersData)

      if (tiersError) throw tiersError
    }

    revalidatePath('/pricing')
    revalidatePath(`/pricing/${id}`)
    return { success: true, data: rule as PricingRule, message: '價格規則更新成功' }
  } catch (error) {
    console.error('updatePricingRule error:', error)
    return { success: false, error: '更新價格規則失敗' }
  }
}

/**
 * 刪除價格規則
 */
export async function deletePricingRule(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 刪除規則
    const { error: ruleError } = await supabase
      .from('pricing_rules')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (ruleError) throw ruleError

    // 刪除階梯
    await supabase
      .from('pricing_tiers')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('pricing_rule_id', id)
      .eq('org_id', orgId)

    revalidatePath('/pricing')
    return { success: true, message: '價格規則已刪除' }
  } catch (error) {
    console.error('deletePricingRule error:', error)
    return { success: false, error: '刪除價格規則失敗' }
  }
}

/**
 * 計算產品價格
 */
export async function calculatePrice(params: {
  productId: string
  quantity: number
  customerGrade?: string
}): Promise<ApiResponse<PriceCalculationResult>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    // 取得產品資料
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('list_price, category')
      .eq('id', params.productId)
      .eq('org_id', orgId)
      .single()

    if (productError) throw productError

    const originalPrice = product.list_price
    let finalUnitPrice = originalPrice
    let discountPercent = 0
    let discountAmount = 0
    let tierApplied: number | null = null
    let tierDescription: string | null = null

    // 取得適用的價格規則
    const today = new Date().toISOString().split('T')[0]

    let query = supabase
      .from('pricing_rules')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .eq('is_active', true)
      .or(`valid_from.is.null,valid_from.lte.${today}`)
      .or(`valid_until.is.null,valid_until.gte.${today}`)
      .order('priority', { ascending: false })

    const { data: rules, error: rulesError } = await query

    if (rulesError) throw rulesError

    // 找出最適用的規則
    for (const rule of rules || []) {
      // 檢查產品匹配
      if (rule.product_id && rule.product_id !== params.productId) continue
      if (rule.product_category && rule.product_category !== product.category) continue

      // 檢查客戶等級
      if (rule.customer_grade && rule.customer_grade !== params.customerGrade) continue

      // 檢查數量範圍
      if (rule.min_quantity && params.quantity < rule.min_quantity) continue
      if (rule.max_quantity && params.quantity > rule.max_quantity) continue

      // 取得該規則的階梯
      const { data: tiers } = await supabase
        .from('pricing_tiers')
        .select('*')
        .eq('pricing_rule_id', rule.id)
        .eq('is_deleted', false)
        .order('tier_number', { ascending: true })

      if (tiers && tiers.length > 0) {
        // 找出適用的階梯
        for (const tier of tiers) {
          if (params.quantity >= tier.min_quantity &&
              (!tier.max_quantity || params.quantity <= tier.max_quantity)) {
            tierApplied = tier.tier_number
            tierDescription = tier.description

            if (tier.fixed_unit_price) {
              finalUnitPrice = tier.fixed_unit_price
            } else if (tier.discount_percent) {
              discountPercent = tier.discount_percent
              finalUnitPrice = originalPrice * (1 - discountPercent / 100)
            } else if (tier.discount_amount) {
              discountAmount = tier.discount_amount
              finalUnitPrice = originalPrice - discountAmount
            }
            break
          }
        }
      } else {
        // 使用規則本身的折扣
        if (rule.fixed_price) {
          finalUnitPrice = rule.fixed_price
        } else if (rule.discount_percent) {
          discountPercent = rule.discount_percent
          finalUnitPrice = originalPrice * (1 - discountPercent / 100)
        } else if (rule.discount_amount) {
          discountAmount = rule.discount_amount
          finalUnitPrice = originalPrice - discountAmount
        }
      }

      break // 使用第一個匹配的規則
    }

    const result: PriceCalculationResult = {
      original_price: originalPrice,
      tier_applied: tierApplied,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      final_unit_price: Math.max(0, finalUnitPrice),
      final_total: Math.max(0, finalUnitPrice * params.quantity),
      tier_description: tierDescription,
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('calculatePrice error:', error)
    return { success: false, error: '計算價格失敗' }
  }
}

/**
 * 切換規則啟用狀態
 */
export async function togglePricingRuleActive(id: string): Promise<ApiResponse<PricingRule>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 取得目前狀態
    const { data: current, error: fetchError } = await supabase
      .from('pricing_rules')
      .select('is_active')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (fetchError) throw fetchError

    const { data, error } = await supabase
      .from('pricing_rules')
      .update({
        is_active: !current.is_active,
        updated_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/pricing')
    return {
      success: true,
      data: data as PricingRule,
      message: data.is_active ? '規則已啟用' : '規則已停用'
    }
  } catch (error) {
    console.error('togglePricingRuleActive error:', error)
    return { success: false, error: '切換狀態失敗' }
  }
}
