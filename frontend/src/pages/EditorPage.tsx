import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi } from '@/lib/resumes';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Check,
  Eye,
  FileText,
  Loader2,
  PanelLeft,
  PanelRight,
  Pencil,
  RotateCcw,
  Save,
  Sparkles,
  X,
} from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';
import { themes } from '@/styles/resumeThemes';
import { sampleResumeData } from '@/lib/sampleResumeData';
import { parseResumeData, sanitizeResumeFilename } from '@/lib/resumeData';
import ResumeForm from '@/components/ResumeForm';
import ResumePreview from '@/components/ResumePreview';
import PDFDownloader from '@/components/PDFDownloader';

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

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumeTitle, setResumeTitle] = useState('我的简历');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [themeId, setThemeId] = useState(0);
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState('');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const safeSetResumeData = useCallback((data: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    setResumeData(prev => {
      const next = typeof data === 'function' ? (data as (prev: ResumeData) => ResumeData)(prev) : data;
      return {
        ...next,
        workExperience: next.workExperience || [],
        projects: next.projects || [],
        education: next.education || [],
        skills: next.skills || [],
        awards: next.awards || [],
        languages: next.languages || [],
        personalInfo: next.personalInfo || defaultResumeData.personalInfo,
      };
    });
  }, []);

  useEffect(() => {
    if (id) {
      loadResume(parseInt(id));
    } else {
      setLoading(false);
    }
  }, [id]);

  // 自动保存
  useEffect(() => {
    if (hasChanges && id) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasChanges, resumeData, resumeTitle, themeId]);

  const loadResume = async (resumeId: number) => {
    setLoading(true);
    try {
      const res = await resumeApi.getResume(resumeId);
      const resume = res.data;
      setResumeTitle(resume.title || '我的简历');
      setThemeId(resume.theme_id || 0);
      safeSetResumeData(parseResumeData(resume));
      setLastSaved(new Date(resume.updated_at || resume.created_at));
      setSaveError('');
    } catch (error) {
      console.error('Failed to load resume:', error);
      setSaveError('简历加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSaveError('');
    try {
      if (id) {
        await resumeApi.updateResume(parseInt(id), {
          title: resumeTitle,
          theme_id: themeId,
          resume_data: resumeData,
        });
      } else {
        const res = await resumeApi.createResume({
          title: resumeTitle || resumeData.personalInfo.name || '我的简历',
          user_id: user.id,
          theme_id: themeId,
          resume_data: resumeData,
        });
        navigate(`/editor/${res.data.id}`, { replace: true });
      }
      setHasChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save resume:', error);
      setSaveError('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (!user || !id) return;

    try {
      await resumeApi.updateResume(parseInt(id), {
        title: resumeTitle,
        theme_id: themeId,
        resume_data: resumeData,
      });
      setHasChanges(false);
      setLastSaved(new Date());
      setSaveError('');
    } catch (error) {
      console.error('Auto save failed:', error);
      setSaveError('自动保存失败');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeTitle(e.target.value);
    setHasChanges(true);
  };

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    if (id && resumeTitle) {
      try {
        await resumeApi.updateResume(parseInt(id), { title: resumeTitle });
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to update title:', error);
      }
    }
  };

  const handleDataChange = useCallback((newData: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    safeSetResumeData(newData);
    setHasChanges(true);
  }, [safeSetResumeData]);

  const handleThemeChange = useCallback(async (newThemeId: number) => {
    setThemeId(newThemeId);
    setHasChanges(true);
    if (id) {
      try {
        await resumeApi.updateResume(parseInt(id), { theme_id: newThemeId });
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    }
  }, [id]);

  const loadSampleData = () => {
    safeSetResumeData(sampleResumeData);
    setHasChanges(true);
  };

  const resetData = () => {
    if (confirm('确定要清空所有内容吗？此操作不可撤销。')) {
      safeSetResumeData(defaultResumeData);
      setHasChanges(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            加载中...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/50">
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* 左侧 - 返回和标题 */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/resumes')}
                className="h-8 px-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <PanelLeft className="w-4 h-4" />
              </Button>

              <div className="h-5 w-px bg-slate-200" />

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                  <FileText className="w-4 h-4 text-white" />
                </div>

                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={resumeTitle}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                    autoFocus
                    className="h-7 w-48 text-sm font-semibold bg-slate-100 border border-blue-300 rounded px-2 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                ) : (
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="flex items-center gap-1.5 h-8 px-2 -mx-2 rounded hover:bg-slate-100 transition-colors group"
                  >
                    <span className="text-sm font-semibold text-slate-800">{resumeTitle}</span>
                    <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>

            {/* 中间 - 状态 */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeSelector themeId={themeId} onChange={handleThemeChange} />
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
                variant="ghost"
                size="sm"
                onClick={loadSampleData}
                className="h-8 px-3 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                示例
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetData}
                className="h-8 px-3 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                重置
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreviewPanel(!showPreviewPanel)}
                className="h-8 px-3 text-xs border-slate-300 text-slate-600 hover:bg-slate-100 xl:hidden"
              >
                {showPreviewPanel ? <PanelRight className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </Button>

              <PDFDownloader
                resumeData={resumeData}
                filename={sanitizeResumeFilename(resumeTitle || resumeData.personalInfo.name || 'resume')}
                className="h-8 px-3 text-xs border-slate-300"
              />

              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="h-8 px-4 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                )}
                保存
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="pt-14 min-h-screen">
        <div className="max-w-[1600px] mx-auto flex">
          {/* 编辑区域 */}
          <div className={`flex-1 min-w-0 transition-all duration-300 ${showPreviewPanel ? 'xl:w-[calc(100%-440px)]' : 'w-full'}`}>
            <div className="p-4 lg:p-6">
              {/* 简历表单卡片 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {/* 模板快捷选择栏 */}
                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-slate-700">选择模板风格</span>
                    <div className="h-3 w-px bg-slate-200 mx-1" />
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-1">
                      {themes.map((theme, index) => (
                        <button
                          key={index}
                          onClick={() => handleThemeChange(index)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            themeId === index
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                          }`}
                        >
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{
                              background: theme.colors.header,
                              border: theme.layout === 'minimalist' ? '1px solid #e5e7eb' : 'none'
                            }}
                          />
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 表单内容 */}
                <div className="p-4 lg:p-6">
                  <div className="max-w-3xl mx-auto">
                    <ResumeForm data={resumeData} setData={handleDataChange} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 预览面板 */}
          {showPreviewPanel && (
            <div className="hidden xl:block w-[420px] flex-shrink-0 border-l border-slate-200/80 bg-slate-50/50 sticky top-14 h-[calc(100vh-3.5rem)] overflow-hidden">
              <div className="h-full flex flex-col">
                {/* 预览头部 */}
                <div className="px-4 py-3 bg-white border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-slate-700">实时预览</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreviewPanel(false)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* 预览内容 */}
                <div className="flex-1 overflow-auto p-4 bg-[#f1f5f9]">
                  <div className="flex justify-center">
                    <div className="shadow-2xl shadow-black/10 rounded-lg overflow-hidden transform scale-[0.6] origin-top-left w-[167%] h-[167%]">
                      <ResumePreview data={resumeData} themeId={themeId} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 浮动预览切换按钮 */}
      {!showPreviewPanel && (
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowPreviewPanel(true)}
          className="fixed bottom-6 right-6 h-10 px-4 shadow-lg shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-medium z-40"
        >
          <Eye className="w-4 h-4 mr-2" />
          显示预览
        </Button>
      )}
    </div>
  );
};

export default EditorPage;
