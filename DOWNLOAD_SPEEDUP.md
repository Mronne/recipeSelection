# GitHub Artifacts 下载加速方案

GitHub Artifacts 服务器在国外，下载几百 MB 的文件会很慢。以下是几种解决方案：

---

## 方案一：使用代理/VPN（最简单）

如果你有代理工具，开启全局代理后下载会快很多。

---

## 方案二：使用 IDM/aria2 等多线程下载工具

### 使用 aria2（推荐）

1. 复制 Artifact 的下载链接
2. 使用 aria2 多线程下载：

```bash
# 安装 aria2
# Mac: brew install aria2
# Ubuntu: sudo apt install aria2
# Windows: 下载 exe 文件

# 16 线程下载
aria2c -x 16 -s 16 "你的下载链接"
```

### 使用 IDM (Windows)
1. 安装 Internet Download Manager
2. 浏览器安装 IDM 扩展
3. 点击下载链接时 IDM 会自动接管

---

## 方案三：使用 GitHub 镜像站

部分镜像站可以加速 GitHub 资源下载：

### ghproxy.com（不稳定，有时可用）
```
原链接: https://github.com/xxx
加速链接: https://ghproxy.com/https://github.com/xxx
```

**注意**: Artifacts 链接通常无法通过镜像站加速。

---

## 方案四：使用 Cloudflare Workers 中转（技术向）

如果你有自己的域名和 Cloudflare 账号，可以搭建加速通道。

---

## 方案五：本地直接下载镜像（推荐 ⭐）

绕过 GitHub Artifacts，直接在本地使用 Token 下载镜像。

### 步骤：

1. **创建 GitHub Token**（只需一次）：
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token
   - 勾选 `read:packages`
   - 复制 token

2. **本地登录并下载**（Mac/Linux）：
   ```bash
   # 登录
   echo "ghp_你的Token" | docker login ghcr.io -u Mronne --password-stdin
   
   # 拉取镜像
   docker pull --platform linux/arm64 ghcr.io/mronne/recipeselection:main
   docker pull --platform linux/arm64 ghcr.io/mronne/recipeselection-frontend:main
   
   # 保存为文件
   docker save ghcr.io/mronne/recipeselection:main > mealie-backend.tar
   docker save ghcr.io/mronne/recipeselection-frontend:main > mealie-frontend.tar
   
   # 压缩
   gzip mealie-backend.tar
   gzip mealie-frontend.tar
   ```

3. **上传到极空间**：
   - 使用 SMB 挂载极空间为网络磁盘
   - 直接复制文件过去

### Windows 脚本：

创建 `download-for-zspace.bat`：

```batch
@echo off
chcp 65001

echo === 下载 Mealie 镜像 for 极空间 Z2 PRO (ARM64) ===
echo.

REM 输入 Token
set /p TOKEN="请输入 GitHub Token: "

echo.
echo [1/4] 登录 GitHub Container Registry...
docker login ghcr.io -u Mronne --password %TOKEN%

echo.
echo [2/4] 下载后端镜像 (ARM64)...
docker pull --platform linux/arm64 ghcr.io/mronne/recipeselection:main

echo.
echo [3/4] 下载前端镜像 (ARM64)...
docker pull --platform linux/arm64 ghcr.io/mronne/recipeselection-frontend:main

echo.
echo [4/4] 保存镜像文件...
docker save ghcr.io/mronne/recipeselection:main -o mealie-backend.tar
docker save ghcr.io/mronne/recipeselection-frontend:main -o mealie-frontend.tar

echo.
echo === 下载完成 ===
echo 文件位置: %CD%
dir *.tar /b
echo.
echo 请将这些文件上传到极空间的 /Docker/images/ 目录
echo 然后在极空间 Container Station 中导入镜像
pause
```

---

## 方案六：使用极空间自带下载工具

极空间 Z2 PRO 支持 BT/磁力链接下载，可以：

1. 将文件上传到云盘（阿里云盘/百度网盘等）
2. 在极空间中登录对应云盘下载
3. 或者使用迅雷等工具下载后上传到极空间

---

## 方案七：rsync 同步（如果你有自己的服务器）

如果你有海外服务器：

```bash
# 在海外服务器上下载
wget "GitHub Artifact链接" -O mealie-backend.tar.gz

# 使用 rsync 同步到本地
rsync -avz --progress user@海外服务器IP:/path/to/file ./
```

---

## 推荐方案总结

| 方案 | 速度 | 难度 | 推荐度 |
|------|------|------|--------|
| 代理/VPN | ⭐⭐⭐ | 低 | ⭐⭐⭐⭐⭐ |
| aria2 多线程 | ⭐⭐ | 低 | ⭐⭐⭐⭐ |
| 本地 Token 下载 | ⭐⭐⭐⭐⭐ | 中 | ⭐⭐⭐⭐⭐ |
| 云盘中转 | ⭐⭐⭐ | 中 | ⭐⭐⭐ |

---

## 快速操作建议

**最快的方式：**

1. 在电脑上使用 Token 方式下载镜像（如果你有代理会更快）
2. 将下载好的 `.tar` 文件通过 SMB 上传到极空间
3. 在极空间 Container Station 中导入

**预计时间：**
- Token 下载：2-5 分钟（有代理）
- 上传到极空间：5-10 分钟（取决于网络）
- 导入镜像：5 分钟

总计约 15 分钟内完成部署。
