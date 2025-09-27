'use client'

import { useUser } from '@/app/hooks/useUser';

export default function UserInfo() {
  const {
    user,
    isLoading,
    error,
    isAuthenticated,
    isLoggedIn,
    isMember,
    isMembershipActive,
    isOverLimit,
    getRemainingUsage,
    getStorageUsagePercent,
    refreshUser,
    updateUsage
  } = useUser();

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 rounded-lg">
        <p className="text-red-700">错误: {error}</p>
        <button
          onClick={refreshUser}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          重试
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
        <p className="text-yellow-700">未找到用户信息</p>
      </div>
    );
  }

  const handleTestUsage = () => {
    // 模拟增加使用量
    updateUsage({
      dailyUsage: user.membership.dailyUsage + 1,
      usedStorage: user.membership.usedStorage + 1024 * 1024 // 增加1MB
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">用户信息</h2>
        <button
          onClick={refreshUser}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          刷新
        </button>
      </div>

      {/* 基本信息 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">用户名</label>
            <p className="text-gray-900">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">邮箱</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">用户ID</label>
            <p className="text-gray-900 font-mono text-sm">{user.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">登录状态</label>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              isLoggedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isLoggedIn ? '已登录' : '未登录'}
            </span>
          </div>
        </div>
      </div>

      {/* 会员信息 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">会员信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">会员类型</label>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              user.membership.type === 'free' ? 'bg-gray-100 text-gray-800' :
              user.membership.type === 'vip' ? 'bg-yellow-100 text-yellow-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {user.membership.type === 'free' ? '免费用户' :
               user.membership.type === 'vip' ? 'VIP会员' : '高级会员'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">会员状态</label>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              isMembershipActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isMembershipActive ? '有效' : '已过期'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">到期时间</label>
            <p className="text-gray-900">{user.membership.endDate.toLocaleDateString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">是否会员</label>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              isMember ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isMember ? '是' : '否'}
            </span>
          </div>
        </div>
      </div>

      {/* 使用统计 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">使用统计</h3>
        <div className="space-y-4">
          {/* 每日使用量 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-600">今日使用量</label>
              <span className="text-sm text-gray-900">
                {user.membership.dailyUsage} / {user.membership.maxDailyUsage}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  isOverLimit ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(100, (user.membership.dailyUsage / user.membership.maxDailyUsage) * 100)}%`
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              剩余: {getRemainingUsage} 次
              {isOverLimit && <span className="text-red-500 ml-2">(已超出限制)</span>}
            </p>
          </div>

          {/* 存储使用量 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-600">存储使用量</label>
              <span className="text-sm text-gray-900">
                {(user.membership.usedStorage / 1024 / 1024).toFixed(1)} MB / {(user.membership.totalStorage / 1024 / 1024).toFixed(0)} MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${getStorageUsagePercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              使用率: {getStorageUsagePercent.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* 功能特性 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">可用功能</h3>
        <div className="flex flex-wrap gap-2">
          {user.membership.features.map((feature, index) => (
            <span
              key={index}
              className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* 测试按钮 */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">测试功能</h3>
        <button
          onClick={handleTestUsage}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          模拟增加使用量
        </button>
      </div>
    </div>
  );
}
