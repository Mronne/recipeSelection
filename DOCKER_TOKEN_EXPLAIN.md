# Docker Hub Token 详解

## 常见误区

**❌ 错误理解**
```
Token Name: MyToken          ← 这是名字，不是这个！
Token: dckr_pat_abc123...    ← 这才是要用的！
```

---

## 正确理解

创建 Token 时有两个东西：

| 项目 | 示例 | 用途 | 登录时用？ |
|------|------|------|-----------|
| **Description** (描述/名字) | `GitHub Actions Push` | 让你自己知道这是干嘛用的 | ❌ 不用 |
| **Token Value** (值) | `dckr_pat_xxx...` | 实际的密码替代品 | ✅ 用！ |

---

## 创建 Token 的步骤

### 1. 点击 "New Access Token"
```
Docker Hub → Account Settings → Security → New Access Token
```

### 2. 填写信息
```
Access Token Description: GitHub Actions Push  ← 名字，随便写
Access Permissions: Read, Write, Delete        ← 权限，必须选
```

### 3. 点击 Generate
这时候会显示：
```
✓ Access Token Generated

Name: GitHub Actions Push
Token: dckr_pat_XXXXXXXXXXXXXXXXXXXX  ← 🔴 复制这个！

⚠️ Make sure to copy your access token now. 
   You won't be able to see it again!
```

**🟢 复制 `dckr_pat_XXX...` 这一长串，这就是 Token！**

---

## Token 长什么样？

```
dckr_pat_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

格式: dckr_pat_ + 48位随机字符
总长度: 56个字符
```

---

## 在哪里使用 Token？

### 本地登录
```bash
docker login -u mronne
# 提示 Password: 
# 粘贴: dckr_pat_abc123...  ← Token值，不是名字！
```

### GitHub Secrets
```
Name: DOCKERHUB_TOKEN
Value: dckr_pat_abc123...  ← Token值，不是名字！
```

---

## 快速检查

如果你看到类似这样的，就是对的：
- `dckr_pat_abcdefghijklmnopqrstuvwxyz0123456789abcd`

如果你用的是这样的，就是错的：
- `MyToken`
- `GitHub Actions`
- `Docker Push Token`

---

## 如果忘记保存 Token 怎么办？

**Token 只能看到一次！** 如果忘记保存：

1. 回到 Docker Hub → Security
2. 找到那个 Token（显示名字）
3. 点击右侧的 **垃圾桶图标** 删除它
4. 重新创建一个新的 Token
5. **这次一定要复制保存！**

---

## 总结

| 概念 | 说明 | 例子 |
|------|------|------|
| Token Name | 给Token起的名字 | `GitHub Actions` |
| Token Value | 实际的Token字符串 | `dckr_pat_xxx...` |

**登录/配置时用 Token Value，不是 Token Name！**
