# NAS 部署指南

## 概述

本项目包含完整的食谱管理系统：
- **前端**: Next.js 15 + React 19 (端口 3000)
- **后端**: Mealie API - Python FastAPI (端口 9000)
- **数据存储**: SQLite (存储在NAS本地)

## 支持的 NAS 系统

- ✅ Synology DSM 7.0+
- ✅ QNAP QTS 5.0+
- ✅ Unraid 6.10+
- ✅ TrueNAS SCALE
- ✅ 任何支持 Docker 的 NAS

## 快速部署

### 1. 克隆仓库到 NAS

```bash
# SSH 连接到 NAS
ssh user@your-nas-ip

# 进入 Docker 目录（根据NAS类型）
# Synology: cd /volume1/docker
# QNAP: cd /share/Container
# Unraid: cd /mnt/user/appdata

git clone https://github.com/yourusername/recipeSelection.git
cd recipeSelection
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp nas-config/.env.example .env

# 编辑配置
nano .env
```

**必须修改的配置：**

```env
# NAS 数据存储路径
NAS_DATA_PATH=/volume1/docker/recipe/data  # Synology 示例

# 外部访问地址
BASE_URL=http://192.168.1.100:3000  # 你的NAS IP
```

### 3. 启动服务

```bash
# 创建数据目录
mkdir -p ${NAS_DATA_PATH}/mealie-data
mkdir -p ${NAS_DATA_PATH}/mealie-images

# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 4. 访问应用

- 前端: http://your-nas-ip:3000
- 后端 API: http://your-nas-ip:9000

**默认管理员账号**: `admin` / `admin123`

## 详细配置

### Synology DSM

```bash
# 1. 安装 Docker 套件
# 2. 开启 SSH (控制面板 > 终端机和 SNMP)
# 3. SSH 登录后执行：

cd /volume1/docker
git clone https://github.com/yourusername/recipeSelection.git
cd recipeSelection

# 配置
export NAS_DATA_PATH=/volume1/docker/recipe/data
export BASE_URL=http://your-synology-ip:3000

# 创建目录并启动
mkdir -p ${NAS_DATA_PATH}/mealie-data
mkdir -p ${NAS_DATA_PATH}/mealie-images
docker-compose up -d
```

**启用反向代理（可选）：**
1. 控制面板 > 登录门户 > 高级 > 反向代理服务器
2. 创建规则：
   - 来源: `https://recipes.yourdomain.com`
   - 目的地: `http://localhost:3000`

### QNAP QTS

```bash
# 1. 安装 Container Station
# 2. 开启 SSH (控制台 > 网络 & 文件服务 > Telnet/SSH)
# 3. SSH 登录后执行：

cd /share/Container
git clone https://github.com/yourusername/recipeSelection.git
cd recipeSelection

# 配置
export NAS_DATA_PATH=/share/Container/recipe/data
export BASE_URL=http://your-qnap-ip:3000

docker-compose up -d
```

### Unraid

```bash
# 1. 安装 Docker 和 Compose 插件
# 2. 通过终端或 User Scripts 执行：

cd /mnt/user/appdata
git clone https://github.com/yourusername/recipeSelection.git
cd recipeSelection

# 配置
export NAS_DATA_PATH=/mnt/user/appdata/recipe/data
export BASE_URL=http://your-unraid-ip:3000

docker-compose up -d
```

**或使用 Unraid 模板：**
1. 在 Community Applications 中搜索 "Compose"
2. 添加 Compose 堆栈，使用本项目的 docker-compose.yml

## 数据备份

### 自动备份脚本

```bash
#!/bin/bash
# backup.sh - 添加到 NAS 的计划任务

BACKUP_DIR="/volume1/backups/recipe"
DATA_DIR="/volume1/docker/recipe/data"
DATE=$(date +%Y%m%d_%H%M%S)

# 停止服务
cd /volume1/docker/recipeSelection
docker-compose stop

# 备份数据
tar -czf ${BACKUP_DIR}/recipe_backup_${DATE}.tar.gz ${DATA_DIR}

# 启动服务
docker-compose start

# 保留最近 30 天的备份
find ${BACKUP_DIR} -name "recipe_backup_*.tar.gz" -mtime +30 -delete
```

### 恢复备份

```bash
# 停止服务
docker-compose down

# 恢复数据
tar -xzf recipe_backup_20240115_120000.tar.gz -C /

# 启动服务
docker-compose up -d
```

## 更新

```bash
cd /path/to/recipeSelection

# 拉取最新代码
git pull

# 重新构建并启动
docker-compose down
docker-compose up -d --build

# 清理旧镜像
docker image prune -f
```

## 故障排除

### 端口冲突

```bash
# 检查端口占用
netstat -tlnp | grep 3000
netstat -tlnp | grep 9000

# 修改 .env 文件中的端口
FRONTEND_PORT=3001
BACKEND_PORT=9001
```

### 权限问题

```bash
# 修复数据目录权限
sudo chown -R ${PUID}:${PGID} ${NAS_DATA_PATH}

# 或在 Synology 中
sudo chown -R 1030:100 ${NAS_DATA_PATH}  # admin:users
```

### 内存不足

```bash
# 限制容器内存
docker-compose down

# 编辑 docker-compose.yml，添加内存限制
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
```

docker-compose up -d
```

### 无法访问

```bash
# 检查防火墙
sudo iptables -L -n | grep 3000

# Synology: 控制面板 > 安全性 > 防火墙
# 添加允许规则：端口 3000, 9000

# 查看容器状态
docker-compose ps
docker-compose logs
```

## 高级配置

### 使用 HTTPS

**方案 1: 反向代理 + SSL**
```nginx
# Nginx 配置示例
server {
    listen 443 ssl;
    server_name recipes.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:9000/api/;
        proxy_set_header Host $host;
    }
}
```

**方案 2: Cloudflare Tunnel**
```bash
# 安装 cloudflared
docker run --net=host cloudflare/cloudflared:latest tunnel --no-autoupdate run --token YOUR_TOKEN
```

### 数据库优化

SQLite 适合中小型部署。如果数据量大，可以考虑 PostgreSQL：

```yaml
# docker-compose.yml 添加
services:
  postgres:
    image: postgres:15-alpine
    container_name: recipe-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: mealie
      POSTGRES_PASSWORD: your-password
      POSTGRES_DB: mealie
    volumes:
      - ${NAS_DATA_PATH}/postgres:/var/lib/postgresql/data
    networks:
      - recipe-network
```

## 常用命令

```bash
# 查看日志
docker-compose logs -f [frontend|backend]

# 重启服务
docker-compose restart [frontend|backend]

# 进入容器
docker-compose exec backend bash
docker-compose exec frontend sh

# 查看资源使用
docker stats

# 更新镜像
docker-compose pull
docker-compose up -d
```

## 支持

- GitHub Issues: https://github.com/yourusername/recipeSelection/issues
- 文档: https://github.com/yourusername/recipeSelection/wiki
