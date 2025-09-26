'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useI18nContext } from '../i18n/context'
import { supportedLocales, localeNames, localeFlags, type Locale } from '../i18n/config'

export default function LocaleSelector() {
  const { locale, changeLocale, t } = useI18nContext()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownRef, setDropdownRef] = useState<HTMLDivElement | null>(null)

  const toggle = () => setIsOpen(prev => !prev)
  
  const selectLocale = (newLocale: Locale) => {
    if (newLocale !== locale) {
      changeLocale(newLocale)
    }
    setIsOpen(false)
  }

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, dropdownRef])

  return (
    <div className="relative" ref={setDropdownRef}>
      <button
        onClick={toggle}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        title="选择语言 / Select Language / 言語を選択"
      >
        <Globe size={20} />
        <span className="hidden md:block font-medium">
          {localeFlags[locale]} {t(`languages.${locale}`)}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {supportedLocales.map((supportedLocale) => (
            <button
              key={supportedLocale}
              onClick={() => selectLocale(supportedLocale)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                locale === supportedLocale ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{localeFlags[supportedLocale]}</span>
              <span className="flex-1 font-medium">{t(`languages.${supportedLocale}`)}</span>
              {locale === supportedLocale && (
                <Check size={16} className="text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
