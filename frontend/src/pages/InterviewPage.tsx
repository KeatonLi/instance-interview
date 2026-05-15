import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi, interviewApi, type Resume } from '@/lib/resumes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { themes } from '@/styles/resumeThemes';
import { Loader2, Play, ArrowLeft, Check, MessageCircle, Send, RefreshCw, FileText, Star, Target, Zap, Trophy, Clock, ChevronRight, History, PlusCircle } from 'lucide-react';

interface InterviewRecord {
  id: number;
  session_id?: string;
  resume_title: string;
  job_position: string | null;
  total_questions: number;
  overall_score: number;
  status: string;
  created_at: string;
}

export default function InterviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [jobPosition, setJobPosition] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [starting, setStarting] = useState(false);
  const [records, setRecords] = useState<InterviewRecord[]>([]);

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
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resRes, recRes] = await Promise.all([
        resumeApi.getResumes(),
        interviewApi.getRecords().catch(() => ({ data: [] as InterviewRecord[] })),
      ]);
      setResumes(resRes.data?.list || []);
      setRecords(recRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
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

  const handleContinueInterview = (record: InterviewRecord) => {
    // 跳转到历史详情页查看
    navigate(`/interview/history/${record.id}`);
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
    setSessionId(null); setCurrentIndex(0); setQuestions([]);
    setCurrentQuestion(null); setAnswer(''); setEvaluation(null);
    setCompleted(false); setSummary(null); setFinalScore(0);
    loadData();
  };

  const scoreToStars = (score: number) => Math.round(score / 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ── 面试进行中 / 已完成 ──
  if (sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <main className="max-w-4xl mx-auto px-4 py-8">
          {completed ? (
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100/50">
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">面试完成</h2>
                <p className="text-emerald-100">AI 已对本次面试进行全面评估</p>
              </div>
              {summary && (
                <div className="p-8">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 rounded-2xl p-5 text-center">
                      <div className="text-3xl font-bold text-blue-600">{summary.total_questions || questions.length}</div>
                      <div className="text-xs text-slate-500 mt-1">总问题数</div>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-5 text-center">
                      <div className="text-3xl font-bold text-emerald-600">{questions.length}</div>
                      <div className="text-xs text-slate-500 mt-1">已完成</div>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-5 text-center">
                      <div className="flex justify-center gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-5 h-5 ${i <= scoreToStars(finalScore) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <div className="text-xs text-slate-500">综合评分</div>
                    </div>
                  </div>
                  {summary.summary && (
                    <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                      <h3 className="font-semibold text-slate-700 mb-2">AI 面试总结</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{summary.summary}</p>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <Button onClick={handleRestart} variant="outline" className="flex-1 h-12 rounded-xl">
                      <RefreshCw className="w-4 h-4 mr-2" /> 重新面试
                    </Button>
                    <Button onClick={() => navigate('/interview/history')} className="flex-1 h-12 bg-slate-800 hover:bg-slate-700 rounded-xl">
                      <History className="w-4 h-4 mr-2" /> 查看历史
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : evaluation ? (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
                <div className="bg-slate-800 px-6 py-4">
                  <div className="text-xs text-slate-400 mb-1">问题 {currentIndex + 1}</div>
                  <div className="text-base font-medium text-white">{currentQuestion?.question}</div>
                </div>
                <div className="p-4 text-xs text-slate-500 bg-slate-50 flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><span className="font-medium text-blue-600">考察要点：</span>{currentQuestion?.focus}</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
                <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-sm font-semibold text-slate-700">你的回答</span>
                </div>
                <div className="p-6"><p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">{answer}</p></div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-lg overflow-hidden border border-emerald-200">
                <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center"><Check className="w-5 h-5 text-white" /></div>
                    <div><div className="text-sm font-semibold text-slate-800">AI 评估</div><div className="text-xs text-slate-500">多维度分析</div></div>
                  </div>
                  <div className="bg-white rounded-xl px-4 py-2 shadow-sm"><span className="text-xs text-slate-500">评分 </span><span className="font-bold text-2xl text-emerald-600">{evaluation.score}</span><span className="text-xs text-slate-400">/10</span></div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-white/80 rounded-xl p-4">
                    <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">评估详情</div>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{evaluation.evaluation}</p>
                  </div>
                  {evaluation.standard_answer && (
                    <div className="bg-white/80 rounded-xl p-4 border border-emerald-100">
                      <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">参考答案</div>
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{evaluation.standard_answer}</p>
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleNextQuestion} className="w-full h-14 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-base font-semibold">
                {currentIndex + 1 >= questions.length ? '查看结果' : '下一题'} <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                  <div className="flex items-center justify-between mb-3">
                    <div><div className="text-xs text-indigo-200">问题 {currentIndex + 1} / {questions.length}</div></div>
                    <div className="flex gap-1">{questions.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i <= currentIndex ? 'bg-white' : 'bg-white/30'}`} />)}</div>
                  </div>
                  <div className="text-lg font-semibold text-white leading-snug">{currentQuestion?.question}</div>
                </div>
                <div className="p-4 text-sm text-slate-600 bg-indigo-50 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span><span className="font-medium text-indigo-600">考察要点：</span>{currentQuestion?.focus}</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
                <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" /><span className="text-sm font-semibold text-slate-700">你的回答</span>
                </div>
                <div className="p-6">
                  <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="输入你的回答..." rows={6} className="resize-none border-slate-200 focus:border-indigo-500 rounded-xl text-base" />
                  <div className="flex justify-between items-center mt-3 text-sm text-slate-400"><span>建议至少 50 字</span><span>{answer.length} 字</span></div>
                </div>
              </div>
              <Button onClick={handleSubmitAnswer} disabled={!answer.trim() || submitting || answer.length < 10}
                className="w-full h-14 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-base font-semibold disabled:opacity-50">
                {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />提交中...</> : <><Send className="w-5 h-5 mr-2" />提交回答</>}
              </Button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ── 面试设置主页 ──
  const inProgressRecords = records.filter(r => r.status === 'in_progress');
  const recentRecords = records.filter(r => r.status === 'completed').slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4" /> AI 模拟面试
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">面试训练</h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm">基于你的简历生成针对性问题，AI 多维度评估你的回答</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：简历卡片 + 历史 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 简历选择 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700">选择简历</h2>
                <button onClick={() => navigate('/editor')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> 新建
                </button>
              </div>

              {resumes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/60 p-10 text-center">
                  <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm mb-4">还没有简历</p>
                  <Button onClick={() => navigate('/editor')} size="sm" className="h-9 bg-slate-800 hover:bg-slate-700 text-xs">
                    创建简历
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {resumes.map(resume => {
                    const t = themes[resume.theme_id] || themes[0];
                    const sel = selectedResume?.id === resume.id;
                    return (
                      <button
                        key={resume.id}
                        onClick={() => setSelectedResume(resume)}
                        className={`w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                          sel ? 'border-indigo-500 shadow-md shadow-indigo-500/10' : 'border-slate-200/60 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 p-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                            style={{ background: t.colors.header }}>
                            {resume.title.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-800 truncate">{resume.title}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{t.name}</div>
                          </div>
                          {sel && <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-white" /></div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 进行中的面试 */}
            {inProgressRecords.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  进行中的面试
                </h2>
                <div className="space-y-2">
                  {inProgressRecords.map(r => (
                    <button key={r.id} onClick={() => handleContinueInterview(r)}
                      className="w-full text-left bg-white rounded-xl border border-amber-200/60 p-3 hover:border-amber-300 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-700 truncate">{r.resume_title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{r.job_position || '未指定职位'} · {r.total_questions} 题</div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600 text-xs font-medium group-hover:gap-2 transition-all">
                          继续 <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 最近历史 */}
            {recentRecords.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-700">最近面试</h2>
                  <button onClick={() => navigate('/interview/history')} className="text-xs text-slate-400 hover:text-slate-600">全部</button>
                </div>
                <div className="space-y-1.5">
                  {recentRecords.map(r => (
                    <button key={r.id} onClick={() => navigate(`/interview/history/${r.id}`)}
                      className="w-full text-left flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/60 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-slate-600 truncate">{r.resume_title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {r.job_position || '未指定'} · {new Date(r.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 ml-3">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`w-2.5 h-2.5 ${i <= scoreToStars(r.overall_score) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：面试设置 */}
          <div className="lg:col-span-2 space-y-5">
            {/* 已选简历 */}
            {selectedResume ? (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-white">
                  <div className="text-xs text-indigo-200 mb-1">已选择简历</div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-white/70" />
                    <span className="font-semibold">{selectedResume.title}</span>
                    <span className="text-xs text-indigo-200 ml-auto">{themes[selectedResume.theme_id]?.name}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center">
                <MessageCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">从左侧选择一份简历开始面试</p>
              </div>
            )}

            {/* 设置 */}
            {selectedResume && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">目标职位 <span className="text-slate-400 font-normal">（可选）</span></label>
                  <Input value={jobPosition} onChange={(e) => setJobPosition(e.target.value)} placeholder="如：高级前端工程师、Java 开发..." className="h-10 border-slate-200 rounded-xl text-sm" />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">题目数量</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 8, 10].map(num => (
                      <button key={num} onClick={() => setQuestionCount(num)}
                        className={`py-3 rounded-xl text-center transition-all text-sm ${
                          questionCount === num ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>
                        <span className="font-bold text-lg">{num}</span>
                        <span className="text-xs opacity-70 ml-0.5">题</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">预计 <span className="font-medium text-slate-700">{questionCount * 3}-{questionCount * 5} 分钟</span></span>
                </div>

                <Button onClick={handleStartInterview} disabled={starting}
                  className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold">
                  {starting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />准备中...</> : <><Play className="w-4 h-4 mr-2" />开始面试</>}
                </Button>
              </div>
            )}

            {/* 说明 */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200/60 p-5">
              <h3 className="text-sm font-semibold text-amber-800 mb-3">面试流程</h3>
              <div className="space-y-2.5 text-sm text-amber-700">
                <div className="flex items-start gap-2"><span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold text-amber-700 flex-shrink-0 mt-0.5">1</span><span>AI 根据简历生成针对性面试问题</span></div>
                <div className="flex items-start gap-2"><span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold text-amber-700 flex-shrink-0 mt-0.5">2</span><span>每道题限时回答，模拟真实面试场景</span></div>
                <div className="flex items-start gap-2"><span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold text-amber-700 flex-shrink-0 mt-0.5">3</span><span>AI 多维度评估并给出参考答案</span></div>
                <div className="flex items-start gap-2"><span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold text-amber-700 flex-shrink-0 mt-0.5">4</span><span>面试结束后生成完整总结报告</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
