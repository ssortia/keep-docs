import { useState, useEffect, useCallback } from 'react';
import { App } from 'antd';
import api from '@/app/services/api';

export interface SystemInfo {
  git: {
    commit: string;
    branch: string;
    commitDate: string;
  };
  build: {
    buildTime: string;
    version: string;
    nodeVersion: string;
  };
  environment: {
    variables: Record<string, string | undefined>;
    nodeEnv: string;
    platform: string;
    arch: string;
    hostname: string;
  };
  system: {
    uptime: {
      process: number;
      system: number;
    };
    memory: {
      total: number;
      free: number;
      used: number;
      usagePercent: number;
      process: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
      };
    };
    cpu: {
      count: number;
      model: string;
      loadAverage: {
        '1min': number;
        '5min': number;
        '15min': number;
      };
      loadPercent: number;
    };
  };
  timestamp: string;
}

export const useSystemInfo = (autoRefresh = true) => {
  const { message } = App.useApp();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemInfo = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/api/admin/system/info') as SystemInfo
      console.log("success", response);
      setSystemInfo(response);
    } catch (err: any) {
      const errorMessage = (err as Error)?.message || 'Failed to fetch system info';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchSystemInfo();

    if (autoRefresh) {
      const interval = setInterval(fetchSystemInfo, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchSystemInfo, autoRefresh]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchSystemInfo();
  }, [fetchSystemInfo]);

  return {
    systemInfo,
    loading,
    error,
    refresh
  };
};

export default useSystemInfo;