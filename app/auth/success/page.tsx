'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { userApi } from '@/app/lib/api'

export default function AuthSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const returnUrl = searchParams.get('returnUrl') || '/'

        if (!code) {
          throw new Error('缺少授权码')
        }

        // 这里应该调用后端API来处理Auth0回调
        // 后端会使用code换取access_token和用户信息
        console.log('处理Auth0回调:', { code, returnUrl })

        // 模拟调用后端API
        try {
          // 这里应该调用类似这样的API：
          // const result = await userApi.auth0Callback({ code })
          // 暂时使用模拟数据
          const mockResult = {
            user: {
              id: 'auth0_' + Date.now(),
              username: 'google_user',
              email: 'user@example.com',
              name: 'Google用户',
              avatar: 'https://via.placeholder.com/40'
            },
            token: 'mock_token_' + Date.now(),
            expiresIn: 3600,
            loginType: 'google'
          }

          // 保存用户信息到localStorage（实际项目中应该使用更安全的方式）
          localStorage.setItem('auth_user', JSON.stringify(mockResult.user))
          localStorage.setItem('auth_token', mockResult.token)

          // 重定向到目标页面
          router.push(returnUrl)
        } catch (apiError) {
          console.error('后端API调用失败:', apiError)
          throw new Error('登录处理失败，请重试')
        }
      } catch (err) {
        console.error('Auth0回调处理失败:', err)
        setError(err instanceof Error ? err.message : '未知错误')
        setIsProcessing(false)
      }
    }

    processAuthCallback()
  }, [searchParams, router])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">正在处理登录...</h2>
          <p className="text-gray-600">请稍候，我们正在验证您的身份</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">登录失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return null
}

