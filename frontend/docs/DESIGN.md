# 前端设计文档

本文档说明「简历大师」前端的设计规范、页面结构、组件规范。

---

## 一、设计规范

### 1.1 整体风格

**现代简约、卡片式设计**

- 界面清晰，层次分明
- 大量使用圆角卡片（border-radius: 0.75rem-1rem）
- 毛玻璃效果（backdrop-blur）和微透明背景
- 渐变色点缀（蓝色到靛蓝色渐变）
- 阴影层次丰富但不突兀

### 1.2 色彩系统

**主色调：蓝色系**

| 用途 | 色值 |
|------|------|
| 主色 | `#2563eb` (blue-600) |
| 主色悬停 | `#1d4ed8` (blue-700) |
| 强调色 | `#4f46e5` (indigo-600) |
| 背景色 | `#f8fafc` (#f8fafc) |
| 卡片背景 | `rgba(255,255,255,0.7)` |
| 边框色 | `#e2e8f0` (slate-200) |

**文字颜色**

| 级别 | 色值 |
|------|------|
| 主要文字 | `#1e293b` (slate-800) |
| 次要文字 | `#64748b` (slate-500) |
| 辅助文字 | `#94a3b8` (slate-400) |
| 白色文字 | `#ffffff` |

**状态颜色**

| 状态 | 色值 |
|------|------|
| 成功 | `#059669` (emerald-600) |
| 警告 | `#d97706` (amber-600) |
| 错误 | `#dc2626` (red-600) |
| 信息 | `#2563eb` (blue-600) |

### 1.3 字体系统

**中文字体**

- 主字体：`"PingFang SC", "Microsoft YaHei", sans-serif`
- 代码字体：`"SF Mono", "Monaco", monospace`

**英文字体**

- 主字体：`"Inter", -apple-system, sans-serif`

**字号规范**

| 用途 | 字号 |
|------|------|
| 页面标题 | 24px (text-2xl) |
| 区块标题 | 18px (text-xl) |
| 卡片标题 | 16px (text-base) |
| 正文 | 14px (text-sm) |
| 辅助文字 | 12px (text-xs) |
| 小标签 | 10px (text-[10px]) |

### 1.4 间距系统

**基础间距单位：** 4px

| 名称 | 值 |
|------|-----|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |

**页面内边距**

- 移动端：`px-4` (16px)
- 桌面端：`px-6` (24px)
- 最大宽度：`max-w-7xl` (1280px)

### 1.5 圆角规范

| 组件 | 圆角值 |
|------|--------|
| 按钮 | `rounded-lg` (8px) |
| 卡片 | `rounded-2xl` (16px) |
| 输入框 | `rounded-lg` (8px) |
| 对话框 | `rounded-2xl` (16px) |
| 小标签 | `rounded-md` (6px) |
| 头像 | `rounded-full` (50%) |

### 1.6 阴影规范

| 级别 | CSS |
|------|-----|
| 卡片 | `shadow-sm` |
| 悬停卡片 | `shadow-xl shadow-slate-900/10` |
| 对话框 | `shadow-2xl` |
| 主按钮 | `shadow-lg shadow-blue-500/25` |
| Logo 区域 | `shadow-xl shadow-blue-500/20` |

---

## 二、页面结构

### 2.1 路由结构

```
/                     -> 首页 (HomePage)
/login                -> 登录页 (LoginPage)
/register             -> 注册页 (RegisterPage)
/resumes              -> 简历列表页 (ResumeListPage) [需认证]
/editor/:id?          -> 简历编辑器页 (EditorPage) [需认证]
/shared/:token        -> 分享页 (SharedResumePage) [公开]
```

### 2.2 首页 (HomePage)

**路径：** `/`

**功能：** 落地页，展示产品功能，引导用户注册或登录

**结构：**

```
┌─────────────────────────────────────────────────────┐
│ Navbar                                              │
├─────────────────────────────────────────────────────┤
│ Hero Section                                         │
│ ┌───────────────────────┬───────────────────────┐  │
│ │  标题 + 副标题 + 按钮  │   简历预览卡片        │  │
│ └───────────────────────┴───────────────────────┘  │
├─────────────────────────────────────────────────────┤
│ 统计数据栏 (4列)                                    │
│ [5+模板] [100%免费] [1键导出] [AI优化]              │
├─────────────────────────────────────────────────────┤
│ 模板选择区 (5个模板预览)                            │
├─────────────────────────────────────────────────────┤
│ 核心功能 (8个功能卡片网格)                         │
├─────────────────────────────────────────────────────┤
│ 技术栈标签展示                                       │
├─────────────────────────────────────────────────────┤
│ 为什么选择我们 + CTA卡片                            │
├─────────────────────────────────────────────────────┤
│ Footer                                              │
└─────────────────────────────────────────────────────┘
```

**关键元素：**

- **Navbar**：固定顶部，毛玻璃效果
- **Hero 区域**：深色渐变背景 (slate-900 到 blue-950)，左侧文案右侧预览
- **简历预览**：使用 ResumePreview 组件，scale=0.56
- **模板选择**：点击切换模板，实时更新预览
- **功能卡片**：图标 + 标题 + 描述，hover 时边框变蓝色

### 2.3 登录页 (LoginPage)

**路径：** `/login`

**功能：** 用户登录，支持游客登录

**布局：**

```
┌─────────────────────────────────────────────────────┐
│ Navbar (showNav=false)                              │
├─────────────────────────────────────────────────────┤
│ 登录卡片（居中）                                    │
│ ┌─────────────────────────────────────────────┐     │
│ │ Logo + 标题                                  │     │
│ │ ─────────────────────────────────────────── │     │
│ │ 用户名/邮箱 输入框                          │     │
│ │ 密码 输入框                                  │     │
│ │ [登录按钮]                                  │     │
│ │ ─────────────────────────────────────────── │     │
│ │ [游客登录按钮]                              │     │
│ │ ─────────────────────────────────────────── │     │
│ │ 还没有账号？立即注册 →                      │     │
│ └─────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

**样式特点：**

- 深色渐变背景
- 白色登录卡片，圆角 2xl
- 错误提示使用红色边框和背景

### 2.4 简历列表页 (ResumeListPage)

**路径：** `/resumes` (需认证)

**功能：** 显示用户所有简历，支持搜索、筛选、导入

**布局：**

```
┌─────────────────────────────────────────────────────┐
│ Navbar                                              │
├─────────────────────────────────────────────────────┤
│ 页面头部（Logo + 统计卡片）                         │
├─────────────────────────────────────────────────────┤
│ 操作栏                                              │
│ [搜索框] [模板筛选] [排序] [导入PDF] [新建简历]    │
├─────────────────────────────────────────────────────┤
│ 空状态 或 简历网格                                  │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │
│ │    │ │    │ │    │ │ +  │                        │
│ │卡片│ │卡片│ │卡片│ │新建│                        │
│ └────┘ └────┘ └────┘ └────┘                        │
└─────────────────────────────────────────────────────┘
```

**简历卡片设计：**

- 玻璃拟态效果：`bg-white/70 backdrop-blur-sm`
- 悬停时：`hover:bg-white hover:shadow-xl hover:-translate-y-1`
- 顶部模板标签
- 中间简历预览（160px 高度）
- 底部标题和时间
- 悬停时显示操作面板（预览、编辑）

**对话框：**

- **导入对话框**：拖拽上传 PDF，AI 解析
- **预览对话框**：全屏预览，可下载 PDF
- **分享对话框**：生成复制分享链接

### 2.5 简历编辑器页 (EditorPage)

**路径：** `/editor/:id?` (需认证)

**功能：** 编辑简历内容，实时预览，模板切换

**布局：**

```
┌─────────────────────────────────────────────────────┐
│ 顶部工具栏（固定）                                  │
│ [←返回] [Logo] [标题编辑] [模板选择] [自动保存]    │
│                           [示例] [重置] [预览] [保存]│
├─────────────────────────────┬───────────────────────┤
│ 表单编辑区                  │ 预览面板（固定）       │
│ ┌─────────────────────────┐│ ┌───────────────────┐ │
│ │ 模板选择栏              ││ │                   │ │
│ ├─────────────────────────┤│ │   实时预览       │ │
│ │ 个人信息表单项          ││ │   (scale=0.6)     │ │
│ │ 教育经历表单项          ││ │                   │ │
│ │ 工作经历表单项          ││ └───────────────────┘ │
│ │ 项目经验表单项          ││                       │
│ │ 专业技能表单项          ││                       │
│ │ 获奖荣誉表单项          ││                       │
│ │ 语言能力表单项          ││                       │
│ └─────────────────────────┘│                       │
└─────────────────────────────┴───────────────────────┘
```

**特点：**

- 工具栏固定在顶部，透明背景
- 左侧表单区可滚动
- 右侧预览面板固定在视区
- 小屏幕下预览面板可隐藏（通过浮动按钮切换）
- 自动保存：3秒无操作后自动保存
- 标题可直接点击编辑

---

## 三、组件规范

### 3.1 Navbar

**文件：** `src/components/Navbar.tsx`

**属性：**
```typescript
interface NavbarProps {
  showNav?: boolean;  // 是否显示导航（默认 true）
}
```

**样式：**

- 固定顶部：`sticky top-0 z-50`
- 背景：`bg-white/95 backdrop-blur-md`
- 高度：`h-14` (56px)
- 边框：`border-b border-slate-200`

**内容：**

- 左侧：Logo + 产品名 "Kvee"
- 中间：导航链接（首页、我的简历）
- 右侧：用户信息 + 退出按钮 或 登录/注册按钮

### 3.2 ResumePreview

**文件：** `src/components/ResumePreview.tsx`

**功能：** 简历预览组件，根据 themeId 渲染对应模板

**属性：**
```typescript
interface ResumePreviewProps {
  data: ResumeData;      // 简历数据
  themeId: number;       // 模板ID (0-4)
  scale?: number;       // 缩放比例 (默认 1)
}
```

**模板风格：**

| ID | 模板名 | 特点 |
|----|--------|------|
| 0 | 经典商务 | 蓝白色调，顶部标题布局 |
| 1 | 现代简约 | 纯白底色，居中对齐 |
| 2 | 现代渐变 | 紫色渐变头部，卡片布局 |
| 3 | 时间线 | 深色背景，左侧时间线 |
| 4 | 左侧边栏 | 橙色侧边栏布局 |

### 3.3 ResumeForm

**文件：** `src/components/ResumeForm.tsx`

**功能：** 简历编辑表单，支持所有字段的增删改

**属性：**
```typescript
interface ResumeFormProps {
  data: ResumeData;
  setData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
}
```

**字段分组：**

- 个人信息 (PersonalInfo)
- 教育经历 (Education[]) - 可多条
- 工作经历 (WorkExperience[]) - 可多条
- 项目经验 (Project[]) - 可多条
- 专业技能 (Skill[]) - 可多条
- 获奖荣誉 (Award[]) - 可多条
- 语言能力 (Language[]) - 可多条

### 3.4 PDFDownloader

**文件：** `src/components/PDFDownloader.tsx`

**功能：** 生成并下载 PDF 文件

**属性：**
```typescript
interface PDFDownloaderProps {
  resumeData: ResumeData;
  filename: string;
  className?: string;
}
```

**样式：** 与普通按钮一致，使用 `<Button>`

### 3.5 UI 组件库

使用 shadcn/ui 组件，位于 `src/components/ui/`

**常用组件：**

| 组件 | 用途 |
|------|------|
| Button | 按钮，支持多种变体和尺寸 |
| Input | 输入框 |
| Dialog | 对话框 |
| DropdownMenu | 下拉菜单 |
| Select | 选择器 |
| Table | 表格 |
| Card | 卡片容器 |
| Badge | 标签 |
| Avatar | 头像 |
| Dialog | 模态对话框 |

---

## 四、简历模板主题

### 4.1 主题配置

**文件：** `src/styles/resumeThemes.ts`

**导出：**

```typescript
export const themes = [classicTheme, minimalistTheme, gradientTheme, timelineTheme, sidebarTheme];
export const defaultTheme = classicTheme;
```

### 4.2 主题列表

#### 经典商务 (themeId: 0)

**布局：** `classic`

**色彩：**

| 用途 | 色值 |
|------|------|
| header | `#1e293b` |
| headerText | `#ffffff` |
| headerSubtitle | `#93c5fd` |
| text | `#374151` |
| subtitle | `#2563eb` |

**特点：** 蓝白色调，黑色细线分隔，专业商务风格

---

#### 现代简约 (themeId: 1)

**布局：** `minimalist`

**色彩：**

| 用途 | 色值 |
|------|------|
| header | `#ffffff` |
| headerText | `#111827` |
| text | `#374151` |
| subtitle | `#059669` |

**特点：** 纯白底色，黑灰文字，绿色强调，字体较细

---

#### 现代渐变 (themeId: 2)

**布局：** `gradient`

**色彩：**

| 用途 | 色值 |
|------|------|
| header | `linear-gradient(135deg, #3b82f6, #8b5cf6)` |
| headerText | `#ffffff` |
| text | `#374151` |
| subtitle | `#8b5cf6` |

**特点：** 蓝紫渐变头部，白色卡片式布局

---

#### 时间线 (themeId: 3)

**布局：** `timeline`

**色彩：**

| 用途 | 色值 |
|------|------|
| header | `#0f172a` |
| headerText | `#ffffff` |
| text | `#e2e8f0` |
| subtitle | `#38bdf8` |

**特点：** 深色背景，亮蓝色强调，左侧时间线样式

---

#### 左侧边栏 (themeId: 4)

**布局：** `sidebar`

**色彩：**

| 用途 | 色值 |
|------|------|
| header | `#f97316` |
| headerText | `#ffffff` |
| text | `#374151` |
| subtitle | `#ea580c` |

**特点：** 橙色侧边栏，暖色调，适合创意类简历

---

## 五、状态管理

### 5.1 AuthContext

**文件：** `src/contexts/AuthContext.tsx`

**功能：** 用户认证状态管理

**状态：**

```typescript
interface AuthContextType {
  user: User | null;        // 当前用户
  token: string | null;     // JWT Token
  loading: boolean;         // 加载状态
  login: (username: string, password: string) => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => void;
}
```

**存储：** Token 存储在 localStorage

---

## 六、API 客户端

### 6.1 api.ts

**文件：** `src/lib/api.ts`

**功能：** 基于 fetch 的 API 请求封装

**类：** `ApiClient`

**方法：**

```typescript
get<T>(endpoint: string): Promise<T>
post<T>(endpoint: string, body?: unknown): Promise<T>
put<T>(endpoint: string, body?: unknown): Promise<T>
delete<T>(endpoint: string): Promise<T>
```

**特性：**

- 自动添加 Authorization Header
- 自动解析 JSON 响应
- 错误处理

---

## 七、类型定义

### 7.1 简历数据类型

**文件：** `src/types/resume.ts`

```typescript
interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  skills: Skill[];
  awards: Award[];
  languages: Language[];
}
```

**子类型：**

- `PersonalInfo`：姓名、职位、邮箱、电话等
- `Education`：学校、学位、时间等
- `WorkExperience`：公司、职位、成就等
- `Project`：项目名、角色、技术栈等
- `Skill`：分类、技能列表
- `Award`：奖项、颁发机构等
- `Language`：语言、熟练度

---

## 八、样式规范

### 8.1 全局样式

**文件：** `src/App.css`

**引入：** 在 `src/App.tsx` 中引入

### 8.2 Tailwind CSS

项目使用 Tailwind CSS 作为主要样式框架

**常用工具类：**

| 用途 | 类名 |
|------|------|
| flex 容器 | `flex`, `flex-col`, `flex-wrap` |
| grid 容器 | `grid`, `grid-cols-2`, `grid-cols-4` |
| 间距 | `m-4`, `p-4`, `mx-auto`, `mt-4` |
| 文字 | `text-sm`, `font-bold`, `text-center` |
| 颜色 | `text-slate-500`, `bg-blue-600` |
| 圆角 | `rounded-lg`, `rounded-2xl` |
| 阴影 | `shadow-sm`, `shadow-lg` |
| 响应式 | `md:flex`, `lg:grid-cols-2` |

### 8.3 组件样式优先级

1. Tailwind CSS 类名（最高优先级）
2. CSS Modules
3. 全局 CSS

---

## 九、图标使用

### 9.1 图标库

使用 **Lucide React** 图标库

**常用图标：**

| 用途 | 图标名 |
|------|--------|
| 文件 | `FileText` |
| 用户 | `User` |
| 编辑 | `Pencil`, `Edit` |
| 删除 | `Trash2` |
| 保存 | `Save` |
| 预览 | `Eye` |
| 下载 | `Download` |
| 上传 | `Upload` |
| 搜索 | `Search` |
| 菜单 | `Menu`, `MoreHorizontal` |
| 退出 | `LogOut` |
| 加号 | `Plus` |
| 分享 | `Share2` |
| 加载 | `Loader2` |
| 成功 | `Check`, `CheckCircle` |
| 错误 | `X` |
| 首页 | `Home` |
| 模板 | `Palette` |
| AI | `Sparkles`, `Bot` |
| 重置 | `RotateCcw` |

---

## 十、页面跳转逻辑

### 10.1 认证流程

```
未登录用户访问 /resumes -> 重定向到 /login
登录成功后 -> 重定向到 /resumes
```

### 10.2 编辑器流程

```
/resumes -> 点击编辑 -> /editor/:id
/resumes -> 点击新建 -> /editor (无 id，创建新简历)
/editor 创建成功后 -> 更新 URL 为 /editor/:newId
```

### 10.3 分享流程

```
简历列表 -> 点击分享 -> 启用分享获取 token
生成链接：/shared/:token
任何人在浏览器打开即可查看（无需登录）
```