/**
 * Supabase Database 類型定義
 * 對應 dealer schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * 必備欄位介面（所有資料表共用）
 */
export interface BaseFields {
  id: string
  org_id: string
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  is_deleted: boolean
  deleted_at: string | null
  metadata: Json
  version: number
}

/**
 * 供應商
 */
export interface Supplier extends BaseFields {
  code: string
  name: string
  short_name: string | null
  tax_id: string | null
  contact_person: string | null
  phone: string | null
  mobile: string | null
  fax: string | null
  email: string | null
  address: string | null
  payment_terms: number
  currency: string
  grade: 'A' | 'B' | 'C' | 'D'
  status: 'active' | 'inactive' | 'blocked'
  notes: string | null
}

/**
 * 供應商評分記錄
 */
export interface SupplierScore extends BaseFields {
  supplier_id: string
  score_date: string
  quality_score: number
  delivery_score: number
  price_score: number
  service_score: number
  compliance_score: number
  total_score: number
  comments: string | null
}

/**
 * 產品
 */
export interface Product extends BaseFields {
  code: string
  name: string
  category: string | null
  unit: string
  spec: string | null
  description: string | null
  cost_price: number | null
  list_price: number
  min_price: number | null
  status: 'active' | 'inactive' | 'discontinued'
}

/**
 * 採購單狀態
 */
export type PurchaseOrderStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'ordered'
  | 'partial'
  | 'completed'
  | 'cancelled'

/**
 * 採購單
 */
export interface PurchaseOrder extends BaseFields {
  po_number: string
  supplier_id: string
  order_date: string
  expected_date: string | null
  status: PurchaseOrderStatus
  currency: string
  subtotal: number
  tax_amount: number
  total_amount: number
  payment_terms: number
  shipping_address: string | null
  notes: string | null
  approved_by: string | null
  approved_at: string | null
}

/**
 * 採購單明細
 */
export interface PurchaseOrderItem extends BaseFields {
  po_id: string
  line_number: number
  product_id: string | null
  product_code: string
  product_name: string
  unit: string
  quantity: number
  unit_price: number
  amount: number
  received_qty: number
  notes: string | null
}

/**
 * 交貨狀態
 */
export type DeliveryStatus =
  | 'pending'
  | 'in_transit'
  | 'delivered'
  | 'inspecting'
  | 'accepted'
  | 'rejected'

/**
 * 交貨記錄
 */
export interface Delivery extends BaseFields {
  delivery_number: string
  po_id: string
  supplier_id: string
  delivery_date: string
  status: DeliveryStatus
  tracking_number: string | null
  carrier: string | null
  received_by: string | null
  received_at: string | null
  notes: string | null
}

/**
 * 交貨明細
 */
export interface DeliveryItem extends BaseFields {
  delivery_id: string
  po_item_id: string | null
  product_code: string
  product_name: string
  quantity: number
  accepted_qty: number
  rejected_qty: number
  rejection_reason: string | null
  notes: string | null
}

/**
 * 報價單狀態
 */
export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'expired'

/**
 * 報價單
 */
export interface Quotation extends BaseFields {
  quote_number: string
  customer_name: string
  customer_contact: string | null
  customer_email: string | null
  customer_phone: string | null
  customer_address: string | null
  quote_date: string
  valid_until: string | null
  status: QuotationStatus
  currency: string
  subtotal: number
  discount_percent: number
  discount_amount: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  payment_terms: string | null
  delivery_terms: string | null
  notes: string | null
  internal_notes: string | null
  sent_at: string | null
  viewed_at: string | null
  responded_at: string | null
}

/**
 * 報價單明細
 */
export interface QuotationItem extends BaseFields {
  quotation_id: string
  line_number: number
  product_id: string | null
  product_code: string
  product_name: string
  description: string | null
  unit: string
  quantity: number
  unit_price: number
  discount_percent: number
  amount: number
  notes: string | null
}

/**
 * 價格規則類型
 */
export type PricingRuleType = 'customer_grade' | 'quantity' | 'promotion'

/**
 * 價格規則
 */
export interface PricingRule extends BaseFields {
  name: string
  rule_type: PricingRuleType
  priority: number
  product_id: string | null
  product_category: string | null
  customer_grade: string | null
  min_quantity: number | null
  max_quantity: number | null
  discount_percent: number | null
  discount_amount: number | null
  fixed_price: number | null
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
  notes: string | null
}

/**
 * 階梯定價
 */
export interface PricingTier extends BaseFields {
  pricing_rule_id: string
  tier_number: number
  min_quantity: number
  max_quantity: number | null
  discount_percent: number | null
  discount_amount: number | null
  fixed_unit_price: number | null
  description: string | null
}

/**
 * 價格計算結果
 */
export interface PriceCalculationResult {
  original_price: number
  tier_applied: number | null
  discount_percent: number
  discount_amount: number
  final_unit_price: number
  final_total: number
  tier_description: string | null
}

// ============================================
// 客戶與信用管理
// ============================================

/**
 * 客戶等級
 */
export type CustomerGrade = 'VIP' | 'A' | 'B' | 'C' | 'NEW'

/**
 * 客戶狀態
 */
export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'blocked'

/**
 * 客戶
 */
export interface Customer extends BaseFields {
  code: string
  name: string
  short_name: string | null
  tax_id: string | null
  contact_person: string | null
  phone: string | null
  mobile: string | null
  email: string | null
  address: string | null
  billing_address: string | null
  shipping_address: string | null
  credit_limit: number
  current_balance: number
  available_credit: number
  payment_terms: number
  credit_hold: boolean
  credit_hold_reason: string | null
  grade: CustomerGrade
  status: CustomerStatus
  total_orders: number
  total_amount: number
  last_order_date: string | null
  notes: string | null
}

/**
 * 信用交易類型
 */
export type CreditTransactionType = 'order' | 'payment' | 'refund' | 'adjustment' | 'write_off'

/**
 * 信用交易記錄
 */
export interface CreditTransaction extends BaseFields {
  customer_id: string
  transaction_type: CreditTransactionType
  reference_type: string | null
  reference_id: string | null
  reference_number: string | null
  amount: number
  balance_before: number
  balance_after: number
  transaction_date: string
  due_date: string | null
  paid_date: string | null
  description: string | null
  notes: string | null
  processed_by: string | null
}

/**
 * 信用檢查結果
 */
export interface CreditCheckResult {
  customerId: string
  customerName: string
  creditLimit: number
  currentBalance: number
  availableCredit: number
  orderAmount: number
  passed: boolean
  exceedsLimit: boolean
  exceedsAmount: number
  creditHold: boolean
  holdReason: string | null
  warnings: string[]
}

// ============================================
// 合約管理
// ============================================

/**
 * 合約類型
 */
export type ContractType = 'supplier' | 'customer' | 'partner'

/**
 * 合約狀態
 */
export type ContractStatus = 'draft' | 'pending' | 'active' | 'expiring' | 'expired' | 'terminated' | 'renewed'

/**
 * 合約
 */
export interface Contract extends BaseFields {
  contract_number: string
  contract_type: ContractType
  title: string
  party_type: 'supplier' | 'customer'
  party_id: string | null
  party_name: string
  party_contact: string | null
  party_email: string | null
  party_phone: string | null
  start_date: string
  end_date: string
  auto_renew: boolean
  renewal_notice_days: number
  payment_terms: string | null
  delivery_terms: string | null
  warranty_terms: string | null
  penalty_terms: string | null
  special_terms: string | null
  contract_value: number | null
  currency: string
  status: ContractStatus
  approved_by: string | null
  approved_at: string | null
  terminated_by: string | null
  terminated_at: string | null
  termination_reason: string | null
  attachment_urls: string[] | null
  notes: string | null
}

/**
 * 合約明細
 */
export interface ContractItem extends BaseFields {
  contract_id: string
  line_number: number
  product_id: string | null
  product_code: string
  product_name: string
  unit: string
  contracted_price: number
  min_quantity: number | null
  max_quantity: number | null
  valid_from: string | null
  valid_until: string | null
  notes: string | null
}

// ============================================
// 批發詢價
// ============================================

/**
 * 批發詢價狀態
 */
export type WholesaleInquiryStatus = 'submitted' | 'reviewing' | 'quoted' | 'accepted' | 'rejected' | 'expired' | 'cancelled'

/**
 * 批發詢價單
 */
export interface WholesaleInquiry extends BaseFields {
  inquiry_number: string
  customer_name: string
  customer_contact: string | null
  customer_email: string
  customer_phone: string | null
  customer_company: string | null
  customer_grade: string | null
  status: WholesaleInquiryStatus
  inquiry_date: string
  expected_delivery_date: string | null
  total_estimated_amount: number | null
  quoted_amount: number | null
  valid_until: string | null
  notes: string | null
  internal_notes: string | null
  response_notes: string | null
  submitted_at: string | null
  reviewed_at: string | null
  quoted_at: string | null
  responded_at: string | null
  quoted_by: string | null
  quotation_id: string | null
}

/**
 * 批發詢價明細
 */
export interface WholesaleInquiryItem extends BaseFields {
  inquiry_id: string
  line_number: number
  product_id: string | null
  product_code: string
  product_name: string
  requested_quantity: number
  unit: string
  target_price: number | null
  quoted_unit_price: number | null
  quoted_amount: number | null
  availability: 'available' | 'limited' | 'unavailable' | null
  lead_time_days: number | null
  notes: string | null
}

/**
 * Supabase Database 類型
 */
export interface Database {
  dealer: {
    Tables: {
      suppliers: {
        Row: Supplier
        Insert: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<Supplier, 'id'>>
      }
      supplier_scores: {
        Row: SupplierScore
        Insert: Omit<SupplierScore, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<SupplierScore, 'id'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<Product, 'id'>>
      }
      purchase_orders: {
        Row: PurchaseOrder
        Insert: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<PurchaseOrder, 'id'>>
      }
      purchase_order_items: {
        Row: PurchaseOrderItem
        Insert: Omit<PurchaseOrderItem, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<PurchaseOrderItem, 'id'>>
      }
      deliveries: {
        Row: Delivery
        Insert: Omit<Delivery, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<Delivery, 'id'>>
      }
      delivery_items: {
        Row: DeliveryItem
        Insert: Omit<DeliveryItem, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<DeliveryItem, 'id'>>
      }
      quotations: {
        Row: Quotation
        Insert: Omit<Quotation, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<Quotation, 'id'>>
      }
      quotation_items: {
        Row: QuotationItem
        Insert: Omit<QuotationItem, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<QuotationItem, 'id'>>
      }
      pricing_rules: {
        Row: PricingRule
        Insert: Omit<PricingRule, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<PricingRule, 'id'>>
      }
      pricing_tiers: {
        Row: PricingTier
        Insert: Omit<PricingTier, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<PricingTier, 'id'>>
      }
      customers: {
        Row: Customer
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<Customer, 'id'>>
      }
      credit_transactions: {
        Row: CreditTransaction
        Insert: Omit<CreditTransaction, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<CreditTransaction, 'id'>>
      }
      contracts: {
        Row: Contract
        Insert: Omit<Contract, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<Contract, 'id'>>
      }
      contract_items: {
        Row: ContractItem
        Insert: Omit<ContractItem, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<ContractItem, 'id'>>
      }
      wholesale_inquiries: {
        Row: WholesaleInquiry
        Insert: Omit<WholesaleInquiry, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<WholesaleInquiry, 'id'>>
      }
      wholesale_inquiry_items: {
        Row: WholesaleInquiryItem
        Insert: Omit<WholesaleInquiryItem, 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: Partial<Omit<WholesaleInquiryItem, 'id'>>
      }
    }
  }
}
