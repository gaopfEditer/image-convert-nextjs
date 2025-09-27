import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

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
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 自动添加认证token
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('发送请求详情:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers
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
    console.log('响应成功:', response.status, response.config.url, response.data);
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

// 通用请求函数
export async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 便捷方法
export const api = {
  // GET 请求
  get: <T = any>(url: string, params?: Record<string, any>): Promise<T> => {
    return request<T>({ method: 'GET', url, params });
  },

  // POST 请求（默认 JSON）
  post: <T = any>(url: string, data?: any): Promise<T> => {
    return request<T>({ method: 'POST', url, data });
  },

  // PUT 请求（默认 JSON）
  put: <T = any>(url: string, data?: any): Promise<T> => {
    return request<T>({ method: 'PUT', url, data });
  },

  // PATCH 请求（默认 JSON）
  patch: <T = any>(url: string, data?: any): Promise<T> => {
    return request<T>({ method: 'PATCH', url, data });
  },

  // DELETE 请求
  delete: <T = any>(url: string, params?: Record<string, any>): Promise<T> => {
    return request<T>({ method: 'DELETE', url, params });
  },

  // FormData 请求（文件上传）
  upload: <T = any>(url: string, formData: FormData): Promise<T> => {
    return request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // 健康检查
  health: (): Promise<any> => {
    return request({ method: 'GET', url: '/health' });
  },
};

// 导出 axios 实例，供高级用法
export { apiClient };

// 兼容性：保留原有函数名
export const postJson = api.post;
export const putJson = api.put;
export const postFormData = api.upload;
