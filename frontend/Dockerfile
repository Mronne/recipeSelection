# ==========================================
# 王者餐厅前端 - ARM64 Docker 镜像
# ==========================================

# 阶段1: 构建
FROM node:20-alpine AS builder

# 安装必要的构建工具
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源码
COPY . .

# 构建应用
RUN npm run build

# 阶段2: 运行
FROM node:20-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_API_URL=""

# 从构建阶段复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 启动应用
CMD ["node", "server.js"]
