import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi } from '@/lib/resumes';
import type { Resume } from '@/lib/resumes';
import type { ResumeData } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  CalendarDays,
  Edit,
  Eye,
  FileText,
  FileUp,
  Layers3,
  Loader2,
  MoreVertical,
  Plus,
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import ResumePreview from '@/components/ResumePreview';
import PDFDownloader from '@/components/PDFDownloader';
import { parseResumeData, sanitizeResumeFilename } from '@/lib/resumeData';
import { themes } from '@/styles/resumeThemes';

const ResumeCardPreview: React.FC<{ resume: Resume }> = ({ resume }) => {
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="h-48 rounded-2xl bg-blue-50/70 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-300" size={24} />
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="h-48 rounded-2xl bg-blue-50/70 flex items-center justify-center text-slate-400 text-sm">
        加载预览失败
      </div>
    );
  }

  return (
    <div className="h-48 bg-white rounded-2xl overflow-hidden border border-blue-100 relative cursor-pointer group/preview shadow-sm">
      <div
        className="origin-top-left scale-[0.28] w-[calc(100%/0.28)]"
        style={{ height: 'calc(100% / 0.28)' }}
      >
        <ResumePreview data={previewData} themeId={resume.theme_id} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-950/10 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;

    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

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
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            导入简历
          </DialogTitle>
          <DialogDescription>
            上传 PDF 格式的简历文件，系统将自动解析并导入。
          </DialogDescription>
        </DialogHeader>

        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            mt-4 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
            ${uploading ? 'cursor-not-allowed opacity-70' : ''}
            ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/60'}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-sm text-slate-600">正在解析简历...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileUp className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">点击或拖拽上传 PDF 文件</p>
              <p className="text-xs text-slate-400">支持自动解析个人信息、工作经历等内容</p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function ResumeListPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
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

  const loadResumeDataById = async (resumeId: number): Promise<ResumeData> => {
    const res = await resumeApi.getResume(resumeId);
    return parseResumeData(res.data);
  };

  const handleCreateResume = async () => {
    try {
      if (!user) return;
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

  const handlePreview = async (resume: Resume) => {
    setLoadingPreview(true);
    setPreviewResume(resume);

    try {
      setPreviewData(await loadResumeDataById(resume.id));
    } catch (error) {
      console.error('Failed to load resume preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  const lastUpdated = resumes[0]
    ? new Date(resumes[0].updated_at || resumes[0].created_at).toLocaleDateString('zh-CN')
    : '暂无';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="rounded-3xl border border-blue-100 bg-white/85 backdrop-blur-sm shadow-sm overflow-hidden animate-fade-in">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] p-6 md:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                <Layers3 className="w-3.5 h-3.5" />
                简历工作台
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">管理你的简历资产</h1>
                <p className="text-slate-500 mt-2 max-w-2xl">
                  在这里集中处理创建、导入、预览和导出，让每一份简历都保持随时可投递的状态。
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleCreateResume}
                  className="bg-blue-600 hover:bg-blue-700 shadow-blue-sm hover:shadow-blue transition-all btn-animate"
                >
                  <Plus size={18} className="mr-2" />
                  新建简历
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setImportDialogOpen(true)}
                  className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
                >
                  <Upload size={18} className="mr-2 text-blue-600" />
                  导入简历
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-4">
                <p className="text-sm text-slate-500">简历总数</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{resumes.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-sm text-slate-500">最近更新</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{lastUpdated}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-sm text-slate-500">导出方式</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">本地生成 PDF</p>
              </div>
            </div>
          </div>
        </section>

        {resumes.length === 0 ? (
          <Card className="text-center py-16 border-blue-100 bg-white/80 backdrop-blur-sm animate-scale-in">
            <CardContent className="pt-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={40} className="text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">还没有简历</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">创建你的第一份专业简历，或导入现有 PDF 快速开始。</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button onClick={handleCreateResume} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <Plus size={18} className="mr-2" />
                  创建简历
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setImportDialogOpen(true)}
                  className="border-blue-200 hover:bg-blue-50 w-full sm:w-auto"
                >
                  <Upload size={18} className="mr-2 text-blue-600" />
                  导入简历
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {resumes.map((resume, index) => (
              <Card
                key={resume.id}
                className="group border-blue-100 bg-white/90 backdrop-blur-sm overflow-hidden animate-fade-in shadow-sm hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div
                  className="p-3 bg-gradient-to-b from-blue-50/60 to-white border-b border-blue-50 cursor-pointer"
                  onClick={() => handlePreview(resume)}
                >
                  <ResumeCardPreview resume={resume} />
                </div>

                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          {themes[resume.theme_id]?.name || '默认模板'}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                          <CalendarDays className="w-3 h-3 mr-1" />
                          {new Date(resume.updated_at || resume.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {resume.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">点击上方缩略图可查看完整预览</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(resume)}>
                          <Eye className="w-4 h-4 mr-2" />
                          预览
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/editor/${resume.id}`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteResume(resume.id)}
                          className="text-red-600 focus:text-red-600"
                          disabled={deleting === resume.id}
                        >
                          {deleting === resume.id ? (
                            <Loader2 size={16} className="mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-100 hover:bg-blue-50 hover:border-blue-200 transition-all"
                      onClick={() => handlePreview(resume)}
                    >
                      <Eye size={16} className="mr-1.5 text-blue-500" />
                      预览
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-100 hover:bg-blue-50 hover:border-blue-200 transition-all"
                      onClick={() => navigate(`/editor/${resume.id}`)}
                    >
                      <Edit size={16} className="mr-1.5 text-blue-500" />
                      编辑
                    </Button>
                    <PDFDownloader
                      filename={sanitizeResumeFilename(resume.title)}
                      loadResumeData={() => loadResumeDataById(resume.id)}
                      className="border-blue-100"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card
              className="group border-dashed border-2 border-blue-200 bg-blue-50/30 hover:bg-blue-50/50 hover:border-blue-300 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[360px] animate-fade-in"
              style={{ animationDelay: `${resumes.length * 0.06}s` }}
              onClick={handleCreateResume}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-200 transition-all duration-300">
                <Plus size={32} className="text-blue-600" />
              </div>
              <p className="text-slate-700 font-semibold">创建新简历</p>
              <p className="text-sm text-slate-400 mt-1">从零开始或复制现有内容继续打磨</p>
            </Card>
          </div>
        )}
      </div>

      <ImportResumeDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} onImport={loadResumes} />

      {previewResume && (
        <Dialog open={!!previewResume} onOpenChange={() => setPreviewResume(null)}>
          <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden p-0">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b px-6 py-4 flex justify-between items-center z-10">
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-900">{previewResume.title}</DialogTitle>
                <p className="text-xs text-slate-500 mt-1">预览最终排版，并可直接导出当前简历。</p>
              </div>
              <div className="flex gap-2">
                {previewData && (
                  <PDFDownloader
                    resumeData={previewData}
                    filename={sanitizeResumeFilename(previewResume.title)}
                  />
                )}
                <Button variant="outline" size="sm" onClick={() => setPreviewResume(null)}>
                  关闭
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-80px)] bg-slate-50">
              {loadingPreview ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : previewData ? (
                <div className="flex justify-center">
                  <ResumePreview data={previewData} themeId={previewResume.theme_id} />
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  加载失败
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
