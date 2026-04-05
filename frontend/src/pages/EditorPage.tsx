import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi } from '@/lib/resumes';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Sparkles,
  Eye,
  Edit,
  RotateCcw,
  Save,
  Loader2,
  ArrowLeft,
  Pencil,
  Check,
  Palette,
  PanelLeft,
  PanelRight,
  AlertCircle,
  LayoutTemplate
} from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';
import { themes } from '@/styles/resumeThemes';
import { sampleResumeData } from '@/lib/sampleResumeData';
import { parseResumeData, sanitizeResumeFilename } from '@/lib/resumeData';
import ResumeForm from '@/components/ResumeForm';
import ResumePreview from '@/components/ResumePreview';
import PDFDownloader from '@/components/PDFDownloader';

// 自动保存提示
const AutoSaveIndicator: React.FC<{ saving: boolean; lastSaved: Date | null }> = ({
  saving,
  lastSaved
}) => {
  if (saving) {
    return (
      <div className="flex items-center gap-2 text-blue-600 text-sm">
        <Loader2 size={14} className="animate-spin" />
        <span>保存中...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <Check size={14} />
        <span>已保存 {lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    );
  }

  return null;
};

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumeTitle, setResumeTitle] = useState('我的简历');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [themeId, setThemeId] = useState(0);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState('');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 确保数据有效的包装函数
  const safeSetResumeData = (data: ResumeData | ((prev: ResumeData) => ResumeData)) => {
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
  };

  useEffect(() => {
    if (id) {
      loadResume(parseInt(id));
    }
  }, [id]);

  // 自动保存功能
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
      setSaveError('简历加载失败，请稍后重试。');
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
      setSaveError(error instanceof Error ? error.message : '保存失败，请稍后重试。');
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
      setSaveError('自动保存失败，请检查网络后手动保存。');
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
        await resumeApi.updateResume(parseInt(id), {
          title: resumeTitle,
        });
        setLastSaved(new Date());
        setSaveError('');
      } catch (error) {
        console.error('Failed to update title:', error);
        setSaveError('标题更新失败，请稍后重试。');
      }
    }
  };

  const handleDataChange = useCallback((newData: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    safeSetResumeData(newData);
    setHasChanges(true);
  }, []);

  const handleThemeChange = useCallback(async (newThemeId: number) => {
    setThemeId(newThemeId);
    setHasChanges(true);
    if (id) {
      try {
        await resumeApi.updateResume(parseInt(id), {
          theme_id: newThemeId,
        });
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-slate-500 text-sm">加载简历中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/20 via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/resumes')}
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <div className="h-6 w-px bg-blue-200" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-blue-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                {isEditingTitle ? (
                  <Input
                    value={resumeTitle}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                    autoFocus
                    className="h-8 w-48 border-blue-200 focus:border-blue-400"
                  />
                ) : (
                  <div
                    className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 rounded-lg px-2 py-1 transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <h1 className="text-xl font-bold text-slate-800">{resumeTitle}</h1>
                    <Pencil className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <AutoSaveIndicator saving={saving} lastSaved={lastSaved} />

              <div className="h-6 w-px bg-blue-200 hidden sm:block" />

              <Button
                variant="ghost"
                size="sm"
                onClick={loadSampleData}
                className="hidden md:flex text-slate-600 hover:text-blue-600 hover:bg-blue-50"
              >
                <Sparkles size={14} className="mr-2" />
                示例
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetData}
                className="hidden md:flex text-slate-600 hover:text-red-600 hover:bg-red-50"
              >
                <RotateCcw size={14} className="mr-2" />
                重置
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 shadow-blue-sm"
              >
                {saving ? (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                ) : (
                  <Save size={14} className="mr-2" />
                )}
                保存
              </Button>

              <div className="h-6 w-px bg-blue-200 hidden lg:block" />

              {/* 预览切换按钮 - 仅在小屏幕显示 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="lg:hidden border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                {isPreviewMode ? (
                  <>
                    <Edit size={14} className="mr-2" />
                    编辑
                  </>
                ) : (
                  <>
                    <Eye size={14} className="mr-2" />
                    预览
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <section className="mb-6 rounded-3xl border border-blue-100 bg-white/85 backdrop-blur-sm shadow-sm p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                  <LayoutTemplate className="w-3.5 h-3.5 mr-1.5" />
                  当前模板：{themes[themeId]?.name || '默认模板'}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                  hasChanges
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {hasChanges ? '有未保存更改' : '内容已同步'}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                左侧专注编辑内容，右侧保持最终排版预览。切换模板和导出都在当前页面直接完成。
              </p>
              {saveError && (
                <div className="inline-flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 xl:min-w-[320px]">
              <Button
                variant="outline"
                onClick={loadSampleData}
                className="border-blue-200 hover:bg-blue-50"
              >
                <Sparkles size={16} className="mr-2 text-blue-500" />
                加载示例
              </Button>
              <PDFDownloader
                resumeData={resumeData}
                filename={sanitizeResumeFilename(resumeTitle || resumeData.personalInfo.name || 'resume')}
              />
            </div>
          </div>
        </section>

        {isPreviewMode ? (
          // 移动端预览模式
          <div className="flex flex-col items-center space-y-6 animate-fade-in">
            {/* 模板切换 */}
            <div className="w-full overflow-x-auto rounded-2xl border border-blue-100 bg-white p-2 shadow-sm">
              <div className="flex gap-2 min-w-max">
              {themes.map((theme, index) => (
                <button
                  key={index}
                  onClick={() => handleThemeChange(index)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    themeId === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
              </div>
            </div>
            <div className="w-full max-w-md">
              <PDFDownloader
                resumeData={resumeData}
                filename={sanitizeResumeFilename(resumeTitle || resumeData.personalInfo.name || 'resume')}
              />
            </div>
            <div className="w-full flex justify-center">
              <ResumePreview data={resumeData} themeId={themeId} />
            </div>
          </div>
        ) : (
          // 编辑模式
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] gap-6 items-start">
            {/* 编辑区域 */}
            <div className={`order-2 xl:order-1 ${showPreviewPanel ? 'xl:block' : 'xl:col-span-2'}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
                <div className="px-6 pt-5">
                  <div className="flex items-center gap-2 overflow-x-auto pb-3">
                    {themes.map((theme, index) => (
                      <button
                        key={index}
                        onClick={() => handleThemeChange(index)}
                        className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                          themeId === index
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600'
                        }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 px-6 py-4 border-b border-blue-100">
                  <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Edit size={18} className="text-blue-500" />
                    编辑简历
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">填写以下信息，右侧将实时预览</p>
                </div>
                <div className="p-6">
                  <ResumeForm data={resumeData} setData={handleDataChange} />
                </div>
              </div>
            </div>

            {/* 预览区域 - 大屏幕显示 */}
            <div className={`order-1 xl:order-2 xl:sticky xl:top-20 xl:h-fit space-y-4 hidden xl:block ${!showPreviewPanel && 'xl:hidden'}`}>
              <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-sm rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <Eye size={18} className="text-blue-500" />
                        实时预览
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">最终导出效果</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPreviewPanel(!showPreviewPanel)}
                        className="text-slate-400 hover:text-slate-600"
                        title={showPreviewPanel ? "隐藏预览" : "显示预览"}
                      >
                        {showPreviewPanel ? <PanelRight size={18} /> : <PanelLeft size={18} />}
                      </Button>
                      <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowThemePicker(!showThemePicker)}
                        className="flex items-center gap-1 border-blue-200 hover:bg-blue-50"
                      >
                        <Palette size={14} />
                        模板
                      </Button>
                        <PDFDownloader
                          resumeData={resumeData}
                          filename={sanitizeResumeFilename(resumeTitle || resumeData.personalInfo.name || 'resume')}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {/* 模板选择器 */}
                {showThemePicker && (
                  <CardContent className="pt-0">
                    <div className="flex gap-2 p-2 bg-slate-50 rounded-lg">
                      {themes.map((theme, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setThemeId(index);
                            setShowThemePicker(false);
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            themeId === index
                              ? 'bg-white shadow-sm ring-2 ring-blue-500 text-blue-600'
                              : 'bg-white/50 hover:bg-white text-slate-600'
                          }`}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
              <div className="transform transition-all duration-300 rounded-2xl border border-blue-100 bg-white/60 backdrop-blur-sm p-3">
                <ResumePreview data={resumeData} themeId={themeId} />
              </div>
            </div>

            {/* 当预览面板隐藏时的浮动按钮 */}
            {showPreviewPanel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreviewPanel(false)}
                className="fixed bottom-6 right-6 shadow-lg border-blue-200 bg-white/90 backdrop-blur-sm hidden xl:flex"
              >
                <PanelRight size={16} className="mr-2" />
                隐藏预览
              </Button>
            )}

            {!showPreviewPanel && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowPreviewPanel(true)}
                className="fixed bottom-6 right-6 shadow-lg shadow-blue-500/30 bg-blue-600 hidden xl:flex"
              >
                <PanelLeft size={16} className="mr-2" />
                显示预览
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default EditorPage;
