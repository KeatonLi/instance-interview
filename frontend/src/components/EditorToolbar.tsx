import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Pencil } from 'lucide-react';
import { themes } from '@/styles/resumeThemes';

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
  onBack
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* 左侧 - 返回和标题 */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 px-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>

            <div className="h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                  className="h-7 w-48 text-sm font-semibold bg-slate-100 border border-blue-300 rounded px-2 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <button
                  onClick={() => { setTitleInput(title); setIsEditingTitle(true); }}
                  className="flex items-center gap-1.5 h-8 px-2 -mx-2 rounded hover:bg-slate-100 transition-colors group"
                >
                  <span className="text-sm font-semibold text-slate-800">{title}</span>
                  <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
          </div>

          {/* 中间 - 状态 */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeSelector themeId={themeId} onChange={onThemeChange} />
            <AutoSaveIndicator saving={saving} lastSaved={lastSaved} error={saveError} />

            {hasChanges && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[10px] font-medium text-amber-700">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                未保存
              </div>
            )}
          </div>

          {/* 右侧 - 操作按钮 */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="h-8 px-4 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              保存
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}