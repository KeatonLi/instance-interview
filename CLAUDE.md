# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 在本项目中工作时提供指导。

## 语言偏好

**用户使用中文，请使用中文回答。**

## 项目概述

简历大师是一款智能简历助手，帮助用户创建、编辑和导出专业简历。项目包含：
- **前端**: React 19 + TypeScript + Vite（在 `frontend/` 目录）
- **后端**: Go + Gin 框架（在 `backend/` 目录）

## 常用命令

### 前端开发
```bash
cd frontend
npm install          # 安装依赖
npm run dev          # 启动开发服务器（通常端口 5173）
npm run build        # 构建生产版本
npm run lint         # 运行 ESLint
```

### 后端开发
```bash
cd backend
go run main.go       # 启动后端服务器（默认端口 8082）
go build -o server  # 构建二进制文件
```

### 环境变量
- 前端：`VITE_API_URL` - 后端 API 地址（默认：`http://localhost:8082/api/v1`）
- 后端：通过环境变量配置（详见 `backend/internal/config/config.go`）：
  - `PORT` - 服务器端口（默认：8082）
  - `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_NAME` - MySQL 数据库配置
  - `MINIMAX_API_URL`、`MINIMAX_API_KEY` - AI 优化功能

## 架构

### 前端目录结构
- `src/components/` - React 组件（包括 `ui/` 目录下的 shadcn/ui 组件）
- `src/pages/` - 页面组件（HomePage、LoginPage、RegisterPage、ResumeListPage、EditorPage）
- `src/contexts/` - React Context（AuthContext 用于认证）
- `src/lib/` - 工具函数（api.ts 是 API 客户端，auth.ts 是认证辅助函数）
- `src/types/` - TypeScript 类型定义（resume.ts 定义了 ResumeData）

### 后端目录结构
- `backend/internal/handlers/` - HTTP 处理器（auth.go、resume.go）
- `backend/internal/models/` - 数据库模型（GORM）
- `backend/internal/services/` - 业务逻辑（ai.go 用于 AI 优化）
- `backend/internal/middleware/` - Gin 中间件（CORS、JWT 认证）
- `backend/internal/config/` - 配置

### API 端点
基础路径：`/api/v1`

**公开接口：**
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/guest` - 游客登录（无需账号）

**需要认证的接口：**
- `GET /auth/me` - 获取当前用户信息
- `GET /resumes` - 获取用户简历列表
- `GET /resumes/:id` - 获取指定简历
- `POST /resumes` - 创建简历
- `PUT /resumes/:id` - 更新简历
- `DELETE /resumes/:id` - 删除简历

### 关键技术细节
- 认证使用 JWT，存储在 localStorage，通过 `Authorization: Bearer <token>` 头发送
- 简历数据以 JSON 字符串形式存储在 MySQL 中
- PDF 生成在前端完成，使用 `@react-pdf/renderer`
- UI 组件使用 shadcn/ui（基于 Radix UI）和 Tailwind CSS
- 表单验证使用 React Hook Form + Zod

## 关键文件
- `frontend/src/App.tsx` - 主应用，包含路由和受保护的路由
- `frontend/src/types/resume.ts` - 简历数据类型（PersonalInfo、Education、WorkExperience、Project、Skill、Award、Language）
- `frontend/src/components/ResumePDF.tsx` - PDF 文档生成组件
- `backend/main.go` - 服务器入口和路由配置
