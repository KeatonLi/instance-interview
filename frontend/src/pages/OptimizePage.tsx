import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi } from '@/lib/resumes';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Check, FileText } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';
import Navbar from '@/components/Navbar';

interface OptimizeType {
  value: string;
  label: string;
  desc: string;
}

const optimizeTypes: OptimizeType[] = [
  { value: 'wording', label: '措辞优化', desc: '使描述更专业、简洁有力' },
  { value: 'keywords', label: '关键词增强', desc: '增强 ATS 关键词通过率' },
  { value: 'quantify', label: '成就量化', desc: '量化工作成果，突出业绩' },
  { value: 'all', label: '全部', desc: '综合优化所有方面' },
];

type ContentType = 'work_experience' | 'project' | 'education' | 'award';

interface SectionConfig {
  type: ContentType;
  label: string;
  getContent: (data: ResumeData) => Array<{ id: string; title: string; content: string }>;
}

const sectionConfigs: SectionConfig[] = [
  {
    type: 'work_experience',
    label: '工作经历',
    getContent: (data) => data.workExperience.map(exp => ({
      id: exp.id,
      title: exp.company || '未命名公司',
      content: exp.description || '',
    })),
  },
  {
    type: 'project',
    label: '项目经验',
    getContent: (data) => data.projects.map(proj => ({
      id: proj.id,
      title: proj.name || '未命名项目',
      content: proj.description || '',
    })),
  },
  {
    type: 'education',
    label: '教育背景',
    getContent: (data) => data.education.map(edu => ({
      id: edu.id,
      title: edu.school || '未命名学校',
      content: edu.description || '',
    })),
  },
  {
    type: 'award',
    label: '荣誉奖项',
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
  const [activeSection, setActiveSection] = useState<ContentType>('work_experience');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<{ original: string; optimized: string; changes: string[] } | null>(null);

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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：简历列表 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="font-medium text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                选择简历
              </h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-auto">
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
                    onClick={() => handleSelectResume(resume)}
                    className={`w-full p-4 text-left transition-all ${
                      selectedResume && resumes.some(r => r.id === resume.id)
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

          {/* 右侧：优化界面 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="font-medium text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                智能优化
              </h2>
            </div>

            {!selectedResume ? (
              <div className="p-12 text-center text-slate-400">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">请从左侧选择一份简历开始优化</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* 标签页 */}
                <Tabs
                  value={activeSection}
                  onValueChange={(v) => {
                    setActiveSection(v as ContentType);
                    setSelectedId(null);
                    setResult(null);
                  }}
                >
                  <TabsList className="grid w-full grid-cols-4 h-10 bg-slate-100 rounded-lg p-1">
                    {sectionConfigs.map(config => (
                      <TabsTrigger
                        key={config.type}
                        value={config.type}
                        className="text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        {config.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {sectionConfigs.map(config => (
                    <TabsContent key={config.type} value={config.type} className="space-y-3 mt-4">
                      <label className="text-xs font-medium text-slate-500">选择要优化的条目</label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                        {config.getContent(selectedResume).map(item => (
                          <button
                            key={item.id}
                            onClick={() => { setSelectedId(item.id); setResult(null); }}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              selectedId === item.id
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="text-xs font-medium text-slate-700 truncate">{item.title}</div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.content || '暂无内容'}</div>
                          </button>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                {/* 优化类型选择 */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">优化类型</label>
                  <div className="grid grid-cols-2 gap-2">
                    {optimizeTypes.map(type => (
                      <button
                        key={type.value}
                        className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-left transition-all"
                      >
                        <div className="text-xs font-medium text-slate-700">{type.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 原文 */}
                {selectedId && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">原文</label>
                    <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 max-h-24 overflow-auto">
                      {selectedItem?.content || '暂无内容'}
                    </div>
                  </div>
                )}

                {/* 优化结果 */}
                {result && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <Check size={12} />
                      优化后
                    </label>
                    <div className="p-3 bg-emerald-50 rounded-lg text-xs text-slate-700 max-h-40 overflow-auto whitespace-pre-wrap">
                      {result.optimized}
                    </div>
                    {result.changes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.changes.map((change, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                            {change}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleOptimize}
                    disabled={!selectedId || !selectedItem?.content || optimizing}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {optimizing ? (
                      <>
                        <Loader2 size={14} className="mr-1.5 animate-spin" />
                        优化中...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="mr-1.5" />
                        开始优化
                      </>
                    )}
                  </Button>
                  {result && (
                    <Button
                      onClick={handleApply}
                      variant="outline"
                      className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Check size={14} className="mr-1.5" />
                      应用
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}