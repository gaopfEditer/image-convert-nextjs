'use client'

import { useState } from 'react'
import { EnhancedLoginModal } from '@/app/components'
import { userApi } from '@/app/lib/api'

export default function TestLoginPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('邮箱登录:', { email, password })
      // 这里可以添加实际的登录逻辑
      alert('邮箱登录功能测试')
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('邮箱注册:', { name, email, password })
      // 这里可以添加实际的注册逻辑
      alert('邮箱注册功能测试')
    } catch (error) {
      console.error('注册失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleThirdPartyLogin = async (loginType: 'wechat' | 'google', data: any) => {
    setIsLoading(true)
    try {
      console.log(`${loginType}登录:`, data)
      // 这里可以添加实际的第三方登录逻辑
      alert(`${loginType === 'wechat' ? '微信' : 'Google'}登录功能测试`)
    } catch (error) {
      console.error(`${loginType}登录失败:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuth0GoogleLogin = () => {
    const returnUrl = window.location.pathname
    window.location.href = `/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
  }

  const testGoogleLoginSuccess = () => {
    // 模拟Auth0成功页面的URL参数（使用code和state）
    const mockParams = new URLSearchParams({
      code: 'mock_auth_code_12345',
      state: 'mock_state_67890'
    })
    
    window.location.href = `/google-login/success?${mockParams.toString()}`
  }

  const testGoogleLoginSuccessWithError = () => {
    // 模拟Auth0错误情况
    const mockParams = new URLSearchParams({
      error: 'access_denied',
      error_description: 'User denied access'
    })
    
    window.location.href = `/google-login/success?${mockParams.toString()}`
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">登录功能测试</h1>
        
        <div className="space-y-4">
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            打开登录模态框
          </button>
          
          <button
            onClick={handleAuth0GoogleLogin}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Auth0 Google登录测试
          </button>
          
          <button
            onClick={testGoogleLoginSuccess}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            测试Auth0登录成功页面
          </button>
          
          <button
            onClick={testGoogleLoginSuccessWithError}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            测试Auth0登录错误页面
          </button>
          
          <div className="text-sm text-gray-600">
            <p>此页面用于测试增强的登录功能：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>根据IP地址自动检测国内/国外</li>
              <li>国内用户显示微信扫码登录</li>
              <li>国外用户显示Google账号登录（Auth0）</li>
              <li>始终显示邮箱登录选项</li>
              <li>支持Auth0 Google登录重定向</li>
              <li>支持/google-login/success页面处理</li>
              <li>处理Auth0 code和state参数</li>
              <li>调用后端API完成登录</li>
              <li>自动更新用户登录状态</li>
            </ul>
          </div>
        </div>

        <EnhancedLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onThirdPartyLogin={handleThirdPartyLogin}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
