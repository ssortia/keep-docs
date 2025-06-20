import { useState, useEffect } from 'react';
import { App } from 'antd';
import api from '../services/api';
import type { Permission, PermissionFormData } from '../types';

interface PermissionsResponse {
  data: Permission[];
  meta?: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
}

export const usePermissions = () => {
  const { message } = App.useApp();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchPermissions = async (page = 1, limit = 20, search = '') => {
    try {
      setLoading(true);
      setCurrentSearch(search);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      const response = await api.get<PermissionsResponse>(`/permissions?${params.toString()}`);
      
      // Handle both paginated and non-paginated responses
      if (response.meta) {
        setPermissions(response.data || []);
        setPagination({
          current: response.meta.currentPage,
          pageSize: response.meta.perPage,
          total: response.meta.total,
        });
      } else {
        // Fallback for non-paginated response
        const permissionsData = Array.isArray(response) ? response : (response.data || []);
        setPermissions(permissionsData);
        setPagination({
          current: 1,
          pageSize: permissionsData.length,
          total: permissionsData.length,
        });
      }
    } catch (error) {
      message.error((error as Error)?.message || 'Ошибка при загрузке разрешений');
    } finally {
      setLoading(false);
    }
  };

  const createPermission = async (permissionData: PermissionFormData) => {
    try {
      await api.post('/permissions', permissionData);
      message.success('Разрешение создано');
      await fetchPermissions(pagination.current, pagination.pageSize, currentSearch);
    } catch (error) {
      message.error((error as Error)?.message || 'Ошибка при создании разрешения');
      throw error;
    }
  };

  const updatePermission = async (id: number, permissionData: PermissionFormData) => {
    try {
      await api.put(`/permissions/${id}`, permissionData);
      message.success('Разрешение обновлено');
      await fetchPermissions(pagination.current, pagination.pageSize, currentSearch);
    } catch (error) {
      message.error((error as Error)?.message || 'Ошибка при обновлении разрешения');
      throw error;
    }
  };

  const deletePermission = async (id: number) => {
    try {
      await api.delete(`/permissions/${id}`);
      message.success('Разрешение удалено');
      await fetchPermissions(pagination.current, pagination.pageSize, currentSearch);
    } catch (error) {
      message.error((error as Error)?.message || 'Ошибка при удалении разрешения');
      throw error;
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    fetchPermissions(page, pageSize || pagination.pageSize);
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    loading,
    pagination,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    handlePageChange,
  };
};
