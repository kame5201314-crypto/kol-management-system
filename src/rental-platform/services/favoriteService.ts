// 收藏服務
import { RentalFavorite, RentalProperty } from '../types';
import { propertyService } from './propertyService';

const STORAGE_KEY = 'rental_favorites';

// 獲取所有收藏
const getAllFavorites = (): RentalFavorite[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// 保存收藏
const saveFavorites = (favorites: RentalFavorite[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
};

// 生成唯一 ID
const generateId = (): string => {
  return `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const favoriteService = {
  // 獲取用戶的收藏列表
  getByUser: (userId: string): RentalProperty[] => {
    const favorites = getAllFavorites().filter(f => f.userId === userId);
    const properties: RentalProperty[] = [];

    favorites.forEach(fav => {
      const property = propertyService.getById(fav.propertyId);
      if (property) {
        properties.push({
          ...property,
          isFavorited: true,
        });
      }
    });

    return properties;
  },

  // 獲取用戶收藏的房源 ID 列表
  getFavoriteIds: (userId: string): string[] => {
    return getAllFavorites()
      .filter(f => f.userId === userId)
      .map(f => f.propertyId);
  },

  // 添加收藏
  add: (userId: string, propertyId: string): RentalFavorite => {
    const favorites = getAllFavorites();

    // 檢查是否已收藏
    const existing = favorites.find(f => f.userId === userId && f.propertyId === propertyId);
    if (existing) return existing;

    const newFavorite: RentalFavorite = {
      id: generateId(),
      userId,
      propertyId,
      createdAt: new Date().toISOString(),
    };

    favorites.push(newFavorite);
    saveFavorites(favorites);
    return newFavorite;
  },

  // 移除收藏
  remove: (userId: string, propertyId: string): boolean => {
    const favorites = getAllFavorites();
    const filtered = favorites.filter(
      f => !(f.userId === userId && f.propertyId === propertyId)
    );

    if (filtered.length === favorites.length) return false;
    saveFavorites(filtered);
    return true;
  },

  // 切換收藏狀態
  toggle: (userId: string, propertyId: string): boolean => {
    if (favoriteService.isFavorited(userId, propertyId)) {
      favoriteService.remove(userId, propertyId);
      return false;
    } else {
      favoriteService.add(userId, propertyId);
      return true;
    }
  },

  // 檢查是否已收藏
  isFavorited: (userId: string, propertyId: string): boolean => {
    const favorites = getAllFavorites();
    return favorites.some(f => f.userId === userId && f.propertyId === propertyId);
  },

  // 獲取收藏數量
  getCount: (userId: string): number => {
    return getAllFavorites().filter(f => f.userId === userId).length;
  },

  // 清空用戶收藏
  clearByUser: (userId: string): void => {
    const favorites = getAllFavorites().filter(f => f.userId !== userId);
    saveFavorites(favorites);
  },
};
