import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi } from '@/lib/resumes';
import type { Resume, ResumeListParams } from '@/lib/resumes';
import type { ResumeData } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  Copy,
  Edit,
  FileText,
  FileUp,
  Plus,
  Search,
  Share2,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import ResumePreview from '@/components/ResumePreview';
import { parseResumeData } from '@/lib/resumeData';
import { themes } from '@/styles/resumeThemes';

// ─── ResumeThumbnail ───────────────────────────────────────────────────────

const RESUME_BASE_WIDTH = 540;  // ResumePreview 的固定渲染宽度
const RESUME_BASE_HEIGHT = 766; // ResumePreview 的固定渲染高度

const ResumeThumbnail: React.FC<{
  resume: Resume;
  previewData: ResumeData | null;
  onEdit: () => void;
  onDelete: () => void;
  onShare?: () => void;
  onDuplicate?: () => void;
}> = ({ resume, previewData, onEdit, onDelete, onShare, onDuplicate }) => {
  const theme = themes[resume.theme_id] || themes[0];
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(200);

  const measure = useCallback(() => {
    if (cardRef.current) {
      const w = cardRef.current.getBoundingClientRect().width;
      if (w > 0) setCardWidth(w);
    }
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (cardRef.current) ro.observe(cardRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // 动态计算缩放比例：卡片宽度 ÷ 简历基准宽度
  const scale = cardWidth / RESUME_BASE_WIDTH;
  const scaledHeight = RESUME_BASE_HEIGHT * scale;

  return (
    <div className="group cursor-pointer" onClick={onEdit}>
      {/* 纸张阴影容器 */}
      <div className="relative">
        <div className="absolute inset-0 translate-y-1.5 translate-x-0.5 bg-slate-300/30 rounded-sm" />
        <div className="absolute inset-0 translate-y-1 translate-x-0 bg-slate-200/40 rounded-sm" />

        {/* 简历预览主体 — 高度由动态缩放决定 */}
        <div
          ref={cardRef}
          className="relative bg-white shadow-lg shadow-slate-900/8 ring-1 ring-slate-900/5 rounded-sm overflow-hidden"
          style={{ height: scaledHeight || 'auto' }}
        >
          {previewData ? (
            <ResumePreview data={previewData} themeId={resume.theme_id} scale={scale} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300">
              <div className="text-center">
                <FileText className="w-6 h-6 mx-auto mb-1 opacity-30" />
                <span className="text-[10px]">加载中</span>
              </div>
            </div>
          )}

          {/* hover 遮罩 + 操作按钮 */}
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/25 transition-all duration-300 flex flex-col items-center justify-center gap-2">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-slate-700 text-xs font-medium rounded-lg shadow-lg flex items-center gap-1.5 hover:bg-white hover:text-blue-600 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                编辑
              </button>
              {onShare && (
                <button
                  onClick={(e) => { e.stopPropagation(); onShare(); }}
                  className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-slate-700 text-xs font-medium rounded-lg shadow-lg flex items-center gap-1.5 hover:bg-white hover:text-green-600 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  分享
                </button>
              )}
              {onDuplicate && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                  className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-slate-700 text-xs font-medium rounded-lg shadow-lg flex items-center gap-1.5 hover:bg-white hover:text-indigo-600 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  复制
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="px-2.5 py-1.5 bg-white/95 backdrop-blur-sm text-slate-700 text-xs font-medium rounded-lg shadow-lg flex items-center gap-1 hover:bg-white hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="mt-2.5 px-0.5">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
              {resume.title}
            </h3>
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />
                {(() => {
                  const d = new Date(resume.updated_at || resume.created_at);
                  const now = new Date();
                  const diffMs = now.getTime() - d.getTime();
                  const diffDays = Math.floor(diffMs / 86400000);
                  if (diffDays === 0) return '今天';
                  if (diffDays === 1) return '昨天';
                  if (diffDays < 7) return `${diffDays} 天前`;
                  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
                })()}
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: theme.colors.accent }}
                />
                <span className="text-[11px] text-slate-400">{theme.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Import Dialog ────────────────────────────────────────────────────────

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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <FileUp className="w-7 h-7" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">导入简历</DialogTitle>
              <p className="text-sm text-blue-100 mt-1">从 PDF 自动解析</p>
            </div>
          </div>
        </div>

        <div className="p-6">
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
              mt-2 border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
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
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">正在解析简历...</p>
                  <p className="text-xs text-slate-400 mt-1">AI 正在提取信息</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center border border-blue-100">
                  <FileUp className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-1">点击或拖拽上传 PDF</p>
                  <p className="text-xs text-slate-400">支持自动解析个人信息、工作经历、项目经验</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2.5">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Share Dialog ─────────────────────────────────────────────────────────

const ShareDialog: React.FC<{
  resume: Resume | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ resume, open, onOpenChange }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEnableShare = async () => {
    if (!resume) return;
    setLoading(true);
    try {
      const res = await resumeApi.enableShare(resume.id);
      const fullUrl = `${window.location.origin}/shared/${res.data.share_token}`;
      setShareUrl(fullUrl);
    } catch (error) {
      console.error('Failed to enable share:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableShare = async () => {
    if (!resume) return;
    setLoading(true);
    try {
      await resumeApi.disableShare(resume.id);
      setShareUrl('');
    } catch (error) {
      console.error('Failed to disable share:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (resume?.share_token) {
      const fullUrl = `${window.location.origin}/shared/${resume.share_token}`;
      setShareUrl(fullUrl);
    } else {
      setShareUrl('');
    }
  }, [resume]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="block">分享简历</span>
              <span className="text-xs font-normal text-slate-500">生成分享链接</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {shareUrl ? (
            <>
              <p className="text-sm text-slate-600">复制以下链接分享给任何人，他们无需登录即可查看：</p>
              <div className="flex items-center gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button onClick={handleCopy} variant={copied ? 'outline' : 'default'}>
                  {copied ? '已复制' : '复制'}
                </Button>
              </div>
              <Button onClick={handleDisableShare} variant="destructive" className="w-full">
                取消分享
              </Button>
            </>
          ) : (
            <Button onClick={handleEnableShare} disabled={loading} className="w-full">
              {loading ? '生成中...' : '生成分享链接'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────

export default function ResumeListPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [previewDataMap, setPreviewDataMap] = useState<Record<number, ResumeData>>({});
  const [loading, setLoading] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareResume, setShareResume] = useState<Resume | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTheme, setFilterTheme] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<ResumeListParams['sort']>('updated_at_desc');

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadResumes();
  }, [searchQuery, filterTheme, sortBy]);

  const loadResumes = async () => {
    try {
      const res = await resumeApi.getResumes({
        search: searchQuery,
        theme_id: filterTheme,
        sort: sortBy,
      });
      setResumes(res.data.list || []);

      const list = res.data.list || [];
      const dataMap: Record<number, ResumeData> = {};
      await Promise.all(
        list.map(async (resume: Resume) => {
          try {
            const detail = await resumeApi.getResume(resume.id);
            dataMap[resume.id] = parseResumeData(detail.data);
          } catch (e) {
            console.error('Failed to load preview for', resume.id, e);
          }
        })
      );
      setPreviewDataMap(dataMap);
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
    try {
      await resumeApi.deleteResume(id);
      setResumes((current) => current.filter((resume) => resume.id !== id));
    } catch (error) {
      console.error('Failed to delete resume:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalResumes = resumes.length;
  const thisWeekCount = resumes.filter((r) => {
    const date = new Date(r.updated_at || r.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date > weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 头部 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">简历工作台</h1>
            <p className="text-sm text-slate-500 mt-0.5">管理你的简历，选择模板并导出 PDF</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportDialogOpen(true)}
              className="h-9 px-3.5 bg-white/80 border-slate-200/80 text-slate-600 hover:bg-white hover:border-blue-300 text-sm font-medium"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              导入 PDF
            </Button>
            <Button
              size="sm"
              onClick={handleCreateResume}
              className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              新建简历
            </Button>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="搜索简历..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-3 bg-white/90 border-slate-200/80 focus:border-slate-400 focus:ring-slate-100 rounded-lg text-sm"
            />
          </div>
          <Select
            value={filterTheme === undefined ? 'all' : String(filterTheme)}
            onValueChange={(v) => setFilterTheme(v === 'all' ? undefined : Number(v))}
          >
            <SelectTrigger className="h-9 w-32 bg-white/90 border-slate-200/80 rounded-lg text-sm">
              <SelectValue placeholder="模板" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部模板</SelectItem>
              {themes.map((theme, idx) => (
                <SelectItem key={idx} value={String(idx)}>{theme.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy || 'updated_at_desc'}
            onValueChange={(v) => setSortBy(v as ResumeListParams['sort'])}
          >
            <SelectTrigger className="h-9 w-32 bg-white/90 border-slate-200/80 rounded-lg text-sm">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at_desc">最近更新</SelectItem>
              <SelectItem value="updated_at_asc">最早更新</SelectItem>
              <SelectItem value="created_at_desc">最新创建</SelectItem>
              <SelectItem value="created_at_asc">最早创建</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-slate-400 ml-auto">
            {totalResumes} 份简历 · 本周 {thisWeekCount} 份
          </span>
        </div>

        {/* 空状态 */}
        {resumes.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-2">还没有简历</h3>
            <p className="text-sm text-slate-400 mb-8">创建你的第一份专业简历，或从 PDF 导入</p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
                className="h-10 px-5 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
              >
                <Upload className="w-4 h-4 mr-2" />
                导入 PDF
              </Button>
              <Button
                onClick={handleCreateResume}
                className="h-10 px-5 bg-slate-800 hover:bg-slate-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                新建简历
              </Button>
            </div>
          </div>
        ) : (
          /* 简历网格 */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {resumes.map((resume) => (
              <ResumeThumbnail
                key={resume.id}
                resume={resume}
                previewData={previewDataMap[resume.id]}
                onEdit={() => navigate(`/editor/${resume.id}`)}
                onDelete={() => handleDeleteResume(resume.id)}
                onDuplicate={() => handleDuplicateResume(resume)}
                onShare={() => {
                  setShareResume(resume);
                  setShareDialogOpen(true);
                }}
              />
            ))}

            {/* 新建卡片 */}
            <div
              onClick={handleCreateResume}
              className="group cursor-pointer flex flex-col items-center justify-center bg-white/60 border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-white/90 transition-all rounded-sm min-h-[300px]"
            >
              <Plus className="w-8 h-8 text-slate-300 group-hover:text-slate-500 transition-colors mb-2" />
              <span className="text-sm text-slate-400 group-hover:text-slate-600 transition-colors">新建简历</span>
            </div>
          </div>
        )}
      </div>

      <ImportResumeDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} onImport={loadResumes} />
      <ShareDialog resume={shareResume} open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
    </div>
  );
}
