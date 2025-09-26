'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useI18n, type TFunction } from './hooks'
import { type Locale } from './config'

interface I18nContextType {
  locale: Locale
  t: TFunction
  changeLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { locale, t, changeLocale } = useI18n()

  // 创建默认翻译函数
  const defaultT = (key: string, params?: Record<string, string | number>) => {
    // 简单的默认翻译映射
    const defaultTranslations: Record<string, string> = {
      'header.title': '专业图片处理工具',
      'header.subtitle': '支持格式转换、压缩优化、裁剪缩放、AI处理等多种功能',
      'tabs.convert': '格式转换',
      'tabs.compress': '图片压缩',
      'tabs.crop': '裁剪缩放',
      'tabs.ai': 'AI功能',
      'user.free': '普通用户',
      'user.vip': 'VIP会员',
      'user.premium': '特级会员',
      'user.dailyUsage': '今日已使用',
      'user.storage': '存储',
      'user.loginRegister': '登录/注册',
      'user.upgrade': '升级会员',
      'common.help': '帮助',
      'formatConvert.description': '支持多种格式转换',
      'imageCompress.description': '智能压缩优化',
      'imageCrop.description': '精确裁剪缩放',
      'aiFeatures.description': 'AI智能处理',
      'languages.zh-CN': '简体中文',
      'languages.en-US': 'English',
      'languages.ja-JP': '日本語',
    }
    
    if (params) {
      let text = defaultTranslations[key] || key
      Object.keys(params).forEach(paramKey => {
        text = text.replace(`{${paramKey}}`, params[paramKey]?.toString() || '')
      })
      return text
    }
    
    return defaultTranslations[key] || key
  }

  // 确保 t 函数始终可用
  const safeT = (typeof t === 'function') ? t : defaultT

  return (
    <I18nContext.Provider value={{ locale, t: safeT, changeLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18nContext() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18nContext must be used within an I18nProvider')
  }
  return context
}
