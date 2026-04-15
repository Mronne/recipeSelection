@echo off
chcp 65001 >nul
REM ==========================================
REM 下载 Mealie 镜像 for 极空间 Z2 PRO (ARM64)
REM ==========================================

echo ==========================================
echo    Mealie 镜像下载工具
echo    目标设备: 极空间 Z2 PRO (ARM64)
echo ==========================================
echo.

REM 检查 Docker
where docker >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未安装，请先安装 Docker Desktop
    echo 下载地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM 输入 GitHub Token
echo 请提供 GitHub Personal Access Token
echo 获取方式: GitHub -	g Settings -	g Developer settings -	g Personal access tokens -	g Tokens (classic)
echo 权限要求: 勾选 read:packages
echo.
set /p TOKEN="Token: "

if "%TOKEN%"=="" (
    echo [错误] Token 不能为空
    pause
    exit /b 1
)

echo.
echo [步骤 1/5] 登录 GitHub Container Registry...
docker login ghcr.io -u Mronne --password %TOKEN%
if errorlevel 1 (
    echo [错误] 登录失败，请检查 Token 是否正确
    pause
    exit /b 1
)
echo [OK] 登录成功

echo.
echo [步骤 2/5] 下载后端镜像 (ARM64)...
echo 这可能需要几分钟，请耐心等待...
docker pull --platform linux/arm64 ghcr.io/mronne/yus-kitchen:main
if errorlevel 1 (
    echo [错误] 后端镜像下载失败
    pause
    exit /b 1
)
echo [OK] 后端镜像下载完成

echo.
echo [步骤 3/5] 下载前端镜像 (ARM64)...
echo 这可能需要几分钟，请耐心等待...
docker pull --platform linux/arm64 ghcr.io/mronne/yus-kitchen-frontend:main
if errorlevel 1 (
    echo [错误] 前端镜像下载失败
    pause
    exit /b 1
)
echo [OK] 前端镜像下载完成

echo.
echo [步骤 4/5] 保存镜像为文件...
docker save ghcr.io/mronne/yus-kitchen:main -o mealie-backend.tar
if errorlevel 1 (
    echo [错误] 保存后端镜像失败
    pause
    exit /b 1
)
echo [OK] 后端镜像已保存: mealie-backend.tar

docker save ghcr.io/mronne/yus-kitchen-frontend:main -o mealie-frontend.tar
if errorlevel 1 (
    echo [错误] 保存前端镜像失败
    pause
    exit /b 1
)
echo [OK] 前端镜像已保存: mealie-frontend.tar

echo.
echo [步骤 5/5] 压缩文件以减小体积...
echo 压缩后端镜像...
gzip -c mealie-backend.tar > mealie-backend.tar.gz
del mealie-backend.tar

echo 压缩前端镜像...
gzip -c mealie-frontend.tar > mealie-frontend.tar.gz
del mealie-frontend.tar

echo.
echo ==========================================
echo    下载完成！
echo ==========================================
echo.
echo 文件位置: %CD%
echo.
dir *.tar.gz /b
echo.
echo 下一步操作:
echo 1. 将这两个 .tar.gz 文件上传到极空间
echo 2. 在极空间 Container Station 中导入镜像
echo 3. 使用 docker-compose 创建容器
echo.
echo 提示: 上传方式推荐
echo   - 方式1: 使用 SMB/FTP 直接复制到极空间
echo   - 方式2: 通过极空间客户端上传
echo.
pause
