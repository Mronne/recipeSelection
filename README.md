# 王者餐厅 (Wangzhe Restaurant)

基于 [Mealie](https://github.com/mealie-recipes/mealie) 的定制版本，使用 Next.js + React 19 重构了前端界面。

## 🏗️ 与原版 Mealie 的区别

| 特性 | 原版 Mealie | 王者餐厅 |
|------|-------------|----------|
| 前端框架 | Nuxt.js 3 | Next.js 15 + React 19 |
| UI 风格 | Vuetify | Tailwind CSS |
| 语言支持 | 多语言 | 中文为主 |
| 界面风格 | Material Design | 现代简洁 |

## 🚀 快速开始

### Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/wangzhe-restaurant.git
cd wangzhe-restaurant

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 3. 启动服务
docker-compose up -d

# 4. 访问 http://localhost:9000
```

### 环境变量配置

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATA_DIR` | 数据存储路径 | `./data` |
| `PUID` / `PGID` | 用户/组 ID | `1000` |
| `TZ` | 时区 | `Asia/Shanghai` |
| `ALLOW_SIGNUP` | 允许注册 | `true` |
| `BASE_URL` | 外部访问地址 | `http://localhost:9000` |

### 从原版 Mealie 迁移

由于数据结构完全兼容原版 Mealie，您可以：

```bash
# 1. 停止原版 Mealie
docker stop mealie

# 2. 备份数据
cp -r /path/to/mealie-data ./backup/

# 3. 使用本项目的 docker-compose.yml 启动
# 修改 DATA_DIR 指向原版数据目录
docker-compose up -d
```

## 🛠️ 开发指南

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

### 完整开发环境

```bash
# 1. 启动后端
cd ..
pip install uv
uv run python -m mealie

# 2. 启动前端（另一个终端）
cd frontend
npm run dev
```

## 🐳 构建镜像

```bash
# 本地构建
docker build -f docker/Dockerfile -t wangzhe-restaurant:latest .

# 多架构构建（需要 buildx）
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t wangzhe-restaurant:latest \
  -f docker/Dockerfile \
  .
```

## 📁 项目结构

```
.
├── mealie/              # 后端代码（与原版一致）
├── frontend/            # 前端代码（Next.js）
├── docker/
│   ├── Dockerfile       # 构建配置
│   ├── entry.sh         # 启动脚本
│   └── healthcheck.sh   # 健康检查
├── docker-compose.yml   # 部署配置
├── pyproject.toml       # Python 依赖
└── uv.lock             # 锁定文件
```

## 🔄 与 Mealie 的兼容性

- ✅ API 完全兼容
- ✅ 数据库结构一致
- ✅ 数据导入/导出兼容
- ✅ 配置文件格式相同

## 📝 配置说明

所有原版 Mealie 的配置都支持，额外添加：

```yaml
# 前端定制配置
FRONTEND_TITLE: "王者餐厅"      # 页面标题
FRONTEND_LOGO: ""              # 自定义 Logo URL
```

## 🐛 故障排除

### 常见问题

**Q: 如何备份数据？**
```bash
# 数据位于 DATA_DIR 指定的目录
tar -czf backup.tar.gz ./data/
```

**Q: 如何更新？**
```bash
# 拉取最新镜像
docker-compose pull
docker-compose up -d
```

**Q: 可以和其他 Mealie 客户端一起使用吗？**
可以！API 完全兼容，可以使用任何 Mealie 客户端。

## 🤝 致谢

- 后端基于 [Mealie](https://github.com/mealie-recipes/mealie) 项目
- 前端使用 [Next.js](https://nextjs.org/) 构建

## 📄 许可证

MIT License
