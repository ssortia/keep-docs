import { useState, useEffect } from 'react';
import { App } from 'antd';
import api from '../services/api';
import type { User, UserFormData } from '../types';

interface UsersResponse {
  data: User[];
  meta?: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
}

export const useUsers = () => {
  const { message } = App.useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchUsers = async (page = 1, limit = 20, search = '') => {
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
      
      const response = await api.get<UsersResponse>(`/users?${params.toString()}`);
      
      // Handle both paginated and non-paginated responses
      if (response.meta) {
        setUsers(response.data || []);
        setPagination({
          current: response.meta.currentPage,
          pageSize: response.meta.perPage,
          total: response.meta.total,
        });
      } else {
        // Fallback for non-paginated response
        const usersData = Array.isArray(response) ? response : (response.data || []);
        setUsers(usersData);
        setPagination({
          current: 1,
          pageSize: usersData.length,
          total: usersData.length,
        });
      }
    } catch (error) {
      message.error((error as Error)?.message || 'Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: UserFormData) => {
    try {
      await api.post('/users', userData);
      message.success('Пользователь создан');
      await fetchUsers(pagination.current, pagination.pageSize, currentSearch);
    } catch (error) {
      message.error((error as Error)?.message || 'Ошибка при создании пользователя');
      throw error;
    }
  };

  const updateUser = async (id: number, userData: UserFormData) => {
    try {
      await api.put(`/users/${id}`, userData);
      message.success('Пользователь обновлен');
      await fetchUsers(pagination.current, pagination.pageSize, currentSearch);
    } catch (error) {
      message.error((error as Error)?.message || 'Ошибка при обновлении пользователя');
      throw error;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      message.success('Пользователь удален');
      await fetchUsers(pagination.current, pagination.pageSize, currentSearch);
    } catch (error) {
      message.error((error as Error)?.message || 'Ошибка при удалении пользователя');
      throw error;
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    fetchUsers(page, pageSize || pagination.pageSize);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    handlePageChange,
  };
};
