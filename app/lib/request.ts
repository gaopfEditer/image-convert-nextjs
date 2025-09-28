import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 扩展AxiosRequestConfig类型
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

// API 配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('API配置信息:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  BACKEND_URL: process.env.BACKEND_URL,
  API_BASE_URL
});

// Token管理工具函数
export const tokenManager = {
  // 保存token
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },
  
  // 获取token
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },
  
  // 清除token
  clearToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
  
  // 检查token是否存在
  hasToken: (): boolean => {
    return !!tokenManager.getToken();
  }
};

// 获取认证token的辅助函数
function getAuthToken(): string | null {
  return tokenManager.getToken();
}

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 增加超时时间到60秒
  headers: {
    'Content-Type': 'application/json',
  },
  // 添加连接配置
  maxRedirects: 5,
  validateStatus: (status) => status < 500, // 只对5xx状态码抛出错误
  // 强制使用新的连接
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  // 添加更多超时配置
  timeoutErrorMessage: '请求超时，请检查网络连接',
  // 禁用请求去重
  transformRequest: [(data) => data],
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 自动添加认证token
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求ID用于调试
    config.metadata = { startTime: Date.now() };
    
    console.log('发送请求详情:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers,
      timeout: config.timeout
    });
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const duration = Date.now() - (response.config.metadata?.startTime || 0);
    console.log('响应成功:', response.status, response.config.url, `耗时: ${duration}ms`, response.data);
    return response;
  },
  (error) => {
    console.error('响应错误详情:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    // 处理401未授权错误（token过期）
    if (error.response?.status === 401) {
      console.log('Token过期，清除本地token');
      tokenManager.clearToken();
      // 可以在这里触发重新登录逻辑
      if (typeof window !== 'undefined') {
        // 可以选择重定向到登录页或显示登录弹窗
        console.log('需要重新登录');
      }
    }
    
    // 统一错误处理
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response;
      const message = data?.message || data?.error || `请求失败: ${status}`;
      throw new Error(message);
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络请求失败，可能是CORS问题或服务器未响应');
      throw new Error('网络连接失败，请检查网络');
    } else {
      // 其他错误
      throw new Error(error.message || '请求失败');
    }
  }
);

// 重试函数
async function retryRequest<T = any>(config: AxiosRequestConfig, retries = 3): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error: any) {
    // 如果是超时错误且还有重试次数，则重试
    if ((error.code === 'ECONNABORTED' || error.message?.includes('timeout')) && retries > 0) {
      const waitTime = (4 - retries) * 2000; // 递增等待时间：2秒、4秒、6秒
      console.log(`请求超时，正在重试... 剩余重试次数: ${retries}, 等待 ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return retryRequest(config, retries - 1);
    }
    throw error;
  }
}

// 通用请求函数
export async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return retryRequest<T>(config);
}

// 便捷方法
export const api = {
  // GET 请求
  get: <T = any>(url: string, params?: Record<string, any>): Promise<T> => {
    return request<T>({ method: 'GET', url, params, timeout: 30000 });
  },

  // POST 请求（默认 JSON）
  post: <T = any>(url: string, data?: any): Promise<T> => {
    return request<T>({ method: 'POST', url, data, timeout: 60000 });
  },

  // PUT 请求（默认 JSON）
  put: <T = any>(url: string, data?: any): Promise<T> => {
    return request<T>({ method: 'PUT', url, data, timeout: 60000 });
  },

  // PATCH 请求（默认 JSON）
  patch: <T = any>(url: string, data?: any): Promise<T> => {
    return request<T>({ method: 'PATCH', url, data, timeout: 60000 });
  },

  // DELETE 请求
  delete: <T = any>(url: string, params?: Record<string, any>): Promise<T> => {
    return request<T>({ method: 'DELETE', url, params, timeout: 30000 });
  },

  // FormData 请求（文件上传）
  upload: <T = any>(url: string, formData: FormData): Promise<T> => {
    return request<T>({
      method: 'POST',
      url,
      data: formData,
      timeout: 120000, // 文件上传需要更长时间
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // 健康检查
  health: (): Promise<any> => {
    return request({ method: 'GET', url: '/health', timeout: 15000 });
  },
};

// 导出 axios 实例，供高级用法
export { apiClient };

// 清理连接池的函数
export function clearConnectionPool() {
  // 清理axios的连接池
  if (apiClient.defaults.adapter) {
    // 如果使用自定义adapter，可以在这里清理
    console.log('清理axios连接池');
  }
}

// 定期清理连接池（每5分钟）
if (typeof window !== 'undefined') {
  setInterval(() => {
    clearConnectionPool();
  }, 5 * 60 * 1000); // 5分钟
}

// 兼容性：保留原有函数名
export const postJson = api.post;
export const putJson = api.put;
export const postFormData = api.upload;
