# 后端 API 文档

本文档说明「简历大师」后端 API 的接口规范、请求格式、响应格式。

---

## 一、基础信息

| 项目 | 值 |
|------|-----|
| 基础路径 | `/api/v1` |
| 认证方式 | JWT Bearer Token |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |

### 认证方式

除公开接口外，所有请求需要在 Header 中携带 Token：

```
Authorization: Bearer <token>
```

### 响应格式

所有接口统一使用以下响应格式：

**成功响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

**错误响应：**
```json
{
  "code": 1,
  "message": "错误描述"
}
```

---

## 二、认证接口

### 2.1 用户注册

**接口：** `POST /api/v1/auth/register`

**描述：** 注册新用户

**请求参数：**
```json
{
  "username": "string (3-20字符)",
  "email": "string (邮箱格式)",
  "password": "string (6-20字符)",
  "nickname": "string (可选)"
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "nickname": null,
    "created_at": "2026-01-01T00:00:00"
  }
}
```

---

### 2.2 用户登录

**接口：** `POST /api/v1/auth/login`

**描述：** 用户登录，返回 JWT Token

**请求参数：**
```json
{
  "username": "string",
  "password": "string"
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "zhangsan",
      "email": "zhangsan@example.com",
      "nickname": null,
      "status": "active"
    }
  }
}
```

---

### 2.3 游客登录

**接口：** `POST /api/v1/auth/guest`

**描述：** 游客登录，无需注册

**请求参数：** 无

**响应示例：**
```json
{
  "code": 0,
  "message": "游客登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "username": "guest_xxx",
      "email": "guest_xxx@kvee.app",
      "nickname": "游客用户"
    },
    "is_guest": true
  }
}
```

---

### 2.4 获取当前用户

**接口：** `GET /api/v1/auth/me`

**描述：** 获取当前登录用户信息

**认证：** 需要

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "nickname": "张三",
    "avatar": null,
    "phone": null,
    "status": "active",
    "created_at": "2026-01-01T00:00:00"
  }
}
```

---

### 2.5 更新个人资料

**接口：** `PUT /api/v1/auth/profile`

**描述：** 更新当前用户的个人资料

**认证：** 需要

**请求参数：**
```json
{
  "nickname": "string (可选)",
  "avatar": "string (可选)",
  "phone": "string (可选)"
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "nickname": "张三",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "13800138000"
  }
}
```

---

### 2.6 修改密码

**接口：** `PUT /api/v1/auth/password`

**描述：** 修改当前用户的密码

**认证：** 需要

**请求参数：**
```json
{
  "old_password": "string",
  "new_password": "string (6-20字符)"
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "密码修改成功"
}
```

---

## 三、简历接口

### 3.1 获取简历列表

**接口：** `GET /api/v1/resumes`

**描述：** 获取当前用户的简历列表

**认证：** 需要

**查询参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| search | string | null | 搜索关键词 |
| sort | string | updated_at_desc | 排序方式 |
| theme_id | number | null | 模板ID过滤 |
| page | number | 1 | 页码 |
| page_size | number | 10 | 每页数量 |

**sort 可选值：**
- `updated_at_desc` - 最近更新优先
- `updated_at_asc` - 最早更新优先
- `created_at_desc` - 最新创建优先
- `created_at_asc` - 最早创建优先

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 1,
        "title": "我的简历",
        "theme_id": 0,
        "resume_type": "full",
        "is_default": false,
        "status": "draft",
        "personal_info": "{}",
        "education": "[]",
        "work_experience": "[]",
        "projects": "[]",
        "skills": "[]",
        "awards": "[]",
        "languages": "[]",
        "share_token": null,
        "created_at": "2026-01-01T00:00:00",
        "updated_at": "2026-01-01T00:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 3.2 获取简历详情

**接口：** `GET /api/v1/resumes/:id`

**描述：** 获取指定简历的详细信息

**认证：** 需要

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "我的简历",
    "theme_id": 0,
    "resume_type": "full",
    "is_default": false,
    "status": "draft",
    "personal_info": "{\"name\":\"张三\",\"title\":\"前端工程师\",\"email\":\"zhangsan@example.com\"}",
    "education": "[{\"id\":\"1\",\"school\":\"清华大学\",\"degree\":\"本科\"}]",
    "work_experience": "[]",
    "projects": "[]",
    "skills": "[]",
    "awards": "[]",
    "languages": "[]",
    "share_token": null,
    "share_expires_at": null,
    "created_at": "2026-01-01T00:00:00",
    "updated_at": "2026-01-01T00:00:00"
  }
}
```

**注意：** 简历数据以 JSON 字符串形式存储，字段说明：

| 字段 | 类型 | 说明 |
|------|------|------|
| personal_info | string (JSON) | 个人信息 |
| education | string (JSON) | 教育经历数组 |
| work_experience | string (JSON) | 工作经历数组 |
| projects | string (JSON) | 项目经验数组 |
| skills | string (JSON) | 专业技能数组 |
| awards | string (JSON) | 获奖荣誉数组 |
| languages | string (JSON) | 语言能力数组 |

---

### 3.3 创建简历

**接口：** `POST /api/v1/resumes`

**描述：** 创建新简历

**认证：** 需要

**请求参数：**
```json
{
  "title": "string (可选, 默认'我的简历')",
  "theme_id": "number (可选, 默认0)",
  "resume_type": "string (可选, 默认'full')",
  "personal_info": "string (可选, JSON字符串)",
  "education": "string (可选, JSON数组字符串)",
  "work_experience": "string (可选, JSON数组字符串)",
  "projects": "string (可选, JSON数组字符串)",
  "skills": "string (可选, JSON数组字符串)",
  "awards": "string (可选, JSON数组字符串)",
  "languages": "string (可选, JSON数组字符串)"
}
```

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "我的简历",
    "theme_id": 0,
    "resume_type": "full",
    "is_default": false,
    "status": "draft",
    "personal_info": "{}",
    "education": "[]",
    "work_experience": "[]",
    "projects": "[]",
    "skills": "[]",
    "awards": "[]",
    "languages": "[]",
    "created_at": "2026-01-01T00:00:00",
    "updated_at": "2026-01-01T00:00:00"
  }
}
```

---

### 3.4 从 PDF 导入简历

**接口：** `POST /api/v1/resumes/import`

**描述：** 从 PDF 文件导入简历内容

**认证：** 需要

**请求格式：** `multipart/form-data`

| 字段 | 类型 | 说明 |
|------|------|------|
| file | File | PDF 文件（最大 10MB） |

**响应示例：**
```json
{
  "code": 0,
  "message": "导入成功",
  "data": {
    "resume": { ... },
    "raw_text": "PDF 原始文本内容",
    "parsed": {
      "personal_info": { "name": "张三", "title": "前端工程师" },
      "education": [ { "school": "清华大学", "degree": "本科" } ],
      "work_experience": [ { "company": "字节跳动", "position": "前端工程师" } ],
      "projects": [],
      "skills": [ { "category": "前端", "items": ["React", "TypeScript"] } ],
      "awards": [],
      "languages": []
    }
  }
}
```

---

### 3.5 更新简历

**接口：** `PUT /api/v1/resumes/:id`

**描述：** 更新简历内容

**认证：** 需要

**请求参数：**
```json
{
  "title": "string (可选)",
  "theme_id": "number (可选)",
  "resume_type": "string (可选)",
  "status": "string (可选)",
  "is_default": "boolean (可选)",
  "personal_info": "string (可选, JSON字符串)",
  "education": "string (可选, JSON数组字符串)",
  "work_experience": "string (可选, JSON数组字符串)",
  "projects": "string (可选, JSON数组字符串)",
  "skills": "string (可选, JSON数组字符串)",
  "awards": "string (可选, JSON数组字符串)",
  "languages": "string (可选, JSON数组字符串)"
}
```

**响应示例：**
```json
{
  "code": 0,
  "data": { ... }
}
```

---

### 3.6 删除简历

**接口：** `DELETE /api/v1/resumes/:id`

**描述：** 删除指定简历

**认证：** 需要

**响应示例：**
```json
{
  "code": 0,
  "message": "deleted successfully"
}
```

---

### 3.7 启用简历分享

**接口：** `POST /api/v1/resumes/:id/share`

**描述：** 生成分享链接，允许他人查看简历

**认证：** 需要

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "share_token": "abc123def456",
    "share_url": "https://example.com/shared/abc123def456"
  }
}
```

---

### 3.8 禁用简历分享

**接口：** `DELETE /api/v1/resumes/:id/share`

**描述：** 取消简历分享

**认证：** 需要

**响应示例：**
```json
{
  "code": 0,
  "message": "分享已取消"
}
```

---

## 四、公开接口

### 4.1 获取分享的简历

**接口：** `GET /api/v1/shared/:token`

**描述：** 通过分享 Token 获取简历（无需认证）

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

---

## 五、错误码说明

| code | 说明 |
|------|------|
| 0 | 成功 |
| 1 | 失败（详见 message） |

### 常见错误

| 场景 | message |
|------|---------|
| 用户名已存在 | "用户名已存在" |
| 邮箱已存在 | "邮箱已被注册" |
| 用户名或密码错误 | "用户名或密码错误" |
| Token 无效 | "无效的 Token" |
| 简历不存在 | "简历不存在" |
| 无权限访问 | "无权限访问此资源" |
| 文件类型错误 | "请上传 PDF 格式的文件" |
| 文件过大 | "文件大小不能超过 10MB" |

---

## 六、简历数据字段详解

### PersonalInfo（个人信息）

```json
{
  "name": "张三",
  "title": "前端工程师",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "location": "北京",
  "linkedin": "https://linkedin.com/in/zhangsan",
  "github": "https://github.com/zhangsan",
  "website": "https://zhangsan.com",
  "summary": "资深前端工程师，5年经验..."
}
```

### Education（教育经历）

```json
{
  "id": "1",
  "school": "清华大学",
  "degree": "本科",
  "field": "计算机科学与技术",
  "startDate": "2015-09",
  "endDate": "2019-06",
  "gpa": "3.8/4.0",
  "description": "主修课程：数据结构、算法、操作系统..."
}
```

### WorkExperience（工作经历）

```json
{
  "id": "1",
  "company": "字节跳动",
  "position": "高级前端工程师",
  "startDate": "2020-07",
  "endDate": "2024-02",
  "current": false,
  "description": "负责公司核心产品研发...",
  "achievements": [
    "主导前端架构升级，性能提升40%",
    "带领5人团队完成项目交付"
  ]
}
```

### Project（项目经验）

```json
{
  "id": "1",
  "name": "企业内部管理系统",
  "role": "前端负责人",
  "startDate": "2022-01",
  "endDate": "2023-06",
  "current": false,
  "description": "基于 React 的企业级管理系统...",
  "technologies": ["React", "TypeScript", "Ant Design"],
  "link": "https://github.com/example/project"
}
```

### Skill（专业技能）

```json
{
  "id": "1",
  "category": "前端技术",
  "items": ["React", "Vue", "TypeScript", "Node.js"]
}
```

### Award（获奖荣誉）

```json
{
  "id": "1",
  "title": "优秀员工",
  "organization": "字节跳动",
  "date": "2023-01",
  "description": "2022年度优秀员工奖"
}
```

### Language（语言能力）

```json
{
  "id": "1",
  "name": "英语",
  "level": "CET-6"
}
```