'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Auth0User {
  id: string
  username: string
  email: string
  name: string
  avatar: string
  loginMethod: string
}

export function useAuth0Success() {
  const [isListening, setIsListening] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleAuthSuccess = (event: CustomEvent) => {
      const { user, token } = event.detail
      console.log('收到Auth0登录成功事件:', { user, token })
      
      // 这里可以更新全局用户状态
      // 例如通过Context或状态管理库
      
      // 触发页面刷新以更新用户状态
      window.location.reload()
    }

    // 监听Auth0成功事件
    window.addEventListener('authSuccess', handleAuthSuccess as EventListener)
    setIsListening(true)

    return () => {
      window.removeEventListener('authSuccess', handleAuthSuccess as EventListener)
      setIsListening(false)
    }
  }, [])

  return { isListening }
}

