# ==========================================
# Next.js Frontend - Standalone Mode
# 支持动态路由，适合管理后台类应用
# ==========================================

# 阶段1: 构建
FROM --platform=$BUILDPLATFORM node:20-slim AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install --prefer-offline --no-audit --no-fund

# 复制源码
COPY . .

# 构建 standalone 应用
RUN npm run build

# 阶段2: 运行
FROM node:20-slim AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 从构建阶段复制 standalone 输出
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# 启动应用
CMD ["node", "server.js"]
