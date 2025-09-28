'use client'

import { useState, useEffect, useCallback } from 'react';
import { healthApi, RegionInfo } from '@/app/lib/api';

export interface RegionState {
  regionInfo: RegionInfo | null;
  isLoading: boolean;
  error: string | null;
}

export function useRegion() {
  const [regionState, setRegionState] = useState<RegionState>({
    regionInfo: null,
    isLoading: true,
    error: null
  });

  // 检测地区信息
  const detectRegion = useCallback(async () => {
    setRegionState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const regionInfo = await healthApi.detectRegion();
      setRegionState({
        regionInfo,
        isLoading: false,
        error: null
      });
      
      console.log('地区检测结果:', regionInfo);
      return regionInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '检测地区信息失败';
      setRegionState({
        regionInfo: null,
        isLoading: false,
        error: errorMessage
      });
      
      console.error('地区检测失败:', error);
      return null;
    }
  }, []);

  // 组件挂载时自动检测
  useEffect(() => {
    detectRegion();
  }, [detectRegion]);

  // 重新检测
  const retryDetection = useCallback(() => {
    detectRegion();
  }, [detectRegion]);

  // 获取登录选项
  const getLoginOptions = useCallback(() => {
    if (!regionState.regionInfo) {
      return {
        showWechat: false,
        showGoogle: true, // 默认显示Google
        showEmail: true
      };
    }

    const { isDomestic } = regionState.regionInfo;
    return {
      showWechat: isDomestic,
      showGoogle: !isDomestic,
      showEmail: true // 始终显示邮箱登录
    };
  }, [regionState.regionInfo]);

  return {
    ...regionState,
    detectRegion,
    retryDetection,
    getLoginOptions
  };
}

