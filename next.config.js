/** @type {import('next').NextConfig} */
const nextConfig = {
  // 只在生产环境使用静态导出
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    domains: ['localhost'],
  },
  // 配置静态资源前缀，确保在宝塔中正确加载
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // 确保静态资源正确输出
  trailingSlash: false,
  // 配置输出目录
  distDir: '.next',
  
  // API代理配置 - 根据环境选择后端地址
  async rewrites() {
    // 只在开发环境启用代理
    if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development') {
      // 从环境变量中获取后端地址
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
      
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ]
    }
    return []
  },
  
  // 环境变量配置
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
