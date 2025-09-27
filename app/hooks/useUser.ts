'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { userApi, type UserProfile } from '@/app/lib/api';

export interface UserMembership {
  type: 'free' | 'vip' | 'premium';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  dailyUsage: number;
  maxDailyUsage: number;
  totalStorage: number;
  usedStorage: number;
  features: string[];
}

export interface UserType {
  id: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
  membership: UserMembership;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserState {
  user: UserType | null;
  isLoading: boolean;
  error: string | null;
}

export function useUser() {
  const { isAuthenticated, token } = useAuth();
  const [userState, setUserState] = useState<UserState>({
    user: null,
    isLoading: true,
    error: null
  });

  // 创建默认游客用户
  const createGuestUser = useCallback((): UserType => {
    return {
      id: 'guest',
      email: 'guest@example.com',
      name: '游客用户',
      isLoggedIn: false,
      membership: {
        type: 'free',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后
        isActive: true,
        dailyUsage: 0,
        maxDailyUsage: 5,
        totalStorage: 100 * 1024 * 1024, // 100MB
        usedStorage: 0,
        features: ['基础格式转换', '每日5张图片处理']
      },
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
  }, []);

  // 从localStorage加载用户信息
  const loadUserFromStorage = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // 转换日期字符串为Date对象
          const user: UserType = {
            ...userData,
            membership: {
              ...userData.membership,
              startDate: new Date(userData.membership.startDate),
              endDate: new Date(userData.membership.endDate)
            },
            createdAt: new Date(userData.createdAt),
            lastLoginAt: new Date(userData.lastLoginAt)
          };
          return user;
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
    return null;
  }, []);

  // 保存用户信息到localStorage
  const saveUserToStorage = useCallback((user: UserType) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  }, []);

  // 初始化用户状态
  useEffect(() => {
    const initializeUser = () => {
      setUserState(prev => ({ ...prev, isLoading: true }));
      
      if (isAuthenticated && token) {
        // 已认证，尝试从localStorage加载用户信息
        const storedUser = loadUserFromStorage();
        if (storedUser) {
          setUserState({
            user: storedUser,
            isLoading: false,
            error: null
          });
        } else {
          // 如果没有存储的用户信息，创建游客用户
          const guestUser = createGuestUser();
          setUserState({
            user: guestUser,
            isLoading: false,
            error: null
          });
        }
      } else {
        // 未认证，创建游客用户
        const guestUser = createGuestUser();
        setUserState({
          user: guestUser,
          isLoading: false,
          error: null
        });
      }
    };

    initializeUser();
  }, [isAuthenticated, token, loadUserFromStorage, createGuestUser]);

  // 设置用户信息
  const setUser = useCallback((user: UserType) => {
    setUserState({
      user,
      isLoading: false,
      error: null
    });
    saveUserToStorage(user);
  }, [saveUserToStorage]);

  // 更新用户信息
  const updateUser = useCallback((updates: Partial<UserType>) => {
    setUserState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...updates };
      saveUserToStorage(updatedUser);
      
      return {
        ...prev,
        user: updatedUser
      };
    });
  }, [saveUserToStorage]);

  // 清除用户信息
  const clearUser = useCallback(() => {
    setUserState({
      user: null,
      isLoading: false,
      error: null
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }, []);

  // 刷新用户信息（从服务器获取最新信息）
  const refreshUser = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setUserState(prev => ({
        ...prev,
        error: '未登录，无法刷新用户信息'
      }));
      return;
    }

    setUserState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const profile = await userApi.getProfile();
      
      // 根据API返回的用户信息更新本地用户状态
      const updatedUser: UserType = {
        id: profile.id,
        email: profile.email || '',
        name: profile.name || profile.username || '',
        isLoggedIn: true,
        membership: {
          type: 'free', // 默认免费用户，实际应该从API获取
          startDate: new Date(profile.createdAt),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true,
          dailyUsage: 0,
          maxDailyUsage: 5,
          totalStorage: 100 * 1024 * 1024,
          usedStorage: 0,
          features: ['基础格式转换', '每日5张图片处理']
        },
        createdAt: new Date(profile.createdAt),
        lastLoginAt: new Date()
      };

      setUser(updatedUser);
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      setUserState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '刷新用户信息失败'
      }));
    }
  }, [isAuthenticated, token, setUser]);

  // 更新会员信息
  const updateMembership = useCallback((membership: Partial<UserMembership>) => {
    updateUser({
      membership: {
        ...userState.user?.membership,
        ...membership
      } as UserMembership
    });
  }, [updateUser, userState.user?.membership]);

  // 更新使用统计
  const updateUsage = useCallback((usage: { dailyUsage?: number; usedStorage?: number }) => {
    if (!userState.user) return;
    
    updateUser({
      membership: {
        ...userState.user.membership,
        dailyUsage: usage.dailyUsage ?? userState.user.membership.dailyUsage,
        usedStorage: usage.usedStorage ?? userState.user.membership.usedStorage
      }
    });
  }, [updateUser, userState.user]);

  // 检查是否为会员
  const isMember = useCallback(() => {
    return userState.user?.membership.type !== 'free';
  }, [userState.user?.membership.type]);

  // 检查会员是否有效
  const isMembershipActive = useCallback(() => {
    if (!userState.user) return false;
    const now = new Date();
    return userState.user.membership.isActive && 
           userState.user.membership.endDate > now;
  }, [userState.user]);

  // 检查是否超出使用限制
  const isOverLimit = useCallback(() => {
    if (!userState.user) return false;
    return userState.user.membership.dailyUsage >= userState.user.membership.maxDailyUsage;
  }, [userState.user]);

  // 获取剩余使用次数
  const getRemainingUsage = useCallback(() => {
    if (!userState.user) return 0;
    return Math.max(0, userState.user.membership.maxDailyUsage - userState.user.membership.dailyUsage);
  }, [userState.user]);

  // 获取存储使用百分比
  const getStorageUsagePercent = useCallback(() => {
    if (!userState.user) return 0;
    return (userState.user.membership.usedStorage / userState.user.membership.totalStorage) * 100;
  }, [userState.user]);

  return {
    // 状态
    ...userState,
    
    // 用户信息
    user: userState.user,
    isLoading: userState.isLoading,
    error: userState.error,
    
    // 认证状态
    isAuthenticated,
    isLoggedIn: userState.user?.isLoggedIn ?? false,
    
    // 操作方法
    setUser,
    updateUser,
    clearUser,
    refreshUser,
    updateMembership,
    updateUsage,
    
    // 会员相关
    isMember: isMember(),
    isMembershipActive: isMembershipActive(),
    isOverLimit: isOverLimit(),
    getRemainingUsage: getRemainingUsage(),
    getStorageUsagePercent: getStorageUsagePercent(),
    
    // 工具方法
    createGuestUser
  };
}
