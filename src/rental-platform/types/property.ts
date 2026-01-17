// 房源類型定義

export type PropertyType =
  | 'apartment'     // 公寓
  | 'suite'         // 套房
  | 'studio'        // 雅房
  | 'whole_floor'   // 整層住家
  | 'townhouse'     // 透天厝
  | 'villa'         // 別墅
  | 'office'        // 辦公室
  | 'store';        // 店面

export type RentalStatus =
  | 'available'       // 可出租
  | 'reserved'        // 已預訂
  | 'rented'          // 已出租
  | 'pending_review'  // 待審核
  | 'rejected'        // 已拒絕
  | 'expired';        // 已過期

export interface PropertyLocation {
  city: string;
  district: string;
  address: string;
  lat?: number;
  lng?: number;
  nearbyMRT?: string[];
}

export interface PropertyLayout {
  bedrooms: number;      // 房
  livingRooms: number;   // 廳
  bathrooms: number;     // 衛
  balconies: number;     // 陽台
}

export interface PropertyPricing {
  rentPrice: number;         // 月租金
  deposit: number;           // 押金（月數）
  managementFee?: number;    // 管理費
  includedUtilities: boolean; // 是否包水電
}

export interface PropertyConditions {
  minLeaseTerm: number;        // 最短租期（月）
  availableDate: string;       // 可入住日
  allowPets: boolean;          // 可養寵物
  allowCooking: boolean;       // 可開伙
  genderRestriction?: 'male' | 'female' | null; // 性別限制
}

export interface RentalProperty {
  id: string;
  landlordId: string;
  title: string;
  description?: string;

  location: PropertyLocation;
  propertyType: PropertyType;
  floor?: number;
  totalFloors?: number;
  area: number;           // 坪數
  buildingAge?: number;   // 屋齡

  layout: PropertyLayout;
  pricing: PropertyPricing;
  conditions: PropertyConditions;

  amenities: string[];    // 設備設施
  furniture: string[];    // 傢俱
  images: string[];       // 圖片 URLs
  videoUrl?: string;

  status: RentalStatus;
  viewCount: number;
  favoriteCount: number;

  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expiresAt?: string;

  // 關聯數據（前端使用）
  landlord?: RentalUser;
  isFavorited?: boolean;
}

// 房源搜尋篩選條件
export interface PropertySearchFilters {
  keyword?: string;
  city?: string;
  district?: string[];
  propertyType?: PropertyType[];
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  bedrooms?: number[];
  amenities?: string[];
  nearbyMRT?: string[];
  allowPets?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  pageSize?: number;
}

// 搜尋結果
export interface PropertySearchResult {
  properties: RentalProperty[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 類型標籤映射
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: '公寓',
  suite: '獨立套房',
  studio: '雅房',
  whole_floor: '整層住家',
  townhouse: '透天厝',
  villa: '別墅',
  office: '辦公室',
  store: '店面',
};

export const RENTAL_STATUS_LABELS: Record<RentalStatus, string> = {
  available: '可出租',
  reserved: '已預訂',
  rented: '已出租',
  pending_review: '待審核',
  rejected: '已拒絕',
  expired: '已過期',
};

export const RENTAL_STATUS_COLORS: Record<RentalStatus, string> = {
  available: 'bg-green-100 text-green-700',
  reserved: 'bg-yellow-100 text-yellow-700',
  rented: 'bg-gray-100 text-gray-700',
  pending_review: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
};

// 用戶類型定義
export type RentalUserRole = 'tenant' | 'landlord' | 'agent' | 'admin';

export interface RentalUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: RentalUserRole;

  // 房東/仲介專用
  companyName?: string;
  licenseNumber?: string;
  verified: boolean;

  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 收藏
export interface RentalFavorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

// 聯繫/詢問
export type InquiryStatus = 'pending' | 'replied' | 'closed';

export interface RentalInquiry {
  id: string;
  propertyId: string;
  userId: string;
  message: string;
  contactPhone?: string;
  preferredTime?: string;
  status: InquiryStatus;
  createdAt: string;
}
