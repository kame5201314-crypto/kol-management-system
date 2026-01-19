'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrgId, getCurrentUserId } from '@/lib/supabase/queries'
import type { CreditTransaction, CreditCheckResult, Customer, ApiResponse } from '@/types'

/**
 * 信用檢查
 */
export async function checkCredit(
  customerId: string,
  orderAmount: number
): Promise<ApiResponse<CreditCheckResult>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .single()

    if (error) throw error

    const warnings: string[] = []
    const exceedsAmount = orderAmount - customer.available_credit
    const exceedsLimit = exceedsAmount > 0

    // 計算使用率
    const usageRate = customer.credit_limit > 0
      ? ((customer.current_balance + orderAmount) / customer.credit_limit) * 100
      : 100

    if (usageRate > 80 && usageRate <= 100) {
      warnings.push(`信用額度使用率將達 ${usageRate.toFixed(1)}%`)
    }

    if (customer.credit_hold) {
      warnings.push('客戶信用已凍結')
    }

    if (exceedsLimit) {
      warnings.push(`訂單金額超過可用額度 ${exceedsAmount.toLocaleString()}`)
    }

    const result: CreditCheckResult = {
      customerId: customer.id,
      customerName: customer.name,
      creditLimit: customer.credit_limit,
      currentBalance: customer.current_balance,
      availableCredit: customer.available_credit,
      orderAmount,
      passed: !customer.credit_hold && !exceedsLimit,
      exceedsLimit,
      exceedsAmount: exceedsLimit ? exceedsAmount : 0,
      creditHold: customer.credit_hold,
      holdReason: customer.credit_hold_reason,
      warnings,
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('checkCredit error:', error)
    return { success: false, error: '信用檢查失敗' }
  }
}

/**
 * 記錄信用交易
 */
export async function recordCreditTransaction(
  customerId: string,
  transaction: {
    transaction_type: 'order' | 'payment' | 'refund' | 'adjustment' | 'write_off'
    amount: number
    reference_type?: string
    reference_id?: string
    reference_number?: string
    due_date?: string
    description?: string
  }
): Promise<ApiResponse<CreditTransaction>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 取得客戶目前餘額
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('current_balance, available_credit, credit_limit')
      .eq('id', customerId)
      .eq('org_id', orgId)
      .single()

    if (customerError) throw customerError

    const balanceBefore = customer.current_balance
    let balanceAfter = balanceBefore

    // 計算新餘額
    switch (transaction.transaction_type) {
      case 'order':
        // 訂單增加餘額（應收款）
        balanceAfter = balanceBefore + transaction.amount
        break
      case 'payment':
        // 付款減少餘額
        balanceAfter = balanceBefore - transaction.amount
        break
      case 'refund':
        // 退款減少餘額
        balanceAfter = balanceBefore - transaction.amount
        break
      case 'adjustment':
      case 'write_off':
        // 調整直接使用指定金額
        balanceAfter = balanceBefore + transaction.amount
        break
    }

    // 建立交易記錄
    const transactionData = {
      org_id: orgId,
      customer_id: customerId,
      transaction_type: transaction.transaction_type,
      reference_type: transaction.reference_type || null,
      reference_id: transaction.reference_id || null,
      reference_number: transaction.reference_number || null,
      amount: transaction.amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      transaction_date: new Date().toISOString(),
      due_date: transaction.due_date || null,
      description: transaction.description || null,
      processed_by: userId,
      created_by: userId,
      updated_by: userId,
    }

    const { data: txData, error: txError } = await supabase
      .from('credit_transactions')
      .insert(transactionData)
      .select()
      .single()

    if (txError) throw txError

    // 更新客戶餘額
    const newAvailableCredit = customer.credit_limit - balanceAfter

    const { error: updateError } = await supabase
      .from('customers')
      .update({
        current_balance: balanceAfter,
        available_credit: newAvailableCredit,
        updated_by: userId,
      })
      .eq('id', customerId)
      .eq('org_id', orgId)

    if (updateError) throw updateError

    revalidatePath('/customers')
    revalidatePath(`/customers/${customerId}`)
    revalidatePath(`/customers/${customerId}/credit`)

    return { success: true, data: txData as CreditTransaction, message: '信用交易記錄成功' }
  } catch (error) {
    console.error('recordCreditTransaction error:', error)
    return { success: false, error: '記錄信用交易失敗' }
  }
}

/**
 * 處理客戶付款
 */
export async function processPayment(
  customerId: string,
  amount: number,
  paymentDetails: {
    payment_method?: string
    payment_reference?: string
    notes?: string
  }
): Promise<ApiResponse<CreditTransaction>> {
  try {
    const description = [
      '客戶付款',
      paymentDetails.payment_method ? `方式：${paymentDetails.payment_method}` : null,
      paymentDetails.payment_reference ? `參考：${paymentDetails.payment_reference}` : null,
      paymentDetails.notes,
    ].filter(Boolean).join('，')

    const result = await recordCreditTransaction(customerId, {
      transaction_type: 'payment',
      amount,
      description,
    })

    if (result.success && result.data) {
      // 更新付款日期
      const supabase = await createClient()
      const orgId = await getCurrentOrgId()
      const userId = await getCurrentUserId()

      await supabase
        .from('credit_transactions')
        .update({ paid_date: new Date().toISOString(), updated_by: userId })
        .eq('id', result.data.id)
        .eq('org_id', orgId)
    }

    return result
  } catch (error) {
    console.error('processPayment error:', error)
    return { success: false, error: '處理付款失敗' }
  }
}

/**
 * 取得客戶信用交易記錄
 */
export async function getCreditTransactions(
  customerId: string,
  options?: {
    transactionType?: string
    dateFrom?: string
    dateTo?: string
  }
): Promise<ApiResponse<CreditTransaction[]>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    let query = supabase
      .from('credit_transactions')
      .select('*')
      .eq('org_id', orgId)
      .eq('customer_id', customerId)
      .eq('is_deleted', false)

    if (options?.transactionType) {
      query = query.eq('transaction_type', options.transactionType)
    }

    if (options?.dateFrom) {
      query = query.gte('transaction_date', options.dateFrom)
    }

    if (options?.dateTo) {
      query = query.lte('transaction_date', options.dateTo)
    }

    const { data, error } = await query.order('transaction_date', { ascending: false })

    if (error) throw error

    return { success: true, data: data as CreditTransaction[] }
  } catch (error) {
    console.error('getCreditTransactions error:', error)
    return { success: false, error: '取得信用交易記錄失敗' }
  }
}

/**
 * 取得客戶信用摘要
 */
export async function getCreditSummary(customerId: string): Promise<ApiResponse<{
  customer: Customer
  transactions: CreditTransaction[]
  overdueAmount: number
  overdueCount: number
}>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()

    // 取得客戶資料
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('org_id', orgId)
      .eq('is_deleted', false)
      .single()

    if (customerError) throw customerError

    // 取得最近交易
    const { data: transactions, error: txError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('org_id', orgId)
      .eq('customer_id', customerId)
      .eq('is_deleted', false)
      .order('transaction_date', { ascending: false })
      .limit(20)

    if (txError) throw txError

    // 計算逾期金額
    const today = new Date().toISOString()
    const { data: overdueData, error: overdueError } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('org_id', orgId)
      .eq('customer_id', customerId)
      .eq('transaction_type', 'order')
      .is('paid_date', null)
      .lt('due_date', today)
      .eq('is_deleted', false)

    if (overdueError) throw overdueError

    const overdueAmount = overdueData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0
    const overdueCount = overdueData?.length || 0

    return {
      success: true,
      data: {
        customer: customer as Customer,
        transactions: transactions as CreditTransaction[],
        overdueAmount,
        overdueCount,
      }
    }
  } catch (error) {
    console.error('getCreditSummary error:', error)
    return { success: false, error: '取得信用摘要失敗' }
  }
}

/**
 * 重新計算客戶餘額
 */
export async function recalculateCustomerBalance(customerId: string): Promise<ApiResponse<Customer>> {
  try {
    const supabase = await createClient()
    const orgId = await getCurrentOrgId()
    const userId = await getCurrentUserId()

    // 取得所有未刪除的交易
    const { data: transactions, error: txError } = await supabase
      .from('credit_transactions')
      .select('transaction_type, amount')
      .eq('org_id', orgId)
      .eq('customer_id', customerId)
      .eq('is_deleted', false)

    if (txError) throw txError

    // 計算餘額
    let balance = 0
    for (const tx of transactions || []) {
      switch (tx.transaction_type) {
        case 'order':
          balance += tx.amount
          break
        case 'payment':
        case 'refund':
          balance -= tx.amount
          break
        case 'adjustment':
        case 'write_off':
          balance += tx.amount
          break
      }
    }

    // 取得客戶信用額度
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('credit_limit')
      .eq('id', customerId)
      .eq('org_id', orgId)
      .single()

    if (customerError) throw customerError

    // 更新客戶餘額
    const { data, error } = await supabase
      .from('customers')
      .update({
        current_balance: balance,
        available_credit: customer.credit_limit - balance,
        updated_by: userId,
      })
      .eq('id', customerId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/customers')
    revalidatePath(`/customers/${customerId}`)

    return { success: true, data: data as Customer, message: '客戶餘額重新計算完成' }
  } catch (error) {
    console.error('recalculateCustomerBalance error:', error)
    return { success: false, error: '重新計算餘額失敗' }
  }
}
