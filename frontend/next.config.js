/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // standalone 模式用于 Docker 部署（支持动态路由）
  output: 'standalone',
  // 允许所有主机访问
  allowedDevOrigins: ['*'],
}

module.exports = nextConfig
