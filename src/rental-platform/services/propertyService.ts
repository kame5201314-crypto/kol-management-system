// 房源服務
import {
  RentalProperty,
  PropertySearchFilters,
  PropertySearchResult,
  RentalUser,
} from '../types';
import { mockProperties, mockLandlords, getPropertyWithLandlord } from '../data/mockProperties';

const STORAGE_KEYS = {
  PROPERTIES: 'rental_properties',
  FAVORITES: 'rental_favorites',
};

// 初始化數據
const initializeData = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(mockProperties));
  }
};

// 獲取所有房源
const getAllProperties = (): RentalProperty[] => {
  initializeData();
  const data = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
  return data ? JSON.parse(data) : [];
};

// 保存房源
const saveProperties = (properties: RentalProperty[]): void => {
  localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
};

// 生成唯一 ID
const generateId = (): string => {
  return `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const propertyService = {
  // 搜尋房源
  search: (filters: PropertySearchFilters): PropertySearchResult => {
    const allProperties = getAllProperties();
    let filtered = allProperties.filter(p => p.status === 'available');

    // 關鍵字搜尋
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(keyword) ||
        p.description?.toLowerCase().includes(keyword) ||
        p.location.address.toLowerCase().includes(keyword) ||
        p.location.district.toLowerCase().includes(keyword)
      );
    }

    // 城市篩選
    if (filters.city) {
      filtered = filtered.filter(p => p.location.city === filters.city);
    }

    // 區域篩選
    if (filters.district && filters.district.length > 0) {
      filtered = filtered.filter(p => filters.district!.includes(p.location.district));
    }

    // 房型篩選
    if (filters.propertyType && filters.propertyType.length > 0) {
      filtered = filtered.filter(p => filters.propertyType!.includes(p.propertyType));
    }

    // 租金範圍
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(p => p.pricing.rentPrice >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(p => p.pricing.rentPrice <= filters.priceMax!);
    }

    // 坪數範圍
    if (filters.areaMin !== undefined) {
      filtered = filtered.filter(p => p.area >= filters.areaMin!);
    }
    if (filters.areaMax !== undefined) {
      filtered = filtered.filter(p => p.area <= filters.areaMax!);
    }

    // 格局篩選
    if (filters.bedrooms && filters.bedrooms.length > 0) {
      filtered = filtered.filter(p => {
        if (filters.bedrooms!.includes(4)) {
          return filters.bedrooms!.includes(p.layout.bedrooms) || p.layout.bedrooms >= 4;
        }
        return filters.bedrooms!.includes(p.layout.bedrooms);
      });
    }

    // 設備篩選
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(p =>
        filters.amenities!.every(a => p.amenities.includes(a))
      );
    }

    // 捷運站篩選
    if (filters.nearbyMRT && filters.nearbyMRT.length > 0) {
      filtered = filtered.filter(p =>
        p.location.nearbyMRT?.some(mrt =>
          filters.nearbyMRT!.some(f => mrt.includes(f))
        )
      );
    }

    // 寵物友善
    if (filters.allowPets !== undefined) {
      filtered = filtered.filter(p => p.conditions.allowPets === filters.allowPets);
    }

    // 排序
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.pricing.rentPrice - b.pricing.rentPrice);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.pricing.rentPrice - a.pricing.rentPrice);
        break;
      case 'popular':
        filtered.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // 分頁
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 12;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedProperties = filtered.slice(startIndex, startIndex + pageSize);

    // 附帶房東資訊
    const propertiesWithLandlord = paginatedProperties.map(getPropertyWithLandlord);

    return {
      properties: propertiesWithLandlord,
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  // 根據 ID 獲取房源
  getById: (id: string): RentalProperty | undefined => {
    const properties = getAllProperties();
    const property = properties.find(p => p.id === id);
    return property ? getPropertyWithLandlord(property) : undefined;
  },

  // 獲取熱門房源
  getPopular: (limit: number = 6): RentalProperty[] => {
    const properties = getAllProperties()
      .filter(p => p.status === 'available')
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
    return properties.map(getPropertyWithLandlord);
  },

  // 獲取最新房源
  getLatest: (limit: number = 6): RentalProperty[] => {
    const properties = getAllProperties()
      .filter(p => p.status === 'available')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    return properties.map(getPropertyWithLandlord);
  },

  // 獲取推薦房源（類似房源）
  getRecommended: (propertyId: string, limit: number = 4): RentalProperty[] => {
    const properties = getAllProperties();
    const currentProperty = properties.find(p => p.id === propertyId);
    if (!currentProperty) return [];

    // 根據相同區域和價格範圍推薦
    const priceRange = currentProperty.pricing.rentPrice * 0.3;
    const recommended = properties
      .filter(p =>
        p.id !== propertyId &&
        p.status === 'available' &&
        (p.location.city === currentProperty.location.city ||
         p.propertyType === currentProperty.propertyType) &&
        Math.abs(p.pricing.rentPrice - currentProperty.pricing.rentPrice) <= priceRange
      )
      .slice(0, limit);
    return recommended.map(getPropertyWithLandlord);
  },

  // 獲取地區統計
  getAreaStats: (city?: string): { city: string; district: string; count: number }[] => {
    const properties = getAllProperties().filter(p => p.status === 'available');
    const stats: Record<string, Record<string, number>> = {};

    properties.forEach(p => {
      if (!city || p.location.city === city) {
        if (!stats[p.location.city]) {
          stats[p.location.city] = {};
        }
        if (!stats[p.location.city][p.location.district]) {
          stats[p.location.city][p.location.district] = 0;
        }
        stats[p.location.city][p.location.district]++;
      }
    });

    const result: { city: string; district: string; count: number }[] = [];
    Object.entries(stats).forEach(([city, districts]) => {
      Object.entries(districts).forEach(([district, count]) => {
        result.push({ city, district, count });
      });
    });

    return result.sort((a, b) => b.count - a.count);
  },

  // 創建房源
  create: (data: Omit<RentalProperty, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'favoriteCount' | 'status'>): RentalProperty => {
    const properties = getAllProperties();
    const now = new Date().toISOString();
    const newProperty: RentalProperty = {
      ...data,
      id: generateId(),
      status: 'pending_review',
      viewCount: 0,
      favoriteCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    properties.push(newProperty);
    saveProperties(properties);
    return newProperty;
  },

  // 更新房源
  update: (id: string, data: Partial<RentalProperty>): RentalProperty | null => {
    const properties = getAllProperties();
    const index = properties.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProperty: RentalProperty = {
      ...properties[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    properties[index] = updatedProperty;
    saveProperties(properties);
    return updatedProperty;
  },

  // 刪除房源
  delete: (id: string): boolean => {
    const properties = getAllProperties();
    const filtered = properties.filter(p => p.id !== id);
    if (filtered.length === properties.length) return false;
    saveProperties(filtered);
    return true;
  },

  // 增加瀏覽次數
  incrementViewCount: (id: string): void => {
    const properties = getAllProperties();
    const property = properties.find(p => p.id === id);
    if (property) {
      property.viewCount++;
      saveProperties(properties);
    }
  },

  // 獲取房東的房源
  getByLandlord: (landlordId: string): RentalProperty[] => {
    return getAllProperties()
      .filter(p => p.landlordId === landlordId)
      .map(getPropertyWithLandlord);
  },

  // 獲取城市房源數量
  getCityPropertyCounts: (): Record<string, number> => {
    const properties = getAllProperties().filter(p => p.status === 'available');
    const counts: Record<string, number> = {};
    properties.forEach(p => {
      counts[p.location.city] = (counts[p.location.city] || 0) + 1;
    });
    return counts;
  },

  // 重置數據（開發用）
  reset: (): void => {
    localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
    initializeData();
  },
};

// 房東服務
export const landlordService = {
  getById: (id: string): RentalUser | undefined => {
    return mockLandlords.find(l => l.id === id);
  },

  getAll: (): RentalUser[] => {
    return mockLandlords;
  },
};
