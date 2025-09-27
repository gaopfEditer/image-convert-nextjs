    'use client'

    import { useState } from 'react';
import { imageApi } from '@/app/lib/api/image';
import { userApi } from '@/app/lib/api/user';
import { api, apiClient } from '@/app/lib/request';

    export default function ApiTest() {
    const [testResult, setTestResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const testApiConnection = async () => {
        setIsLoading(true);
        setTestResult('正在测试API连接...\n');

        try {
        // 测试基本连接
        setTestResult(prev => prev + '1. 测试基本连接...\n');
        const response = await api.get('/api/health');
        setTestResult(prev => prev + '✅ 基本连接正常\n');
        } catch (error) {
        setTestResult(prev => prev + `❌ 连接错误: ${error}\n`);
        }

        try {
        // 测试登录API
        setTestResult(prev => prev + '2. 测试登录API...\n');
        const loginResult = await userApi.login({ 
            username: 'admin', 
            password: 'admin666' 
        });
        setTestResult(prev => prev + `✅ 登录API正常: ${JSON.stringify(loginResult)}\n`);
        } catch (error) {
        setTestResult(prev => prev + `❌ 登录API错误: ${error}\n`);
        }

        try {
        // 测试图片转换API
        setTestResult(prev => prev + '3. 测试图片转换API...\n');
        const formData = new FormData();
        formData.append('file', new Blob(['test'], { type: 'text/plain' }), 'test.txt');
        formData.append('format', 'jpg');
        
        try {
            await api.upload('/api/image/convert', formData);
            setTestResult(prev => prev + '✅ 图片转换API接口正常\n');
        } catch (error: any) {
            if (error.message.includes('400')) {
            setTestResult(prev => prev + '✅ 图片转换API接口存在（返回400是正常的，因为文件格式不支持）\n');
            } else {
            throw error;
            }
        }
        } catch (error) {
        setTestResult(prev => prev + `❌ 图片转换API错误: ${error}\n`);
        }

        setTestResult(prev => prev + '\n测试完成！');
        setIsLoading(false);
    };

    const testImageUpload = async () => {
        setIsLoading(true);
        setTestResult('正在测试图片转换...\n');

        try {
        // 创建一个测试文件
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(0, 0, 100, 100);
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.fillText('Test', 30, 50);
        }

        canvas.toBlob(async (blob) => {
            if (blob) {
            const file = new File([blob], 'test.png', { type: 'image/png' });
            
            // 测试图片转换API
            try {
                const result = await imageApi.convert(file, { format: 'jpg', quality: 80 });
                setTestResult(prev => prev + `✅ 图片转换成功: ${JSON.stringify(result)}\n`);
            } catch (error) {
                setTestResult(prev => prev + `❌ 图片转换失败: ${error}\n`);
            }
            }
            setIsLoading(false);
        });
        } catch (error) {
        setTestResult(prev => prev + `❌ 测试失败: ${error}\n`);
        setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">API 连接测试</h3>
        
        <div className="space-y-4">
            <div className="flex space-x-4">
            <button
                onClick={testApiConnection}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
                {isLoading ? '测试中...' : '测试API连接'}
            </button>
            
            <button
                onClick={testImageUpload}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
                {isLoading ? '上传中...' : '测试图片上传'}
            </button>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
            <h4 className="font-semibold mb-2">测试结果:</h4>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {testResult || '点击按钮开始测试...'}
            </pre>
            </div>

            <div className="text-sm text-gray-600">
            <p><strong>配置信息:</strong></p>
            <p>API Base URL: {apiClient.defaults.baseURL}</p>
            <p>超时时间: {apiClient.defaults.timeout}ms</p>
            <p>代理路径: /api/* → {apiClient.defaults.baseURL}/api/*</p>
            </div>
        </div>
        </div>
    );
    }
