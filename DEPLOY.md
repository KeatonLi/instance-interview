# 部署指南

本文档说明「简历大师」项目的部署流程、环境变量配置、项目结构。

---

## 一、项目结构

```
instance-interview/
├── deploy.sh              # 部署脚本（一键部署到服务器）
├── CLAUDE.md              # Claude Code 工作指引
├── README.md              # 项目说明
├── .gitignore             # Git 忽略配置
├── .gitattributes         # 换行符配置
│
├── frontend/              # React 前端
│   ├── src/               # 源代码
│   │   ├── config/        # 配置（API_BASE_URL 从环境变量读取）
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # UI 组件
│   │   └── ...
│   ├── dist/              # 构建产物（构建后自动生成）
│   ├── .env.example       # 环境变量示例
│   ├── .env.local         # 本地开发配置（不提交）
│   └── package.json
│
├── backend/               # Python FastAPI 后端
│   ├── main.py            # 入口文件
│   ├── config.py          # 配置（从环境变量读取）
│   ├── database.py        # 数据库连接
│   ├── routers/           # API 路由
│   ├── models/             # 数据模型
│   ├── schemas/           # Pydantic 模型
│   ├── services/          # 业务逻辑
│   ├── middleware/         # 中间件
│   ├── utils/              # 工具函数
│   ├── requirements.txt   # Python 依赖
│   ├── .env.example       # 环境变量示例
│   └── .env               # 实际配置（不提交）
│
├── sql/
│   └── schema.sql         # 数据库表结构
│
└── .claude/               # Claude Code 配置（不提交）
```

---

## 二、环境变量

### 前端（frontend/.env.local）

```bash
# 开发环境使用
VITE_API_URL=http://localhost:8082/api/v1
```

**重要**：`.env.local` 不提交到 Git，只用于本地开发。

### 后端（backend/.env）

```bash
# 服务器端口
RESUME_PORT=8082

# 数据库
RESUME_DB_HOST=localhost
RESUME_DB_PORT=3306
RESUME_DB_USER=root
RESUME_DB_PASSWORD=your_password
RESUME_DB_NAME=interview

# AI 功能（可选）
# ANTHROPIC_API_KEY=your_api_key
```

**重要**：`.env` 不提交到 Git，只用于实际运行。

### 环境变量读取逻辑

| 组件 | 配置项 | 读取来源 |
|------|--------|---------|
| 前端 | `VITE_API_URL` | 编译时由 deploy.sh 注入到 `.env.production` |
| 后端 | `RESUME_PORT` | `.env` 文件（python-dotenv） |
| 后端 | `RESUME_DB_*` | `.env` 文件（python-dotenv） |

---

## 三、部署流程

执行 `./deploy.sh` 会依次完成以下步骤：

### 1. 构建前端

```bash
cd frontend
# 生成 .env.production（部署时自动创建）
VITE_API_URL=http://${SERVER_HOST}:8082/api/v1

npm install
npm run build  # 生成 dist/ 目录
```

### 2. 上传文件到服务器

通过 SSH 上传到 `/opt/instant-interview/`：

| 文件/目录 | 说明 |
|-----------|------|
| `backend/` | Python 后端代码（含 .env） |
| `frontend/dist/` | 前端构建产物 |
| `.env` | 后端环境变量 |

### 3. 服务器上安装依赖

```bash
cd backend
pip3 install -r requirements.txt
```

### 4. 停止旧服务

- 读取 `backend.pid` 和 `frontend.pid`
- `kill` 旧进程

### 5. 启动新服务

```bash
# 后端
python3 -m uvicorn main:app --host 0.0.0.0 --port 8082 &

# 前端
serve -s . -p 3001 &
```

### 6. 健康检查

```bash
curl http://localhost:8082/health     # 期望: {"status":"ok"}
curl http://localhost:3001            # 期望: HTML 页面
```

---

## 四、服务访问

| 服务 | 地址 |
|------|------|
| 前端 | `http://{SERVER_HOST}:3001` |
| 后端 API | `http://{SERVER_HOST}:8082/api/v1` |

---

## 五、开发环境

### 本地运行后端

```bash
cd backend
cp .env.example .env  # 编辑填入实际值
pip3 install -r requirements.txt
python3 main.py
```

### 本地运行前端

```bash
cd frontend
cp .env.example .env.local  # 编辑填入实际值
npm install
npm run dev
```

### 本地构建

```bash
./deploy.sh  # 直接执行，会自动完成构建和上传
```

---

## 六、配置服务器信息

在 `deploy.sh` 开头修改：

```bash
SERVER_HOST="111.231.107.210"   # 服务器 IP
SERVER_USER="root"              # SSH 用户
SERVER_PORT="22"                # SSH 端口
REMOTE_DIR="/opt/instant-interview"  # 远程部署目录
```

---

## 七、部署检查清单

- [ ] 服务器 SSH 免密登录已配置
- [ ] `backend/.env` 已正确配置数据库信息
- [ ] `deploy.sh` 中 `SERVER_HOST` 已修改为实际 IP
- [ ] 执行 `./deploy.sh` 后看到 `🎉 部署完成!`
- [ ] `curl http://{SERVER_HOST}:8082/health` 返回 `{"status":"ok"}`
- [ ] 前端页面可正常访问

---

## 八、服务器日志

```bash
# 查看后端日志
ssh root@{SERVER_HOST} "tail -n 500 /opt/instant-interview/backend.log"

# 查看前端日志
ssh root@{SERVER_HOST} "tail -n 500 /opt/instant-interview/frontend.log"
```