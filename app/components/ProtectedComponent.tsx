'use client'

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { imageApi } from '@/app/lib/api/image';

export default function ProtectedComponent() {
  const { isAuthenticated, token } = useAuth();
  const [result, setResult] = useState<string>('');

  const testProtectedAPI = async () => {
    if (!isAuthenticated) {
      setResult('请先登录');
      return;
    }

    try {
      // 这个请求会自动携带token
      const images = await imageApi.getImages({ page: 1, limit: 10 });
      setResult(`获取图片列表成功: ${JSON.stringify(images)}`);
    } catch (error) {
      setResult(`请求失败: ${error}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p>请先登录以访问受保护的内容</p>
        <p>当前Token: {token ? '已设置' : '未设置'}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-100 border border-green-400 rounded">
      <h3 className="font-bold mb-2">受保护的内容</h3>
      <p className="mb-2">Token: {token ? `${token.substring(0, 20)}...` : '未设置'}</p>
      
      <button
        onClick={testProtectedAPI}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        测试受保护的API
      </button>
      
      {result && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <pre className="text-sm">{result}</pre>
        </div>
      )}
    </div>
  );
}
