/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // 输出 standalone 模式，用于 Docker 部署
  output: 'standalone',
  // 允许所有主机访问
  allowedDevOrigins: ['*'],
  async rewrites() {
    // Docker 环境中使用环境变量配置 API 地址
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
}
module.exports = nextConfig
