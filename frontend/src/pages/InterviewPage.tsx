import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi, interviewApi, type Resume } from '@/lib/resumes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Play, ArrowLeft, Check, MessageCircle, Send, RefreshCw, FileText, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function InterviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 状态
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [jobPosition, setJobPosition] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [starting, setStarting] = useState(false);

  // 面试状态
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 评估结果
  const [evaluation, setEvaluation] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [finalScore, setFinalScore] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    loadResumes();
  }, [user]);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const res = await resumeApi.getResumes();
      setResumes(res.data?.list || []);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!selectedResume) return;

    setStarting(true);
    try {
      const res = await interviewApi.start(selectedResume.id, jobPosition || undefined, questionCount);

      if (res.code === 0 && res.data) {
        setSessionId(res.data.session_id);
        setQuestions([res.data.current_question]);
        setCurrentQuestion(res.data.current_question);
        setCurrentIndex(0);
        setEvaluation(null);
        setCompleted(false);
      } else {
        alert(res.message || '启动面试失败');
      }
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('启动面试失败，请稍后重试');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!sessionId || !answer.trim()) return;

    setSubmitting(true);
    try {
      const res = await interviewApi.answer(sessionId, currentIndex, answer);

      if (res.code === 0 && res.data) {
        setEvaluation(res.data);
      } else {
        alert(res.message || '提交失败');
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!sessionId) return;

    const nextIndex = currentIndex + 1;

    try {
      const res = await interviewApi.next(sessionId, nextIndex);

      if (res.code === 0 && res.data) {
        if (res.data.completed) {
          setCompleted(true);
          setSummary(res.data.summary);
          setFinalScore(res.data.overall_score || 0);
        } else {
          setCurrentQuestion(res.data.question);
          setCurrentIndex(nextIndex);
          setAnswer('');
          setEvaluation(null);
          setQuestions(prev => [...prev, res.data!.question]);
        }
      }
    } catch (error) {
      console.error('Failed to get next question:', error);
    }
  };

  const handleRestart = () => {
    setSessionId(null);
    setCurrentIndex(0);
    setQuestions([]);
    setCurrentQuestion(null);
    setAnswer('');
    setEvaluation(null);
    setCompleted(false);
    setSummary(null);
    setFinalScore(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // 面试进行中或已完成
  if (sessionId) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-6">
          {completed ? (
            // 面试完成页面
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">面试完成！</h2>
                <p className="text-slate-500">恭喜你完成了本次模拟面试</p>
              </div>

              {summary && (
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <h3 className="font-medium text-slate-700 mb-4 text-center">面试总结</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">{summary.total_questions || questions.length}</div>
                      <div className="text-xs text-slate-500 mt-1">总问题数</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-emerald-600">{questions.length}</div>
                      <div className="text-xs text-slate-500 mt-1">已完成</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i <= finalScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">综合评分</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新面试
                </Button>
                <Button
                  onClick={() => navigate('/interview/history')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  查看历史
                </Button>
              </div>
            </div>
          ) : evaluation ? (
            // 显示评估结果
            <div className="space-y-4">
              {/* 问题卡片 */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="text-xs font-medium text-slate-400 mb-2">当前问题</div>
                <div className="text-lg font-medium text-slate-800 mb-2">{currentQuestion?.question}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="text-blue-500">考察要点：</span>
                  {currentQuestion?.focus}
                </div>
              </div>

              {/* 你的回答 */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="text-xs font-medium text-slate-500 mb-2">你的回答</div>
                <div className="text-slate-700 whitespace-pre-wrap">{answer}</div>
              </div>

              {/* 评估结果 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-slate-800">评估结果</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm">
                    <span className="text-xs text-slate-500">评分</span>
                    <span className="font-bold text-blue-600 text-lg">{evaluation.score}</span>
                    <span className="text-xs text-slate-400">/10</span>
                  </div>
                </div>
                <div className="text-slate-700 whitespace-pre-wrap mb-4 leading-relaxed">{evaluation.evaluation}</div>
                <div className="bg-white rounded-xl p-4 border border-emerald-100">
                  <div className="text-xs font-medium text-emerald-600 mb-2 flex items-center gap-1">
                    <Check size={12} />
                    标准答案
                  </div>
                  <div className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{evaluation.standard_answer}</div>
                </div>
              </div>

              {/* 操作按钮 */}
              <Button
                onClick={handleNextQuestion}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                {currentIndex + 1 >= questions.length ? '查看结果' : '下一题'}
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </div>
          ) : (
            // 回答问题界面
            <div className="space-y-4">
              {/* 问题卡片 */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-500">问题 {currentIndex + 1}</span>
                  </div>
                  <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    {questions.length - currentIndex - 1} 题剩余
                  </div>
                </div>
                <div className="text-lg font-medium text-slate-800 mb-3">{currentQuestion?.question}</div>
                <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 inline-block">
                  <span className="text-blue-500">考察要点：</span>
                  {currentQuestion?.focus}
                </div>
              </div>

              {/* 回答输入 */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <label className="text-sm font-medium text-slate-700 mb-2 block">你的回答</label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="请输入你的回答..."
                  rows={6}
                  className="resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <div className="text-xs text-slate-400 mt-2 text-right">
                  {answer.length} 字
                </div>
              </div>

              {/* 提交按钮 */}
              <Button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    提交回答
                  </>
                )}
              </Button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // 选择简历界面
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：简历列表 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="font-medium text-slate-700">选择简历</h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-auto">
              {resumes.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">暂无简历</p>
                  <Button
                    variant="link"
                    onClick={() => navigate('/editor')}
                    className="text-blue-500 text-sm mt-2"
                  >
                    创建新简历
                  </Button>
                </div>
              ) : (
                resumes.map(resume => (
                  <button
                    key={resume.id}
                    onClick={() => setSelectedResume(resume)}
                    className={`w-full p-4 text-left transition-all ${
                      selectedResume?.id === resume.id
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="font-medium text-slate-800">{resume.title}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      更新于 {new Date(resume.updated_at).toLocaleDateString('zh-CN')}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 右侧：面试设置 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="font-medium text-white flex items-center gap-2">
                <Play className="w-4 h-4" />
                面试设置
              </h2>
            </div>

            {!selectedResume ? (
              <div className="p-12 text-center text-slate-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">请从左侧选择一份简历</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="text-sm font-medium text-blue-700">已选择简历</div>
                  <div className="text-slate-800 font-medium mt-1">{selectedResume.title}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">目标职位（可选）</label>
                  <Input
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    placeholder="如：前端工程师"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">问题数量</label>
                  <div className="flex gap-2">
                    {[3, 5, 8, 10].map(num => (
                      <button
                        key={num}
                        onClick={() => setQuestionCount(num)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
                          questionCount === num
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {num} 题
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleStartInterview}
                  disabled={starting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  {starting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      准备中...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      开始面试
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 说明 */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-medium text-amber-800 mb-2">面试说明</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• 面试将根据你的简历内容生成针对性的问题</li>
            <li>• 每道题回答后，你会获得评估结果和标准答案</li>
            <li>• 面试结束后，你可以查看整体表现和总结</li>
          </ul>
        </div>
      </main>
    </div>
  );
}