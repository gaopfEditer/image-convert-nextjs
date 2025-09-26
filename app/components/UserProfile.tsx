'use client'

import { useState } from 'react'
import { User, Crown, Calendar, HardDrive, Settings, LogOut, History, Star } from 'lucide-react'
import { User as UserType, Membership } from '../types/user'

interface UserProfileProps {
  user: UserType
  onLogout: () => void
  onUpgrade: () => void
}

export default function UserProfile({ user, onLogout, onUpgrade }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'vip':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getMembershipName = (type: string) => {
    switch (type) {
      case 'premium':
        return '特级会员'
      case 'vip':
        return 'VIP会员'
      default:
        return '普通用户'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:block font-medium">{user.name}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">用户中心</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 用户信息 */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white mt-2 ${getMembershipColor(user.membership.type)}`}>
                    <Crown className="w-4 h-4 mr-1" />
                    {getMembershipName(user.membership.type)}
                  </div>
                </div>
              </div>

              {/* 会员信息 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  会员信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">会员类型</p>
                    <p className="font-medium">{getMembershipName(user.membership.type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">到期时间</p>
                    <p className="font-medium">{formatDate(user.membership.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">今日使用</p>
                    <p className="font-medium">
                      {user.membership.dailyUsage}/{user.membership.maxDailyUsage} 张
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">存储空间</p>
                    <p className="font-medium">
                      {formatFileSize(user.membership.usedStorage)}/{formatFileSize(user.membership.totalStorage)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>存储使用率</span>
                    <span>{Math.round((user.membership.usedStorage / user.membership.totalStorage) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(user.membership.usedStorage / user.membership.totalStorage) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 功能权限 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">功能权限</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {user.membership.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3">
                {user.membership.type === 'free' && (
                  <button
                    onClick={onUpgrade}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all font-medium"
                  >
                    <Crown className="inline-block mr-2" size={16} />
                    升级会员
                  </button>
                )}
                <button
                  onClick={() => {/* 历史记录功能 */}}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <History className="inline-block mr-2" size={16} />
                  历史记录
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  <LogOut className="inline-block mr-2" size={16} />
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
