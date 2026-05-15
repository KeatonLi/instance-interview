import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  X,
} from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';
import { themes } from '@/styles/resumeThemes';
import { parseResumeData } from '@/lib/resumeData';
import ResumeForm from '@/components/ResumeForm';
import ResumePreview from '@/components/ResumePreview';
import EditorToolbar from '@/components/EditorToolbar';
import OptimizeDialog from '@/components/OptimizeDialog';

// ─── 预览面板 — 动态缩放 ────────────────────────────────────────

const RESUME_W = 540;
const RESUME_H = 766;

const PreviewPanel: React.FC<{ data: ResumeData; themeId: number }> = ({ data, themeId }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const measure = useCallback(() => {
    if (wrapperRef.current) {
      const w = wrapperRef.current.getBoundingClientRect().width;
      const h = wrapperRef.current.getBoundingClientRect().height;
      if (w > 0 && h > 0) {
        const s = Math.min(w / RESUME_W, h / RESUME_H);
        if (s > 0 && isFinite(s)) setScale(s);
      }
    }
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div ref={wrapperRef} className="flex-1 overflow-auto p-3 flex items-start justify-center bg-[#f1f5f9]">
      <div className="flex-shrink-0" style={{ width: RESUME_W * scale, height: RESUME_H * scale }}>
        <ResumePreview data={data} themeId={themeId} scale={scale} />
      </div>
    </div>
  );
};

// ─── 错误边界 ────────────────────────────────────────────────────

class EditorErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(e: Error) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 mb-2">页面加载出错</h2>
            <p className="text-sm text-slate-500 mb-4">{this.state.error.message}</p>
            <Button onClick={() => { this.setState({ error: null }); window.location.reload(); }} size="sm" className="h-9 text-xs">
              重新加载
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── 编辑器主页面 ────────────────────────────────────────────────

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
    <EditorErrorBoundary>
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-slate-100/50">
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
        onFullOptimize={() => setOptimizeDialogOpen(true)}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-h-0">
        <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
          {/* 编辑面板 */}
          {previewMode !== 'hidden' && (
            <ResizablePanel
              defaultSize={previewMode === 'full' ? 0 : 55}
              minSize={30}
              className="transition-all duration-300"
            >
              <div className="h-full overflow-auto p-3 lg:p-4">
                <div className="max-w-3xl mx-auto">
                  <ResumeForm
                    data={resumeData}
                    setData={handleDataChange}
                  />
                </div>
              </div>
            </ResizablePanel>
          )}

          {/* 可调节分割线 */}
          {previewMode === 'split' && (
            <ResizableHandle withHandle className="w-2 bg-transparent hover:bg-blue-200/40 transition-colors" />
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
                <div className="px-3 py-2 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-medium text-slate-500">预览</span>
                    <span className="text-[10px] text-slate-400">· {themes[themeId]?.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewMode('hidden')}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <PreviewPanel data={resumeData} themeId={themeId} />
              </div>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>

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
    </EditorErrorBoundary>
  );
};

export default EditorPage;
