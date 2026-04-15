#!/bin/bash
# ==========================================
# 下载 Mealie 镜像 for 极空间 Z2 PRO (ARM64)
# ==========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}   Mealie 镜像下载工具${NC}"
echo -e "${BLUE}   目标设备: 极空间 Z2 PRO (ARM64)${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[错误] Docker 未安装${NC}"
    echo "请安装 Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# 提示输入 Token
echo "请提供 GitHub Personal Access Token"
echo "获取方式: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)"
echo -e "${YELLOW}权限要求: 勾选 read:packages${NC}"
echo ""
read -s -p "Token: " TOKEN
echo ""

if [ -z "$TOKEN" ]; then
    echo -e "${RED}[错误] Token 不能为空${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}[步骤 1/5] 登录 GitHub Container Registry...${NC}"
echo "$TOKEN" | docker login ghcr.io -u Mronne --password-stdin || {
    echo -e "${RED}[错误] 登录失败，请检查 Token 是否正确${NC}"
    exit 1
}
echo -e "${GREEN}[OK] 登录成功${NC}"

echo ""
echo -e "${GREEN}[步骤 2/5] 下载后端镜像 (ARM64)...${NC}"
echo "这可能需要几分钟，请耐心等待..."
docker pull --platform linux/arm64 ghcr.io/mronne/yus-kitchen:main || {
    echo -e "${RED}[错误] 后端镜像下载失败${NC}"
    exit 1
}
echo -e "${GREEN}[OK] 后端镜像下载完成${NC}"

echo ""
echo -e "${GREEN}[步骤 3/5] 下载前端镜像 (ARM64)...${NC}"
echo "这可能需要几分钟，请耐心等待..."
docker pull --platform linux/arm64 ghcr.io/mronne/yus-kitchen-frontend:main || {
    echo -e "${RED}[错误] 前端镜像下载失败${NC}"
    exit 1
}
echo -e "${GREEN}[OK] 前端镜像下载完成${NC}"

echo ""
echo -e "${GREEN}[步骤 4/5] 保存镜像为文件...${NC}"
docker save ghcr.io/mronne/yus-kitchen:main > mealie-backend.tar || {
    echo -e "${RED}[错误] 保存后端镜像失败${NC}"
    exit 1
}
echo -e "${GREEN}[OK] 后端镜像已保存: mealie-backend.tar${NC}"

docker save ghcr.io/mronne/yus-kitchen-frontend:main > mealie-frontend.tar || {
    echo -e "${RED}[错误] 保存前端镜像失败${NC}"
    exit 1
}
echo -e "${GREEN}[OK] 前端镜像已保存: mealie-frontend.tar${NC}"

echo ""
echo -e "${GREEN}[步骤 5/5] 压缩文件以减小体积...${NC}"
echo "压缩后端镜像..."
gzip -f mealie-backend.tar

echo "压缩前端镜像..."
gzip -f mealie-frontend.tar

echo ""
echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}   下载完成！${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""
echo -e "${YELLOW}文件位置:${NC} $(pwd)"
echo ""
ls -lh *.tar.gz
echo ""
echo -e "${YELLOW}下一步操作:${NC}"
echo "1. 将这两个 .tar.gz 文件上传到极空间"
echo "2. 在极空间 Container Station 中导入镜像"
echo "3. 使用 docker-compose 创建容器"
echo ""
echo -e "${YELLOW}上传方式推荐:${NC}"
echo "  - 方式1: 使用 SMB/FTP 直接复制到极空间"
echo "  - 方式2: 通过极空间客户端上传"
echo ""
echo -e "${YELLOW}SMB 挂载示例:${NC}"
echo "  sudo mount -t cifs //你的极空间IP/你的共享名 ~/zspace -o username=root"
echo "  cp *.tar.gz ~/zspace/Docker/images/"
