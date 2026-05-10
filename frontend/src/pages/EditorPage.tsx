import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi } from '@/lib/resumes';
import { Button } from '@/components/ui/button';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import {
  Eye,
  FileText,
  Loader2,
  PanelRight,
  RotateCcw,
  Sparkles,
  X,
  BookOpen,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';
import { themes } from '@/styles/resumeThemes';
import { sampleResumeData } from '@/lib/sampleResumeData';
import { parseResumeData, sanitizeResumeFilename } from '@/lib/resumeData';
import ResumeForm from '@/components/ResumeForm';
import ResumePreview from '@/components/ResumePreview';
import PDFDownloader from '@/components/PDFDownloader';
import EditorToolbar from '@/components/EditorToolbar';
import OptimizeDialog from '@/components/OptimizeDialog';

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumeTitle, setResumeTitle] = useState('我的简历');
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [themeId, setThemeId] = useState(0);
  const [previewMode, setPreviewMode] = useState<'split' | 'full' | 'hidden'>('split');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState('');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 优化对话框状态
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);

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

  const handleTitleChange = useCallback((title: string) => {
    setResumeTitle(title);
    setHasChanges(true);
    if (id && title) {
      resumeApi.updateResume(parseInt(id), { title }).then(() => {
        setLastSaved(new Date());
      }).catch(console.error);
    }
  }, [id]);

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

  // 优化单条内容
  const handleOptimizeContent = async (content: string, type: string) => {
    const res = await resumeApi.optimizeContent(content, type);
    if (res.code === 0) {
      return res.data;
    }
    throw new Error('优化失败，请稍后重试');
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
      {/* 顶部工具栏 */}
      <EditorToolbar
        title={resumeTitle}
        themeId={themeId}
        saving={saving}
        hasChanges={hasChanges}
        lastSaved={lastSaved}
        saveError={saveError}
        onTitleChange={handleTitleChange}
        onThemeChange={handleThemeChange}
        onSave={handleSave}
        onBack={() => navigate('/resumes')}
      />

      {/* 工具栏 - AI 优化按钮 */}
      <div className="sticky top-14 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-[1800px] mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 模板选择快捷栏 */}
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-slate-500">模板：</span>
                <div className="flex items-center gap-1.5">
                  {themes.map((theme, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleThemeChange(index)}
                          className={`w-6 h-6 rounded border-2 transition-all ${
                            themeId === index ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105'
                          }`}
                          style={{
                            background: theme.colors.header,
                            border: theme.colors.border === '#e5e7eb' ? '1px solid #e5e7eb' : 'none'
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>{theme.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="h-4 w-px bg-slate-200" />

              {/* 简历统计 */}
              <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
                {resumeData.workExperience.length > 0 && (
                  <span>{resumeData.workExperience.length} 条工作经历</span>
                )}
                {resumeData.projects.length > 0 && (
                  <span>{resumeData.projects.length} 个项目</span>
                )}
                {resumeData.education.length > 0 && (
                  <span>{resumeData.education.length} 条教育经历</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 示例数据 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadSampleData}
                    className="h-8 px-3 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    示例
                  </Button>
                </TooltipTrigger>
                <TooltipContent>加载示例数据</TooltipContent>
              </Tooltip>

              {/* 重置 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetData}
                    className="h-8 px-3 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    重置
                  </Button>
                </TooltipTrigger>
                <TooltipContent>清空所有内容</TooltipContent>
              </Tooltip>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              {/* 预览模式切换 */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === 'split' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('split')}
                      className={`h-7 px-2.5 text-xs ${previewMode === 'split' ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <PanelRight className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>分屏显示</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === 'full' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('full')}
                      className={`h-7 px-2.5 text-xs ${previewMode === 'full' ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>全屏预览</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === 'hidden' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('hidden')}
                      className={`h-7 px-2.5 text-xs ${previewMode === 'hidden' ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>隐藏预览</TooltipContent>
                </Tooltip>
              </div>

              {/* PDF 下载 */}
              <PDFDownloader
                resumeId={id ? parseInt(id) : undefined}
                filename={sanitizeResumeFilename(resumeTitle || resumeData.personalInfo.name || 'resume')}
                className="h-8 px-3 text-xs border-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 - 可调节分屏布局 */}
      <main className="pt-24 min-h-screen">
        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-8rem)]">
          {/* 编辑面板 */}
          {previewMode !== 'hidden' && (
            <ResizablePanel
              defaultSize={previewMode === 'full' ? 0 : 60}
              minSize={30}
              className="transition-all duration-300"
            >
              <div className="h-full overflow-auto p-4 lg:p-6">
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-4 lg:p-6">
                    <div className="max-w-3xl mx-auto">
                      <ResumeForm
                        data={resumeData}
                        setData={handleDataChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          )}

          {/* 可调节分割线 */}
          {previewMode === 'split' && (
            <ResizableHandle withHandle className="w-2 bg-transparent hover:bg-blue-500/20 transition-colors" />
          )}

          {/* 预览面板 */}
          {previewMode !== 'hidden' && (
            <ResizablePanel
              defaultSize={previewMode === 'full' ? 100 : 40}
              minSize={20}
              className="transition-all duration-300"
            >
              <div className="h-full bg-slate-50/50 border-l border-slate-200/80 flex flex-col">
                {/* 预览头部 */}
                <div className="px-4 py-3 bg-white border-b border-slate-200/80 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-slate-700">实时预览</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {themes[themeId]?.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewMode('hidden')}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* 预览内容 */}
                <div className="flex-1 overflow-auto p-4 bg-[#f1f5f9]">
                  <div className="flex justify-center items-start min-h-full">
                    <div className="shadow-2xl shadow-black/10 rounded-lg overflow-hidden transform origin-top scale-[0.55] md:scale-[0.65] lg:scale-[0.75]">
                      <ResumePreview data={resumeData} themeId={themeId} />
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </main>

      {/* 浮动预览切换按钮 */}
      {previewMode === 'hidden' && (
        <Button
          variant="default"
          size="sm"
          onClick={() => setPreviewMode('split')}
          className="fixed bottom-6 right-6 h-10 px-4 shadow-lg shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-medium z-40"
        >
          <Eye className="w-4 h-4 mr-2" />
          显示预览
        </Button>
      )}

      {/* 单条优化对话框 */}
      <OptimizeDialog
        open={optimizeDialogOpen}
        onOpenChange={setOptimizeDialogOpen}
        resumeData={resumeData}
        onApply={(newData) => {
          safeSetResumeData(newData);
          setHasChanges(true);
        }}
        onOptimize={handleOptimizeContent}
      />
    </div>
  );
};

export default EditorPage;
