import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Check } from 'lucide-react';
import type { ResumeData } from '@/types/resume';

interface FullOptimizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeData;
  onApply: (data: ResumeData) => void;
  onOptimize: (data: ResumeData) => Promise<{
    original: ResumeData;
    optimized: ResumeData;
    summary: string[];
  }>;
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

export default function FullOptimizeDialog({
  open,
  onOpenChange,
  resumeData,
  onApply,
  onOptimize,
}: FullOptimizeDialogProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<{
    optimized: ResumeData;
    summary: string[];
  } | null>(null);

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const res = await onOptimize(resumeData);
      setResult(res);
    } catch (error) {
      console.error('Full optimize failed:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result.optimized);
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setResult(null);
    setSelectedType('all');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">一键优化整份简历</h2>
                <p className="text-purple-100 text-xs">AI 一次性优化所有简历内容</p>
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
        <div className="p-5 space-y-4">
          {!result ? (
            <>
              <p className="text-sm text-slate-600">
                AI 将分析你的整份简历，对工作经历、项目描述等进行全面优化，提升简历质量和面试通过率。
              </p>

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
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-medium text-slate-700">{type.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Info */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="text-xs font-medium text-slate-500 mb-2">将优化的内容</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {resumeData.workExperience.length > 0 && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Check size={12} className="text-emerald-500" />
                      工作经历 ({resumeData.workExperience.length})
                    </div>
                  )}
                  {resumeData.projects.length > 0 && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Check size={12} className="text-emerald-500" />
                      项目经验 ({resumeData.projects.length})
                    </div>
                  )}
                  {resumeData.education.length > 0 && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Check size={12} className="text-emerald-500" />
                      教育背景 ({resumeData.education.length})
                    </div>
                  )}
                  {resumeData.awards.length > 0 && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Check size={12} className="text-emerald-500" />
                      荣誉奖项 ({resumeData.awards.length})
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-emerald-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Check size={18} />
                  <span className="text-sm font-medium">优化完成！</span>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">优化摘要</label>
                  <div className="flex flex-wrap gap-1">
                    {result.summary.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} className="h-9 text-xs">
            {result ? '关闭' : '取消'}
          </Button>
          {!result ? (
            <Button
              onClick={handleOptimize}
              disabled={optimizing}
              className="h-9 text-xs bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {optimizing ? (
                <>
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                  优化中，请稍候...
                </>
              ) : (
                <>
                  <Sparkles size={14} className="mr-1.5" />
                  一键优化
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