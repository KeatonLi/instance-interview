import { useEffect, useRef, useState } from 'react';
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
  Layers3,
  Plus,
  Search,
  Share2,
  Sparkles,
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

// 简历缩略图卡片
const ResumeThumbnail: React.FC<{
  resume: Resume;
  previewData: ResumeData | null;
  onEdit: () => void;
  onDelete: () => void;
  onShare?: () => void;
  onDuplicate?: () => void;
}> = ({ resume, previewData, onEdit, onDelete, onShare, onDuplicate }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const theme = themes[resume.theme_id] || themes[0];

  return (
    <div className="group relative">
      {/* 操作按钮 */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-1"
        >
          <Edit className="w-3 h-3" />
          编辑
        </button>
        {onShare && (
          <button
            onClick={onShare}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg shadow-lg flex items-center gap-1"
          >
            <Share2 className="w-3 h-3" />
            分享
          </button>
        )}
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg shadow-lg flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            复制
          </button>
        )}
        <button
          onClick={onDelete}
          className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 text-xs font-medium rounded-lg shadow-lg flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* 模板标签 */}
      <div className="absolute top-2 left-2 z-10">
        <span
          className="px-2 py-1 rounded-md text-[10px] font-medium shadow"
          style={{
            backgroundColor: theme.colors.header,
            color: '#fff',
          }}
        >
          {theme.name}
        </span>
      </div>

      {/* 简历渲染 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200/60 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-200">
        <div className="relative" style={{ paddingTop: '141.4%' /* A4 ratio */ }}>
          {previewData ? (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-slate-50">
              <div
                className="transform scale-[0.25] origin-center pointer-events-none"
                style={{ width: '400%', height: '400%' }}
              >
                <ResumePreview data={previewData} themeId={resume.theme_id} />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-1 opacity-40" />
                <span className="text-xs">加载失败</span>
              </div>
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                {resume.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                <Clock className="w-3 h-3" />
                {formatDate(resume.updated_at || resume.created_at)}
              </div>
            </div>
          </div>
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

// 分享对话框
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

      // 加载所有简历的预览数据
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse">
            <FileText className="w-10 h-10 text-white" />
          </div>
        </div>
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
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* 头部区域 */}
        <div className="relative mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                    <Layers3 className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-xl shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                    简历工作台
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">管理、创建、导出你的专业简历</p>
                </div>
              </div>

              {/* 统计卡片 */}
              <div className="hidden md:flex items-center gap-3">
                <div className="group relative px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-200/50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">简历总数</p>
                      <p className="text-xl font-bold text-slate-800">{totalResumes}</p>
                    </div>
                  </div>
                </div>
                <div className="group relative px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-emerald-200/50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">本周新建</p>
                      <p className="text-xl font-bold text-slate-800">{thisWeekCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="relative mb-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                {/* 搜索框 */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="搜索简历..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 pl-10 pr-4 bg-white/80 border-slate-200/80 focus:border-blue-400 focus:ring-blue-100 rounded-xl text-sm"
                  />
                </div>
                {/* 模板过滤 */}
                <Select value={filterTheme === undefined ? 'all' : String(filterTheme)} onValueChange={(v) => setFilterTheme(v === 'all' ? undefined : Number(v))}>
                  <SelectTrigger className="h-10 w-36 bg-white/80 border-slate-200/80 rounded-xl text-sm">
                    <SelectValue placeholder="模板" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部模板</SelectItem>
                    {themes.map((theme, idx) => (
                      <SelectItem key={idx} value={String(idx)}>{theme.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* 排序 */}
                <Select value={sortBy || 'updated_at_desc'} onValueChange={(v) => setSortBy(v as ResumeListParams['sort'])}>
                  <SelectTrigger className="h-10 w-40 bg-white/80 border-slate-200/80 rounded-xl text-sm">
                    <SelectValue placeholder="排序" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated_at_desc">最近更新</SelectItem>
                    <SelectItem value="updated_at_asc">最早更新</SelectItem>
                    <SelectItem value="created_at_desc">最新创建</SelectItem>
                    <SelectItem value="created_at_asc">最早创建</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImportDialogOpen(true)}
                  className="h-10 px-4 bg-white/80 border-slate-200/80 text-slate-700 hover:bg-white hover:border-blue-300 text-sm font-medium shadow-sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  导入 PDF
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateResume}
                  className="h-10 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm font-semibold shadow-lg shadow-blue-500/25"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新建简历
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 空状态 */}
        {resumes.length === 0 ? (
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-20 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto">
                  <FileText className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-3">还没有简历</h3>
              <p className="text-sm text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">
                创建你的第一份专业简历，或从 PDF 导入现有简历开始
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setImportDialogOpen(true)}
                  className="h-12 px-6 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300 text-sm font-medium shadow-sm"
                >
                  <Upload className="w-5 h-5 mr-2.5" />
                  导入 PDF
                </Button>
                <Button
                  size="lg"
                  onClick={handleCreateResume}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm font-semibold shadow-lg shadow-blue-500/25"
                >
                  <Plus className="w-5 h-5 mr-2.5" />
                  新建简历
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <span className="text-sm text-slate-500 mb-4 block">{resumes.length} 份简历</span>

            {/* 简历网格 - 直接渲染简历内容 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                className="cursor-pointer flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg transition-all duration-300 min-h-[320px]"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-blue-100 group-hover:to-indigo-100 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                  <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-base font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">新建简历</p>
                <p className="text-sm text-slate-400 mt-1">从空白开始创建</p>
              </div>
            </div>
          </>
        )}
      </div>

      <ImportResumeDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} onImport={loadResumes} />
      <ShareDialog
        resume={shareResume}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </div>
  );
}
