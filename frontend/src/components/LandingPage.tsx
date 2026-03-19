import { useState, useEffect } from 'react';
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
  ChevronRight,
  Star,
  Zap,
  Shield,
  ArrowRight
} from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';
import ResumeForm from '@/components/ResumeForm';
import ResumePreview from '@/components/ResumePreview';
import PDFDownloader from '@/components/PDFDownloader';
import { useAuth } from '@/contexts/AuthContext';
import { sampleResumeData } from '@/lib/sampleResumeData';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEditor, setShowEditor] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>(sampleResumeData);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadSampleData = () => {
    setResumeData(sampleResumeData);
  };

  const resetData = () => {
    setResumeData(defaultResumeData);
  };

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-white">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditor(false)}
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  返回
                </Button>
                <div className="h-6 w-px bg-blue-200" />
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-blue-sm">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Kvee
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadSampleData}
                  className="hidden sm:flex text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Sparkles size={14} className="mr-2" />
                  示例
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetData}
                  className="hidden sm:flex text-slate-600 hover:text-red-600 hover:bg-red-50"
                >
                  <RotateCcw size={14} className="mr-2" />
                  重置
                </Button>
                <div className="h-6 w-px bg-blue-200 hidden sm:block" />
                <Button
                  variant={isPreviewMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`gap-2 ${!isPreviewMode && 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
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
            <div className="flex flex-col items-center space-y-6 animate-fade-in">
              <div className="w-full max-w-md">
                <PDFDownloader resumeData={resumeData} filename={`${resumeData.personalInfo.name || 'resume'}`} />
              </div>
              <div className="w-full flex justify-center bg-blue-50/50 rounded-xl p-4">
                <ResumePreview data={resumeData} />
              </div>
            </div>
          ) : (
            /* Edit Mode - Split View */
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              {/* Form Section */}
              <div className="order-2 xl:order-1 xl:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 px-6 py-4 border-b border-blue-100">
                    <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Edit size={18} className="text-blue-500" />
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
              <div className="order-1 xl:order-2 xl:col-span-3 xl:sticky xl:top-20 xl:h-fit space-y-4 hidden xl:block">
                <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-sm">
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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-blue-100'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-blue-sm">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Kvee
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
                  className="bg-blue-600 hover:bg-blue-700 shadow-blue-sm btn-animate"
                >
                  进入简历
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700 shadow-blue-sm btn-animate"
                >
                  开始创建
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-blue-100 px-4 py-4 space-y-3 animate-fade-in">
            <a href="#features" className="block text-slate-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>
              功能
            </a>
            <a href="#tech" className="block text-slate-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>
              技术栈
            </a>
            <a href="#about" className="block text-slate-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>
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
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 mr-2" />
            专为程序员打造的简历生成器
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            轻松创建专业
            <br />
            <span className="text-gradient-blue">
              程序员简历
            </span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            在线编辑、实时预览、一键导出 PDF。专为互联网技术岗位设计，突出你的技术能力和项目经验。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button
              size="lg"
              onClick={() => user ? navigate('/resumes') : navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto shadow-blue btn-animate"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              {user ? '进入编辑器' : '立即开始'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-blue-300 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto"
              onClick={() => { loadSampleData(); setShowEditor(true); }}
            >
              查看示例
            </Button>
          </div>

          {/* 信任指标 */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm">完全免费</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">数据安全</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="text-sm">AI 优化</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              强大功能，轻松上手
            </h2>
            <p className="text-slate-600 text-lg">
              从填写到导出，全程流畅体验
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Edit className="w-6 h-6" />, title: '在线编辑', description: '直观的表单界面，实时预览，所见即所得' },
              { icon: <Download className="w-6 h-6" />, title: 'PDF 导出', description: '一键生成高质量 PDF，方便投递招聘平台' },
              { icon: <Sparkles className="w-6 h-6" />, title: 'AI 优化', description: '智能优化简历内容，提升面试通过率' },
              { icon: <Code className="w-6 h-6" />, title: '程序员专属', description: '专为互联网技术岗位设计，突出技术能力' },
            ].map((feature, idx) => (
              <Card key={idx} className="card-hover border-blue-100 bg-white/90">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
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
      <section id="tech" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            支持的技术标签
          </h2>
          <p className="text-slate-600 mb-12 text-lg">
            预设常见技术栈，快速选择
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Vue', 'Node.js', 'Python', 'Go', 'Java', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Git', 'TypeScript', 'GraphQL', 'MongoDB'].map((tech, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-4 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                为什么选择简历大师？
              </h2>
              <div className="space-y-6">
                {[
                  { icon: <Code className="w-5 h-5" />, title: '专为程序员设计', desc: '深入了解互联网技术岗位需求，帮你更好地展示技术能力和项目经验' },
                  { icon: <Bot className="w-5 h-5" />, title: 'AI 智能优化', desc: '接入 MiniMax M2.5 大模型，智能优化简历内容，提升面试通过率' },
                  { icon: <Download className="w-5 h-5" />, title: '完全免费', desc: '无需注册，所有功能免费使用。生成高质量 PDF，方便投递' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
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
              <div className="w-80 bg-white rounded-2xl shadow-xl p-6 border border-blue-100 card-hover">
                <div className="flex flex-col items-center text-center py-8">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">立即体验</h3>
                  <p className="text-slate-600 mb-6">创建你的第一份专业简历</p>
                  <Button
                    onClick={() => user ? navigate('/resumes') : navigate('/login')}
                    className="bg-blue-600 hover:bg-blue-700 shadow-blue-sm btn-animate"
                  >
                    {user ? '进入编辑器' : '开始创建'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white shadow-blue-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              准备好创建你的简历了吗？
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              加入数千名程序员，使用简历大师打造专业简历
            </p>
            <Button
              size="lg"
              onClick={() => user ? navigate('/resumes') : navigate('/login')}
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto shadow-lg btn-animate"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              {user ? '进入编辑器' : '免费开始'}
            </Button>
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
            <span className="text-lg font-bold text-slate-800">简历大师</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 简历大师. 专为程序员打造的简历生成器。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
