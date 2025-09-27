/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['localhost'],
  },
  // 配置静态资源前缀，确保在宝塔中正确加载
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // 确保静态资源正确输出
  trailingSlash: false,
  // 配置输出目录
  distDir: '.next',
}

module.exports = nextConfig
