import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi } from '@/lib/resumes';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Check, FileText, Wand2, ArrowRight, AlertCircle } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';


interface OptimizeType {
  value: string;
  label: string;
  desc: string;
  icon: string;
}

const optimizeTypes: OptimizeType[] = [
  { value: 'wording', label: '措辞优化', desc: '专业、简洁有力', icon: '✍️' },
  { value: 'keywords', label: '关键词增强', desc: 'ATS通过率提升', icon: '🎯' },
  { value: 'quantify', label: '成就量化', desc: '突出业绩数据', icon: '📊' },
  { value: 'all', label: '全部', desc: '综合优化', icon: '✨' },
];

type ContentType = 'work_experience' | 'project' | 'education' | 'award';

interface SectionConfig {
  type: ContentType;
  label: string;
  icon: string;
  getContent: (data: ResumeData) => Array<{ id: string; title: string; content: string }>;
}

const sectionConfigs: SectionConfig[] = [
  {
    type: 'work_experience',
    label: '工作经历',
    icon: '💼',
    getContent: (data) => data.workExperience.map(exp => ({
      id: exp.id,
      title: exp.company || '未命名公司',
      content: exp.description || '',
    })),
  },
  {
    type: 'project',
    label: '项目经验',
    icon: '🚀',
    getContent: (data) => data.projects.map(proj => ({
      id: proj.id,
      title: proj.name || '未命名项目',
      content: proj.description || '',
    })),
  },
  {
    type: 'education',
    label: '教育背景',
    icon: '🎓',
    getContent: (data) => data.education.map(edu => ({
      id: edu.id,
      title: edu.school || '未命名学校',
      content: edu.description || '',
    })),
  },
  {
    type: 'award',
    label: '荣誉奖项',
    icon: '🏆',
    getContent: (data) => data.awards.map(award => ({
      id: award.id,
      title: award.title || '未命名奖项',
      content: award.description || '',
    })),
  },
];

export default function OptimizePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
  const [selectedResumeTitle, setSelectedResumeTitle] = useState('');
  const [activeSection, setActiveSection] = useState<ContentType>('work_experience');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<{ original: string; optimized: string; changes: string[] } | null>(null);
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadResumes();
  }, [user]);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const res = await resumeApi.getResumes();
      setResumes(res.data.list || []);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (resume: any) => {
    const parsed = {
      personalInfo: resume.personal_info ? JSON.parse(resume.personal_info) : defaultResumeData.personalInfo,
      workExperience: resume.work_experience ? JSON.parse(resume.work_experience) : [],
      projects: resume.projects ? JSON.parse(resume.projects) : [],
      education: resume.education ? JSON.parse(resume.education) : [],
      skills: resume.skills ? JSON.parse(resume.skills) : [],
      awards: resume.awards ? JSON.parse(resume.awards) : [],
      languages: resume.languages ? JSON.parse(resume.languages) : [],
    };
    setSelectedResume(parsed);
    setSelectedResumeTitle(resume.title);
    setSelectedId(null);
    setResult(null);
  };

  const handleOptimize = async () => {
    if (!selectedResume || !selectedId) return;
    const currentConfig = sectionConfigs.find(c => c.type === activeSection)!;
    const item = currentConfig.getContent(selectedResume).find(i => i.id === selectedId);
    if (!item?.content) return;

    setOptimizing(true);
    try {
      const res = await resumeApi.optimizeContent(item.content, activeSection);
      if (res.code === 0) {
        setResult(res.data);
      }
    } catch (error) {
      console.error('Optimize failed:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const handleApply = () => {
    if (!selectedResume || !selectedId || !result) return;
    alert('优化结果已显示，请到编辑器中手动更新简历内容');
  };

  const currentConfig = sectionConfigs.find(c => c.type === activeSection)!;
  const items = selectedResume ? currentConfig.getContent(selectedResume) : [];
  const selectedItem = items.find(i => i.id === selectedId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Wand2 className="w-4 h-4" />
            AI 智能优化
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            简历
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">内容优化</span>
          </h1>
          <p className="text-slate-500 max-w-md mx-auto">
            选择简历和要优化的内容，AI 将为你提供专业级的优化建议
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
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-auto">
                  {resumes.map((resume, idx) => {
                    const isSelected = selectedResumeTitle === resume.title;
                    return (
                      <button
                        key={resume.id}
                        onClick={() => handleSelectResume(resume)}
                        className={`w-full p-4 text-left transition-all duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500'
                            : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                        }`}
                        style={{ animationDelay: `${idx * 50}ms` }}
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
                              {new Date(resume.updated_at).toLocaleDateString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
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

          {/* 右侧：优化界面 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 已选简历卡片 */}
            {selectedResume && (
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white/70" />
                  </div>
                  <div>
                    <div className="text-sm text-white/60">当前简历</div>
                    <div className="font-semibold text-lg">{selectedResumeTitle}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 标签页 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100/50">
              <div className="px-6 pt-6">
                <Tabs
                  value={activeSection}
                  onValueChange={(v) => {
                    setActiveSection(v as ContentType);
                    setSelectedId(null);
                    setResult(null);
                  }}
                >
                  <TabsList className="grid w-full grid-cols-4 h-12 bg-slate-100 rounded-xl p-1">
                    {sectionConfigs.map(config => (
                      <TabsTrigger
                        key={config.type}
                        value={config.type}
                        className="text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600"
                      >
                        <span className="mr-1">{config.icon}</span>
                        {config.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {sectionConfigs.map(config => (
                    <TabsContent key={config.type} value={config.type} className="space-y-4 mt-6">
                      {/* 选择要优化的条目 */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">选择要优化的条目</h3>
                        {selectedResume ? (
                          <div className="grid grid-cols-2 gap-3">
                            {config.getContent(selectedResume).map(item => (
                              <button
                                key={item.id}
                                onClick={() => { setSelectedId(item.id); setResult(null); }}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                  selectedId === item.id
                                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-200/50'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className="font-medium text-slate-800 truncate">{item.title}</div>
                                <div className="text-xs text-slate-400 truncate mt-1">{item.content || '暂无内容'}</div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400 text-center py-4">请先选择简历</div>
                        )}
                      </div>

                      {/* 优化类型选择 */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">选择优化方式</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {optimizeTypes.map(type => (
                            <button
                              key={type.value}
                              onClick={() => setHoveredType(type.value)}
                              onMouseEnter={() => setHoveredType(type.value)}
                              onMouseLeave={() => setHoveredType(null)}
                              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                hoveredType === type.value
                                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-200/50'
                                  : 'border-slate-200 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{type.icon}</span>
                                <span className="font-medium text-slate-800">{type.label}</span>
                              </div>
                              <div className="text-xs text-slate-500">{type.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* 原文 & 优化结果 */}
              <div className="p-6 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
                {selectedId && (
                  <div className="space-y-4">
                    {/* 原文 */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">原文</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {selectedItem?.content || '暂无内容'}
                      </p>
                    </div>

                    {/* 优化结果 */}
                    {result && (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">优化后</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {result.optimized}
                        </p>
                        {result.changes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-emerald-200">
                            {result.changes.map((change, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                {change}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleOptimize}
                    disabled={!selectedId || !selectedItem?.content || optimizing}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 rounded-xl"
                  >
                    {optimizing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        优化中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        开始优化
                      </>
                    )}
                  </Button>
                  {result && (
                    <Button
                      onClick={handleApply}
                      variant="outline"
                      className="h-12 px-6 border-emerald-300 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      应用建议
                    </Button>
                  )}
                </div>

                {!selectedId && selectedResume && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm mt-4 justify-center">
                    <AlertCircle className="w-4 h-4" />
                    请选择一个要优化的条目
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
