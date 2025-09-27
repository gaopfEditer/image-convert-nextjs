'use client'

import { useState } from 'react';
import { api, apiClient } from '@/app/lib/request';

export default function DebugPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDirectConnection = async () => {
    setLoading(true);
    setResult('测试直接连接...\n');
    
    try {
      // 直接测试后端连接
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin666'
        })
      });
      
      const data = await response.json();
      setResult(prev => prev + `直接连接结果: ${response.status} - ${JSON.stringify(data)}\n`);
    } catch (error) {
      setResult(prev => prev + `直接连接错误: ${error}\n`);
    }
    
    setLoading(false);
  };

  const testAxiosConnection = async () => {
    setLoading(true);
    setResult('测试Axios连接...\n');
    
    try {
      const response = await api.post('/api/auth/login', {
        username: 'admin',
        password: 'admin666'
      });
      
      setResult(prev => prev + `Axios连接结果: ${JSON.stringify(response)}\n`);
    } catch (error) {
      setResult(prev => prev + `Axios连接错误: ${error}\n`);
    }
    
    setLoading(false);
  };

  const testProxyConnection = async () => {
    setLoading(true);
    setResult('测试代理连接...\n');
    
    try {
      // 测试代理路径
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin666'
        })
      });
      
      const data = await response.json();
      setResult(prev => prev + `代理连接结果: ${response.status} - ${JSON.stringify(data)}\n`);
    } catch (error) {
      setResult(prev => prev + `代理连接错误: ${error}\n`);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API 调试页面</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">配置信息:</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>API Base URL: {apiClient.defaults.baseURL}</p>
          <p>超时时间: {apiClient.defaults.timeout}ms</p>
          <p>环境: {process.env.NODE_ENV}</p>
        </div>
      </div>

      <div className="space-x-4 mb-4">
        <button
          onClick={testDirectConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          测试直接连接
        </button>
        
        <button
          onClick={testAxiosConnection}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          测试Axios连接
        </button>
        
        <button
          onClick={testProxyConnection}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          测试代理连接
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">测试结果:</h3>
        <pre className="whitespace-pre-wrap text-sm">
          {result || '点击按钮开始测试...'}
        </pre>
      </div>
    </div>
  );
}
