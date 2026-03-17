import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resumeApi } from '@/lib/resumes';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, Sparkles, Eye, Edit, RotateCcw, Save, Loader2, ArrowLeft, Pencil, Palette } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';
import { themes } from '@/styles/resumeThemes';
import ResumeForm from '@/components/ResumeForm';
import ResumePreview from '@/components/ResumePreview';
import PDFDownloader from '@/components/PDFDownloader';

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumeTitle, setResumeTitle] = useState('我的简历');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [themeId, setThemeId] = useState(0);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (id) {
      loadResume(parseInt(id));
    }
  }, [id]);

  const loadResume = async (resumeId: number) => {
    setLoading(true);
    try {
      const res = await resumeApi.getResume(resumeId);
      // 解析后端返回的 JSON 字符串字段
      const resume = res.data;
      setResumeTitle(resume.title || '我的简历');
      setResumeData({
        personalInfo: resume.personal_info ? JSON.parse(resume.personal_info) : {},
        education: resume.education ? JSON.parse(resume.education) : [],
        workExperience: resume.work_experience ? JSON.parse(resume.work_experience) : [],
        projects: resume.projects ? JSON.parse(resume.projects) : [],
        skills: resume.skills ? JSON.parse(resume.skills) : [],
        awards: resume.awards ? JSON.parse(resume.awards) : [],
        languages: resume.languages ? JSON.parse(resume.languages) : [],
      });
    } catch (error) {
      console.error('Failed to load resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      if (id) {
        await resumeApi.updateResume(parseInt(id), {
          title: resumeTitle,
          resume_data: resumeData,
        });
      } else {
        const res = await resumeApi.createResume({
          title: resumeTitle || resumeData.personalInfo.name || '我的简历',
          user_id: user.id,
          resume_data: resumeData,
        });
        navigate(`/editor/${res.data.id}`, { replace: true });
      }
      setHasChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save resume:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeTitle(e.target.value);
    setHasChanges(true);
  };

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    if (id && resumeTitle) {
      try {
        await resumeApi.updateResume(parseInt(id), {
          title: resumeTitle,
        });
      } catch (error) {
        console.error('Failed to update title:', error);
      }
    }
  };

  const handleDataChange = useCallback((newData: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    setResumeData(newData);
    setHasChanges(true);
  }, []);

  const loadSampleData = () => {
    setResumeData({
      personalInfo: {
        name: '张明远',
        title: '全栈开发工程师',
        email: 'zhangmingyuan@email.com',
        phone: '138-1234-5678',
        location: '上海市浦东新区',
        linkedin: 'linkedin.com/in/zhangmingyuan',
        github: 'github.com/zhangmingyuan',
        website: 'zhangmingyuan.dev',
        summary: '拥有5年软件开发经验的全栈工程师，专注于现代Web技术栈。擅长React、Node.js和云原生开发，在多个大型项目中担任技术负责人。热爱开源社区，积极参与技术分享和代码审查。'
      },
      education: [
        {
          id: '1',
          school: '上海交通大学',
          degree: '硕士',
          field: '计算机科学与技术',
          startDate: '2016-09',
          endDate: '2019-06',
          gpa: '3.9/4.0',
          description: '专注于分布式系统和云计算研究，发表SCI论文2篇'
        },
        {
          id: '2',
          school: '浙江大学',
          degree: '本科',
          field: '软件工程',
          startDate: '2012-09',
          endDate: '2016-06',
          gpa: '3.7/4.0',
          description: '获国家奖学金，ACM程序设计竞赛省级一等奖'
        }
      ],
      workExperience: [
        {
          id: '1',
          company: '字节跳动',
          position: '高级前端工程师',
          startDate: '2021-03',
          endDate: '',
          current: true,
          description: '负责抖音电商后台管理系统的前端架构设计和开发工作',
          achievements: [
            '主导微前端架构改造，将单体应用拆分为5个独立模块，构建时间减少70%',
            '设计并实现组件库，被10+团队复用，提升开发效率40%',
            '优化首屏加载性能，LCP从3.2s降低至1.5s'
          ]
        },
        {
          id: '2',
          company: '阿里巴巴',
          position: '前端开发工程师',
          startDate: '2019-07',
          endDate: '2021-02',
          current: false,
          description: '参与淘宝商家后台系统的开发和维护',
          achievements: [
            '负责订单管理模块重构，代码可维护性提升50%',
            '实现自动化测试覆盖率从30%提升至85%',
            '指导3名初级工程师，参与技术面试和团队建设'
          ]
        }
      ],
      projects: [
        {
          id: '1',
          name: '智能代码审查平台',
          role: '项目负责人',
          startDate: '2023-01',
          endDate: '2023-08',
          current: false,
          description: '基于AI的代码审查工具，集成多种代码质量检测规则，支持自动化CR流程',
          technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
          link: 'github.com/zhangmingyuan/code-review-platform'
        }
      ],
      skills: [
        { id: '1', category: '编程语言', items: ['JavaScript', 'TypeScript', 'Python', 'Go', 'SQL'] },
        { id: '2', category: '前端框架', items: ['React', 'Vue', 'Next.js', 'Webpack', 'Vite'] },
        { id: '3', category: '后端技术', items: ['Node.js', 'Express', 'Django', 'GraphQL', 'Redis'] },
        { id: '4', category: '云与DevOps', items: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'] }
      ],
      awards: [
        { id: '1', title: '年度最佳员工', organization: '字节跳动', date: '2023-12', description: '因在技术架构改进和团队建设方面的突出贡献获奖' },
        { id: '2', title: '技术创新奖', organization: '阿里巴巴', date: '2020-09', description: '开发的前端性能监控工具被全集团推广使用' }
      ],
      languages: [
        { id: '1', name: '中文', level: '母语' },
        { id: '2', name: '英语', level: '流利' },
        { id: '3', name: '日语', level: '基础' }
      ]
    });
    setHasChanges(true);
  };

  const resetData = () => {
    setResumeData(defaultResumeData);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/resumes')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                {isEditingTitle ? (
                  <Input
                    value={resumeTitle}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                    autoFocus
                    className="h-8 w-48"
                  />
                ) : (
                  <div
                    className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 rounded px-2 py-1"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <h1 className="text-xl font-bold text-slate-800">{resumeTitle}</h1>
                    <Pencil className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">
                {hasChanges ? '未保存' : lastSaved ? `已保存 ${lastSaved.toLocaleTimeString('zh-CN')}` : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadSampleData}
                className="hidden sm:flex text-slate-600"
              >
                <Sparkles size={14} className="mr-2" />
                示例
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetData}
                className="hidden sm:flex text-slate-600"
              >
                <RotateCcw size={14} className="mr-2" />
                重置
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="text-blue-600 hover:text-blue-700"
              >
                {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
                保存
              </Button>
              <div className="h-6 w-px bg-slate-300 hidden sm:block" />
              <Button
                variant={isPreviewMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="gap-2 shadow-sm"
              >
                {isPreviewMode ? (
                  <>
                    <Edit size={14} />
                    编辑
                  </>
                ) : (
                  <>
                    <Eye size={14} />
                    预览
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isPreviewMode ? (
          <div className="flex flex-col items-center space-y-6">
            {/* 模板切换 */}
            <div className="flex gap-2 p-2 bg-white rounded-lg shadow-sm">
              {themes.map((theme, index) => (
                <button
                  key={index}
                  onClick={() => setThemeId(index)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    themeId === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
            <div className="w-full max-w-md">
              <PDFDownloader resumeData={resumeData} filename={`${resumeData.personalInfo.name || 'resume'}`} />
            </div>
            <div className="w-full flex justify-center">
              <ResumePreview data={resumeData} themeId={themeId} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="order-2 xl:order-1">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 py-4 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Edit size={18} className="text-slate-500" />
                    编辑简历
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">填写以下信息，右侧将实时预览</p>
                </div>
                <div className="p-6">
                  <ResumeForm data={resumeData} setData={handleDataChange} />
                </div>
              </div>
            </div>

            <div className="order-1 xl:order-2 xl:sticky xl:top-20 xl:h-fit space-y-4">
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <Eye size={18} className="text-blue-500" />
                        实时预览
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">最终导出效果</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowThemePicker(!showThemePicker)}
                        className="flex items-center gap-1"
                      >
                        <Palette size={14} />
                        模板
                      </Button>
                      <PDFDownloader resumeData={resumeData} filename={`${resumeData.personalInfo.name || 'resume'}`} />
                    </div>
                  </div>
                </CardHeader>
                {/* 模板选择器 */}
                {showThemePicker && (
                  <CardContent className="pt-0">
                    <div className="flex gap-2 p-2 bg-slate-50 rounded-lg">
                      {themes.map((theme, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setThemeId(index);
                            setShowThemePicker(false);
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            themeId === index
                              ? 'bg-white shadow-sm ring-2 ring-blue-500 text-blue-600'
                              : 'bg-white/50 hover:bg-white text-slate-600'
                          }`}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
              <div>
                <ResumePreview data={resumeData} themeId={themeId} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EditorPage;
