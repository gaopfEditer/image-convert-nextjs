'use client'

import { useState, useCallback, useEffect } from 'react'
import { Image as ImageIcon, LogIn, User, HelpCircle, Crown } from 'lucide-react'
import { 
  UserProfile, 
  MembershipModal, 
  FeatureGuide,
  FormatConvert, 
  ImageCompress, 
  ImageCrop, 
  AIFeatures 
} from './pages'
import { 
  LocaleSelector,
  EnhancedLoginModal
} from './components'
import { User as UserType, Membership, HistoryRecord } from './types/user'
import { useI18nContext } from './i18n/context'
import { safeCreateDate, createFutureDate } from './lib/dateUtils'
import { userApi, api } from './lib/api'
import { useUser } from './hooks/useUser'
import { useAuth0Success } from './hooks/useAuth0Success'

export default function ImageConverter() {
  const { t, locale } = useI18nContext()
  const [activeTab, setActiveTab] = useState<string>('convert')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showMembershipModal, setShowMembershipModal] = useState(false)
  const [showFeatureGuide, setShowFeatureGuide] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 监听Auth0登录成功事件
  useAuth0Success()

  // 监听用户登录成功事件
  useEffect(() => {
    const handleUserLoginSuccess = (event: CustomEvent) => {
      const userData = event.detail
      console.log('收到用户登录成功事件:', userData)
      
      // 更新用户状态
      const auth0User: UserType = {
        id: userData.id,
        email: userData.email,
        name: userData.name || userData.username,
        isLoggedIn: true,
        membership: {
          type: 'free',
          startDate: new Date(),
          endDate: createFutureDate(365),
          isActive: true,
          dailyUsage: 0,
          maxDailyUsage: 5,
          totalStorage: 100 * 1024 * 1024,
          usedStorage: 0,
          features: ['基础格式转换', '每日5张图片处理']
        },
        createdAt: new Date(),
        lastLoginAt: new Date()
      }
      
      setUser(auth0User)
      console.log('用户状态已更新:', auth0User)
    }

    // 监听用户登录成功事件
    window.addEventListener('userLoginSuccess', handleUserLoginSuccess as EventListener)

    return () => {
      window.removeEventListener('userLoginSuccess', handleUserLoginSuccess as EventListener)
    }
  }, [])

  // 客户端挂载标记和健康检查
  useEffect(() => {
    setIsClient(true)
    
    // 检查是否有Auth0登录的用户信息
    const checkAuth0User = () => {
      try {
        const authUser = localStorage.getItem('auth_user')
        const authToken = localStorage.getItem('auth_token')
        
        if (authUser && authToken) {
          const userData = JSON.parse(authUser)
          console.log('发现Auth0用户信息:', userData)
          
          // 更新用户状态
          const auth0User: UserType = {
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.username,
            isLoggedIn: true,
            membership: {
              type: 'free',
              startDate: new Date(),
              endDate: createFutureDate(365),
              isActive: true,
              dailyUsage: 0,
              maxDailyUsage: 5,
              totalStorage: 100 * 1024 * 1024,
              usedStorage: 0,
              features: ['基础格式转换', '每日5张图片处理']
            },
            createdAt: new Date(),
            lastLoginAt: new Date()
          }
          
          setUser(auth0User)
          console.log('Auth0用户状态已更新')
        }
      } catch (error) {
        console.error('检查Auth0用户信息失败:', error)
      }
    }
    
    checkAuth0User()
    
    // 健康检查（延迟执行，避免与其他请求冲突）
    const healthCheck = async () => {
      try {
        // 延迟5秒执行健康检查，给axios更多时间
        await new Promise(resolve => setTimeout(resolve, 5000))
        console.log('🔍 开始后台健康检查...')
        const response = await api.health()
        console.log('✅ 后台健康检查成功:', response)
      } catch (error) {
        console.error('❌ 健康检查失败:', error)
        // 健康检查失败不影响主要功能，只记录错误
      }
    }
    
    // 异步执行健康检查，不阻塞页面加载
    healthCheck()
  }, [])

  // 将 TABS 移到 useEffect 中，确保 t 函数已经准备好
  const [TABS, setTABS] = useState([
    { id: 'convert', label: '格式转换', icon: 'FileImage', description: '支持多种格式转换' },
    { id: 'compress', label: '图片压缩', icon: 'Zap', description: '智能压缩优化' },
    { id: 'crop', label: '裁剪缩放', icon: 'Scissors', description: '精确裁剪缩放' },
    { id: 'ai', label: 'AI功能', icon: 'Sparkles', description: 'AI智能处理' },
  ])

  // 更新 TABS 当语言改变时
  useEffect(() => {
    if (isClient) {
      setTABS([
        { id: 'convert', label: t('tabs.convert'), icon: 'FileImage', description: t('formatConvert.description') },
        { id: 'compress', label: t('tabs.compress'), icon: 'Zap', description: t('imageCompress.description') },
        { id: 'crop', label: t('tabs.crop'), icon: 'Scissors', description: t('imageCrop.description') },
        { id: 'ai', label: t('tabs.ai'), icon: 'Sparkles', description: t('aiFeatures.description') },
      ])
    }
  }, [t, locale, isClient])

  // 初始化用户数据
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // 确保日期字段被正确解析为 Date 对象
        if (parsedUser.membership) {
          parsedUser.membership.startDate = safeCreateDate(parsedUser.membership.startDate)
          parsedUser.membership.endDate = safeCreateDate(parsedUser.membership.endDate)
        }
        if (parsedUser.createdAt) {
          parsedUser.createdAt = safeCreateDate(parsedUser.createdAt)
        }
        if (parsedUser.lastLoginAt) {
          parsedUser.lastLoginAt = safeCreateDate(parsedUser.lastLoginAt)
        }
        setUser(parsedUser)
      } catch (error) {
        console.error('解析用户数据失败:', error)
        // 如果解析失败，创建默认用户
        createDefaultUser()
      }
    } else {
      createDefaultUser()
    }
  }, [])

  // 创建默认用户
  const createDefaultUser = () => {
    // 创建默认游客用户
    const guestUser: UserType = {
      id: 'guest',
      email: 'guest@example.com',
      name: '游客用户',
      isLoggedIn: false,
        membership: {
          type: 'free',
          startDate: new Date(),
          endDate: createFutureDate(365), // 1年后
          isActive: true,
          dailyUsage: 0,
          maxDailyUsage: 5,
          totalStorage: 100 * 1024 * 1024, // 100MB
          usedStorage: 0,
          features: ['基础格式转换', '每日5张图片处理']
        },
        createdAt: new Date(),
        lastLoginAt: new Date()
      }
      setUser(guestUser)
    }

  // 保存用户数据到本地存储
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }, [user])

  // 更新用户信息
  const handleUpdateUser = useCallback((updatedUser: UserType) => {
    setUser(updatedUser)
  }, [])

  // 添加历史记录
  const handleAddHistory = useCallback((record: HistoryRecord) => {
    setHistory(prev => [record, ...prev])
  }, [])

  // 用户登录
  const handleLogin = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('准备发送登录请求:', { username: email, password: password })
      
      // 调用后台登录API
      const loginResult = await userApi.login({ 
        username: email, 
        password: password 
      })
      
      console.log('登录成功:', loginResult)
      
      // 保存token到本地存储
      if (loginResult.token) {
        // 导入tokenManager
        const { tokenManager } = await import('@/app/lib/request');
        tokenManager.setToken(loginResult.token);
        console.log('Token已保存:', loginResult.token);
      }
      
      // 根据API返回结果创建用户对象
      const loggedInUser: UserType = {
        id: loginResult.user.id || 'user_' + Date.now(),
        email: loginResult.user.email || email,
        name: loginResult.user.name || email.split('@')[0],
        isLoggedIn: true,
        membership: {
          type: 'free', // 默认免费用户
          startDate: safeCreateDate(loginResult.user.createdAt),
          endDate: createFutureDate(365),
          isActive: true,
          dailyUsage: 0,
          maxDailyUsage: 5,
          totalStorage: 100 * 1024 * 1024, // 100MB
          usedStorage: 0,
          features: ['基础格式转换', '每日5张图片处理']
        },
        createdAt: safeCreateDate(loginResult.user.createdAt),
        lastLoginAt: new Date()
      }
      
      setUser(loggedInUser)
      setShowLoginModal(false)
      
      // 显示成功消息
      alert('登录成功！')
      
    } catch (error) {
      console.error('登录失败:', error)
      // 显示错误消息
      alert('登录失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 用户注册
  const handleRegister = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // 调用后台注册API
      const registerResult = await userApi.register({ 
        username: email, 
        password: password,
        email: email,
        name: name
      })
      
      console.log('注册成功:', registerResult)
      
      // 保存token到本地存储
      if (registerResult.token) {
        // 导入tokenManager
        const { tokenManager } = await import('@/app/lib/request');
        tokenManager.setToken(registerResult.token);
        console.log('Token已保存:', registerResult.token);
      }
      
      // 根据API返回结果创建用户对象
      const newUser: UserType = {
        id: registerResult.user.id || 'user_' + Date.now(),
        email: registerResult.user.email || email,
        name: registerResult.user.name || name,
        isLoggedIn: true,
        membership: {
          type: 'free', // 默认免费用户
          startDate: safeCreateDate(registerResult.user.createdAt),
          endDate: createFutureDate(365),
          isActive: true,
          dailyUsage: 0,
          maxDailyUsage: 5,
          totalStorage: 100 * 1024 * 1024, // 100MB
          usedStorage: 0,
          features: ['基础格式转换', '每日5张图片处理']
        },
        createdAt: safeCreateDate(registerResult.user.createdAt),
        lastLoginAt: new Date()
      }
      
      setUser(newUser)
      setShowLoginModal(false)
      
      // 显示成功消息
      alert('注册成功！')
      
    } catch (error) {
      console.error('注册失败:', error)
      // 显示错误消息
      alert('注册失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 第三方登录处理
  const handleThirdPartyLogin = useCallback(async (loginType: 'wechat' | 'google', data: any) => {
    setIsLoading(true)
    try {
      let loginResult
      
      if (loginType === 'wechat') {
        loginResult = await userApi.wechatLogin(data)
      } else if (loginType === 'google') {
        loginResult = await userApi.googleLogin(data)
      } else {
        throw new Error('不支持的登录类型')
      }
      
      console.log(`${loginType}登录成功:`, loginResult)
      
      // 保存token到本地存储
      if (loginResult.token) {
        const { tokenManager } = await import('@/app/lib/request');
        tokenManager.setToken(loginResult.token);
        console.log('Token已保存:', loginResult.token);
      }
      
      // 根据API返回结果创建用户对象
      const newUser: UserType = {
        id: loginResult.user.id || 'user_' + Date.now(),
        email: loginResult.user.email || '',
        name: loginResult.user.name || loginResult.user.username,
        isLoggedIn: true,
        membership: {
          type: 'free',
          startDate: safeCreateDate(loginResult.user.createdAt),
          endDate: createFutureDate(365),
          isActive: true,
          dailyUsage: 0,
          maxDailyUsage: 5,
          totalStorage: 100 * 1024 * 1024,
          usedStorage: 0,
          features: ['基础格式转换', '每日5张图片处理']
        },
        createdAt: safeCreateDate(loginResult.user.createdAt),
        lastLoginAt: new Date()
      }
      
      setUser(newUser)
      setShowLoginModal(false)
      
      // 显示成功消息
      alert(`${loginType === 'wechat' ? '微信' : 'Google'}登录成功！`)
      
    } catch (error) {
      console.error(`${loginType}登录失败:`, error)
      alert(`${loginType === 'wechat' ? '微信' : 'Google'}登录失败，请重试`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 用户登出
  const handleLogout = useCallback(async () => {
    // 清除token
    const { tokenManager } = await import('@/app/lib/request');
    tokenManager.clearToken();
    console.log('Token已清除');
    
    const guestUser: UserType = {
      id: 'guest',
      email: 'guest@example.com',
      name: '游客用户',
      isLoggedIn: false,
      membership: {
        type: 'free',
        startDate: new Date(),
          endDate: createFutureDate(365),
        isActive: true,
        dailyUsage: 0,
        maxDailyUsage: 5,
        totalStorage: 100 * 1024 * 1024,
        usedStorage: 0,
        features: ['基础格式转换', '每日5张图片处理']
      },
      createdAt: new Date(),
      lastLoginAt: new Date()
    }
    setUser(guestUser)
    setHistory([])
  }, [])

  // 升级会员
  const handleUpgrade = useCallback((type: 'vip' | 'premium') => {
    if (!user) return

    const newMembership: Membership = {
      type,
      startDate: new Date(),
      endDate: createFutureDate(30), // 30天
      isActive: true,
      dailyUsage: user.membership.dailyUsage,
      maxDailyUsage: type === 'premium' ? 999999 : 100,
      totalStorage: type === 'premium' ? 100 * 1024 * 1024 * 1024 : 10 * 1024 * 1024 * 1024, // 100GB or 10GB
      usedStorage: user.membership.usedStorage,
      features: type === 'premium' 
        ? ['无限图片处理', '100GB存储', 'AI功能', '批量处理', '高级压缩', 'API访问', '24/7客服']
        : ['每日100张图片', '10GB存储', '批量处理', '高级压缩', '优先客服']
    }

    setUser(prev => prev ? { ...prev, membership: newMembership } : prev)
    setShowMembershipModal(false)
  }, [user])

  // 渲染标签页内容
  const renderTabContent = () => {
    if (!user) return null

    switch (activeTab) {
      case 'convert':
        return (
          <FormatConvert
            user={user}
            onUpdateUser={handleUpdateUser}
            onAddHistory={handleAddHistory}
            onShowFeatureGuide={() => setShowFeatureGuide(true)}
          />
        )
      case 'compress':
        return (
          <ImageCompress
            user={user}
            onUpdateUser={handleUpdateUser}
            onAddHistory={handleAddHistory}
            onShowFeatureGuide={() => setShowFeatureGuide(true)}
          />
        )
      case 'crop':
        return (
          <ImageCrop
            user={user}
            onUpdateUser={handleUpdateUser}
            onAddHistory={handleAddHistory}
            onShowFeatureGuide={() => setShowFeatureGuide(true)}
          />
        )
      case 'ai':
        return (
          <AIFeatures
            user={user}
            onUpdateUser={handleUpdateUser}
            onAddHistory={handleAddHistory}
            onShowFeatureGuide={() => setShowFeatureGuide(true)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-8">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        {/* <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            <ImageIcon className="inline-block mr-3" size={40} />
            {isClient ? t('header.title') : '专业图片处理工具'}
          </h1>
          <p className="text-lg text-gray-600">
            {isClient ? t('header.subtitle') : '支持格式转换、压缩优化、裁剪缩放、AI处理等多种功能'}
          </p>
        </div> */}

        {/* 用户信息栏 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                user?.membership.type === 'premium'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : user?.membership.type === 'vip'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {user?.membership.type === 'premium' ? (isClient ? t('user.premium') : '特级会员') : 
                 user?.membership.type === 'vip' ? (isClient ? t('user.vip') : 'VIP会员') : (isClient ? t('user.free') : '普通用户')}
              </div>
              <div className="text-sm text-gray-600">
                {isClient ? t('user.dailyUsage') : '今日已使用'}: {user?.membership.dailyUsage || 0}/{user?.membership.maxDailyUsage || 5}
              </div>
              <div className="text-sm text-gray-600">
                {isClient ? t('user.storage') : '存储'}: {Math.round((user?.membership.usedStorage || 0) / 1024 / 1024)}MB / {Math.round((user?.membership.totalStorage || 0) / 1024 / 1024)}MB
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* <LocaleSelector /> */}
              {user?.isLoggedIn ? (
                <UserProfile 
                  user={user} 
                  onLogout={handleLogout}
                  onUpgrade={() => setShowMembershipModal(true)}
                />
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="btn-primary"
                >
                  <LogIn className="inline-block mr-2" size={16} />
                  {isClient ? t('user.loginRegister') : '登录/注册'}
                </button>
              )}
              {user?.membership.type === 'free' && (
                <button 
                  onClick={() => setShowMembershipModal(true)}
                  className="btn-secondary"
                >
                  <Crown className="inline-block mr-2" size={16} />
                  {isClient ? t('user.upgrade') : '升级会员'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
            
          </div>
        </div>

        {/* 标签页内容 */}
        <div className="max-w-6xl mx-auto">
          {renderTabContent()}
        </div>
      </div>

      {/* 模态框 */}
      <EnhancedLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onThirdPartyLogin={handleThirdPartyLogin}
        isLoading={isLoading}
      />

      <MembershipModal
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        onUpgrade={handleUpgrade}
        currentType={user?.membership.type || 'free'}
      />

      <FeatureGuide
        isOpen={showFeatureGuide}
        onClose={() => setShowFeatureGuide(false)}
        activeTab={activeTab}
      />
    </div>
  )
}