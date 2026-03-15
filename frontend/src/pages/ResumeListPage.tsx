import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from '@/lib/resumes';
import type { Resume } from '@/lib/resumes';
import type { ResumeData } from '@/types/resume';
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
      personalInfo: resume.personal_info ? JSON.parse(resume.personal_info) : {},
      education: resume.education ? JSON.parse(resume.education) : [],
      workExperience: resume.work_experience ? JSON.parse(resume.work_experience) : [],
      projects: resume.projects ? JSON.parse(resume.projects) : [],
      skills: resume.skills ? JSON.parse(resume.skills) : [],
      awards: resume.awards ? JSON.parse(resume.awards) : [],
      languages: resume.languages ? JSON.parse(resume.languages) : [],
    };
  } catch {
    return {
      personalInfo: {},
      education: [],
      workExperience: [],
      projects: [],
      skills: [],
      awards: [],
      languages: [],
    };
  }
};

export default function ResumeListPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const navigate = useNavigate();

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
      const res = await resumeApi.createResume({
        title: '我的新简历',
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
    setPreviewResume(resume);
    setLoadingPreview(true);
    try {
      const res = await resumeApi.getResume(resume.id);
      const data = res.data;
      setPreviewData({
        personalInfo: data.personal_info ? JSON.parse(data.personal_info) : {},
        education: data.education ? JSON.parse(data.education) : [],
        workExperience: data.work_experience ? JSON.parse(data.work_experience) : [],
        projects: data.projects ? JSON.parse(data.projects) : [],
        skills: data.skills ? JSON.parse(data.skills) : [],
        awards: data.awards ? JSON.parse(data.awards) : [],
        languages: data.languages ? JSON.parse(data.languages) : [],
      });
    } catch (error) {
      console.error('Failed to load preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">我的简历</h2>
            <p className="text-slate-600 mt-1">管理你的简历作品</p>
          </div>
          <Button onClick={handleCreateResume} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            新建简历
          </Button>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">还没有简历</h3>
            <p className="text-slate-600 mb-6">创建你的第一份简历吧</p>
            <Button onClick={handleCreateResume} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              创建简历
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => {
              const resumeData = parseResumeData(resume);
              return (
              <Card key={resume.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-0">
                  {/* PDF 预览缩略图 */}
                  <div
                    className="bg-white rounded-t-xl overflow-hidden cursor-pointer"
                    onClick={() => handlePreview(resume)}
                    style={{ height: '220px', overflow: 'hidden' }}
                  >
                    <div style={{ transform: 'scale(0.25)', transformOrigin: 'top left', width: '400%' }}>
                      <ResumePreview data={resumeData} />
                    </div>
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {resume.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(resume.updated_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/editor/${resume.id}`);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(resume);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        预览
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResume(resume.id);
                        }}
                        disabled={deleting === resume.id}
                      >
                        {deleting === resume.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {previewResume && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{previewResume.title} - 预览</h3>
              <div className="flex items-center gap-2">
                {previewData && (
                  <PDFDownloader resumeData={previewData} filename={previewResume.title} />
                )}
                <Button variant="ghost" onClick={() => setPreviewResume(null)}>
                  关闭
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {loadingPreview ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : previewData ? (
                <ResumePreview data={previewData} />
              ) : (
                <div className="text-center py-10 text-slate-500">无法加载预览</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
