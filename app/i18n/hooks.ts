'use client'

import { useState, useEffect, useCallback } from 'react'
import { locales, type Locale, type LocaleMessages, getCurrentLocale, setStoredLocale, getStoredLocale, detectBrowserLocale } from './config'

// 翻译函数类型
export type TFunction = (key: string, params?: Record<string, string | number>) => string

// 深度获取嵌套对象的值
function getNestedValue(obj: any, path: string): string {
  if (typeof path !== 'string') {
    console.warn('Translation key must be a string:', path)
    return String(path)
  }
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}

// 替换参数占位符
function replaceParams(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}

// 翻译函数
export function createTFunction(messages: LocaleMessages): TFunction {
  return (key: string, params?: Record<string, string | number>) => {
    if (!key || typeof key !== 'string') {
      console.warn('Invalid translation key:', key)
      return String(key || '')
    }
    const text = getNestedValue(messages, key)
    return replaceParams(text, params)
  }
}

// 国际化 Hook
export function useI18n() {
  const [locale, setLocale] = useState<Locale>(() => getCurrentLocale())
  const [messages, setMessages] = useState<LocaleMessages>(() => locales[locale])
  const [t, setT] = useState<TFunction>(() => createTFunction(locales[locale]))
  const [isClient, setIsClient] = useState(false)

  // 标记客户端已挂载
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 客户端挂载后检测并更新语言
  useEffect(() => {
    if (isClient) {
      const clientLocale = getStoredLocale() || detectBrowserLocale()
      if (clientLocale !== locale) {
        setLocale(clientLocale)
        setMessages(locales[clientLocale as Locale])
        setT(createTFunction(locales[clientLocale as Locale]))
      }
    }
  }, [isClient, locale])

  // 更新语言
  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale)
    setMessages(locales[newLocale])
    setT(createTFunction(locales[newLocale]))
    setStoredLocale(newLocale)
  }, [])

  // 当 locale 改变时，更新 messages 和 t 函数
  useEffect(() => {
    setMessages(locales[locale])
    setT(createTFunction(locales[locale]))
  }, [locale])

  return {
    locale,
    messages,
    t,
    changeLocale,
  }
}

// 语言选择器 Hook
export function useLocaleSelector() {
  const { locale, changeLocale } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const selectLocale = useCallback((newLocale: Locale) => {
    if (newLocale !== locale) {
      changeLocale(newLocale)
    }
    setIsOpen(false)
  }, [changeLocale, locale])

  return {
    locale,
    isOpen,
    toggle,
    selectLocale,
  }
}
