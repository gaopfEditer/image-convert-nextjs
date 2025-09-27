import { api } from '../request';

// 统计相关类型定义
export interface UsageStats {
  totalImages: number;
  totalSize: number;
  imagesThisMonth: number;
  sizeThisMonth: number;
  lastProcessedAt?: string;
}

export interface StorageStats {
  used: number;
  limit: number;
  percentage: number;
  files: number;
}

export interface MonthlyUsage {
  month: string;
  images: number;
  size: number;
}

export interface UsageHistory {
  daily: Array<{
    date: string;
    images: number;
    size: number;
  }>;
  monthly: MonthlyUsage[];
}

export interface ApiUsage {
  endpoint: string;
  count: number;
  lastUsed: string;
}

// 使用统计 API
export const statsApi = {
  // 获取使用统计
  getUsage: (): Promise<UsageStats> => {
    return api.get('/api/stats/usage');
  },

  // 获取存储使用情况
  getStorage: (): Promise<StorageStats> => {
    return api.get('/api/stats/storage');
  },

  // 获取使用历史
  getUsageHistory: (params?: {
    period?: 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<UsageHistory> => {
    return api.get('/api/stats/history', params);
  },

  // 获取API使用统计
  getApiUsage: (): Promise<ApiUsage[]> => {
    return api.get('/api/stats/api-usage');
  },

  // 更新使用统计
  updateUsage: (data: {
    images?: number;
    size?: number;
    endpoint?: string;
  }): Promise<void> => {
    return api.post('/api/stats/usage', data);
  },

  // 更新存储统计
  updateStorage: (data: {
    size: number;
    files: number;
  }): Promise<void> => {
    return api.post('/api/stats/storage', data);
  },

  // 重置统计
  resetStats: (): Promise<void> => {
    return api.post('/api/stats/reset');
  },

  // 获取存储配额信息
  getQuota: (): Promise<{
    plan: string;
    storageLimit: number;
    monthlyLimit: number;
    usedStorage: number;
    usedMonthly: number;
    resetDate: string;
  }> => {
    return api.get('/api/stats/quota');
  },
};
