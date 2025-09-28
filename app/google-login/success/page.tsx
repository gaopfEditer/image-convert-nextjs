'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { userApi } from '@/app/lib/api'

interface Auth0LoginData {
  access_token: string
  user: {
    id: string
    username: string
    email: string
    name?: string
    avatar?: string
  }
}

export default function GoogleLoginSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    // 防止重复处理 - 使用localStorage确保只处理一次
    const processKey = `auth0_processing_${searchParams.get('code')}_${searchParams.get('state')}`
    if (localStorage.getItem(processKey)) {
      console.log('Auth0回调已在处理中，跳过重复调用')
      return
    }

    const handleAuth0Callback = async () => {
      try {
        // 标记已经开始处理，防止重复调用
        localStorage.setItem(processKey, 'true')
        hasProcessedRef.current = true
        
        // 从URL参数中获取Auth0返回的数据
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          throw new Error('登录失败: ' + error)
        }

        if (!code || !state) {
          throw new Error('缺少必要的授权参数')
        }

        console.log('Auth0回调处理:', { code, state })

        try {
          // 调用后端API完成登录
          const data: Auth0LoginData = await userApi.completeAuth0Login({ code, state })
          handleLoginSuccess(data)
        } catch (apiError) {
          console.error('后端API调用失败:', apiError)
          throw new Error('登录失败: ' + (apiError instanceof Error ? apiError.message : '网络错误'))
        }
      } catch (err) {
        console.error('Auth0回调处理失败:', err)
        setError(err instanceof Error ? err.message : '未知错误')
        setIsProcessing(false)
        // 如果出错，重置处理状态，允许重试
        hasProcessedRef.current = false
        localStorage.removeItem(processKey)
      }
    }

    handleAuth0Callback()
  }, [searchParams, router])

  const handleLoginSuccess = (data: Auth0LoginData) => {
    // 保存登录信息
    localStorage.setItem('auth_token', data.access_token)
    localStorage.setItem('user_id', data.user.id)
    localStorage.setItem('username', data.user.username)
    localStorage.setItem('email', data.user.email)
    localStorage.setItem('login_method', 'Auth0')

    // 保存完整的用户信息
    const userInfo = {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      name: data.user.name || data.user.username,
      avatar: data.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.username)}&background=random`,
      loginMethod: 'Auth0'
    }
    localStorage.setItem('auth_user', JSON.stringify(userInfo))

    // 触发登录成功事件
    window.dispatchEvent(new CustomEvent('userLoginSuccess', {
      detail: userInfo
    }))

    console.log('用户登录成功:', userInfo)

    // 清理处理标记
    const processKey = `auth0_processing_${searchParams.get('code')}_${searchParams.get('state')}`
    localStorage.removeItem(processKey)

    // 延迟一下让用户看到成功消息，然后跳转到首页
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">登录成功！</h2>
          <p className="text-gray-600 mb-4">正在验证您的身份信息...</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">登录失败</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              返回首页
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
