# ResumeAI - 智能简历助手

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python" alt="Python">
</p>

> 用 AI 赋能你的求职之路 - 智能简历解析、优化、导出与模拟面试

## 项目简介

**ResumeAI** 是一款基于 AI 的智能简历助手，旨在帮助求职者快速创建、优化简历并提升面试技能。通过深度集成 AI 技术，用户可以上传现有 PDF 简历自动提取内容，或通过直观的表单填写简历信息，利用 AI 智能优化简历内容，还能基于简历进行模拟面试训练，大幅提升求职成功率。

## 核心功能

### 1. 简历管理
- 创建、编辑、删除、预览简历
- 5 种精美简历模板可选
- PDF 导入/导出
- 分享链接生成

### 2. PDF 简历智能解析
- 支持上传现有 PDF 简历文件
- 自动识别并提取简历中的关键信息
- 包括：个人信息、工作经历、教育背景、技能等
- 一键将 PDF 内容转换为结构化数据

### 3. 简历表单编辑
- 直观的可视化表单界面
- 完整的简历字段支持：
  - 个人信息（姓名、职位、联系方式等）
  - 工作经历（公司、职位、时间、成就）
  - 教育背景（学校、学位、专业、成绩）
  - 项目经历（项目描述、技术栈、链接）
  - 技能专长（分类展示）
  - 荣誉奖项
  - 语言能力
- 实时预览，所见即所得

### 4. AI 简历智能优化
基于 MiniMax M2.5 大语言模型，提供多种优化方式：

| 优化类型 | 说明 |
|---------|------|
| 措辞优化 | 使描述更专业、简洁有力 |
| 关键词增强 | 增强 ATS 关键词通过率 |
| 成就量化 | 量化工作成果，突出业绩数据 |

- **单条优化**：快速优化简历中的单条内容
- **一键优化**：整份简历全面优化

### 5. AI 模拟面试
基于简历内容生成针对性的技术面试问题，AI 实时评估回答并提供改进建议：

- **问题生成**：基于简历中的工作经历和项目经验生成面试题
- **多维评估**：技术深度、项目实战、场景行为、职业规划
- **即时反馈**：每道题回答后显示评分、标准答案和改进建议
- **综合报告**：面试完成后展示综合评分和总结
- **历史记录**：保存每次面试记录，随时回顾复习

### 6. 高质量 PDF 导出
- 一键生成专业 PDF 简历
- 精美的排版设计
- 支持 A4 纸张格式
- 高清输出，适配各类招聘平台

## 技术栈

### 前端
| 类别 | 技术 |
|------|------|
| 框架 | React 19 |
| 语言 | TypeScript 5.9 |
| 构建工具 | Vite 7 |
| UI 框架 | Tailwind CSS 3.4 + shadcn/ui |
| PDF 生成 | @react-pdf/renderer |
| 表单处理 | React Hook Form + Zod |
| 图标 | Lucide React |

### 后端
| 类别 | 技术 |
|------|------|
| 框架 | FastAPI (Python) |
| 数据库 | MySQL |
| AI 能力 | MiniMax M2.5 API |

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev      # 开发服务器 http://localhost:5173
npm run build    # 生产构建
```

### 后端

```bash
cd backend
pip install -r requirements.txt
python3 main.py  # 服务端口 8082
```

## API 接口

基础路径: `/api/v1`

**公开接口：**
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/guest` - 游客登录
- `GET /shared/:token` - 获取分享简历

**简历接口（需认证）：**
- `GET /resumes` - 简历列表
- `POST /resumes` - 创建简历
- `PUT /resumes/:id` - 更新简历
- `DELETE /resumes/:id` - 删除简历
- `POST /resumes/:id/share` - 启用分享
- `POST /resumes/optimize` - 优化单条简历内容
- `POST /resumes/optimize-full` - 一键优化整份简历

**模拟面试接口（需认证）：**
- `POST /interview/start` - 开始面试
- `POST /interview/answer` - 提交回答
- `POST /interview/next` - 获取下一道题
- `GET /interview/records` - 获取面试记录列表
- `GET /interview/records/:id` - 获取面试记录详情

## 项目结构

```
instance-interview/
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   │   ├── EditorPage.tsx         # 简历编辑器
│   │   │   ├── OptimizePage.tsx        # 简历优化页
│   │   │   ├── InterviewPage.tsx       # 模拟面试页
│   │   │   ├── InterviewHistoryPage.tsx # 面试历史页
│   │   │   └── InterviewHistoryDetailPage.tsx # 面试详情页
│   │   ├── components/         # UI 组件
│   │   │   ├── ui/             # shadcn/ui 基础组件
│   │   │   ├── OptimizeDialog.tsx      # 单条优化弹窗
│   │   │   └── FullOptimizeDialog.tsx  # 一键优化弹窗
│   │   ├── contexts/           # React Context
│   │   │   └── AuthContext.tsx  # 认证状态管理
│   │   ├── lib/                # 工具库
│   │   │   ├── api.ts          # API 客户端
│   │   │   └── resumes.ts      # 简历 API 封装
│   │   ├── types/              # 类型定义
│   │   │   └── resume.ts       # 简历类型
│   │   └── styles/             # 样式
│   │       └── resumeThemes.ts # 5种模板主题
│   └── ...
├── backend/                     # 后端项目
│   ├── routers/                # API 路由
│   │   ├── auth.py             # 认证接口
│   │   ├── resume.py           # 简历接口
│   │   └── interview.py        # 模拟面试接口
│   ├── services/                # 业务逻辑
│   ├── schemas/                # Pydantic 模型
│   ├── models/                 # 数据模型
│   └── main.py                 # FastAPI 入口
├── deploy.sh                    # 部署脚本
└── README.md
```

## 目标用户

- 求职者 - 需要快速创建或优化简历的专业人士
- 应届毕业生 - 首次撰写简历的学生
- 职场转型者 - 准备转向新行业的求职者
- 留学申请者 - 需要英文简历的留学生

## 未来规划

- [ ] 多语言简历支持（中英文）
- [ ] 更多简历模板
- [ ] 求职信生成
- [ ] 简历评分系统
- [ ] 云端保存与同步

## 贡献指南

欢迎提交 Pull Request 或 Issue！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

MIT License - 欢迎自由使用和修改

---

<p align="center">Made with ❤️</p>
