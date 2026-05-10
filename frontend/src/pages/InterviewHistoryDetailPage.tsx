import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { interviewApi } from '@/lib/resumes';
import { Button } from '@/components/ui/button';
import { Loader2, Star, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Answer {
  question: string;
  focus: string;
  answer: string;
  score: number;
  evaluation: string;
  standard_answer: string;
}

interface InterviewRecordDetail {
  id: number;
  session_id: string;
  resume_title: string;
  job_position: string | null;
  total_questions: number;
  overall_score: number;
  answers: Answer[];
  summary: string;
  status: string;
  created_at: string;
}

export default function InterviewHistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<InterviewRecordDetail | null>(null);
  const [expandedAnswer, setExpandedAnswer] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    loadRecord();
  }, [user, id]);

  const loadRecord = async () => {
    setLoading(true);
    try {
      const res = await interviewApi.getRecordDetail(Number(id));
      if (res.code === 0 && res.data) {
        setRecord(res.data);
      }
    } catch (error) {
      console.error('Failed to load interview record:', error);
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
          className={`w-5 h-5 ${i <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
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

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">记录不存在</p>
          <Button onClick={() => navigate('/interview/history')}>返回列表</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 概览卡片 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">{record.resume_title}</h1>
              {record.job_position && (
                <p className="text-sm text-slate-500 mt-1">{record.job_position}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">综合评分</div>
              {renderStars(record.overall_score || 0)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center bg-slate-50 rounded-xl p-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">{record.total_questions}</div>
              <div className="text-xs text-slate-500">总问题数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{record.answers?.length || 0}</div>
              <div className="text-xs text-slate-500">已回答</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600">{formatDate(record.created_at)}</div>
              <div className="text-xs text-slate-500">面试时间</div>
            </div>
          </div>
        </div>

        {/* 问题和回答列表 */}
        <div className="space-y-4">
          {record.answers?.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <button
                className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedAnswer(expandedAnswer === index ? null : index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        问题 {index + 1}
                      </span>
                      <span className="text-xs text-slate-400">考察：{item.focus}</span>
                    </div>
                    <p className="font-medium text-slate-800">{item.question}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-amber-700">{item.score}</span>
                      <span className="text-xs text-amber-500">/10</span>
                    </div>
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </button>

              {expandedAnswer === index && (
                <div className="border-t border-slate-100 p-4 bg-slate-50">
                  <div className="space-y-4">
                    {/* 你的回答 */}
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-1">你的回答</div>
                      <div className="text-slate-700 bg-white rounded-lg p-3">{item.answer}</div>
                    </div>

                    {/* 评估结果 */}
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-1">评估意见</div>
                      <div className="text-slate-700 bg-white rounded-lg p-3">{item.evaluation}</div>
                    </div>

                    {/* 标准答案 */}
                    <div>
                      <div className="text-xs font-medium text-emerald-600 mb-1">标准答案</div>
                      <div className="text-slate-700 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                        {item.standard_answer}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => navigate('/interview')}
            variant="outline"
            className="flex-1"
          >
            重新面试
          </Button>
          <Button
            onClick={() => navigate('/interview/history')}
            className="flex-1 bg-blue-600"
          >
            返回列表
          </Button>
        </div>
      </main>
    </div>
  );
}