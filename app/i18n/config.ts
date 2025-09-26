import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'
import jaJP from './locales/ja-JP.json'

export const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
} as const

export type Locale = keyof typeof locales
export type LocaleMessages = typeof zhCN

export const defaultLocale: Locale = 'zh-CN'

// 支持的语言列表
export const supportedLocales: Locale[] = ['zh-CN', 'en-US', 'ja-JP']

// 语言显示名称
export const localeNames: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語',
}

// 语言标志
export const localeFlags: Record<Locale, string> = {
  'zh-CN': '🇨🇳',
  'en-US': '🇺🇸',
  'ja-JP': '🇯🇵',
}

// 检测浏览器语言（仅在客户端）
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale

  const browserLang = navigator.language || (navigator as any).userLanguage
  
  // 精确匹配
  if (browserLang in locales) {
    return browserLang as Locale
  }
  
  // 语言代码匹配（如 zh 匹配 zh-CN）
  const langCode = browserLang.split('-')[0]
  for (const locale of supportedLocales) {
    if (locale.startsWith(langCode)) {
      return locale
    }
  }
  
  return defaultLocale
}

// 获取服务端安全的初始语言
export function getServerSafeLocale(): Locale {
  // 服务端始终返回默认语言，避免水合错误
  return defaultLocale
}

// 从本地存储获取语言设置
export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem('locale')
  if (stored && stored in locales) {
    return stored as Locale
  }
  
  return null
}

// 保存语言设置到本地存储
export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('locale', locale)
}

// 获取当前语言设置
export function getCurrentLocale(): Locale {
  // 服务端渲染时使用默认语言
  if (typeof window === 'undefined') {
    return getServerSafeLocale()
  }
  
  // 客户端优先使用存储的语言设置，然后检测浏览器语言
  return getStoredLocale() || detectBrowserLocale()
}
