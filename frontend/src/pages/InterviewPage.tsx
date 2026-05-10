import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi, interviewApi, type Resume } from '@/lib/resumes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Play, ArrowLeft, Check, MessageCircle, Send, RefreshCw, FileText, Star, Target, Zap, Trophy } from 'lucide-react';


export default function InterviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30 animate-pulse">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  // 面试进行中或已完成
  if (sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <main className="max-w-4xl mx-auto px-4 py-8">
          {completed ? (
            // 面试完成页面
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100/50">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">面试完成！</h2>
                  <p className="text-emerald-100">恭喜你完成了本次模拟面试</p>
                </div>

                {/* Stats */}
                {summary && (
                  <div className="p-8">
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 text-center border border-blue-100">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{summary.total_questions || questions.length}</div>
                        <div className="text-xs text-slate-500 font-medium">总问题数</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 text-center border border-emerald-100">
                        <div className="text-3xl font-bold text-emerald-600 mb-1">{questions.length}</div>
                        <div className="text-xs text-slate-500 font-medium">已完成</div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 text-center border border-amber-100">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i <= finalScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">综合评分</div>
                      </div>
                    </div>

                    {/* Summary text if available */}
                    {summary.summary && (
                      <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                        <h3 className="font-semibold text-slate-700 mb-2">面试总结</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{summary.summary}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                      <Button
                        onClick={handleRestart}
                        variant="outline"
                        className="flex-1 h-12 rounded-xl border-2 border-slate-200 hover:bg-slate-50"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        重新面试
                      </Button>
                      <Button
                        onClick={() => navigate('/interview/history')}
                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        查看历史
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : evaluation ? (
            // 显示评估结果
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* 问题卡片 */}
              <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100/50">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">当前问题</div>
                      <div className="text-sm font-medium text-white">{currentQuestion?.question}</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
                    <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span><span className="text-blue-600 font-medium">考察要点：</span>{currentQuestion?.focus}</span>
                  </div>
                </div>
              </div>

              {/* 你的回答 */}
              <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100/50">
                <div className="px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-sm font-semibold text-slate-700">你的回答</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{answer}</p>
                </div>
              </div>

              {/* 评估结果 */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl shadow-lg overflow-hidden border border-emerald-200">
                <div className="px-6 py-5 border-b border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">评估结果</div>
                        <div className="text-xs text-slate-500">AI 智能分析</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-emerald-100">
                      <span className="text-xs text-slate-500">评分 </span>
                      <span className="font-bold text-2xl text-emerald-600">{evaluation.score}</span>
                      <span className="text-xs text-slate-400">/10</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-white/80 backdrop-blur rounded-xl p-4">
                    <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">评估详情</div>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{evaluation.evaluation}</p>
                  </div>
                  {evaluation.standard_answer && (
                    <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-emerald-100">
                      <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        参考答案
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{evaluation.standard_answer}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <Button
                onClick={handleNextQuestion}
                className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/25 rounded-2xl text-base font-semibold"
              >
                {currentIndex + 1 >= questions.length ? '查看结果' : '下一题'}
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
              </Button>
            </div>
          ) : (
            // 回答问题界面
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* 问题卡片 */}
              <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100/50">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-blue-200">问题 {currentIndex + 1}</div>
                        <div className="text-sm font-medium text-white">{questions.length - currentIndex - 1} 题剩余</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {questions.map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i <= currentIndex ? 'bg-white' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-white leading-snug">
                    {currentQuestion?.question}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-2 text-sm text-slate-600 bg-blue-50 rounded-xl p-4">
                    <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span><span className="text-blue-600 font-medium">考察要点：</span>{currentQuestion?.focus}</span>
                  </div>
                </div>
              </div>

              {/* 回答输入 */}
              <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100/50">
                <div className="px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm font-semibold text-slate-700">你的回答</span>
                  </div>
                </div>
                <div className="p-6">
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="请输入你的回答..."
                    rows={6}
                    className="resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-base"
                  />
                  <div className="flex justify-between items-center mt-3 text-sm text-slate-400">
                    <span>建议至少 50 字</span>
                    <span>{answer.length} 字</span>
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <Button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || submitting || answer.length < 10}
                className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/25 rounded-2xl text-base font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4" />
            AI 智能面试
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            模拟
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">面试训练</span>
          </h1>
          <p className="text-slate-500 max-w-md mx-auto">
            基于你的简历生成针对性问题，AI 实时评估你的回答表现
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* 左侧：简历列表 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">选择简历</h2>
              <span className="text-sm text-slate-400">{resumes.length} 份</span>
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100/50">
              {resumes.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 mb-4">还没有简历</p>
                  <Button
                    onClick={() => navigate('/editor')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    创建新简历
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[450px] overflow-auto">
                  {resumes.map(resume => {
                    const isSelected = selectedResume?.id === resume.id;
                    return (
                      <button
                        key={resume.id}
                        onClick={() => setSelectedResume(resume)}
                        className={`w-full p-4 text-left transition-all duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500'
                            : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium truncate ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                              {resume.title}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              更新于 {new Date(resume.updated_at).toLocaleDateString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：面试设置 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 已选简历卡片 */}
            {selectedResume && (
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white/80" />
                  </div>
                  <div>
                    <div className="text-sm text-white/60">已选择简历</div>
                    <div className="font-semibold text-lg">{selectedResume.title}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 设置卡片 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100/50">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  面试设置
                </h3>
              </div>

              {!selectedResume ? (
                <div className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500">请从左侧选择一份简历开始面试</p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* 目标职位 */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">目标职位（可选）</label>
                    <Input
                      value={jobPosition}
                      onChange={(e) => setJobPosition(e.target.value)}
                      placeholder="如：前端工程师、Java开发..."
                      className="h-12 border-slate-200 focus:border-blue-500 rounded-xl text-base"
                    />
                    <p className="text-xs text-slate-400">AI 将根据职位调整问题难度和方向</p>
                  </div>

                  {/* 问题数量 */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">问题数量</label>
                    <div className="grid grid-cols-4 gap-3">
                      {[3, 5, 8, 10].map(num => (
                        <button
                          key={num}
                          onClick={() => setQuestionCount(num)}
                          className={`py-4 rounded-xl text-center transition-all duration-200 ${
                            questionCount === num
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <div className="text-2xl font-bold">{num}</div>
                          <div className="text-xs opacity-70">题</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 预估时间 */}
                  <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Target className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">预估时长</div>
                      <div className="text-xs text-slate-500">约 {questionCount * 3}-{questionCount * 5} 分钟</div>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartInterview}
                    disabled={starting}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/25 rounded-2xl text-base font-semibold"
                  >
                    {starting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        准备中...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        开始面试
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* 说明卡片 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                面试说明
              </h3>
              <ul className="text-sm text-amber-700 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <span>基于你的简历内容生成针对性问题</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <span>每道题回答后获得 AI 评估和参考答案</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <span>面试结束后查看整体表现和详细总结</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
