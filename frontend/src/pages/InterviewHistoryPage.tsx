import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { interviewApi } from '@/lib/resumes';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Clock, Briefcase, FileText, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface InterviewRecord {
  id: number;
  resume_title: string;
  job_position: string | null;
  total_questions: number;
  overall_score: number;
  status: string;
  created_at: string;
}

export default function InterviewHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<InterviewRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    loadRecords();
  }, [user]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await interviewApi.getRecords();
      if (res.code === 0) {
        setRecords(res.data || []);
      }
    } catch (error) {
      console.error('Failed to load interview records:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">暂无面试记录</h3>
            <p className="text-slate-500 mb-6">开始你的第一次模拟面试吧</p>
            <Button onClick={() => navigate('/interview')} className="bg-blue-600">
              开始面试
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-blue-200 transition-colors cursor-pointer"
                onClick={() => navigate(`/interview/history/${record.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-800">{record.resume_title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          record.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {record.status === 'completed' ? '已完成' : '进行中'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {record.job_position && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {record.job_position}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {record.total_questions}题
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(record.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 mb-1">综合评分</div>
                      {renderStars(record.overall_score || 0)}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}