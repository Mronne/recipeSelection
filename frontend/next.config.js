/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // standalone 模式用于 Docker 部署（支持动态路由）
  output: 'standalone',
  // 允许所有主机访问
  allowedDevOrigins: ['*'],
  // API 代理配置 - 开发时转发到后端
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:9000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
