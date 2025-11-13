import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// 混合使用者介面（支援 Supabase 和本地）
interface LocalUser {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | LocalUser | null;
  session: Session | any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isUsingSupabase: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 內建帳號（可以在這裡新增更多）
const BUILT_IN_ACCOUNTS = [
  { email: 'admin', password: 'mefu69563216', username: 'Admin' },
  { email: 'admin@test.com', password: 'mefu69563216', username: 'Admin' },
  { email: 'test', password: '123456', username: 'Test User' },
];

// 檢查 Supabase 是否可用
async function checkSupabaseAvailable(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    // 如果能成功獲取 session（即使是 null），代表 Supabase 可用
    return !error;
  } catch (e) {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | LocalUser | null>(null);
  const [session, setSession] = useState<Session | any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);

  useEffect(() => {
    // 先嘗試使用 Supabase
    const initAuth = async () => {
      const supabaseAvailable = await checkSupabaseAvailable();

      if (supabaseAvailable) {
        // Supabase 可用，使用 Supabase 認證
        setIsUsingSupabase(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        // 監聽認證狀態變化
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        // Supabase 不可用，使用本地認證
        setIsUsingSupabase(false);
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setSession({ user: parsedUser });
          } catch (e) {
            localStorage.removeItem('currentUser');
          }
        }
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    // 優先檢查內建帳號（本地模式）
    const builtInAccount = BUILT_IN_ACCOUNTS.find(
      acc => acc.email === email && acc.password === password
    );

    if (builtInAccount) {
      const user: LocalUser = {
        id: builtInAccount.email,
        email: builtInAccount.email,
        username: builtInAccount.username,
      };
      setUser(user);
      setSession({ user });
      localStorage.setItem('currentUser', JSON.stringify(user));
      setIsUsingSupabase(false);
      return { error: null };
    }

    // 如果 Supabase 可用，嘗試使用 Supabase 登入
    if (isUsingSupabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    }

    // 本地模式：檢查已註冊的帳號（從 localStorage）
    const registeredAccounts = JSON.parse(localStorage.getItem('registeredAccounts') || '[]');
    const registeredAccount = registeredAccounts.find(
      (acc: any) => acc.email === email && acc.password === password
    );

    if (registeredAccount) {
      const user: LocalUser = {
        id: registeredAccount.email,
        email: registeredAccount.email,
        username: registeredAccount.username,
      };
      setUser(user);
      setSession({ user });
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { error: null };
    }

    return { error: { message: '帳號或密碼錯誤' } };
  };

  const signUp = async (email: string, password: string, username: string) => {
    // 如果 Supabase 可用，使用 Supabase 註冊
    if (isUsingSupabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      return { error };
    }

    // 本地模式：檢查是否已存在
    const registeredAccounts = JSON.parse(localStorage.getItem('registeredAccounts') || '[]');
    const exists = registeredAccounts.some((acc: any) => acc.email === email);

    if (exists) {
      return { error: { message: '此帳號已被註冊' } };
    }

    // 新增到已註冊帳號
    const newAccount = { email, password, username };
    registeredAccounts.push(newAccount);
    localStorage.setItem('registeredAccounts', JSON.stringify(registeredAccounts));

    // 自動登入
    const user: LocalUser = {
      id: email,
      email,
      username,
    };
    setUser(user);
    setSession({ user });
    localStorage.setItem('currentUser', JSON.stringify(user));

    return { error: null };
  };

  const signOut = async () => {
    if (isUsingSupabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isUsingSupabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
