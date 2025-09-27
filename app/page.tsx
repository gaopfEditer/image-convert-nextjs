'use client'

import { useState, useCallback, useEffect } from 'react'
import { Image as ImageIcon, LogIn, User, HelpCircle, Crown } from 'lucide-react'
import LoginModal from './components/LoginModal'
import UserProfile from './components/UserProfile'
import MembershipModal from './components/MembershipModal'
import FeatureGuide from './components/FeatureGuide'
import LocaleSelector from './components/LocaleSelector'
import FormatConvert from './components/features/FormatConvert'
import ImageCompress from './components/features/ImageCompress'
import ImageCrop from './components/features/ImageCrop'
import AIFeatures from './components/features/AIFeatures'
import { User as UserType, Membership, HistoryRecord } from './types/user'
import { useI18nContext } from './i18n/context'

export default function ImageConverter() {
  const { t, locale } = useI18nContext()
  const [activeTab, setActiveTab] = useState<string>('convert')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showMembershipModal, setShowMembershipModal] = useState(false)
  const [showFeatureGuide, setShowFeatureGuide] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [isClient, setIsClient] = useState(false)

  // 客户端挂载标记
  useEffect(() => {
    setIsClient(true)
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
      setUser(JSON.parse(savedUser))
    } else {
      // 创建默认游客用户
      const guestUser: UserType = {
        id: 'guest',
        email: 'guest@example.com',
        name: '游客用户',
        isLoggedIn: false,
        membership: {
          type: 'free',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后
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
  }, [])

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
  const handleLogin = useCallback((email: string, password: string) => {
    // 模拟登录逻辑
    const loggedInUser: UserType = {
      id: 'user_' + Date.now(),
      email,
      name: email.split('@')[0],
      isLoggedIn: true,
      membership: {
        type: 'free',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
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
    setUser(loggedInUser)
    setShowLoginModal(false)
  }, [])

  // 用户注册
  const handleRegister = useCallback((name: string, email: string, password: string) => {
    // 模拟注册逻辑
    const newUser: UserType = {
      id: 'user_' + Date.now(),
      email,
      name,
      isLoggedIn: true,
      membership: {
        type: 'free',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
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
    setUser(newUser)
    setShowLoginModal(false)
  }, [])

  // 用户登出
  const handleLogout = useCallback(() => {
    const guestUser: UserType = {
      id: 'guest',
      email: 'guest@example.com',
      name: '游客用户',
      isLoggedIn: false,
      membership: {
        type: 'free',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
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
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            <ImageIcon className="inline-block mr-3" size={40} />
            {isClient ? t('header.title') : '专业图片处理工具'}
          </h1>
          <p className="text-lg text-gray-600">
            {isClient ? t('header.subtitle') : '支持格式转换、压缩优化、裁剪缩放、AI处理等多种功能'}
          </p>
        </div>

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
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
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