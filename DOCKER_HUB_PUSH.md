# 推送到 Docker Hub 指南

## 常见错误

```
Error response from daemon: Get "https://registry-1.docker.io/v2/": 
unauthorized: incorrect username or password
```

**原因**：Docker Hub 登录需要使用 **Access Token**，不能使用账号密码！

---

## 步骤 1: 创建 Docker Hub Access Token

1. 登录 [Docker Hub](https://hub.docker.com)
2. 点击右上角头像 → **Account Settings**
3. 左侧菜单 → **Security** → **New Access Token**
4. 填写信息：
   - **Access Token Description**: `GitHub Actions Push` 或任意名称
   - **Access Permissions**: `Read, Write, Delete`
5. 点击 **Generate**
6. **立即复制保存 Token**（只显示一次！）

![Docker Hub Access Token](https://docs.docker.com/docker-hub/images/hub-create-token.png)

---

## 步骤 2: 本地登录测试

### 使用 Token 登录（不是密码！）

```bash
# 使用你的 Docker Hub 用户名和刚才生成的 Token
docker login -u 你的DockerHub用户名 --password-stdin
# 然后粘贴 Token，回车
```

**示例**：
```bash
docker login -u mronne --password-stdin
# 输入: dckr_pat_xxxxxxxxxxxxx
```

成功会显示：`Login Succeeded`

---

## 步骤 3: 本地推送测试

```bash
# 给镜像打标签（替换为你的用户名）
docker tag ghcr.io/mronne/recipeselection:main mronne/yus-kitchen:latest
docker tag ghcr.io/mronne/recipeselection-frontend:main mronne/yus-kitchen-frontend:latest

# 推送
docker push mronne/yus-kitchen:latest
docker push mronne/yus-kitchen-frontend:latest
```

---

## 步骤 4: GitHub Actions 自动推送到 Docker Hub

### 4.1 添加 Secrets

在 GitHub 仓库 → Settings → Secrets and variables → Actions → **New repository secret**：

| Secret Name | Value |
|-------------|-------|
| `DOCKERHUB_USERNAME` | 你的 Docker Hub 用户名 |
| `DOCKERHUB_TOKEN` | 刚才生成的 Access Token |

### 4.2 创建工作流

`.github/workflows/docker-hub.yml`

```yaml
name: Build and Push to Docker Hub

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: read  # 从 GHCR 拉取

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Set up QEMU
      uses: docker/setup-qemu-action@v3
      with:
        platforms: linux/arm64

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}

    - name: Login to GitHub Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push backend
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./docker/Dockerfile
        platforms: linux/arm64
        push: true
        tags: |
          ${{ secrets.DOCKERHUB_USERNAME }}/yus-kitchen:latest
          ${{ secrets.DOCKERHUB_USERNAME }}/yus-kitchen:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Build and push frontend
      uses: docker/build-push-action@v5
      with:
        context: ./frontend
        platforms: linux/arm64
        push: true
        tags: |
          ${{ secrets.DOCKERHUB_USERNAME }}/yus-kitchen-frontend:latest
          ${{ secrets.DOCKERHUB_USERNAME }}/yus-kitchen-frontend:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

---

## 常见问题

### Q1: 提示 "denied: requested access to the resource is denied"
**原因**: 仓库名不对或没有权限
**解决**: 
- 确认仓库已创建（Docker Hub 网页上新建）
- 或者先推送会自动创建 public 仓库

### Q2: Token 登录成功但推送失败
**原因**: 可能是组织账号限制或仓库名冲突
**解决**:
```bash
# 检查当前登录
docker info | grep Username

# 确认镜像标签正确
docker images | grep yus-kitchen
```

### Q3: GitHub Actions 推送失败
**原因**: Secrets 没设置对
**解决**:
1. 检查 Settings → Secrets → Actions 中是否有 `DOCKERHUB_USERNAME` 和 `DOCKERHUB_TOKEN`
2. 确认 Token 有 `Read, Write, Delete` 权限
3. 重新运行 workflow

---

## 极空间部署（使用 Docker Hub）

推送到 Docker Hub 后，极空间部署更简单（无需认证）：

```yaml
version: "3.8"

services:
  mealie:
    container_name: yus-kitchen-api
    image: mronne/yus-kitchen:latest  # Docker Hub 镜像
    restart: always
    ports:
      - "9000:9000"
    volumes:
      - ./data/mealie-data:/app/data/
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai

  frontend:
    container_name: yus-kitchen-web
    image: mronne/yus-kitchen-frontend:latest  # Docker Hub 镜像
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://mealie:9000
```

优势：
- ✅ 极空间可以直接拉取（Docker Hub 国内访问更快）
- ✅ 无需配置 GitHub Token
- ✅ 镜像下载速度通常比 GHCR 快

---

## 检查清单

- [ ] 在 Docker Hub 创建 Access Token（不是用密码！）
- [ ] Token 权限设置为 `Read, Write, Delete`
- [ ] GitHub Secrets 添加 `DOCKERHUB_USERNAME` 和 `DOCKERHUB_TOKEN`
- [ ] 镜像标签格式：`用户名/仓库名:标签`
- [ ] 确认已登录 Docker Hub: `docker info | grep Registry`
