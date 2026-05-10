# Claude Code 工作指引

## 语言偏好

**用户使用中文，请使用中文回答。**

## 项目概述

**简历大师**是一款智能简历助手，帮助用户创建、编辑、导出专业简历。

### 核心功能
- 简历管理（创建、编辑、删除、预览）
- 5种简历模板
- PDF 导出/导入
- 分享链接
- AI 优化（基于 MiniMax）

### 技术栈
- 前端: React 19 + TypeScript + Vite (`frontend/`)
- 后端: Python FastAPI (`backend/`)
- 数据库: MySQL

---

## 常用命令

### 前端
```bash
cd frontend
npm install
npm run dev      # 端口 5173
npm run build
```

### 后端
```bash
cd backend
pip install -r requirements.txt
python3 main.py  # 端口 8082
```

---

## 部署

**每次修改代码后必须部署到服务器：**
```bash
./deploy.sh
```

部署后检查：
1. `curl http://111.231.107.210:8082/health` 返回 `{"status":"ok"}`
2. 前端页面可正常访问

---

## 项目结构

### 前端
- `src/pages/` - 页面组件
- `src/components/` - UI 组件（`ui/` 为 shadcn/ui）
- `src/contexts/AuthContext.tsx` - 认证状态
- `src/lib/api.ts` - API 客户端
- `src/types/resume.ts` - 类型定义
- `src/styles/resumeThemes.ts` - 5种模板主题

### 后端
- `routers/` - API 路由
- `services/` - 业务逻辑
- `schemas/` - Pydantic 模型
- `middleware/auth.py` - JWT 认证

---

## API 端点

基础路径: `/api/v1`

**公开接口：**
- `POST /auth/register` - 注册
- `POST /auth/login` - 登录
- `POST /auth/guest` - 游客登录
- `GET /shared/:token` - 获取分享简历

**需认证：**
- `GET /auth/me` - 当前用户
- `PUT /auth/profile` - 更新资料
- `GET /resumes` - 简历列表
- `POST /resumes` - 创建简历
- `PUT /resumes/:id` - 更新简历
- `DELETE /resumes/:id` - 删除简历
- `POST /resumes/:id/share` - 启用分享

---

## 关键文件
- `frontend/src/App.tsx` - 路由配置
- `frontend/src/pages/EditorPage.tsx` - 简历编辑器
- `backend/main.py` - FastAPI 入口
- `backend/services/pdf_parser.py` - PDF 解析器

---

## 任务完成标准

部署到服务器并验证服务正常运行才算完成。

---

## 环境变量

| 组件 | 变量 | 说明 |
|------|------|------|
| 前端 | `VITE_API_URL` | 后端 API 地址 |
| 后端 | `RESUME_PORT` | 服务端口 |
| 后端 | `RESUME_DB_*` | 数据库配置 |
| 后端 | `ANTHROPIC_API_KEY` | AI 密钥 |

服务器: `111.231.107.210` | 用户: `root`