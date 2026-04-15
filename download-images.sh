#!/bin/bash
# ==========================================
# 自动下载并保存 Mealie 镜像
# 支持 Linux / Mac / Windows(Git Bash)
# ==========================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Mealie 镜像下载工具 ===${NC}"
echo ""

# 创建保存目录
SAVE_DIR="${HOME}/Desktop/mealie-images"
mkdir -p "$SAVE_DIR"
cd "$SAVE_DIR"

echo -e "${YELLOW}镜像将保存到: $SAVE_DIR${NC}"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装，请先安装 Docker Desktop${NC}"
    exit 1
fi

echo -e "${GREEN}步骤 1/4: 检查 Docker 状态...${NC}"
docker info > /dev/null 2>&1 || {
    echo -e "${RED}错误: Docker 未运行，请启动 Docker Desktop${NC}"
    exit 1
}

echo -e "${GREEN}步骤 2/4: 下载后端镜像...${NC}"
docker pull ghcr.io/mronne/yus-kitchen:main

echo -e "${GREEN}步骤 3/4: 下载前端镜像...${NC}"
docker pull ghcr.io/mronne/yus-kitchen-frontend:main

echo -e "${GREEN}步骤 4/4: 保存镜像为文件...${NC}"
echo "正在保存后端镜像 (可能需要几分钟)..."
docker save ghcr.io/mronne/yus-kitchen:main > mealie-backend.tar
echo -e "${GREEN}✓ 后端镜像已保存: mealie-backend.tar${NC}"

echo "正在保存前端镜像..."
docker save ghcr.io/mronne/yus-kitchen-frontend:main > mealie-frontend.tar
echo -e "${GREEN}✓ 前端镜像已保存: mealie-frontend.tar${NC}"

echo ""
echo -e "${GREEN}=== 下载完成 ===${NC}"
echo "文件列表:"
ls -lh *.tar
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo "1. 将这两个 .tar 文件上传到极空间的 /Docker/images/ 目录"
echo "2. 在 Container Station 中导入镜像"
echo "3. 创建 docker-compose 项目"
