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
    }
  }
}
