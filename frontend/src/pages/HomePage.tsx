import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Sparkles, Download, Code, Bot, User } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleStart = () => {
    if (user) {
      navigate('/resumes');
    } else {
      navigate('/login');
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      await guestLogin();
      navigate('/resumes');
    } catch (error) {
      console.error('Guest login failed:', error);
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Poker
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
                <Button onClick={handleStart}>
                  我的简历
                </Button>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" onClick={handleGuestLogin}>
                    游客登录
                  </Button>
                  <Button onClick={handleStart}>
                    开始创建
                  </Button>
                </div>
              )}
            </div>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <span>X</span> : <span>Menu</span>}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-blue-100 px-4 py-4 space-y-3">
            <a href="#features" className="block text-slate-600">功能</a>
            <a href="#tech" className="block text-slate-600">技术栈</a>
            <a href="#about" className="block text-slate-600">关于</a>
            {user ? (
              <Button onClick={handleStart} className="w-full">
                我的简历
              </Button>
            ) : (
              <div className="space-y-2">
                <Button variant="outline" onClick={handleGuestLogin} className="w-full">
                  游客登录
                </Button>
                <Button onClick={handleStart} className="w-full">
                  开始创建
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

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
            <Button size="lg" onClick={handleStart} className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto">
              <Sparkles className="mr-2 w-5 h-5" />
              立即开始
            </Button>
            {!user && (
              <Button size="lg" variant="outline" onClick={handleGuestLogin} disabled={guestLoading} className="text-lg px-8 py-6 h-auto">
                <User className="mr-2 w-5 h-5" />
                游客体验
              </Button>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">强大功能，轻松上手</h2>
            <p className="text-slate-600">从填写到导出，全程流畅体验</p>
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

      <section id="tech" className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">支持的技术标签</h2>
          <p className="text-slate-600 mb-10">预设常见技术栈，快速选择</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Vue', 'Node.js', 'Python', 'Go', 'Java', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Git'].map((tech, idx) => (
              <span key={idx} className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">为什么选择 Poker？</h2>
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
                  <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700">
                    开始创建
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

export default HomePage;
