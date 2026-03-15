import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi } from '@/lib/resumes';
import type { Resume } from '@/lib/resumes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus, Loader2, LogOut, Trash2 } from 'lucide-react';

export default function ResumeListPage() {
  const { user, logout } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
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
        user_id: user!.id,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/resumes" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-800">Poker</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">{user?.email || user?.username}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

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
            {resumes.map((resume) => (
              <Card key={resume.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-0">
                  <div 
                    className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-xl flex items-center justify-center"
                    onClick={() => navigate(`/editor/${resume.id}`)}
                  >
                    <FileText className="w-16 h-16 text-slate-300" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/editor/${resume.id}`)}
                      >
                        <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {resume.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(resume.updated_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
