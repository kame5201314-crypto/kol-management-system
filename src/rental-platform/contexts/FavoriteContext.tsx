import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RentalProperty } from '../types';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from './AuthContext';

interface FavoriteContextType {
  favorites: RentalProperty[];
  favoriteIds: string[];
  isLoading: boolean;
  isFavorited: (propertyId: string) => boolean;
  toggleFavorite: (propertyId: string) => void;
  addFavorite: (propertyId: string) => void;
  removeFavorite: (propertyId: string) => void;
  refreshFavorites: () => void;
  favoriteCount: number;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

interface FavoriteProviderProps {
  children: ReactNode;
}

export function FavoriteProvider({ children }: FavoriteProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<RentalProperty[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 當用戶變化時重新載入收藏
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds([]);
    }
  }, [user, isAuthenticated]);

  // 刷新收藏列表
  const refreshFavorites = () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userFavorites = favoriteService.getByUser(user.id);
      const ids = favoriteService.getFavoriteIds(user.id);
      setFavorites(userFavorites);
      setFavoriteIds(ids);
    } finally {
      setIsLoading(false);
    }
  };

  // 檢查是否已收藏
  const isFavorited = (propertyId: string): boolean => {
    return favoriteIds.includes(propertyId);
  };

  // 切換收藏狀態
  const toggleFavorite = (propertyId: string) => {
    if (!user) return;

    const isNowFavorited = favoriteService.toggle(user.id, propertyId);

    if (isNowFavorited) {
      setFavoriteIds(prev => [...prev, propertyId]);
    } else {
      setFavoriteIds(prev => prev.filter(id => id !== propertyId));
      setFavorites(prev => prev.filter(p => p.id !== propertyId));
    }
  };

  // 添加收藏
  const addFavorite = (propertyId: string) => {
    if (!user || isFavorited(propertyId)) return;

    favoriteService.add(user.id, propertyId);
    setFavoriteIds(prev => [...prev, propertyId]);
    refreshFavorites();
  };

  // 移除收藏
  const removeFavorite = (propertyId: string) => {
    if (!user) return;

    favoriteService.remove(user.id, propertyId);
    setFavoriteIds(prev => prev.filter(id => id !== propertyId));
    setFavorites(prev => prev.filter(p => p.id !== propertyId));
  };

  const value: FavoriteContextType = {
    favorites,
    favoriteIds,
    isLoading,
    isFavorited,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    refreshFavorites,
    favoriteCount: favoriteIds.length,
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites(): FavoriteContextType {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
}
