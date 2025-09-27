'use client'

import { useUser } from '@/app/hooks/useUser';

export default function UserInfoDemo() {
  const {
    user,
    isLoading,
    isAuthenticated,
    isLoggedIn,
    isMember,
    isMembershipActive,
    getRemainingUsage,
    getStorageUsagePercent,
    refreshUser,
    updateUsage
  } = useUser();

  if (isLoading) {
    return <div className="p-4">加载中...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">用户信息演示</h3>
      
      <div className="space-y-2">
        <p><strong>用户名:</strong> {user?.name || '未知'}</p>
        <p><strong>邮箱:</strong> {user?.email || '未知'}</p>
        <p><strong>登录状态:</strong> {isLoggedIn ? '已登录' : '未登录'}</p>
        <p><strong>认证状态:</strong> {isAuthenticated ? '已认证' : '未认证'}</p>
        <p><strong>会员类型:</strong> {user?.membership.type || '未知'}</p>
        <p><strong>是否会员:</strong> {isMember ? '是' : '否'}</p>
        <p><strong>会员有效:</strong> {isMembershipActive ? '是' : '否'}</p>
        <p><strong>剩余使用次数:</strong> {getRemainingUsage}</p>
        <p><strong>存储使用率:</strong> {getStorageUsagePercent.toFixed(1)}%</p>
      </div>

      <div className="mt-4 space-x-2">
        <button
          onClick={refreshUser}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          刷新用户信息
        </button>
        
        <button
          onClick={() => updateUsage({ dailyUsage: (user?.membership.dailyUsage || 0) + 1 })}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          增加使用量
        </button>
      </div>
    </div>
  );
}
