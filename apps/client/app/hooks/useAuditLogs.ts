import { useState, useEffect, useCallback } from 'react';
import api from '@/app/services/api';
import { App } from 'antd';

export interface AuditLog {
  id: number;
  userId: number | null;
  user: {
    id: number;
    email: string;
    fullName: string;
  } | null;
  action: string;
  type: 'info' | 'warning' | 'error';
  ip: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  formattedDate: string;
}

export interface AuditLogFilters {
  type?: 'info' | 'warning' | 'error';
  action?: string;
  userId?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogSort {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogPagination {
  page?: number;
  limit?: number;
}

export interface AuditLogStats {
  totals: {
    total: number;
    info: number;
    warning: number;
    error: number;
    period: number;
  };
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ userId: number; user: any; count: number }>;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const useAuditLogs = () => {
  const { message } = App.useApp();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<AuditLogsResponse['meta'] | null>(null);

  const fetchAuditLogs = useCallback(async (
    filters: AuditLogFilters = {},
    sort: AuditLogSort = {},
    pagination: AuditLogPagination = {}
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      Object.entries(sort).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await api.get(`/admin/audit-logs?${params.toString()}`) as AuditLogsResponse;
      
      setAuditLogs(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      const errorMessage = (err as Error)?.message || 'Ошибка получения логов';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [message]);

  const fetchAuditLogById = useCallback(async (id: number): Promise<AuditLog | null> => {
    try {
      return await api.get(`/admin/audit-logs/${id}`) as AuditLog;
    } catch (err: any) {
      message.error((err as Error)?.message || 'Ошибка получения логов');
      return null;
    }
  }, [message]);

  const fetchStats = useCallback(async (period: 'day' | 'week' | 'month' = 'day'): Promise<AuditLogStats | null> => {
    try {
      return await api.get(`/admin/audit-logs/stats?period=${period}`) as AuditLogStats;
    } catch (err: any) {
      message.error((err as Error)?.message || 'Ошибка получения статистики логов');
      return null;
    }
  }, [message]);

  const fetchAvailableActions = useCallback(async (): Promise<string[]> => {
    try {
      const response = await api.get('/admin/audit-logs/actions') as { actions: string[] };
      return response.actions;
    } catch (err: any) {
      message.error((err as Error)?.message || 'Failed to fetch available actions');
      return [];
    }
  }, [message]);

  return {
    auditLogs,
    loading,
    error,
    meta,
    fetchAuditLogs,
    fetchAuditLogById,
    fetchStats,
    fetchAvailableActions
  };
};

export default useAuditLogs;