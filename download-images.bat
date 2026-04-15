@echo off
chcp 65001 >nul
REM ==========================================
REM 自动下载并保存 Mealie 镜像 (Windows)
REM ==========================================

echo === Mealie 镜像下载工具 ===
echo.

REM 创建保存目录
set "SAVE_DIR=%USERPROFILE%\Desktop\mealie-images"
if not exist "%SAVE_DIR%" mkdir "%SAVE_DIR%"
cd /d "%SAVE_DIR%"

echo 镜像将保存到: %SAVE_DIR%
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

echo [步骤 1/4] 检查 Docker 状态...
docker info >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未运行，请启动 Docker Desktop
    pause
    exit /b 1
)

echo [步骤 2/4] 下载后端镜像...
docker pull ghcr.io/mronne/yus-kitchen:main
if errorlevel 1 (
    echo [错误] 后端镜像下载失败
    pause
    exit /b 1
)

echo [步骤 3/4] 下载前端镜像...
docker pull ghcr.io/mronne/yus-kitchen-frontend:main
if errorlevel 1 (
    echo [错误] 前端镜像下载失败
    pause
    exit /b 1
)

echo [步骤 4/4] 保存镜像为文件...
echo 正在保存后端镜像 (可能需要几分钟)...
docker save ghcr.io/mronne/yus-kitchen:main -o mealie-backend.tar
if errorlevel 1 (
    echo [错误] 保存后端镜像失败
    pause
    exit /b 1
)
echo [OK] 后端镜像已保存: mealie-backend.tar

echo 正在保存前端镜像...
docker save ghcr.io/mronne/yus-kitchen-frontend:main -o mealie-frontend.tar
if errorlevel 1 (
    echo [错误] 保存前端镜像失败
    pause
    exit /b 1
)
echo [OK] 前端镜像已保存: mealie-frontend.tar

echo.
echo === 下载完成 ===
echo 文件列表:
dir *.tar /b

echo.
echo 下一步:
echo 1. 将这两个 .tar 文件上传到极空间的 /Docker/images/ 目录
echo 2. 在 Container Station 中导入镜像
echo 3. 创建 docker-compose 项目
echo.
pause
