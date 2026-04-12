# 极空间 Z2 PRO 部署指南

## 环境信息
- **设备**: 极空间 Z2 PRO
- **架构**: ARM64 (linux/arm64)
- **镜像**: 已构建完成，支持 ARM64

---

## 方案一：使用极空间 Container Station (推荐)

### 步骤 1: 准备工作

1. 打开极空间客户端 → 进入 **Container Station (容器中心)**
2. 确保已开启 Docker 服务
3. 在电脑上创建 `docker-compose.yml` 文件（等下会上传到极空间）

### 步骤 2: 创建部署文件

在你的电脑上创建以下文件：

**docker-compose.yml**
```yaml
version: "3.8"

services:
  # 后端 API 服务
  mealie:
    container_name: wangzhe-restaurant-api
    image: ghcr.io/mronne/recipeselection:main
    restart: always
    ports:
      - "9000:9000"
    volumes:
      - ./data/mealie-data:/app/data/
      - ./data/mealie-images:/app/images
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      - ALLOW_SIGNUP=true
      - LOG_LEVEL=info
      - BASE_URL=http://你的极空间IP:9000
      - DB_ENGINE=sqlite
    networks:
      - mealie-network

  # 前端 Web 服务
  frontend:
    container_name: wangzhe-restaurant-web
    image: ghcr.io/mronne/recipeselection-frontend:main
    restart: always
    ports:
      - "3000:3000"
    environment:
      # 后端 API 地址（使用 Docker 内部网络）
      - NEXT_PUBLIC_API_URL=http://mealie:9000
    networks:
      - mealie-network
    depends_on:
      - mealie

networks:
  mealie-network:
    driver: bridge
```

**说明**：将 `你的极空间IP` 替换为实际的 IP 地址，如 `192.168.1.100`

### 步骤 3: 上传到极空间

1. 打开极空间客户端 → **文件管理**
2. 创建一个文件夹，如：`/Docker/wangzhe-restaurant/`
3. 将 `docker-compose.yml` 上传到这个文件夹

### 步骤 4: 使用 Container Station 部署

#### 方法 A: 通过 Compose 项目部署（推荐）

1. 打开 **Container Station**
2. 左侧菜单 → **Compose 项目**
3. 点击 **创建 Compose 项目**
4. 项目名称：`wangzhe-restaurant`
5. 选择 **使用 Docker Compose 文件创建**
6. 文件路径：点击右侧文件夹图标，选择刚才上传的 `docker-compose.yml`
7. 点击 **创建**

#### 方法 B: 命令行部署（高级用户）

1. 在极空间中开启 **SSH 访问**（设置 → 服务 → SSH）
2. 使用 SSH 客户端连接到极空间：
   ```bash
   ssh root@你的极空间IP
   # 密码：你的极空间管理员密码
   ```
3. 进入目录并启动：
   ```bash
   cd /你的存储池/Docker/wangzhe-restaurant/
   docker-compose up -d
   ```

### 步骤 5: 验证部署

1. 在 Container Station → **容器** 中查看：
   - `wangzhe-restaurant-api` (后端)
   - `wangzhe-restaurant-web` (前端)
2. 确认两个容器都显示为 **运行中** (绿色)

### 步骤 6: 访问应用

- **前端界面**: `http://你的极空间IP:3000`
- **后端 API**: `http://你的极空间IP:9000`

---

## 方案二：使用极空间自带模板（简化版）

如果只想要后端（不带独立前端）：

```yaml
version: "3.8"

services:
  mealie:
    container_name: wangzhe-restaurant
    image: ghcr.io/mronne/recipeselection:main
    restart: always
    ports:
      - "9000:9000"
    volumes:
      - ./data:/app/data/
      - ./images:/app/images
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      - ALLOW_SIGNUP=true
      - BASE_URL=http://你的极空间IP:9000
```

访问地址：`http://你的极空间IP:9000`

---

## 方案三：使用 Portainer 管理（可选）

如果你已经在极空间安装了 Portainer：

1. 登录 Portainer
2. **Stacks** → **Add stack**
3. Name: `wangzhe-restaurant`
4. 将上面的 docker-compose 内容粘贴到编辑器
5. 点击 **Deploy the stack**

---

## 常见问题

### Q1: 拉取镜像很慢或失败
**解决**: 极空间可能无法直接访问 ghcr.io，可以尝试：
- 等待重试（有时网络会恢复）
- 使用代理（在 Container Station 设置中配置）
- 手动导入镜像（见下方）

### Q2: 如何手动导入镜像
如果自动拉取失败，可以在电脑上先下载镜像再导入：

```bash
# 在电脑上下载镜像
docker pull ghcr.io/mronne/recipeselection:main
docker pull ghcr.io/mronne/recipeselection-frontend:main

# 保存为文件
docker save ghcr.io/mronne/recipeselection:main > mealie-backend.tar
docker save ghcr.io/mronne/recipeselection-frontend:main > mealie-frontend.tar

# 上传到极空间，然后在 Container Station 中导入
```

### Q3: 如何更新到最新版本
在 Container Station 中：
1. 停止并删除现有容器（**不要删除数据卷**）
2. 重新创建 Compose 项目，会自动拉取最新镜像

或使用 SSH：
```bash
cd /你的存储池/Docker/wangzhe-restaurant/
docker-compose pull
docker-compose up -d
```

### Q4: 数据备份
定期备份以下目录：
- `./data/mealie-data/` - 数据库和配置
- `./data/mealie-images/` - 上传的图片

---

## 需要我帮你创建配置文件吗？

请提供以下信息，我可以帮你生成个性化的配置文件：
1. 你的极空间 IP 地址（如：192.168.1.100）
2. 是否需要前端独立部署（还是只用后端）
3. 数据存储路径偏好
