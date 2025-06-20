'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, authUtils } from '../services/api';

interface User {
  id: number;
  email: string;
  fullName: string | null;
  role?: {
    id: number;
    name: string;
    description: string | null;
  } | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userPermissions: string[];
  userRole: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      if (authUtils.isAuthenticated()) {
        try {
          const { user } = await authApi.getCurrentUser();
          setUser(user);

          const { permissions, role } = await authApi.getUserPermissions();
          setUserPermissions(permissions);
          setUserRole(role);
        } catch (error: any) {
          authUtils.clearAuth();
          setUser(null);
          setUserPermissions([]);
          setUserRole(null);
          
          if (error?.response?.status === 403) {
            console.error('Аккаунт заблокирован');
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      authUtils.setAuth(response);
      setUser(response.user);

      const { permissions, role } = await authApi.getUserPermissions();
      setUserPermissions(permissions);
      setUserRole(role);

      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      await authApi.register(data);
      router.push('/login?registered=true');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      authUtils.clearAuth();
      router.push('/login');

      // Отложенный вызов setState, чтобы избежать ререндера компонентов,
      // зависящих от этих переменных, до редиректа
      setTimeout(() => {
        setUser(null);
        setUserPermissions([]);
        setUserRole(null);
        setIsLoading(false);
      }, 50);
    }
  };

  const setToken = async (token: string) => {
    setIsLoading(true);
    try {
      authUtils.setToken(token);

      const { user } = await authApi.getCurrentUser();
      setUser(user);
      const { permissions, role } = await authApi.getUserPermissions();
      setUserPermissions(permissions);
      setUserRole(role);
    } catch (error) {
      console.error('OAuth setToken error:', error);
      authUtils.clearAuth();
      setUser(null);
      setUserPermissions([]);
      setUserRole(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string) => userPermissions.includes(permission);

  const hasRole = (role: string) => userRole === role;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        userPermissions,
        userRole,
        login,
        register,
        logout,
        setToken,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
