// 用戶服務
import { RentalUser, RentalUserRole } from '../types';

const STORAGE_KEYS = {
  USERS: 'rental_users',
  CURRENT_USER: 'rental_current_user',
};

// 初始化模擬用戶
const initializeUsers = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const mockUsers: RentalUser[] = [
      {
        id: 'user-1',
        email: 'demo@example.com',
        fullName: '王小明',
        phone: '0912-345-678',
        role: 'tenant',
        verified: true,
        isActive: true,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-15T08:00:00Z',
      },
      {
        id: 'landlord-demo',
        email: 'landlord@example.com',
        fullName: '陳房東',
        phone: '0923-456-789',
        role: 'landlord',
        verified: true,
        isActive: true,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-15T08:00:00Z',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
};

// 獲取所有用戶
const getAllUsers = (): RentalUser[] => {
  initializeUsers();
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

// 保存用戶
const saveUsers = (users: RentalUser[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// 生成唯一 ID
const generateId = (): string => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: RentalUserRole;
}

export interface LoginResult {
  success: boolean;
  user?: RentalUser;
  error?: string;
}

export const userService = {
  // 登入
  login: (email: string, password: string): LoginResult => {
    const users = getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // 開發模式：任何密碼都可以登入
    if (!user) {
      return {
        success: false,
        error: '帳號不存在',
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: '帳號已被停用',
      };
    }

    // 更新最後登入時間
    user.lastLoginAt = new Date().toISOString();
    saveUsers(users);

    // 保存當前用戶
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

    return {
      success: true,
      user,
    };
  },

  // 註冊
  register: (input: RegisterInput): LoginResult => {
    const users = getAllUsers();

    // 檢查 email 是否已存在
    if (users.some(u => u.email.toLowerCase() === input.email.toLowerCase())) {
      return {
        success: false,
        error: '此 Email 已被註冊',
      };
    }

    const now = new Date().toISOString();
    const newUser: RentalUser = {
      id: generateId(),
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
      role: input.role || 'tenant',
      verified: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };

    users.push(newUser);
    saveUsers(users);

    // 保存當前用戶
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

    return {
      success: true,
      user: newUser,
    };
  },

  // 登出
  logout: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // 獲取當前用戶
  getCurrentUser: (): RentalUser | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  // 檢查是否已登入
  isAuthenticated: (): boolean => {
    return !!userService.getCurrentUser();
  },

  // 更新用戶資料
  updateProfile: (userId: string, data: Partial<RentalUser>): RentalUser | null => {
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return null;

    const updatedUser: RentalUser = {
      ...users[index],
      ...data,
      id: users[index].id, // 確保 ID 不變
      email: users[index].email, // 確保 email 不變
      updatedAt: new Date().toISOString(),
    };

    users[index] = updatedUser;
    saveUsers(users);

    // 如果是當前用戶，也更新當前用戶
    const currentUser = userService.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    }

    return updatedUser;
  },

  // 獲取用戶資料
  getById: (id: string): RentalUser | undefined => {
    return getAllUsers().find(u => u.id === id);
  },

  // 切換用戶角色（房東/租客）
  switchRole: (userId: string, role: RentalUserRole): RentalUser | null => {
    return userService.updateProfile(userId, { role });
  },

  // 驗證用戶
  verifyUser: (userId: string): RentalUser | null => {
    return userService.updateProfile(userId, { verified: true });
  },
};
