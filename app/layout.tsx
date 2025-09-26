import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { I18nProvider } from './i18n/context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '图片格式转换器',
  description: '支持多种格式的图片转换工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
