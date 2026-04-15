# 本地测试指南 - 前后端联调

## 数据文件存储位置

后端数据存储在以下位置：

```
/home/mronne/Projects/yus-kitchen/dev/data/
├── mealie.db              # SQLite 数据库（食谱、用户等数据）
├── recipes/               # 食谱相关文件
│   └── {uuid}/           # 每个食谱一个目录
│       └── images/       # 食谱图片
├── users/                # 用户相关文件
│   └── {user_id}/       # 每个用户一个目录
│       └── images/      # 用户头像
├── groups/              # 用户组数据
├── backups/             # 备份文件
└── .temp/               # 临时文件
```

### 实时查看数据变化

**1. 查看数据库（SQLite）**
```bash
# 进入项目目录
cd /home/mronne/Projects/yus-kitchen

# 使用 sqlite3 命令行查看
sqlite3 dev/data/mealie.db

# 常用查询
.tables                    # 查看所有表
SELECT * FROM recipes;     # 查看所有食谱
SELECT * FROM users;       # 查看所有用户
.quit                     # 退出
```

**2. 查看图片文件**
```bash
# 查看所有食谱图片
ls -la dev/data/recipes/*/images/

# 查看用户头像
ls -la dev/data/users/*/images/
```

**3. 实时监控日志**
```bash
# 后端日志
tail -f /tmp/mealie.log

# 前端日志
tail -f /tmp/frontend.log
```

---

## 图片无法显示问题修复

### 问题原因
Next.js 开发服务器的图片代理配置问题，导致 `/api` 路径的图片请求无法正确转发到后端。

### 解决方案

**方法1：使用完整的后端地址（推荐用于调试）**

修改 `frontend/lib/api.ts` 中的图片 URL 生成：

```typescript
// 修改前
getRecipeImageUrl(recipeId: string, imageName: string): string {
  return `/api/recipes/${recipeId}/images/${imageName}`
}

// 修改后 - 使用完整后端地址
getRecipeImageUrl(recipeId: string, imageName: string): string {
  return `http://localhost:9000/api/recipes/${recipeId}/images/${imageName}`
}
```

**方法2：配置 Next.js 图片代理**

在 `next.config.js` 中添加图片代理：

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:9000/api/:path*',
    },
    // 添加图片代理
    {
      source: '/api/recipes/:id/images/:name',
      destination: 'http://localhost:9000/api/recipes/:id/images/:name',
    },
  ]
}
```

---

## 快速测试流程

### 1. 启动后端
```bash
cd /home/mronne/Projects/yus-kitchen
source .venv/bin/activate
export PRODUCTION=false
export ALLOW_SIGNUP=true
export BASE_URL=http://localhost:9000
python mealie/main.py
```

### 2. 启动前端（新终端）
```bash
cd /home/mronne/Projects/yus-kitchen/frontend
npm run dev
```

### 3. 测试步骤
1. 访问 http://localhost:3000
2. 注册新用户或登录（默认管理员：admin/admin123）
3. 创建菜谱并上传图片
4. 查看数据变化：
   ```bash
   # 新终端 - 查看数据库
   sqlite3 dev/data/mealie.db "SELECT * FROM recipes;"
   
   # 查看图片文件
   ls dev/data/recipes/
   ```

---

## API 测试

### 使用 curl 测试后端 API

```bash
# 1. 登录获取 token
curl -X POST http://localhost:9000/api/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123"

# 2. 获取食谱列表（使用上一步返回的 token）
curl http://localhost:9000/api/recipes \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. 上传图片
curl -X POST http://localhost:9000/api/recipes/{recipe_id}/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

---

## 常见问题

### Q1: 图片上传成功但无法显示
**解决**：检查图片 URL 是否使用完整后端地址 `http://localhost:9000`

### Q2: 数据库被锁定
**解决**：确保只有一个后端实例在运行
```bash
pkill -f "python mealie/main"
```

### Q3: 如何清空测试数据
```bash
# 停止后端
pkill -f "python mealie/main"

# 删除数据目录
rm -rf dev/data/*

# 重新启动后端（会自动创建新数据库）
python mealie/main.py
```

---

## 数据备份

```bash
# 备份整个数据目录
cp -r dev/data dev/data.backup.$(date +%Y%m%d)

# 只备份数据库
cp dev/data/mealie.db mealie.db.backup.$(date +%Y%m%d)
```
