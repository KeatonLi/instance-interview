import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Pencil, Sparkles, Maximize2, Minimize2, PanelRight } from 'lucide-react';
import { themes } from '@/styles/resumeThemes';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EditorToolbarProps {
  title: string;
  themeId: number;
  saving: boolean;
  hasChanges: boolean;
  lastSaved: Date | null;
  saveError: string;
  onTitleChange: (title: string) => void;
  onThemeChange: (id: number) => void;
  onSave: () => void;
  onBack: () => void;
  onFullOptimize?: () => void;
  onOptimizeContent?: (content: string, type: string) => void;
  previewMode?: 'split' | 'full' | 'hidden';
  onPreviewModeChange?: (mode: 'split' | 'full' | 'hidden') => void;
}

// 模板选择器
const ThemeSelector: React.FC<{
  themeId: number;
  onChange: (id: number) => void;
}> = ({ themeId, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="h-8 px-3 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      >
        <div
          className="w-3 h-3 rounded-sm mr-2"
          style={{
            background: themes[themeId]?.colors.header ||
              (themeId === 0 ? '#1e293b' : themeId === 1 ? '#ffffff' : themeId === 2 ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#0f172a')
          }}
        />
        {themes[themeId]?.name || '默认模板'}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl border border-slate-200 shadow-xl shadow-black/10 p-2 min-w-[200px]">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider px-2 py-1.5">
              选择模板
            </div>
            <div className="space-y-0.5">
              {themes.map((theme, index) => (
                <button
                  key={index}
                  onClick={() => { onChange(index); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-xs transition-all ${
                    themeId === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded"
                    style={{
                      background: theme.colors.header,
                      border: theme.colors.border === '#e5e7eb' ? '1px solid #e5e7eb' : 'none'
                    }}
                  />
                  <span className="font-medium">{theme.name}</span>
                  {themeId === index && <Check size={12} className="ml-auto text-blue-500" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// 自动保存指示器
const AutoSaveIndicator: React.FC<{ saving: boolean; lastSaved: Date | null; error?: string }> = ({
  saving,
  lastSaved,
  error
}) => {
  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-red-500 text-xs">
        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        <span>保存失败</span>
      </div>
    );
  }

  if (saving) {
    return (
      <div className="flex items-center gap-1.5 text-amber-500 text-xs">
        <Loader2 size={12} className="animate-spin" />
        <span>保存中...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 text-xs">
        <Check size={12} />
        <span>已保存 {lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    );
  }

  return null;
};

export default function EditorToolbar({
  title,
  themeId,
  saving,
  hasChanges,
  lastSaved,
  saveError,
  onTitleChange,
  onThemeChange,
  onSave,
  onBack,
  onFullOptimize,
  previewMode,
  onPreviewModeChange,
}: EditorToolbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(title);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onTitleChange(titleInput.trim());
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setTitleInput(title);
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200/60">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* 左侧 - 返回和标题 */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>

            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="h-7 w-44 text-sm font-semibold bg-slate-100 border border-blue-300 rounded px-2 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            ) : (
              <button
                onClick={() => { setTitleInput(title); setIsEditingTitle(true); }}
                className="flex items-center gap-1 h-7 px-2 rounded hover:bg-slate-100 transition-colors group"
              >
                <span className="text-sm font-semibold text-slate-700">{title}</span>
                <Pencil className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </button>
            )}

            <ThemeSelector themeId={themeId} onChange={onThemeChange} />
            <AutoSaveIndicator saving={saving} lastSaved={lastSaved} error={saveError} />
            {hasChanges && (
              <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                未保存
              </span>
            )}
          </div>

          {/* 右侧 - 操作按钮 */}
          <div className="flex items-center gap-1.5">
            {/* AI 一键优化 */}
            {onFullOptimize && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={onFullOptimize}
                    className="h-7 px-3 text-[11px] font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI 一键优化
                  </Button>
                </TooltipTrigger>
                <TooltipContent>AI 智能优化整份简历的所有条目的措辞和关键词</TooltipContent>
              </Tooltip>
            )}

            {/* 预览模式 */}
            {onPreviewModeChange && previewMode !== undefined && (
              <div className="flex items-center bg-slate-100 rounded-md p-0.5 ml-1">
                {([
                  { mode: 'split' as const, icon: PanelRight, label: '分屏' },
                  { mode: 'full' as const, icon: Maximize2, label: '全屏预览' },
                  { mode: 'hidden' as const, icon: Minimize2, label: '隐藏预览' },
                ]).map(({ mode, icon: Icon, label }) => (
                  <Tooltip key={mode}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={previewMode === mode ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onPreviewModeChange(mode)}
                        className={`h-6 px-2 text-[10px] ${previewMode === mode ? 'bg-white shadow-sm text-slate-700 hover:bg-white' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {mode === 'split' ? label : ''}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}

            {/* 保存 */}
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="h-7 px-3 text-[11px] font-medium bg-slate-800 hover:bg-slate-700"
            >
              {saving ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Check className="w-3 h-3 mr-1" />
              )}
              保存
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}