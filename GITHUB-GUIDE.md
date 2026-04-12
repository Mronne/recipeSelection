# GitHub 上传和 CI/CD 配置指南

## 1. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 输入仓库名称: `recipeSelection`
3. 选择公开或私有仓库
4. 不要初始化 README（我们已有 README.md）
5. 点击 "Create repository"

## 2. 上传代码到 GitHub

```bash
cd ~/Projects/recipeSelection

# 初始化 Git（如果尚未初始化）
git init

# 添加远程仓库（替换 yourusername 为你的 GitHub 用户名）
git remote add origin https://github.com/yourusername/recipeSelection.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Wangzhe Restaurant frontend with Docker support"

# 推送到 GitHub
git push -u origin main
# 如果默认分支是 master，使用: git push -u origin master
```

## 3. 配置 GitHub Actions

### 3.1 GitHub Container Registry（默认）

无需额外配置，GitHub Actions 会自动使用 `GITHUB_TOKEN` 推送镜像到 `ghcr.io`。

镜像地址格式：
```
ghcr.io/yourusername/recipeselection:latest
```

### 3.2 Docker Hub（可选）

如果你想推送到 Docker Hub：

1. 访问 https://hub.docker.com/
2. 创建访问令牌 (Account Settings → Security → New Access Token)
3. 在 GitHub 仓库设置中添加 Secrets：
   - 点击 Settings → Secrets and variables → Actions
   - 添加 `DOCKERHUB_USERNAME`（你的 Docker Hub 用户名）
   - 添加 `DOCKERHUB_TOKEN`（刚才创建的令牌）

4. 启用 `docker-hub.yml` 工作流（取消 `.github/workflows/docker-hub.yml` 的注释或重命名）

## 4. 查看构建状态

1. 访问 GitHub 仓库
2. 点击 Actions 标签
3. 查看工作流运行状态

## 5. 拉取构建好的镜像

### 从 GitHub Container Registry 拉取

```bash
# 登录（需要 GitHub 个人访问令牌）
echo $GITHUB_TOKEN | docker login ghcr.io -u yourusername --password-stdin

# 拉取镜像
docker pull ghcr.io/yourusername/recipeselection:latest

# 运行
docker run -d -p 3000:3000 ghcr.io/yourusername/recipeselection:latest
```

### 从 Docker Hub 拉取（如果配置了）

```bash
docker pull yourusername/wangzhe-restaurant-frontend:latest
docker run -d -p 3000:3000 yourusername/wangzhe-restaurant-frontend:latest
```

## 6. 自动触发构建

GitHub Actions 会在以下情况自动触发构建：

- 推送到 `main` 或 `master` 分支
- 创建版本标签（如 `v1.0.0`）
- 手动触发（通过 Actions 页面的 "Run workflow" 按钮）

## 7. 版本标签

创建新版本：

```bash
# 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签
git push origin v1.0.0
```

这将触发 GitHub Actions 构建并推送带版本号的镜像：
- `ghcr.io/yourusername/recipeselection:1.0.0`
- `ghcr.io/yourusername/recipeselection:latest`

## 8. 常见问题

### 权限错误

如果推送镜像时出现权限错误：

1. 确保 GitHub 仓库启用了 GitHub Actions
2. 在仓库设置中，确保 Actions 有写入包的权限：
   - Settings → Actions → General → Workflow permissions
   - 选择 "Read and write permissions"

### 镜像拉取失败

如果无法拉取镜像：

```bash
# 检查镜像是否存在
docker pull ghcr.io/yourusername/recipeselection:latest

# 如果需要认证
docker login ghcr.io -u yourusername
# 输入 GitHub 个人访问令牌作为密码
```

## 9. 本地测试构建

在推送到 GitHub 前，可以先本地测试：

```bash
cd ~/Projects/recipeSelection

# 构建镜像
docker build -t test-build:latest .

# 运行测试
docker run -d -p 3000:3000 test-build:latest

# 检查日志
docker logs <container-id>
```

## 10. 更新代码

修改代码后推送到 GitHub：

```bash
git add .
git commit -m "Your commit message"
git push

# 推送标签（如果有新版本）
git push origin v1.1.0
```

GitHub Actions 将自动构建并推送新镜像。
