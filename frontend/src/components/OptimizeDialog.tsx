import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Check } from 'lucide-react';
import type { ResumeData } from '@/types/resume';

interface OptimizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeData;
  onApply: (data: ResumeData) => void;
  onOptimize: (content: string, type: string) => Promise<{ original: string; optimized: string; changes: string[] }>;
}

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
  setContent: (data: ResumeData, id: string, content: string) => ResumeData;
}

const sectionConfigs: SectionConfig[] = [
  {
    type: 'work_experience',
    label: '工作经历',
    getContent: (data) => data.workExperience.map(exp => ({
      id: exp.id,
      title: exp.company || '未命名公司',
      content: exp.description || exp.achievements?.join('\n') || '',
    })),
    setContent: (data, id, content) => ({
      ...data,
      workExperience: data.workExperience.map(exp =>
        exp.id === id ? { ...exp, description: content } : exp
      ),
    }),
  },
  {
    type: 'project',
    label: '项目经验',
    getContent: (data) => data.projects.map(proj => ({
      id: proj.id,
      title: proj.name || '未命名项目',
      content: proj.description || '',
    })),
    setContent: (data, id, content) => ({
      ...data,
      projects: data.projects.map(proj =>
        proj.id === id ? { ...proj, description: content } : proj
      ),
    }),
  },
  {
    type: 'education',
    label: '教育背景',
    getContent: (data) => data.education.map(edu => ({
      id: edu.id,
      title: edu.school || '未命名学校',
      content: edu.description || '',
    })),
    setContent: (data, id, content) => ({
      ...data,
      education: data.education.map(edu =>
        edu.id === id ? { ...edu, description: content } : edu
      ),
    }),
  },
  {
    type: 'award',
    label: '荣誉奖项',
    getContent: (data) => data.awards.map(award => ({
      id: award.id,
      title: award.title || '未命名奖项',
      content: award.description || '',
    })),
    setContent: (data, id, content) => ({
      ...data,
      awards: data.awards.map(award =>
        award.id === id ? { ...award, description: content } : award
      ),
    }),
  },
];

export default function OptimizeDialog({
  open,
  onOpenChange,
  resumeData,
  onApply,
  onOptimize,
}: OptimizeDialogProps) {
  // Don't render if dialog is not open
  if (!open) return null;

  const [activeSection, setActiveSection] = useState<ContentType>('work_experience');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<{ original: string; optimized: string; changes: string[] } | null>(null);

  const currentConfig = sectionConfigs.find(c => c.type === activeSection)!;
  const items = currentConfig.getContent(resumeData);
  const selectedItem = items.find(i => i.id === selectedId);

  const handleOptimize = async () => {
    if (!selectedItem?.content) return;
    setOptimizing(true);
    try {
      const res = await onOptimize(selectedItem.content, activeSection);
      setResult(res);
    } catch (error) {
      console.error('Optimize failed:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const handleApply = () => {
    if (!selectedId || !result) return;
    const newData = currentConfig.setContent(resumeData, selectedId, result.optimized);
    onApply(newData);
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setSelectedId(null);
    setResult(null);
    setSelectedType('all');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">AI 简历优化</h2>
                <p className="text-blue-100 text-xs">智能优化简历措辞，提升求职竞争力</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {/* Section Tabs */}
          <Tabs value={activeSection} onValueChange={(v) => { setActiveSection(v as ContentType); setSelectedId(null); setResult(null); }}>
            <TabsList className="grid w-full grid-cols-4 h-10 mb-4">
              {sectionConfigs.map(config => (
                <TabsTrigger key={config.type} value={config.type} className="text-xs">
                  {config.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {sectionConfigs.map(config => (
              <TabsContent key={config.type} value={config.type} className="space-y-4">
                {/* Item List */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">选择要优化的条目</label>
                  <div className="grid grid-cols-2 gap-2">
                    {config.getContent(resumeData).map(item => (
                      <button
                        key={item.id}
                        onClick={() => { setSelectedId(item.id); setResult(null); }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedId === item.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-medium text-slate-700 truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.content || '暂无内容'}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optimize Type */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">优化类型</label>
                  <div className="grid grid-cols-2 gap-2">
                    {optimizeTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedType === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-medium text-slate-700">{type.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Result Area */}
          {selectedId && (
            <div className="mt-4 space-y-3">
              {/* Original */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">原文</label>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 max-h-32 overflow-auto">
                  {selectedItem?.content || '暂无内容'}
                </div>
              </div>

              {/* Optimized */}
              {result && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <Check size={12} />
                      优化后
                    </label>
                    <div className="p-3 bg-emerald-50 rounded-xl text-xs text-slate-700 max-h-40 overflow-auto whitespace-pre-wrap">
                      {result.optimized}
                    </div>
                  </div>

                  {/* Changes */}
                  {result.changes.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">优化点</label>
                      <div className="flex flex-wrap gap-1">
                        {result.changes.map((change, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px]">
                            {change}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} className="h-9 text-xs">
            取消
          </Button>
          {!result ? (
            <Button
              onClick={handleOptimize}
              disabled={!selectedId || !selectedItem?.content || optimizing}
              className="h-9 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
          ) : (
            <Button
              onClick={handleApply}
              className="h-9 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Check size={14} className="mr-1.5" />
              应用到简历
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}