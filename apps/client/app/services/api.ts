'use client';

const API_URL = 'http://localhost:3333/api';

interface Role {
  id: number;
  name: string;
  description: string | null;
}

interface Permission {
  id: number;
  name: string;
  description: string | null;
}

interface User {
  id: number;
  email: string;
  fullName: string | null;
  role?: Role | null;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class ApiError extends Error {
  status: number;

  data: any;

  constructor(message: string, status: number, data: any = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    // @ts-ignore
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(
      data?.message || 'Произошла ошибка при выполнении запроса',
      response.status,
      data,
    );
  }

  return data as T;
}

interface UserPermissions {
  role: string;
  permissions: string[];
}

export const authApi = {
  register: (data: RegisterData): Promise<AuthResponse> =>
    fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginData): Promise<AuthResponse> =>
    fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: (): Promise<void> =>
    fetchApi<void>('/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: (): Promise<{ user: User }> => fetchApi<{ user: User }>('/auth/me'),

  getUserPermissions: (): Promise<UserPermissions> =>
    fetchApi<UserPermissions>('/auth/permissions'),
};

export const authUtils = {
  setAuth: (data: AuthResponse): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      document.cookie = `authToken=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
    }
  },

  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
    }
  },

  clearAuth: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken');
    }
    return false;
  },

  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  },
};

const api = {
  get: <T>(endpoint: string): Promise<T> => fetchApi<T>(endpoint),
  post: <T>(endpoint: string, data?: any): Promise<T> => 
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T>(endpoint: string, data?: any): Promise<T> => 
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(endpoint: string): Promise<T> => 
    fetchApi<T>(endpoint, { method: 'DELETE' }),
};

export default api;
