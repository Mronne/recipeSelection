# 镜像仍然 403 - 设置 Package 为 Public

即使仓库改为 Public，GitHub Packages (镜像) 可能仍是 Private。

---

## 检查镜像权限

### 步骤 1: 查看 Package 设置

1. 进入 GitHub 仓库页面
2. 点击右侧 **Packages** 标签
   ![位置在 Code、Issues、Pull requests 旁边]
3. 点击镜像名称（如 `recipeselection`）
4. 在镜像页面右侧点击 **Package settings**

### 步骤 2: 更改可见性

在 Package settings 页面：

1. 找到 **Danger Zone** 区域
2. 点击 **Change visibility**
3. 选择 **Public**
4. 输入镜像名确认
5. 点击 **I understand, change visibility**

![Package Visibility Settings]

### 步骤 3: 对另一个镜像重复操作

同样设置 `recipeselection-frontend` 为 Public。

---

## 验证镜像是否公开

在浏览器中打开（无痕模式）：
```
https://github.com/Mronne?tab=packages
```

应该能看到两个镜像，且图标显示为 🌐 Public。

---

## 重新登录 Docker

修改权限后，需要重新登录：

```bash
# 登出
docker logout ghcr.io

# 清空登录缓存
docker system prune -f

# 无需登录即可拉取（因为是 public 了）
docker pull --platform linux/arm64 ghcr.io/mronne/recipeselection:main
docker pull --platform linux/arm64 ghcr.io/mronne/recipeselection-frontend:main
```

---

## 如果还是 403

### 可能原因 1: GitHub 缓存

GitHub 的权限同步有延迟，等待 5-10 分钟再试。

### 可能原因 2: 镜像未正确关联仓库

检查镜像页面的 **Repository** 字段是否显示你的仓库。

如果没有关联：
1. Package settings → **Manage Actions access** 
2. 添加你的仓库并授予 **Read** 权限

### 可能原因 3: 需要重新推送镜像

极端情况下，需要重新触发 workflow 构建并推送：

1. 进入仓库 Actions 页面
2. 找到 **Build and Push Docker Images** workflow
3. 点击 **Run workflow** 手动触发

---

## 快速测试镜像是否公开

在浏览器中访问：
```
https://ghcr.io/v2/mronne/recipeselection/manifests/main
```

- 如果返回 JSON 数据 → 镜像已公开 ✅
- 如果返回 401/403 → 镜像仍是私有 ❌

---

## 替代方案：直接在极空间构建

如果权限问题无法解决，可以在极空间上直接构建：

### 1. 上传源码到极空间

```bash
# 在电脑上打包项目
git clone https://github.com/Mronne/recipeSelection.git
cd recipeSelection
tar czvf ../mealie-source.tar.gz --exclude='.git' --exclude='frontend/node_modules' .

# 上传到极空间
scp ../mealie-source.tar.gz root@极空间IP:/tmp/
```

### 2. 在极空间 SSH 中构建

```bash
ssh root@极空间IP

cd /tmp
tar xzvf mealie-source.tar.gz
cd recipeSelection

# 构建后端
docker build -f docker/Dockerfile --target production -t mealie-backend .

# 构建前端
cd frontend
docker build -t mealie-frontend .
```

---

## 总结

1. 仓库 Public ≠ 镜像 Public
2. 需要单独在 Package settings 中设置镜像为 Public
3. 修改后等待几分钟再试
4. 如果仍有问题，尝试在极空间本地构建
