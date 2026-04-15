# 手动导入镜像到极空间 Z2 PRO

如果极空间无法直接访问 ghcr.io 拉取镜像，可以使用手动导入方式。

---

## 步骤一：在电脑上下载镜像

### 前提条件
- 电脑上已安装 Docker Desktop
- 电脑可以访问 GitHub (ghcr.io)

### 下载镜像

打开终端（Windows 用 PowerShell/CMD，Mac/Linux 用 Terminal）：

```bash
# 下载单镜像（后端 API + 前端 Web 合一）
docker pull mronne/yus-kitchen:latest

# 查看已下载的镜像
docker images | grep yus-kitchen
```

---

## 步骤二：保存镜像为文件

```bash
# 创建保存目录
mkdir -p ~/Desktop/mealie-images
cd ~/Desktop/mealie-images

# 保存镜像（约 400-600MB）
docker save mronne/yus-kitchen:latest > mealie.tar

# 查看文件大小
ls -lh *.tar
```

> **注意**：文件较大，请确保有足够空间。

---

## 步骤三：上传到极空间

### 方法 A：通过极空间客户端上传

1. 打开 **极空间客户端** → **文件管理**
2. 创建文件夹：`/Docker/images/`
3. 将 `mealie.tar` 文件上传到该文件夹

### 方法 B：通过 SMB/FTP 上传（更快）

1. 在极空间设置中开启 **Samba 共享**
2. 在电脑上挂载极空间为网络磁盘
3. 直接复制文件到 `\\你的极空间IP\你的共享名\Docker\images\`

---

## 步骤四：在极空间导入镜像

### 使用 Container Station 导入

1. 打开 **Container Station**
2. 左侧菜单 → **镜像**
3. 点击右上角的 **导入镜像** 按钮
4. 选择文件：找到上传的 `mealie.tar`
5. 点击 **导入**
6. 等待导入完成（可能需要几分钟）

### 验证镜像已导入

导入完成后，在 **镜像** 列表中应该能看到：
- `mronne/yus-kitchen:latest`

---

## 步骤五：创建容器

镜像导入后，创建 `docker-compose.yml`：

```yaml
version: "3.8"

services:
  mealie:
    container_name: yus-kitchen
    # 使用已导入的镜像
    image: mronne/yus-kitchen:latest
    restart: always
    ports:
      - "9000:9000"
    volumes:
      - ./data/mealie-data:/app/data/
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      - ALLOW_SIGNUP=true
      - BASE_URL=http://你的极空间IP:9000
```

然后按照之前的步骤使用 Container Station 的 **Compose 项目** 创建。

---

## 使用 SSH 命令行导入（高级）

如果你熟悉命令行，可以通过 SSH 直接在极空间操作：

### 1. 开启极空间 SSH
- 极空间设置 → 服务 → SSH → 开启
- 记住 IP 地址和端口（默认 22）

### 2. 使用 SCP 上传镜像文件
```bash
# 在电脑终端执行
scp ~/Desktop/mealie-images/mealie.tar root@你的极空间IP:/tmp/
```

### 3. SSH 登录并导入
```bash
# 登录极空间
ssh root@你的极空间IP

# 导入镜像
docker load -i /tmp/mealie.tar

# 验证
docker images | grep yus-kitchen

# 启动（如果在对应目录）
cd /你的存储池/Docker/yus-kitchen/
docker-compose up -d
```

---

## 常见问题

### Q1: 导入镜像时报错 "invalid tar header"
**原因**: 镜像文件在上传过程中损坏
**解决**: 重新上传文件，或使用 SMB/FTP 方式上传

### Q2: 镜像导入成功但启动失败
**检查**: 
1. 查看日志：Container Station → 容器 → 点击容器 → 日志
2. 检查端口是否被占用
3. 检查数据目录权限

### Q3: 如何更新镜像版本
1. 在电脑上下载新版本镜像
2. 重新保存为 tar 文件
3. 上传到极空间并重新导入（同名镜像会被覆盖）
4. 重启容器

---

## 镜像文件下载（备用）

如果无法使用 Docker 下载，可以尝试以下方式获取镜像文件：

### 使用 GitHub Actions artifact（如果有配置）
检查 GitHub 仓库的 Actions 页面，看是否有生成镜像文件的 workflow。

### 使用第三方镜像站（如果可用）
部分国内镜像站可能同步了 ghcr.io 的镜像，可以尝试搜索：
- `mronne/recipeselection`

---

需要我帮你生成一个自动下载和保存镜像的脚本吗？
