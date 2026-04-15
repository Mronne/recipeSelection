# 私有仓库镜像下载方案

由于仓库是 Private 的，直接 `docker pull` 会报 `unauthorized` 错误。

---

## 方案一：使用 GitHub Token 下载（推荐）

### 步骤 1: 创建 GitHub Personal Access Token

1. 登录 GitHub → 点击右上角头像 → **Settings**
2. 左侧最下方 → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. 点击 **Generate new token (classic)**
4. 填写信息：
   - **Note**: `Docker Pull Token`
   - **Expiration**: 选择 30 天（或自定义）
   - **Scopes**: 勾选 `read:packages`（下载镜像需要）
5. 点击 **Generate token**
6. **立即复制保存** token（只显示一次）

### 步骤 2: 使用 Token 登录并下载

#### Windows (PowerShell):
```powershell
# 登录 GitHub Container Registry
$token = "ghp_你的Token"
echo $token | docker login ghcr.io -u Mronne --password-stdin

# 下载镜像
docker pull ghcr.io/mronne/yus-kitchen:main
docker pull ghcr.io/mronne/yus-kitchen-frontend:main

# 保存镜像
docker save ghcr.io/mronne/yus-kitchen:main > mealie-backend.tar
docker save ghcr.io/mronne/yus-kitchen-frontend:main > mealie-frontend.tar
```

#### Mac/Linux:
```bash
# 登录 GitHub Container Registry
echo "ghp_你的Token" | docker login ghcr.io -u Mronne --password-stdin

# 下载镜像
docker pull ghcr.io/mronne/yus-kitchen:main
docker pull ghcr.io/mronne/yus-kitchen-frontend:main

# 保存镜像
docker save ghcr.io/mronne/yus-kitchen:main > mealie-backend.tar
docker save ghcr.io/mronne/yus-kitchen-frontend:main > mealie-frontend.tar
```

---

## 方案二：GitHub Actions 自动导出 Artifact（无需 Token）

配置 GitHub Actions，在每次构建后自动将镜像打包为可下载文件。

已为你添加 workflow 文件：`.github/workflows/export-images.yml`

### 使用方法：

1. **推送到 main 分支** 或 **手动触发 workflow**
2. 等待构建完成
3. 进入 GitHub 仓库 → **Actions** → 选择最新的 workflow 运行
4. 页面下方 **Artifacts** 区域会显示：
   - `mealie-backend-image`
   - `mealie-frontend-image`
5. 点击下载，解压后得到 `.tar` 文件
6. 上传到极空间导入

---

## 方案三：临时改为 Public（最简单）

### 临时公开仓库：
1. GitHub 仓库页面 → **Settings** → 左侧 **General**
2. 最下方 **Danger Zone** → **Change repository visibility**
3. 选择 **Make public** → 输入仓库名确认
4. 现在可以无认证下载镜像

### 下载完成后改回 Private：
1. 同上步骤，选择 **Make private**

> ⚠️ **注意**：改为 public 期间，任何人可以看到代码。如果代码敏感，请使用方案一或二。

---

## 方案四：使用 gh CLI 工具下载

### 安装 GitHub CLI：
- **Windows**: `winget install GitHub.cli`
- **Mac**: `brew install gh`
- **Linux**: 
  ```bash
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  sudo apt update
  sudo apt install gh
  ```

### 登录并下载：
```bash
# 登录（浏览器认证）
gh auth login

# 使用 gh 登录 Docker
gh auth token | docker login ghcr.io -u Mronne --password-stdin

# 下载镜像
docker pull ghcr.io/mronne/yus-kitchen:main
```

---

## 常见问题

### Q: Token 权限不够怎么办？
确保创建 Token 时勾选了：
- ✅ `read:packages` （读取包）
- ✅ `repo` （访问仓库，如果是私有仓库）

### Q: 登录成功但 pull 还是失败？
可能是 Token 没有 package 读取权限，重新创建 Token 并勾选 `read:packages`。

### Q: Docker 登录失败？
检查网络是否能访问 `ghcr.io`，某些网络环境可能需要代理。

---

## 推荐方案总结

| 方案 | 难度 | 安全性 | 推荐度 |
|------|------|--------|--------|
| Token 认证 | 中 | 高 | ⭐⭐⭐⭐⭐ |
| Actions Artifact | 低 | 高 | ⭐⭐⭐⭐⭐ |
| 临时改 Public | 极低 | 低 | ⭐⭐⭐ |
| gh CLI | 低 | 高 | ⭐⭐⭐⭐ |

对于极空间部署，推荐 **方案二（Actions Artifact）**，因为：
- 无需管理 Token
- 可直接从网页下载
- 操作简单
