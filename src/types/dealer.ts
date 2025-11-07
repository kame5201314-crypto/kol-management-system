// 經銷商相關型別定義

export interface Dealer {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  salesAmount: number;
  orderAmount: number;
  paymentDate: string;
  creditLimit: number;
  commissionRate: number;
  dealerLevel?: 'VIP' | 'A' | 'B' | 'C';
}

export interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  specification: string;
  unit: string;
  costPrice: number;
  listPrice: number;
  stockQty: number;
  image?: string;
}

export interface PriceRule {
  id: number;
  productId: number;
  dealerLevel: 'VIP' | 'A' | 'B' | 'C' | 'ALL';
  price: number;
  minQty?: number;
  maxQty?: number;
}

export interface Quotation {
  id: number;
  quotationNo: string;
  dealerId: number;
  dealerName: string;
  items: QuotationItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'confirmed' | 'rejected' | 'expired';
  validUntil: string;
  createdAt: string;
  notes?: string;
}

export interface QuotationItem {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  lineTotal: number;
}
