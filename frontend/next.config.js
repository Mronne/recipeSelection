/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // 静态导出模式，用于嵌入 Mealie 后端
  output: 'export',
  distDir: 'dist',
  // 设置基础路径（Mealie 后端会通过 / 提供前端）
  basePath: '',
  // 允许从任何来源访问
  allowedDevOrigins: ['*'],
}
module.exports = nextConfig
