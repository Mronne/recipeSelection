/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // 静态导出模式，构建为纯静态文件由后端直接 serve
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  // 允许所有主机访问
  allowedDevOrigins: ['*'],
}

module.exports = nextConfig
