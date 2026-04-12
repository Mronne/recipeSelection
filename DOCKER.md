# Docker 部署指南

## 快速部署

### 使用预构建镜像

```bash
# 从 GitHub Container Registry 拉取
docker pull ghcr.io/yourusername/recipeselection:latest

# 运行
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://your-backend:9000 \
  --name wangzhe-frontend \
  ghcr.io/yourusername/recipeselection:latest
```

### 使用 Docker Compose

```bash
docker-compose up -d
```

## 构建镜像

### 本地构建

```bash
docker build -t wangzhe-restaurant-frontend:latest .
```

### 多架构构建（需要 buildx）

```bash
# 创建 buildx 构建器
docker buildx create --name mybuilder --use
docker buildx inspect --bootstrap

# 构建多架构镜像
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t wangzhe-restaurant-frontend:latest \
  --push .
```

## 导出/导入镜像

### 导出

```bash
docker save wangzhe-restaurant-frontend:latest | gzip > wangzhe-frontend.tar.gz
```

### 导入

```bash
gunzip wangzhe-frontend.tar.gz
docker load -i wangzhe-frontend.tar
```

## 环境配置

### 后端 API 配置

修改 `docker-compose.yml` 中的环境变量：

```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://mealie-backend:9000
```

或使用命令行：

```bash
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://192.168.1.100:9000 \
  wangzhe-restaurant-frontend:latest
```

## 故障排除

### 镜像架构不匹配

```bash
# 检查镜像架构
docker inspect wangzhe-restaurant-frontend:latest --format='{{.Os}}/{{.Architecture}}'

# 预期输出: linux/arm64 或 linux/amd64
```

### CSS 样式未加载

确保使用 `output: 'standalone'` 构建，并正确复制了 `.next/static` 目录。

### API 连接失败

检查 `NEXT_PUBLIC_API_URL` 是否指向正确的后端地址。
