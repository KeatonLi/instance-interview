# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 在本项目中工作时提供指导。

## 语言偏好

**用户使用中文，请使用中文回答。**

## 项目概述

简历大师是一款智能简历助手，帮助用户创建、编辑、导出专业简历。项目包含：
- **前端**: React 19 + TypeScript + Vite（`frontend/`）
- **后端**: Go + Gin 框架（`backend/`）

## 常用命令

### 前端开发
```bash
cd frontend
npm install          # 安装依赖
npm run dev          # 启动开发服务器（端口 5173）
npm run build        # 构建生产版本
npm run lint         # 运行 ESLint
```

### 后端开发
```bash
cd backend
go run main.go       # 启动后端服务器（端口 8082）
go build -o server  # 构建二进制文件
go test -v ./...    # 运行所有测试
```

### 后端测试
```bash
cd backend
go test -v ./internal/services/...  # 运行 services 层测试
```

当前已实现的单元测试：
- `pdf_parser_test.go` - PDF 简历解析器测试
  - 辅助函数测试（中文姓名判断、技术栈判断）
  - Section 识别测试
  - 条目分割测试
  - 个人信息/教育/工作/项目/技能提取测试
  - 完整解析流程测试

### 部署
**重要**: 每次修改代码后，**必须运行部署脚本**将改动发布到服务器。

**Windows 用户**: 使用 WSL 运行部署脚本：
```bash
wsl ./deploy.sh
```

或者通过 Bash（需要管理员授权）：
```bash
bash -c "cd /mnt/d/programs/instance-interview && ./deploy.sh"
```

部署脚本会自动：构建前后端 → 上传文件 → 重启服务

**部署后必须检查**：
1. 服务是否正常启动（查看后端日志确认无 panic）
2. 前端功能是否正常（刷新页面测试）
3. 如果出现 `panic: regexp: Compile` 错误，说明正则表达式语法有问题，需要修复后重新部署

**服务器信息**:
- 地址：`111.231.107.210`
- 用户：`root`
- 密码：`Li_bo_kai53274`

### Docker 部署

项目支持 Docker 部署，前端、后端、nginx 打包在同一个镜像中。

#### 构建镜像
```bash
cd D:/programs/instance-interview
docker build -t resume-ai .
```

#### 运行应用容器
```bash
docker run -d -p 8080:8080 \
  -e RESUME_PORT=8082 \
  -e RESUME_DB_HOST=数据库IP \
  -e RESUME_DB_PORT=3306 \
  -e RESUME_DB_USER=root \
  -e RESUME_DB_PASSWORD=密码 \
  -e RESUME_DB_NAME=interview \
  -e ANTHROPIC_API_KEY=AI密钥 \
  --name resume-ai \
  resume-ai
```

#### 运行 MySQL（可选，如果本地没有数据库）
```bash
docker run -d -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=密码 \
  -e MYSQL_DATABASE=interview \
  --name mysql \
  mysql:8.0
```

#### 环境变量说明

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `RESUME_PORT` | 8082 | 后端端口（容器内部） |
| `RESUME_DB_HOST` | localhost | 数据库地址 |
| `RESUME_DB_PORT` | 3306 | 数据库端口 |
| `RESUME_DB_USER` | root | 数据库用户名 |
| `RESUME_DB_PASSWORD` | (空) | 数据库密码 |
| `RESUME_DB_NAME` | interview | 数据库名 |
| `ANTHROPIC_API_KEY` | (空) | MiniMax AI 密钥 |

#### 访问应用
- 启动后访问：**http://localhost:8080**
- API 通过 nginx 代理到后端

### 环境变量
- 前端：`VITE_API_URL` - 后端 API 地址（默认：`http://111.231.107.210:8082/api/v1`）
- 后端：
  - `RESUME_PORT` - 服务器端口（默认：8082）
  - `RESUME_DB_HOST`、`RESUME_DB_PORT`、`RESUME_DB_USER`、`RESUME_DB_PASSWORD`、`RESUME_DB_NAME` - MySQL 数据库
  - `ANTHROPIC_BASE_URL`、`ANTHROPIC_API_KEY` - AI 优化功能

## 架构

### 前端结构
- `src/components/` - React 组件（`ui/` 为 shadcn/ui 组件）
- `src/pages/` - 页面（HomePage、LoginPage、RegisterPage、ResumeListPage、EditorPage）
- `src/contexts/` - React Context（AuthContext 认证）
- `src/lib/` - 工具函数（api.ts API 客户端，auth.ts 认证辅助）
- `src/types/` - TypeScript 类型定义
- `src/styles/` - 样式文件（resumeTheme.ts 简历主题配置）

### 后端结构
- `backend/internal/handlers/` - HTTP 处理器（auth.go、resume.go）
- `backend/internal/models/` - 数据库模型（GORM）
- `backend/internal/services/` - 业务逻辑（ai.go AI 优化）
- `backend/internal/middleware/` - Gin 中间件（CORS、JWT）
- `backend/internal/config/` - 配置

### API 端点
基础路径：`/api/v1`

**公开接口：**
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/guest` - 游客登录

**需要认证：**
- `GET /auth/me` - 获取当前用户
- `GET /resumes` - 获取简历列表
- `GET /resumes/:id` - 获取简历详情
- `POST /resumes` - 创建简历
- `PUT /resumes/:id` - 更新简历
- `DELETE /resumes/:id` - 删除简历

### 关键技术
- 认证：JWT 存储在 localStorage
- 数据：简历以 JSON 字符串存储在 MySQL
- PDF：前端使用 `@react-pdf/renderer` 生成
- UI：shadcn/ui + Tailwind CSS
- 表单：React Hook Form + Zod

## 关键文件
- `frontend/src/App.tsx` - 主应用，路由和受保护路由
- `frontend/src/types/resume.ts` - 简历数据类型定义
- `frontend/src/components/ResumePDF.tsx` - PDF 生成组件
- `frontend/src/components/ResumePreview.tsx` - 简历预览组件
- `frontend/src/styles/resumeThemes.ts` - 简历主题配置（5种模板风格）
- `backend/main.go` - 服务器入口
- `backend/internal/services/pdf_parser.go` - PDF 简历解析器（类结构）

## PDF 简历导入功能

解析器类：`ResumePDFParser`（位于 `backend/internal/services/pdf_parser.go`）

**主要功能：**
- 支持 Section 识别：教育背景、工作经历、项目经验、专业技能、获奖荣誉、语言能力
- 智能条目分割：按序号、列表符号、时间戳等分割多行条目
- 字段提取：学校名、学位、时间范围、技术栈等

**解析结果字段：**
| Section | 字段 |
|---------|------|
| PersonalInfo | name, title, email, phone, location, github, linkedin, website, summary |
| Education | id, school, degree, field, startDate, endDate, gpa, description |
| WorkExperience | id, company, position, startDate, endDate, current, description, achievements |
| Project | id, name, role, startDate, endDate, current, description, technologies, link |
| Skill | id, category, items |
| Award | id, title, organization, date, description |
| Language | id, name, level |

## 简历模板

模板配置文件：`frontend/src/styles/resumeThemes.ts`

目前提供 5 种模板风格：
1. **经典商务** - 蓝白色调，黑色细线
2. **现代简约** - 纯白底色，黑灰文字
3. **现代渐变** - 紫色渐变头部
4. **温暖橙光** - 橙色暖色调
5. **清新绿意** - 绿色清新风格
