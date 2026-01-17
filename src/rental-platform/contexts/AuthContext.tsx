import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RentalUser, RentalUserRole } from '../types';
import { userService, RegisterInput } from '../services/userService';

interface AuthContextType {
  user: RentalUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<RentalUser>) => Promise<RentalUser | null>;
  switchRole: (role: RentalUserRole) => Promise<RentalUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<RentalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：從 localStorage 恢復用戶狀態
  useEffect(() => {
    const currentUser = userService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  // 登入
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // 模擬網路延遲
      await new Promise(resolve => setTimeout(resolve, 500));

      const result = userService.login(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    } finally {
      setIsLoading(false);
    }
  };

  // 註冊
  const register = async (input: RegisterInput): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // 模擬網路延遲
      await new Promise(resolve => setTimeout(resolve, 500));

      const result = userService.register(input);
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    } finally {
      setIsLoading(false);
    }
  };

  // 登出
  const logout = () => {
    userService.logout();
    setUser(null);
  };

  // 更新用戶資料
  const updateProfile = async (data: Partial<RentalUser>): Promise<RentalUser | null> => {
    if (!user) return null;

    const updatedUser = userService.updateProfile(user.id, data);
    if (updatedUser) {
      setUser(updatedUser);
    }
    return updatedUser;
  };

  // 切換角色
  const switchRole = async (role: RentalUserRole): Promise<RentalUser | null> => {
    if (!user) return null;

    const updatedUser = userService.switchRole(user.id, role);
    if (updatedUser) {
      setUser(updatedUser);
    }
    return updatedUser;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    switchRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
