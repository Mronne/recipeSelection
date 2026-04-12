# 王者餐厅 (Wangzhe Restaurant)

完整的食谱管理系统，包含前端展示和后端 API，专为 NAS 家庭部署优化。

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        NAS (Docker)                          │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Frontend   │◄───────►│   Backend    │                  │
│  │  (Next.js)   │         │   (Mealie)   │                  │
│  │   :3000      │         │    :9000     │                  │
│  └──────────────┘         └──────┬───────┘                  │
│         │                        │                          │
│         │                 ┌──────┴──────┐                   │
│         │                 │   SQLite    │                   │
│         │                 │  (持久化)    │                   │
│         │                 └─────────────┘                   │
└─────────┼───────────────────────────────────────────────────┘
          │
    ┌─────┴─────┐
    │   用户    │
    │ 浏览器/APP │
    └───────────┘
```

## 📦 项目结构

```
recipeSelection/
├── frontend/          # Next.js 前端
│   ├── app/          # 页面
│   ├── components/   # 组件
│   ├── Dockerfile    # 前端镜像配置
│   └── package.json
├── backend/          # Mealie 后端
│   ├── mealie/       # Python 源码
│   ├── docker/       # Docker 配置
│   ├── Dockerfile    # 后端镜像配置
│   └── pyproject.toml
├── nas-config/       # NAS 部署配置
│   └── .env.example  # 环境变量模板
├── docker-compose.yml # 完整部署配置
├── NAS-DEPLOY.md     # NAS 部署指南
└── README.md         # 本文档
```

## 🚀 快速开始

### 方式 1: NAS Docker 部署（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/recipeSelection.git
cd recipeSelection

# 2. 配置环境变量
cp nas-config/.env.example .env
# 编辑 .env，修改 NAS_DATA_PATH 和 BASE_URL

# 3. 启动
docker-compose up -d

# 4. 访问 http://your-nas-ip:3000
```

**默认账号**: `admin` / `admin123`

### 方式 2: 仅前端开发

```bash
cd frontend
npm install
npm run dev
```

### 方式 3: 完整开发环境

```bash
# 后端
cd backend
pip install -r requirements.txt
python main.py

# 前端（另一个终端）
cd frontend
npm install
npm run dev
```

## 🛠️ 功能特性

### 前端
- 📱 响应式设计，支持移动端和桌面端
- 🔍 智能食谱搜索和分类筛选
- 👨‍🍳 智能食材和步骤解析
- 🖼️ 头像上传和裁剪
- 📅 膳食计划管理
- 🛒 购物清单自动生成
- 👤 多角色权限（管理员/用户/游客）

### 后端
- 🔐 JWT 身份认证
- 📝 RESTful API
- 🗄️ SQLite 数据库（可切换 PostgreSQL）
- 🖼️ 图片上传和存储
- 📊 数据导入/导出

## 🐳 Docker 镜像

### GitHub Container Registry

```bash
# 前端
docker pull ghcr.io/yourusername/recipe-frontend:latest

# 后端
docker pull ghcr.io/yourusername/recipe-backend:latest

# 运行
docker-compose up -d
```

### 自动构建

GitHub Actions 会自动构建并推送镜像：
- 推送代码到 `main` 分支 → 构建 `latest` 标签
- 创建版本标签 `v1.0.0` → 构建版本镜像

## 📋 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NAS_DATA_PATH` | NAS 数据存储路径 | `./data` |
| `BASE_URL` | 外部访问地址 | `http://localhost:3000` |
| `ALLOW_SIGNUP` | 允许注册 | `true` |
| `PUID` / `PGID` | 用户/组 ID | `1000` |
| `TZ` | 时区 | `Asia/Shanghai` |

## 📚 文档

- [NAS 部署指南](./NAS-DEPLOY.md) - Synology/QNAP/Unraid 详细部署步骤
- [Docker 指南](./frontend/DOCKER.md) - Docker 相关文档
- [GitHub 配置](./GITHUB-GUIDE.md) - CI/CD 配置指南

## 🖥️ 支持的 NAS 系统

| 系统 | 支持 | 说明 |
|------|------|------|
| Synology DSM | ✅ | 7.0+ |
| QNAP QTS | ✅ | 5.0+ |
| Unraid | ✅ | 6.10+ |
| TrueNAS SCALE | ✅ | - |
| 通用 Docker | ✅ | 任何支持 Docker 的系统 |

## 🔒 默认账号

- **管理员**: admin / admin123
- **权限**: 管理所有内容、查看所有用户数据

## 🔄 更新

```bash
cd recipeSelection
git pull
docker-compose down
docker-compose up -d --build
```

## 💾 数据备份

数据存储在 `${NAS_DATA_PATH}` 目录：
- `mealie-data/` - 数据库和配置
- `mealie-images/` - 上传的图片

定期备份此目录即可。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- 前端基于 [Next.js](https://nextjs.org/) 构建
- 后端基于 [Mealie](https://github.com/mealie-recipes/mealie) 项目
