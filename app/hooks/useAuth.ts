'use client'

import { useState, useEffect, useCallback } from 'react';
import { tokenManager } from '@/app/lib/request';

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    isLoading: true
  });

  // 初始化时检查token
  useEffect(() => {
    const token = tokenManager.getToken();
    setAuthState({
      isAuthenticated: !!token,
      token,
      isLoading: false
    });
  }, []);

  // 设置token
  const setToken = useCallback((token: string) => {
    tokenManager.setToken(token);
    setAuthState({
      isAuthenticated: true,
      token,
      isLoading: false
    });
  }, []);

  // 清除token
  const clearToken = useCallback(() => {
    tokenManager.clearToken();
    setAuthState({
      isAuthenticated: false,
      token: null,
      isLoading: false
    });
  }, []);

  // 检查token是否存在
  const hasToken = useCallback(() => {
    return tokenManager.hasToken();
  }, []);

  return {
    ...authState,
    setToken,
    clearToken,
    hasToken
  };
}
