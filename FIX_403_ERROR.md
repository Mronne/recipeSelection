# 修复 403 Forbidden 错误

错误信息：
```
403 Forbidden: failed to resolve reference "ghcr.io/mronne/yus-kitchen:main"
```

这意味着你的 Token 认证成功了，但没有权限访问私有镜像。

---

## 原因

GitHub Container Registry (ghcr.io) 的权限与仓库权限是分开的。
即使你能访问代码仓库，也不一定能访问镜像。

---

## 解决方案

### 方案一：重新创建 Token（推荐）

1. **删除旧 Token**：
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 找到之前的 Token，点击 **Delete**

2. **创建新 Token**，勾选以下权限：
   - ✅ `repo` （完整控制私有仓库）
   - ✅ `read:packages` （读取包）
   - ✅ `write:packages` （写入包，如果你是仓库所有者）
   - ✅ `delete:packages` （删除包，可选）

   ![Token 权限截图位置]

3. **重新登录并下载**：
   ```bash
   # 先登出
   docker logout ghcr.io
   
   # 使用新 Token 登录
   echo "ghp_你的新Token" | docker login ghcr.io -u Mronne --password-stdin
   
   # 拉取镜像
   docker pull --platform linux/arm64 ghcr.io/mronne/yus-kitchen:main
   ```

---

### 方案二：检查镜像权限设置

如果你是仓库所有者，检查镜像是否关联了仓库：

1. 进入 GitHub 仓库页面
2. 点击右侧 **Packages** 标签
3. 点击镜像名称（如 `yus-kitchen`）
4. 点击右侧 **Package settings**
5. 在 **Manage Actions access** 或 **Inherited access** 中确保：
   - ✅ 你的账号有 **Read** 权限
   - ✅ 仓库有正确关联

---

### 方案三：使用 GitHub CLI 登录（更简单）

```bash
# 安装 GitHub CLI
# Mac: brew install gh
# Windows: winget install GitHub.cli

# 登录（浏览器认证，权限更全面）
gh auth login
# 选择：GitHub.com → HTTPS → Login with a web browser

# 使用 gh 的 token 登录 Docker
gh auth token | docker login ghcr.io -u Mronne --password-stdin

# 下载镜像
docker pull --platform linux/arm64 ghcr.io/mronne/yus-kitchen:main
```

---

### 方案四：临时将仓库改为 Public

如果以上方法都不行，可以临时改公开：

1. 仓库 Settings → General → Danger Zone
2. **Change repository visibility** → **Make public**
3. 下载镜像（无需认证）
4. 改回 **Make private**

> ⚠️ 注意：改 public 期间代码可被查看，请权衡使用。

---

## 验证步骤

创建新 Token 后，先测试一下：

```bash
# 1. 登出
docker logout ghcr.io

# 2. 用新 Token 登录
echo "ghp_你的新Token" | docker login ghcr.io -u Mronne --password-stdin

# 应该显示：Login Succeeded

# 3. 检查权限
docker pull --platform linux/arm64 ghcr.io/mronne/yus-kitchen:main
```

---

## Token 权限对照表

| 权限 | 作用 | 必需 |
|------|------|------|
| `repo` | 访问私有仓库代码 | ✅ 是 |
| `read:packages` | 下载镜像 | ✅ 是 |
| `write:packages` | 推送镜像 | 否（仅上传需要）|

---

## 仍然有问题？

如果还是 403，请检查：

1. **Token 是否复制完整**（不要有多余空格）
2. **是否使用了正确的用户名**（Mronne）
3. **网络是否正常**（能否访问 ghcr.io）

可以提供以下信息以便进一步排查：
- Token 创建时勾选了哪些权限？
- 你是仓库所有者还是有协作权限？
