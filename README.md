# ResumeAI - 智能简历助手

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite" alt="Vite">
</p>

> 🚀 用 AI 赋能你的求职之路 - 智能简历解析、优化与生成

## 📋 项目简介

**ResumeAI** 是一款基于 AI 的智能简历助手，旨在帮助求职者快速创建、优化和导出专业简历。通过深度集成 AI 技术，用户可以上传现有 PDF 简历自动提取内容，或通过直观的表单填写简历信息，并利用 AI 智能优化简历内容，大幅提升简历质量和求职成功率。

## ✨ 核心功能

### 1. 📄 PDF 简历智能解析
- 支持上传现有 PDF 简历文件
- 自动识别并提取简历中的关键信息
- 包括：个人信息、工作经历、教育背景、技能等
- 一键将 PDF 内容转换为结构化数据

### 2. 📝 简历表单编辑
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

### 3. 🤖 AI 简历智能优化
- 基于 MiniMax M2.5 大语言模型
- AI 分析现有简历内容
- 提供优化建议：
  - 措辞优化，使描述更具专业性
  - 关键词增强，提升 ATS 通过率
  - 成就量化，用数据说话
  - 格式建议，结构更清晰

### 4. 📥 高质量 PDF 导出
- 一键生成专业 PDF 简历
- 精美的排版设计
- 支持 A4 纸张格式
- 高清输出，适配各类招聘平台

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 |
| 语言 | TypeScript 5.9 |
| 构建工具 | Vite 7 |
| UI 框架 | Tailwind CSS 3.4 + shadcn/ui |
| PDF 生成 | @react-pdf/renderer |
| 表单处理 | React Hook Form + Zod |
| AI 能力 | MiniMax M2.5 API |
| 图标 | Lucide React |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm / yarn / pnpm

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/yourusername/resume-ai.git

# 进入项目目录
cd resume-ai

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
resume-ai/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui 基础组件
│   │   ├── ResumeForm.tsx   # 简历表单组件
│   │   ├── ResumePreview.tsx # 简历预览组件
│   │   ├── ResumePDF.tsx    # PDF 渲染组件
│   │   └── PDFDownloader.tsx # PDF 下载组件
│   ├── types/
│   │   └── resume.ts        # 简历数据类型定义
│   ├── hooks/
│   │   └── use-mobile.ts    # 移动端检测 Hook
│   ├── lib/
│   │   └── utils.ts         # 工具函数
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🎯 目标用户

- 🧑‍💼 **求职者** - 需要快速创建或优化简历的专业人士
- 🎓 **应届毕业生** - 首次撰写简历的学生
- 🔄 **职场转型者** - 准备转向新行业的求职者
- 📚 **留学申请者** - 需要英文简历的留学生

## 💡 为什选择 ResumeAI？

| 传统方式 | ResumeAI |
|----------|----------|
| 从零开始写简历 | AI 辅助，快速起步 |
| 手动排版繁琐 | 自动生成精美 PDF |
| 不知道如何优化 | AI 提供专业建议 |
| 重复修改费时 | 实时预览快速迭代 |
| 费用高昂 | 完全开源免费 |

## 🔮 未来规划

- [ ] PDF 简历智能解析与提取
- [ ] MiniMax M2.5 AI 优化引擎
- [ ] 多语言简历支持（中英文）
- [ ] 简历模板库
- [ ] 求职信生成
- [ ] 简历评分系统
- [ ] 云端保存与同步

## 🤝 贡献指南

欢迎提交 Pull Request 或 Issue！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 欢迎自由使用和修改

---

<p align="center">Made with ❤️ by ResumeAI</p>
