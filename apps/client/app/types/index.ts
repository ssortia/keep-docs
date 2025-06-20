export interface User {
  id: number;
  fullName: string | null;
  email: string;
  roleId: number | null;
  blocked: boolean;
  role?: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  fullName?: string;
  email: string;
  password?: string;
  roleId?: number;
  blocked?: boolean;
}

export interface PermissionFormData {
  name: string;
  description?: string;
}

export interface RoleFormData {
  name: string;
  description?: string;
  permissions?: number[];
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
}
