import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  FileText,
  Sparkles,
  Download,
  Eye,
  Edit,
  RotateCcw,
  Code,
  Bot,
  Menu,
  X,
} from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';
import ResumeForm from '@/components/ResumeForm';
import ResumePreview from '@/components/ResumePreview';
import PDFDownloader from '@/components/PDFDownloader';
import { useAuth } from '@/contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEditor, setShowEditor] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        {
          id: '1',
          category: '编程语言',
          items: ['JavaScript', 'TypeScript', 'Python', 'Go', 'SQL']
        },
        {
          id: '2',
          category: '前端框架',
          items: ['React', 'Vue', 'Next.js', 'Webpack', 'Vite']
        },
        {
          id: '3',
          category: '后端技术',
          items: ['Node.js', 'Express', 'Django', 'GraphQL', 'Redis']
        },
        {
          id: '4',
          category: '云与DevOps',
          items: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform']
        }
      ],
      awards: [
        {
          id: '1',
          title: '年度最佳员工',
          organization: '字节跳动',
          date: '2023-12',
          description: '因在技术架构改进和团队建设方面的突出贡献获奖'
        },
        {
          id: '2',
          title: '技术创新奖',
          organization: '阿里巴巴',
          date: '2020-09',
          description: '开发的前端性能监控工具被全集团推广使用'
        }
      ],
      languages: [
        { id: '1', name: '中文', level: '母语' },
        { id: '2', name: '英语', level: '流利' },
        { id: '3', name: '日语', level: '基础' }
      ]
    });
  };

  const resetData = () => {
    setResumeData(defaultResumeData);
  };

  if (showEditor) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={() => setShowEditor(false)}>
                  <FileText className="w-4 h-4 mr-2" />
                  返回
                </Button>
                <div className="h-6 w-px bg-slate-300" />
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    简历大师
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadSampleData}
                  className="hidden sm:flex text-slate-600 hover:text-slate-900"
                >
                  <Sparkles size={14} className="mr-2" />
                  示例
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetData}
                  className="hidden sm:flex text-slate-600 hover:text-slate-900"
                >
                  <RotateCcw size={14} className="mr-2" />
                  重置
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

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isPreviewMode ? (
            /* Preview Mode - Full Page Preview */
            <div className="flex flex-col items-center space-y-6">
              <div className="w-full max-w-md">
                <PDFDownloader resumeData={resumeData} filename={`${resumeData.personalInfo.name || 'resume'}`} />
              </div>
              <div className="w-full flex justify-center bg-slate-200/50 rounded-lg p-4">
                <ResumePreview data={resumeData} />
              </div>
            </div>
          ) : (
            /* Edit Mode - Split View */
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              {/* Form Section */}
              <div className="order-2 xl:order-1 xl:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 py-4 border-b border-slate-200">
                    <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Edit size={18} className="text-slate-500" />
                      编辑简历
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">填写以下信息，右侧将实时预览</p>
                  </div>
                  <div className="p-6">
                    <ResumeForm data={resumeData} setData={setResumeData} />
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="order-1 xl:order-2 xl:col-span-3 xl:sticky xl:top-20 xl:h-fit space-y-4">
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
                      <div className="w-40">
                        <PDFDownloader resumeData={resumeData} filename={`${resumeData.personalInfo.name || 'resume'}`} />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                <div>
                  <ResumePreview data={resumeData} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                简历大师
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                功能
              </a>
              <a href="#tech" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                技术栈
              </a>
              <a href="#about" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                关于
              </a>
              {user ? (
                <Button
                  onClick={() => navigate('/resumes')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  进入简历
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  开始创建
                </Button>
              )}
            </div>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-blue-100 px-4 py-4 space-y-3">
            <a href="#features" className="block text-slate-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
              功能
            </a>
            <a href="#tech" className="block text-slate-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
              技术栈
            </a>
            <a href="#about" className="block text-slate-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
              关于
            </a>
            <Button
              onClick={() => { setShowEditor(true); setMobileMenuOpen(false); }}
              className="w-full bg-blue-600"
            >
              开始创建
            </Button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            专为程序员打造的简历生成器
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            轻松创建专业
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              程序员简历
            </span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            在线编辑、实时预览、一键导出 PDF。专为互联网技术岗位设计，突出你的技术能力和项目经验。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setShowEditor(true)}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              立即开始
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto"
              onClick={() => { loadSampleData(); setShowEditor(true); }}
            >
              查看示例
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              强大功能，轻松上手
            </h2>
            <p className="text-slate-600">
              从填写到导出，全程流畅体验
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <FileText className="w-6 h-6" />, title: '在线编辑', description: '直观的表单界面，实时预览，所见即所得' },
              { icon: <Download className="w-6 h-6" />, title: 'PDF 导出', description: '一键生成高质量 PDF，方便投递招聘平台' },
              { icon: <Sparkles className="w-6 h-6" />, title: 'AI 优化', description: '智能优化简历内容，提升面试通过率' },
              { icon: <Code className="w-6 h-6" />, title: '程序员专属', description: '专为互联网技术岗位设计，突出技术能力' },
            ].map((feature, idx) => (
              <Card key={idx} className="border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech" className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            支持的技术标签
          </h2>
          <p className="text-slate-600 mb-10">
            预设常见技术栈，快速选择
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Vue', 'Node.js', 'Python', 'Go', 'Java', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Git'].map((tech, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">
                为什么选择 Poker？
              </h2>
              <div className="space-y-6">
                {[
                  { icon: <Code className="w-5 h-5" />, title: '专为程序员设计', desc: '深入了解互联网技术岗位需求，帮你更好地展示技术能力和项目经验' },
                  { icon: <Bot className="w-5 h-5" />, title: 'AI 智能优化', desc: '接入 MiniMax M2.5 大模型，智能优化简历内容，提升面试通过率' },
                  { icon: <Download className="w-5 h-5" />, title: '完全免费', desc: '无需注册，所有功能免费使用。生成高质量 PDF，方便投递' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">{item.title}</h3>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-80 bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
                <div className="flex flex-col items-center text-center py-8">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">立即体验</h3>
                  <p className="text-slate-600 mb-6">创建你的第一份专业简历</p>
                  <Button onClick={() => setShowEditor(true)} className="bg-blue-600 hover:bg-blue-700">
                    开始创建
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-blue-100">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">Poker</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Poker. 专为程序员打造的简历生成器。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
