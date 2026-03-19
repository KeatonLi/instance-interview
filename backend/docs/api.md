# Resume AI 后端接口文档

## 接口基础信息

- **基础URL**: `http://111.231.107.210:8082`
- **API版本**: `v1`
- **前缀**: `/api/v1`
- **请求格式**: JSON
- **响应格式**: JSON

---

## 通用响应格式

### 成功响应
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 错误响应
```json
{
  "code": 1,
  "message": "错误信息",
  "data": null
}
```

---

## 一、用户模块 (Auth)

### 1.1 用户注册
- **URL**: `/api/v1/auth/register`
- **方法**: `POST`
- **说明**: 创建新用户账号
- **请求体**:
```json
{
  "username": "string",      // 用户名 (必填, 3-20字符)
  "email": "string",         // 邮箱 (必填)
  "password": "string",     // 密码 (必填, 6-20字符)
  "nickname": "string"      // 昵称 (可选)
}
```
- **响应**:
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "nickname": "测试用户",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 1.2 用户登录
- **URL**: `/api/v1/auth/login`
- **方法**: `POST`
- **说明**: 用户登录，返回Token
- **请求体**:
```json
{
  "username": "string",      // 用户名或邮箱
  "password": "string"      // 密码
}
```
- **响应**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "test",
      "email": "test@example.com",
      "nickname": "测试用户",
      "avatar": ""
    }
  }
}
```

### 1.3 获取当前用户信息
- **URL**: `/api/v1/auth/me`
- **方法**: `GET`
- **说明**: 获取已登录用户的详细信息
- **Headers**: `Authorization: Bearer <token>`
- **响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "nickname": "测试用户",
    "avatar": "",
    "phone": "",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 1.4 更新用户信息
- **URL**: `/api/v1/auth/profile`
- **方法**: `PUT`
- **说明**: 更新当前用户的个人资料
- **Headers**: `Authorization: Bearer <token>`
- **请求体**:
```json
{
  "nickname": "string",     // 昵称
  "avatar": "string",       // 头像URL
  "phone": "string"         // 手机号
}
```
- **响应**:
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "nickname": "新昵称",
    "avatar": "https://...",
    "phone": "13800138000"
  }
}
```

### 1.5 修改密码
- **URL**: `/api/v1/auth/password`
- **方法**: `PUT`
- **说明**: 修改当前用户密码
- **Headers**: `Authorization: Bearer <token>`
- **请求体**:
```json
{
  "old_password": "string",   // 旧密码
  "new_password": "string"    // 新密码 (6-20字符)
}
```
- **响应**:
```json
{
  "code": 0,
  "message": "密码修改成功"
}
```

---

## 二、简历模块 (Resume)

### 2.1 获取简历列表
- **URL**: `/api/v1/resumes`
- **方法**: `GET`
- **说明**: 获取当前用户的简历列表
- **Headers**: `Authorization: Bearer <token>`
- **查询参数**:
  - `page` (可选): 页码，默认1
  - `page_size` (可选): 每页数量，默认10
- **响应**:
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 1,
        "title": "我的简历",
        "resume_type": "full",
        "is_default": true,
        "status": "draft",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "page_size": 10
  }
}
```

### 2.2 获取简历详情
- **URL**: `/api/v1/resumes/:id`
- **方法**: `GET`
- **说明**: 获取单个简历的完整信息
- **Headers**: `Authorization: Bearer <token>`
- **响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "高级后端工程师",
    "resume_type": "backend",
    "is_default": true,
    "status": "published",
    "personal_info": {},
    "education": [],
    "work_experience": [],
    "projects": [],
    "skills": [],
    "awards": [],
    "languages": [],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2.3 创建简历
- **URL**: `/api/v1/resumes`
- **方法**: `POST`
- **说明**: 创建新简历
- **Headers**: `Authorization: Bearer <token>`
- **请求体**:
```json
{
  "title": "string",           // 简历标题 (必填)
  "resume_type": "string",     // 简历类型: full/simple/project-manager/frontend/backend/fullstack
  "personal_info": {},          // 个人基本信息 (JSON)
  "education": [],              // 教育经历 (JSON数组)
  "work_experience": [],       // 工作经历 (JSON数组)
  "projects": [],              // 项目经验 (JSON数组)
  "skills": [],                // 技能列表 (JSON数组)
  "awards": [],                // 奖项荣誉 (JSON数组)
  "languages": []              // 语言能力 (JSON数组)
}
```
- **响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "高级后端工程师",
    ...
  }
}
```

### 2.4 更新简历
- **URL**: `/api/v1/resumes/:id`
- **方法**: `PUT`
- **说明**: 更新简历内容
- **Headers**: `Authorization: Bearer <token>`
- **请求体**: 同创建简历，所有字段可选

### 2.5 删除简历
- **URL**: `/api/v1/resumes/:id`
- **方法**: `DELETE`
- **说明**: 删除指定简历
- **Headers**: `Authorization: Bearer <token>`
- **响应**:
```json
{
  "code": 0,
  "message": "删除成功"
}
```

### 2.6 导入简历（PDF 解析）
- **URL**: `/api/v1/resumes/import`
- **方法**: `POST`
- **说明**: 上传 PDF 简历文件，自动解析并创建新简历
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **请求参数**:
  - `file` (必填): PDF 文件，大小不超过 10MB
- **响应**:
```json
{
  "code": 0,
  "message": "导入成功",
  "data": {
    "resume": {
      "id": 1,
      "title": "张三的简历",
      "user_id": 1,
      "status": "draft",
      ...
    },
    "raw_text": "解析出的原始文本内容...",
    "parsed": {
      "personal_info": {
        "name": "张三",
        "email": "zhangsan@example.com",
        "phone": "13800138000"
      },
      "education": [...],
      "work_experience": [...],
      "projects": [...],
      "skills": [...]
    }
  }
}
```
- **错误响应**:
```json
{
  "code": 1,
  "error": "请上传 PDF 格式的文件"
}
```

---

## 三、健康检查

### 3.1 服务健康检查
- **URL**: `/health`
- **方法**: `GET`
- **说明**: 检查服务是否正常运行
- **响应**:
```json
{
  "status": "ok"
}
```

---

## 接口状态码说明

| code | 说明 |
|------|------|
| 0 | 成功 |
| 1 | 通用错误 |
| 401 | 未授权 (token无效或过期) |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 422 | 请求参数错误 |
| 500 | 服务器内部错误 |

---

## 认证方式

除公开接口（注册、登录）外，所有接口需要在请求头中携带Token：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token 有效期为 7 天。

---

## 简历类型说明

| 类型 | 说明 |
|------|------|
| full | 完整版简历 |
| simple | 简洁版简历 |
| project-manager | 项目经理版 |
| frontend | 前端工程师版 |
| backend | 后端工程师版 |
| fullstack | 全栈工程师版 |

---

## 简历内容说明

所有简历详细内容以 JSON 格式存储在各个字段中：

| 字段 | 类型 | 说明 |
|------|------|------|
| personal_info | JSON | 个人基本信息 |
| education | JSON Array | 教育经历 |
| work_experience | JSON Array | 工作经历 |
| projects | JSON Array | 项目经验 |
| skills | JSON Array | 技能列表 |
| awards | JSON Array | 奖项荣誉 |
| languages | JSON Array | 语言能力 |

### personal_info 结构
```json
{
  "name": "姓名",
  "title": "职位",
  "email": "邮箱",
  "phone": "电话",
  "location": "所在地",
  "github": "GitHub URL",
  "linkedin": "LinkedIn URL",
  "summary": "个人简介"
}
```

### education 结构 (数组)
```json
[{
  "id": "唯一标识",
  "school": "学校名称",
  "degree": "学位",
  "field": "专业",
  "startDate": "开始时间",
  "endDate": "结束时间",
  "gpa": "GPA",
  "description": "描述"
}]
```

### work_experience 结构 (数组)
```json
[{
  "id": "唯一标识",
  "company": "公司名称",
  "position": "职位",
  "location": "工作地点",
  "startDate": "开始时间",
  "endDate": "结束时间",
  "current": false,
  "description": "工作描述",
  "achievements": ["成就1", "成就2"]
}]
```

### projects 结构 (数组)
```json
[{
  "id": "唯一标识",
  "name": "项目名称",
  "role": "担任角色",
  "startDate": "开始时间",
  "endDate": "结束时间",
  "current": false,
  "description": "项目描述",
  "technologies": ["技术栈1", "技术栈2"],
  "link": "项目链接"
}]
```

### skills 结构 (数组)
```json
[{
  "id": "唯一标识",
  "category": "技能类别",
  "level": "熟练度",
  "items": ["技能项1", "技能项2"]
}]
```
