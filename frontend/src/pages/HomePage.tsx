import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Sparkles,
  Download,
  Code,
  Bot,
  Wand2,
  Palette,
  Rocket,
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  Eye,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { themes } from '@/styles/resumeThemes';
import ResumePreview from '@/components/ResumePreview';
import { sampleResumeData } from '@/lib/sampleResumeData';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState(0);

  const handleStart = () => {
    if (user) {
      navigate('/resumes');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧文字 */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                专为程序员打造的简历生成器
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                轻松创建
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  专业简历
                </span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
                简洁大方的设计，实时预览，一键导出 PDF。让你的简历在招聘眼中脱颖而出。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-6 h-auto"
                >
                  <Rocket className="mr-2 w-5 h-5" />
                  立即开始
                </Button>
                {!user && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="border-blue-400 text-blue-300 hover:bg-blue-500/20 hover:text-white hover:border-blue-300 text-lg px-8 py-6 h-auto"
                  >
                    <Sparkles className="mr-2 w-5 h-5" />
                    立即登录
                  </Button>
                )}
              </div>
            </div>

            {/* 右侧简历预览 */}
            <div className="flex justify-center">
              <div className="relative">
                {/* 装饰效果 */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500" style={{ width: '360px', height: '510px' }}>
                  <ResumePreview data={sampleResumeData} themeId={selectedTheme} scale={0.67} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部波浪 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* 模板展示 */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              <span className="flex items-center justify-center gap-3">
                <Palette className="w-8 h-8 text-blue-600" />
                多款精美模板
              </span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              多种风格可选，蓝色商务、简约现代、彩色渐变，总有一款适合你
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {themes.map((theme, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedTheme === index
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedTheme(index)}
              >
                <CardContent className="p-2">
                  <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white">
                    <div className="w-full" style={{ height: '180px' }}>
                      <ResumePreview data={sampleResumeData} themeId={index} scale={0.33} />
                    </div>
                    {/* 模板名称 */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-center text-sm font-medium">{theme.name}</p>
                    </div>
                    {/* 选中标识 */}
                    {selectedTheme === index && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" onClick={handleStart} className="bg-blue-600 hover:bg-blue-700">
              使用模板创建简历
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 功能特点 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              <span className="flex items-center justify-center gap-3">
                <Target className="w-8 h-8 text-blue-600" />
                核心功能
              </span>
            </h2>
            <p className="text-slate-600">从创建到导出，全程轻松搞定</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Wand2 className="w-8 h-8" />,
                title: 'AI 智能优化',
                description: '接入大模型，智能优化简历内容，突出你的核心优势',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: '多款模板',
                description: '多种精美模板可选，蓝色商务、简约现代，总有一款适合你',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: <Eye className="w-8 h-8" />,
                title: '实时预览',
                description: '编辑过程中实时预览最终效果，所见即所得',
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: <Download className="w-8 h-8" />,
                title: '一键导出',
                description: '一键生成高质量 PDF，直接投递招聘平台',
                color: 'bg-orange-50 text-orange-600',
              },
            ].map((feature, idx) => (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-8 text-center">
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
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

      {/* 技术栈 */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">支持的技术标签</h2>
          <p className="text-slate-600 mb-10">预设常见技术栈，快速选择</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Vue', 'Node.js', 'Python', 'Go', 'Java', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Git', 'TypeScript', 'Next.js', 'MongoDB', 'GraphQL', 'Rust', 'Swift'].map((tech, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 为什么选择我们 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">为什么选择 Kvee？</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: <Code className="w-6 h-6" />,
                    title: '专为程序员设计',
                    desc: '深入了解互联网技术岗位需求，帮你更好地展示技术能力和项目经验',
                  },
                  {
                    icon: <Bot className="w-6 h-6" />,
                    title: 'AI 智能优化',
                    desc: '接入 MiniMax 大模型，智能优化简历内容，提升面试通过率',
                  },
                  {
                    icon: <Star className="w-6 h-6" />,
                    title: '完全免费',
                    desc: '无需注册，所有功能免费使用。生成高质量 PDF，方便投递',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
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
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-2xl opacity-20"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-2xl">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-12 h-12 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">立即体验</h3>
                    <p className="text-slate-400 mb-6">创建你的第一份专业简历</p>
                    <Button onClick={handleStart} className="bg-blue-500 hover:bg-blue-600">
                      开始创建
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">Kvee</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Kvee. 专为程序员打造的简历生成器。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
