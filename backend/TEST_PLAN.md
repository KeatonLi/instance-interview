# API 一致性测试方案

## 测试目标
确保 Python 后端与 Go 后端的 API 入参出参 100% 一致。

## 测试环境准备

### 1. 启动 Go 后端 (端口 8082)
```bash
cd D:/programs/instance-interview/backend
go run main.go
# 或编译后运行
go build -o server && ./server
```

### 2. 启动 Python 后端 (端口 8083)
```bash
cd D:/programs/instance-interview/backend-python
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8083 --reload
```

### 3. 验证服务启动
```bash
# Go 后端
curl http://localhost:8082/health

# Python 后端
curl http://localhost:8083/health
```

---

## API 测试用例

### 测试 1: 用户注册
```bash
# Go 后端
curl -X POST http://localhost:8082/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_go","email":"test_go@example.com","password":"test123456","nickname":"Go测试"}'

# Python 后端
curl -X POST http://localhost:8083/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_py","email":"test_py@example.com","password":"test123456","nickname":"Py测试"}'
```

**预期结果**: 两边都返回相同结构
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "...",
    "email": "...",
    "nickname": "...",
    "created_at": "..."
  }
}
```

---

### 测试 2: 用户登录
```bash
# Go 后端
curl -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_go","password":"test123456"}'

# Python 后端
curl -X POST http://localhost:8083/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_py","password":"test123456"}'
```

**预期结果**: 响应结构一致 (token 值不同)
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 1,
      "username": "...",
      "email": "...",
      "nickname": "...",
      "avatar": null
    }
  }
}
```

---

### 测试 3: 游客登录
```bash
curl -X POST http://localhost:8082/api/v1/auth/guest
curl -X POST http://localhost:8083/api/v1/auth/guest
```

**预期结果**:
```json
{
  "code": 0,
  "message": "游客登录成功",
  "data": {
    "token": "...",
    "user": {...},
    "is_guest": true
  }
}
```

---

### 测试 4: 获取当前用户 (需要 Token)
```bash
# 从登录响应获取 token
GO_TOKEN="eyJhbGci..."
PY_TOKEN="eyJhbGci..."

# Go 后端
curl -X GET http://localhost:8082/api/v1/auth/me \
  -H "Authorization: Bearer $GO_TOKEN"

# Python 后端
curl -X GET http://localhost:8083/api/v1/auth/me \
  -H "Authorization: Bearer $PY_TOKEN"
```

**预期结果**:
```json
{
  "code": 0,
  "data": {
    "id": 2,
    "username": "guest",
    "email": "guest@poker.app",
    "nickname": "游客",
    "avatar": null,
    "phone": null,
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 测试 5: 更新个人资料
```bash
curl -X PUT http://localhost:8082/api/v1/auth/profile \
  -H "Authorization: Bearer $GO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nickname":"新昵称","avatar":"https://example.com/avatar.png"}'
```

**预期结果**:
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 2,
    "username": "guest",
    "email": "guest@poker.app",
    "nickname": "新昵称",
    "avatar": "https://example.com/avatar.png",
    "phone": null
  }
}
```

---

### 测试 6: 修改密码
```bash
curl -X PUT http://localhost:8082/api/v1/auth/password \
  -H "Authorization: Bearer $GO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"old_password":"guest123","new_password":"newpass123"}'
```

**预期结果**:
```json
{
  "code": 0,
  "message": "密码修改成功"
}
```

---

### 测试 7: 创建简历
```bash
curl -X POST http://localhost:8082/api/v1/resumes \
  -H "Authorization: Bearer $GO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "我的简历",
    "theme_id": 0,
    "resume_type": "full",
    "personal_info": "{\"name\":\"张三\",\"title\":\"后端工程师\"}",
    "education": "[{\"school\":\"清华大学\",\"degree\":\"硕士\"}]"
  }'
```

**预期结果**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "user_id": 2,
    "title": "我的简历",
    "theme_id": 0,
    "resume_type": "full",
    "is_default": false,
    "status": "draft",
    "personal_info": "{\"name\":\"张三\",\"title\":\"后端工程师\"}",
    "education": "[{\"school\":\"清华大学\",\"degree\":\"硕士\"}]",
    ...
  }
}
```

---

### 测试 8: 获取简历列表
```bash
curl -X GET "http://localhost:8082/api/v1/resumes?search=简历&sort=updated_at_desc" \
  -H "Authorization: Bearer $GO_TOKEN"
```

**预期结果**:
```json
{
  "code": 0,
  "data": {
    "list": [...],
    "total": 1,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 测试 9: 获取简历详情
```bash
curl -X GET http://localhost:8082/api/v1/resumes/1 \
  -H "Authorization: Bearer $GO_TOKEN"
```

---

### 测试 10: 更新简历
```bash
curl -X PUT http://localhost:8082/api/v1/resumes/1 \
  -H "Authorization: Bearer $GO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"更新后的简历","status":"published"}'
```

---

### 测试 11: 删除简历
```bash
curl -X DELETE http://localhost:8082/api/v1/resumes/1 \
  -H "Authorization: Bearer $GO_TOKEN"
```

**预期结果**:
```json
{
  "code": 0,
  "message": "deleted successfully"
}
```

---

### 测试 12: 启用简历分享
```bash
curl -X POST http://localhost:8082/api/v1/resumes/1/share \
  -H "Authorization: Bearer $GO_TOKEN"
```

**预期结果**:
```json
{
  "code": 0,
  "data": {
    "share_token": "a1b2c3d4e5f6...",
    "share_url": "/shared/a1b2c3d4e5f6..."
  }
}
```

---

### 测试 13: 禁用简历分享
```bash
curl -X DELETE http://localhost:8082/api/v1/resumes/1/share \
  -H "Authorization: Bearer $GO_TOKEN"
```

**预期结果**:
```json
{
  "code": 0,
  "message": "分享已取消"
}
```

---

### 测试 14: 获取分享的简历 (公开接口)
```bash
curl -X GET http://localhost:8082/api/v1/shared/a1b2c3d4e5f6
```

**预期结果**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "...",
    "theme_id": 0,
    "resume_type": "full",
    "status": "published",
    ...
  }
}
```

---

## 测试检查清单

| 测试项 | Go 响应 | Python 响应 | 结构一致 | 状态码一致 |
|--------|---------|-------------|----------|------------|
| 注册 | | | ☐ | ☐ |
| 登录 | | | ☐ | ☐ |
| 游客登录 | | | ☐ | ☐ |
| 获取当前用户 | | | ☐ | ☐ |
| 更新资料 | | | ☐ | ☐ |
| 修改密码 | | | ☐ | ☐ |
| 创建简历 | | | ☐ | ☐ |
| 获取简历列表 | | | ☐ | ☐ |
| 获取简历详情 | | | ☐ | ☐ |
| 更新简历 | | | ☐ | ☐ |
| 删除简历 | | | ☐ | ☐ |
| 启用分享 | | | ☐ | ☐ |
| 禁用分享 | | | ☐ | ☐ |
| 获取分享简历 | | | ☐ | ☐ |

---

## 注意事项

1. **数据库隔离**: 测试时两边使用不同的数据库，或测试前清空数据
2. **Token 不可互通**: 由于密钥不同，Go 和 Python 生成的 token 不能互用
3. **时间戳格式**: 检查 `created_at`、`updated_at` 格式是否一致
4. **JSON 字段**: 确保 JSON 字符串的 key 顺序一致 (虽然 JSON 规范不要求顺序)
5. **NULL vs 空字符串**: 确保 `null` 和 `""` 处理一致
