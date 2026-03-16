import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi } from '@/lib/resumes';
import type { Resume } from '@/lib/resumes';
import type { ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Loader2, Trash2, Eye, Edit, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ResumePreview from '@/components/ResumePreview';
import PDFDownloader from '@/components/PDFDownloader';

// 解析简历数据
const parseResumeData = (resume: Resume): ResumeData => {
  try {
    return {
      personalInfo: resume.personal_info ? JSON.parse(resume.personal_info) : defaultResumeData.personalInfo,
      education: resume.education ? JSON.parse(resume.education) : [],
      workExperience: resume.work_experience ? JSON.parse(resume.work_experience) : [],
      projects: resume.projects ? JSON.parse(resume.projects) : [],
      skills: resume.skills ? JSON.parse(resume.skills) : [],
      awards: resume.awards ? JSON.parse(resume.awards) : [],
      languages: resume.languages ? JSON.parse(resume.languages) : [],
    };
  } catch {
    return defaultResumeData;
  }
};

// 简历卡片预览组件
const ResumeCardPreview: React.FC<{ resume: Resume }> = ({ resume }) => {
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const res = await resumeApi.getResume(resume.id);
        const parsedData = parseResumeData(res.data);
        setPreviewData(parsedData);
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
      <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" size={24} />
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-sm">
        加载预览失败
      </div>
    );
  }

  return (
    <div className="h-48 bg-white rounded-lg overflow-hidden border border-slate-200 relative cursor-pointer group/preview">
      {/* 缩放预览 */}
      <div 
        className="origin-top-left scale-[0.28] w-[calc(100%/0.28)]"
        style={{ height: 'calc(100% / 0.28)' }}
      >
        <ResumePreview data={previewData} />
      </div>
      {/* 悬停遮罩 */}
      <div className="absolute inset-0 bg-slate-900/0 group-hover/preview:bg-slate-900/5 transition-colors" />
    </div>
  );
};

export default function ResumeListPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const res = await resumeApi.getResumes();
      setResumes(res.data.list);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
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
    if (!confirm('确定要删除这份简历吗？')) return;
    setDeleting(id);
    try {
      await resumeApi.deleteResume(id);
      setResumes(resumes.filter(r => r.id !== id));
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
      const res = await resumeApi.getResume(resume.id);
      const parsedData = parseResumeData(res.data);
      setPreviewData(parsedData);
    } catch (error) {
      console.error('Failed to load resume preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">我的简历</h1>
          <Button onClick={handleCreateResume}>
            <Plus size={20} className="mr-2" />
            新建简历
          </Button>
        </div>

        {resumes.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">还没有简历</h3>
              <p className="text-slate-400 mb-4">点击上方按钮创建你的第一份简历</p>
              <Button onClick={handleCreateResume}>
                <Plus size={20} className="mr-2" />
                创建简历
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                {/* PDF 预览区域 */}
                <div 
                  className="p-3 bg-slate-50 border-b border-slate-100"
                  onClick={() => handlePreview(resume)}
                >
                  <ResumeCardPreview resume={resume} />
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{resume.title}</h3>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {new Date(resume.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePreview(resume)}
                    >
                      <Eye size={16} className="mr-1" />
                      预览
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/editor/${resume.id}`)}
                    >
                      <Edit size={16} className="mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteResume(resume.id)}
                      disabled={deleting === resume.id}
                    >
                      {deleting === resume.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewResume && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">{previewResume.title}</h2>
              <div className="flex gap-2">
                {previewData && (
                  <PDFDownloader
                    resumeData={previewData}
                    filename={`${previewResume.title}.pdf`}
                  />
                )}
                <Button variant="outline" onClick={() => setPreviewResume(null)}>
                  关闭
                </Button>
              </div>
            </div>
            <div className="p-4">
              {loadingPreview ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : previewData ? (
                <ResumePreview data={previewData} />
              ) : (
                <div className="text-center py-8 text-slate-400">加载失败</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
