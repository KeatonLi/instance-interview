import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Sparkles,
  Download,
  Code,
  Bot,
  Wand2,
  Palette,
  Rocket,
  CheckCircle,
  ArrowRight,
  Star,
  Eye,
  Zap,
  Shield,
  FileUp,
  Layers3,
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

      {/* Hero Section - 更紧凑 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* 左侧文字 */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium mb-5">
                <Sparkles className="w-3 h-3 mr-1.5" />
                专为程序员打造
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                轻松创建
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> 专业简历</span>
              </h1>
              <p className="text-slate-300 mb-6 max-w-lg mx-auto lg:mx-0 text-sm lg:text-base">
                简洁设计 · 实时预览 · 一键导出 PDF · AI 智能优化，让你的简历在竞争中脱颖而出
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-5 h-auto text-sm font-medium"
                >
                  <Rocket className="mr-2 w-4 h-4" />
                  立即开始
                </Button>
                {!user && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="border-blue-400/50 text-blue-300 hover:bg-blue-500/20 hover:text-white px-6 py-5 h-auto text-sm"
                  >
                    登录账号
                  </Button>
                )}
              </div>
            </div>

            {/* 右侧简历预览 - 缩小 */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur-lg opacity-20"></div>
                <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden" style={{ width: '300px', height: '420px' }}>
                  <ResumePreview data={sampleResumeData} themeId={selectedTheme} scale={0.56} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 统计数据栏 */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '5+', label: '精美模板' },
              { value: '100%', label: '免费使用' },
              { value: '1键', label: 'PDF 导出' },
              { value: 'AI', label: '智能优化' },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-2xl lg:text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-xs lg:text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 模板展示 - 更紧凑 */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                选择模板风格
              </h2>
              <p className="text-sm text-slate-500 mt-1">点击切换，实时预览效果</p>
            </div>
            <Button size="sm" onClick={handleStart} className="bg-blue-600 hover:bg-blue-700 text-xs">
              开始使用 <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {themes.map((theme, index) => (
              <div
                key={index}
                className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                  selectedTheme === index
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedTheme(index)}
              >
                <div className="bg-white" style={{ height: '140px' }}>
                  <ResumePreview data={sampleResumeData} themeId={index} scale={0.26} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs font-medium text-center">{theme.name}</p>
                </div>
                {selectedTheme === index && (
                  <div className="absolute top-1.5 right-1.5 bg-blue-500 text-white rounded-full p-0.5">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 - 网格布局更紧凑 */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            核心功能
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Wand2 className="w-5 h-5" />, title: 'AI 智能优化', desc: '大模型智能优化，突出核心优势', color: 'bg-purple-50 text-purple-600' },
              { icon: <Palette className="w-5 h-5" />, title: '多款模板', desc: '5种风格可选，总有一款适合你', color: 'bg-blue-50 text-blue-600' },
              { icon: <Eye className="w-5 h-5" />, title: '实时预览', desc: '编辑过程所见即所得', color: 'bg-green-50 text-green-600' },
              { icon: <Download className="w-5 h-5" />, title: '一键导出', desc: '生成高质量 PDF 直接投递', color: 'bg-orange-50 text-orange-600' },
              { icon: <FileUp className="w-5 h-5" />, title: 'PDF 导入', desc: '自动解析现有 PDF 简历', color: 'bg-cyan-50 text-cyan-600' },
              { icon: <Layers3 className="w-5 h-5" />, title: '多简历管理', desc: '管理多份简历版本', color: 'bg-indigo-50 text-indigo-600' },
              { icon: <Shield className="w-5 h-5" />, title: '数据安全', desc: '本地处理，数据加密存储', color: 'bg-emerald-50 text-emerald-600' },
              { icon: <Code className="w-5 h-5" />, title: '技术友好', desc: '专为程序员设计的简历模板', color: 'bg-slate-100 text-slate-600' },
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-default">
                <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">{feature.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 技术栈标签 */}
      <section className="py-10 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-semibold text-slate-600 mb-4">支持的技术标签</h2>
          <div className="flex flex-wrap gap-2">
            {['React', 'Vue', 'Node.js', 'Python', 'Go', 'Java', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Git', 'TypeScript', 'Next.js', 'MongoDB', 'GraphQL', 'Rust', 'Swift', 'Flutter', 'TensorFlow', 'Vue3', 'Nuxt', 'Spring Boot', 'Flutter', 'Koa'].map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 为什么选择我们 */}
      <section className="py-12 px-4 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-5">为什么选择 Kvee？</h2>
              <div className="space-y-4">
                {[
                  { icon: <Code className="w-5 h-5" />, title: '专为程序员设计', desc: '深入了解互联网技术岗位需求，帮你更好地展示技术能力和项目经验' },
                  { icon: <Bot className="w-5 h-5" />, title: 'AI 智能优化', desc: '接入 MiniMax 大模型，智能优化简历内容，提升面试通过率' },
                  { icon: <Star className="w-5 h-5" />, title: '完全免费', desc: '无需注册，所有功能免费使用。生成高质量 PDF，方便投递' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA 卡片 */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-xl w-full max-w-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">开始创建</h3>
                    <p className="text-slate-400 text-xs">免费注册，即刻拥有</p>
                  </div>
                </div>
                <Button onClick={handleStart} className="w-full bg-blue-500 hover:bg-blue-600 text-sm py-5">
                  创建我的简历 <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 px-4 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Kvee</span>
            <span className="text-xs text-slate-400 ml-2">© 2026</span>
          </div>
          <p className="text-xs text-slate-500">专为程序员打造的简历生成器</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
