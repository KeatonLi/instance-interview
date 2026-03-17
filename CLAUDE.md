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
```

### 环境变量
- 前端：`VITE_API_URL` - 后端 API 地址（默认：`http://111.231.107.210:8082/api/v1`）
- 后端：
  - `PORT` - 服务器端口（默认：8082）
  - `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_NAME` - MySQL 数据库
  - `MINIMAX_API_URL`、`MINIMAX_API_KEY` - AI 优化功能

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

## 简历模板

模板配置文件：`frontend/src/styles/resumeThemes.ts`

目前提供 5 种模板风格：
1. **经典商务** - 蓝白色调，黑色细线
2. **现代简约** - 纯白底色，黑灰文字
3. **现代渐变** - 紫色渐变头部
4. **温暖橙光** - 橙色暖色调
5. **清新绿意** - 绿色清新风格
