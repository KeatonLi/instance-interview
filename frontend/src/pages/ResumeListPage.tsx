import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi } from '@/lib/resumes';
import type { Resume } from '@/lib/resumes';
import type { ResumeData } from '@/types/resume';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Copy,
  Edit,
  Eye,
  FileText,
  FileUp,
  Layers3,
  Loader2,
  MoreHorizontal,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import ResumePreview from '@/components/ResumePreview';
import PDFDownloader from '@/components/PDFDownloader';
import { parseResumeData, sanitizeResumeFilename } from '@/lib/resumeData';
import { themes } from '@/styles/resumeThemes';

// 简历卡片 - 简历本身即是卡片
const ResumeCard: React.FC<{
  resume: Resume;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}> = ({ resume, onPreview, onEdit, onDelete, onDuplicate }) => {
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const res = await resumeApi.getResume(resume.id);
        setPreviewData(parseResumeData(res.data));
      } catch (error) {
        console.error('Failed to load preview:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPreview();
  }, [resume.id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const theme = themes[resume.theme_id] || themes[0];

  return (
    <div className="group relative">
      {/* 简历本身即是卡片 - 没有额外边框 */}
      <div
        ref={cardRef}
        className="relative bg-white cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-black/15 hover:-translate-y-1 overflow-hidden rounded"
        onClick={onPreview}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-slate-300" size={24} />
          </div>
        ) : previewData ? (
          <>
            <div
              className="w-full overflow-hidden"
              style={{ height: '280px' }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <ResumePreview data={previewData} themeId={resume.theme_id} scale={0.32} />
              </div>
            </div>

            {/* 悬停时显示的遮罩和操作 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-center gap-2 bg-gradient-to-t from-black/30 to-transparent">
                <button
                  onClick={(e) => { e.stopPropagation(); onPreview(); }}
                  className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-medium text-slate-700 shadow-lg hover:bg-white transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> 预览
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-medium text-slate-700 shadow-lg hover:bg-white transition-colors flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" /> 编辑
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col items-center justify-center bg-slate-100 text-slate-400" style={{ height: '280px' }}>
            <FileText className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs">加载失败</span>
          </div>
        )}

        {/* 左下角模板标签 */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[10px] font-medium text-slate-600 shadow-sm">
            {theme.name}
          </span>
        </div>
      </div>

      {/* 简历信息 - 卡片底部 */}
      <div className="pt-2.5 pb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
              {resume.title}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(resume.updated_at || resume.created_at)}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex-shrink-0 -mr-1">
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={onPreview}>
                <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                预览
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-3.5 h-3.5 mr-2 text-slate-500" />
                编辑
              </DropdownMenuItem>
              {onDuplicate && (
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  复制
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center gap-1 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="h-7 px-2 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex-1"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            预览
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="h-7 px-2 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex-1"
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            编辑
          </Button>
          <PDFDownloader
            filename={sanitizeResumeFilename(resume.title)}
            loadResumeData={async () => {
              const res = await resumeApi.getResume(resume.id);
              return parseResumeData(res.data);
            }}
            className="h-7 px-2 text-xs flex-1"
          />
        </div>
      </div>
    </div>
  );
};

// 导入对话框
const ImportResumeDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: () => void;
}> = ({ open, onOpenChange, onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('请上传 PDF 格式的简历文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB');
      return;
    }
    setUploading(true);
    try {
      const result = await resumeApi.importResume(file);
      if (result.code === 0 && result.data?.resume?.id) {
        onImport();
        onOpenChange(false);
        navigate(`/editor/${result.data.resume.id}`);
      } else {
        setError(result.message || '导入失败');
      }
    } catch (err) {
      console.error('Failed to import resume:', err);
      setError(err instanceof Error ? err.message : '导入失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="block">导入简历</span>
              <span className="text-xs font-normal text-slate-500">从 PDF 自动解析</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const files = e.dataTransfer.files;
            if (files.length > 0) handleFileUpload(files[0]);
          }}
          className={`
            mt-4 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
            ${uploading ? 'cursor-not-allowed opacity-60' : ''}
            ${isDragging
              ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10'
              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <div>
                <p className="text-sm font-medium text-slate-700">正在解析简历...</p>
                <p className="text-xs text-slate-400 mt-1">AI 正在提取信息</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center border border-blue-100">
                <FileUp className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">点击或拖拽上传 PDF</p>
                <p className="text-xs text-slate-400">支持自动解析个人信息、工作经历、项目经验</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// 大预览对话框
const PreviewDialog: React.FC<{
  resume: Resume | null;
  previewData: ResumeData | null;
  loading: boolean;
  onClose: () => void;
}> = ({ resume, previewData, loading, onClose }) => {
  if (!resume) return null;

  return (
    <Dialog open={!!resume} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full max-h-[92vh] overflow-hidden p-0 bg-slate-100">
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-800">{resume.title}</DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {themes[resume.theme_id]?.name || '默认模板'} · 预览最终效果
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {previewData && (
                <PDFDownloader
                  resumeData={previewData}
                  filename={sanitizeResumeFilename(resume.title)}
                />
              )}
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-8">
                关闭
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(92vh-80px)] bg-gradient-to-b from-slate-100 to-slate-200">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm text-slate-500">加载中...</p>
              </div>
            </div>
          ) : previewData ? (
            <div className="flex justify-center">
              <div className="shadow-2xl shadow-black/10 rounded-lg overflow-hidden">
                <ResumePreview data={previewData} themeId={resume.theme_id} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              加载失败
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function ResumeListPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setDeleting] = useState<number | null>(null);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const res = await resumeApi.getResumes();
      setResumes(res.data.list || []);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async () => {
    if (!user) return;
    try {
      const res = await resumeApi.createResume({
        title: '我的新简历',
        user_id: user.id,
      });
      navigate(`/editor/${res.data.id}`);
    } catch (error) {
      console.error('Failed to create resume:', error);
    }
  };

  const handleDeleteResume = async (id: number) => {
    if (!confirm('确定要删除这份简历吗？此操作不可恢复。')) return;
    setDeleting(id);
    try {
      await resumeApi.deleteResume(id);
      setResumes((current) => current.filter((resume) => resume.id !== id));
    } catch (error) {
      console.error('Failed to delete resume:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleDuplicateResume = async (resume: Resume) => {
    if (!user) return;
    try {
      const res = await resumeApi.getResume(resume.id);
      const data = parseResumeData(res.data);
      const newResume = await resumeApi.createResume({
        title: `${resume.title} (副本)`,
        user_id: user.id,
        theme_id: resume.theme_id,
        resume_data: data,
      });
      loadResumes();
      navigate(`/editor/${newResume.data.id}`);
    } catch (error) {
      console.error('Failed to duplicate resume:', error);
    }
  };

  const handlePreview = async (resume: Resume) => {
    setLoadingPreview(true);
    setPreviewResume(resume);
    try {
      const res = await resumeApi.getResume(resume.id);
      setPreviewData(parseResumeData(res.data));
    } catch (error) {
      console.error('Failed to load resume preview:', error);
      setPreviewData(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  const totalResumes = resumes.length;
  const thisWeekCount = resumes.filter(r => {
    const date = new Date(r.updated_at || r.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date > weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* 顶部区域 */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Layers3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">简历工作台</h1>
              <p className="text-sm text-slate-500 mt-0.5">管理、创建、导出你的专业简历</p>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="hidden md:flex items-center gap-3">
            <div className="px-4 py-2.5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">简历总数</p>
                  <p className="text-lg font-bold text-slate-800">{totalResumes}</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-2.5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">本周新建</p>
                  <p className="text-lg font-bold text-slate-800">{thisWeekCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportDialogOpen(true)}
              className="h-9 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 text-xs font-medium px-4"
            >
              <Upload className="w-4 h-4 mr-2" />
              导入 PDF
            </Button>
          </div>
          <Button
            size="sm"
            onClick={handleCreateResume}
            className="h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-medium shadow-lg shadow-blue-500/25 px-5"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建简历
          </Button>
        </div>

        {/* 空状态 */}
        {resumes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">还没有简历</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
              创建你的第一份专业简历，或从 PDF 导入现有简历开始
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)} className="h-10 text-xs font-medium px-5">
                <Upload className="w-4 h-4 mr-2" />
                导入 PDF
              </Button>
              <Button size="sm" onClick={handleCreateResume} className="h-10 text-xs font-medium px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
                <Plus className="w-4 h-4 mr-2" />
                新建简历
              </Button>
            </div>
          </div>
        ) : (
          /* 简历网格 - 直接展示简历本身 */
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {resumes.map((resume, index) => (
              <div
                key={resume.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
              >
                <ResumeCard
                  resume={resume}
                  onPreview={() => handlePreview(resume)}
                  onEdit={() => navigate(`/editor/${resume.id}`)}
                  onDelete={() => handleDeleteResume(resume.id)}
                  onDuplicate={() => handleDuplicateResume(resume)}
                />
              </div>
            ))}

            {/* 新建卡片 - 保持简历的比例风格 */}
            <div
              onClick={handleCreateResume}
              className="group cursor-pointer flex flex-col"
              style={{ aspectRatio: '3/4' }}
            >
              <div className="flex-1 bg-white border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-lg flex flex-col items-center justify-center transition-all duration-300 hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-500/5">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-blue-100 group-hover:to-indigo-100 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                  <Plus className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">新建简历</p>
                <p className="text-xs text-slate-400 mt-1">从空白开始</p>
              </div>
              {/* 占位信息栏 */}
              <div className="pt-2.5">
                <p className="text-sm font-medium text-slate-400 group-hover:text-blue-500 transition-colors">点击创建</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <ImportResumeDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} onImport={loadResumes} />
      <PreviewDialog
        resume={previewResume}
        previewData={previewData}
        loading={loadingPreview}
        onClose={() => setPreviewResume(null)}
      />
    </div>
  );
}
