# AI 简历优化菜单

## 一、菜单位置

简历编辑器页面内，在工作经历和项目经验的每个条目卡片上显示「AI优化」按钮。

## 二、功能入口

```
简历编辑器 → 编辑区块 → 条目卡片 → [AI优化] 按钮
```

## 三、优化按钮样式

在条目卡片的操作区域添加：

```jsx
<Button size="sm" variant="ghost" className="text-blue-600">
  <Sparkles className="w-4 h-4 mr-1" />
  AI 优化
</Button>
```

## 四、点击后行为

1. 弹出「AI 简历优化」对话框
2. 显示该条目的当前内容
3. 用户选择优化类型
4. 点击「优化」按钮调用后端 API
5. 显示优化结果
6. 用户确认后更新内容

## 五、对话框交互

### 状态

1. **idle** - 显示原文，等待选择优化类型
2. **loading** - 调用 AI，显示加载中
3. **success** - 显示优化结果
4. **error** - 显示错误信息

### 优化类型选项

| 选项 | 说明 |
|------|------|
| 措辞优化 | 使描述更专业、简洁 |
| 关键词增强 | 增强 ATS 关键词 |
| 成就量化 | 量化工作成果 |
| 全部 | 综合优化 |

## 六、组件结构

```tsx
// components/OptimizeDialog.tsx
interface OptimizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalContent: string;
  onApply: (optimized: string) => void;
}

// 使用
<OptimizeDialog
  open={optimizeDialogOpen}
  onOpenChange={setOptimizeDialogOpen}
  originalContent={selectedContent}
  onApply={(optimized) => handleApplyOptimized(optimized)}
/>
```

## 七、样式要求

- 使用蓝色主色调 (`text-blue-600`)
- Sparkles 图标表示 AI
- 加载时显示 spinner
- 优化结果区域可滚动