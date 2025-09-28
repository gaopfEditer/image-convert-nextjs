'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, Smartphone, Chrome } from 'lucide-react'
import { useRegion } from '@/app/hooks/useRegion'
import { userApi, WechatLoginData, GoogleLoginData } from '@/app/lib/api'

interface EnhancedLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => void
  onRegister: (name: string, email: string, password: string) => void
  onThirdPartyLogin: (loginType: 'wechat' | 'google', data: any) => void
  isLoading?: boolean
}

export default function EnhancedLoginModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onRegister, 
  onThirdPartyLogin,
  isLoading = false 
}: EnhancedLoginModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isThirdPartyLoading, setIsThirdPartyLoading] = useState(false)

  const { regionInfo, isLoading: regionLoading, getLoginOptions } = useRegion()

  if (!isOpen) return null

  const loginOptions = getLoginOptions()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = '请输入邮箱'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6位'
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = '请输入用户名'
      } else if (formData.name.length < 2) {
        newErrors.name = '用户名至少2位'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '请确认密码'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次密码输入不一致'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (isLogin) {
      onLogin(formData.email, formData.password)
    } else {
      onRegister(formData.name, formData.email, formData.password)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // 微信登录处理
  const handleWechatLogin = async () => {
    setIsThirdPartyLoading(true)
    try {
      const { url } = await userApi.getWechatLoginUrl()
      // 打开微信登录页面
      const popup = window.open(url, 'wechat-login', 'width=500,height=600,scrollbars=yes,resizable=yes')
      
      // 监听弹窗关闭
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          setIsThirdPartyLoading(false)
          // 这里可以添加检查登录状态的逻辑
        }
      }, 1000)
    } catch (error) {
      console.error('微信登录失败:', error)
      setIsThirdPartyLoading(false)
    }
  }

  // Google登录处理 (使用Auth0)
  const handleGoogleLogin = async () => {
    setIsThirdPartyLoading(true)
    try {
      // 直接重定向到Auth0登录页面
      const returnUrl = window.location.pathname + window.location.search
      const authUrl = `/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
      
      // 重定向到Auth0登录页面
      window.location.href = authUrl
    } catch (error) {
      console.error('Google登录失败:', error)
      setIsThirdPartyLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? '登录' : '注册'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* 第三方登录选项 */}
          {!regionLoading && (
            <div className="space-y-3 mb-6">
              {loginOptions.showWechat && (
                <button
                  onClick={handleWechatLogin}
                  disabled={isThirdPartyLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Smartphone className="w-5 h-5 mr-3 text-green-600" />
                  <span className="text-gray-700 font-medium">
                    {isThirdPartyLoading ? '处理中...' : '微信扫码登录'}
                  </span>
                </button>
              )}

              {loginOptions.showGoogle && (
                <button
                  onClick={handleGoogleLogin}
                  disabled={isThirdPartyLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Chrome className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="text-gray-700 font-medium">
                    {isThirdPartyLoading ? '处理中...' : 'Google账号登录'}
                  </span>
                </button>
              )}

              {/* 分隔线 */}
              {(loginOptions.showWechat || loginOptions.showGoogle) && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">或</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 邮箱登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入用户名"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入邮箱"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请再次输入密码"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '处理中...' : (isLogin ? '登录' : '注册')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
              </button>
            </div>
          </form>

          {/* 地区信息显示（调试用） */}
          {regionInfo && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
              <div>IP: {regionInfo.ip}</div>
              <div>地区: {regionInfo.isDomestic ? '国内' : '国外'}</div>
              <div>国家: {regionInfo.country}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
