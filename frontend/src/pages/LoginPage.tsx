import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, User, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/resumes');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setGuestLoading(true);
    try {
      await guestLogin();
      navigate('/resumes');
    } catch (err) {
      setError(err instanceof Error ? err.message : '游客登录失败');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col">
      <Navbar showNav={false} />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg mb-4">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">登录 Kvee</h1>
            <p className="text-slate-400 text-sm mt-1">管理你的专业简历</p>
          </div>

          {/* 表单卡片 */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">用户名或邮箱</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="输入用户名或邮箱"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="输入密码"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-medium" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '登录'}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                className="w-full py-2.5 text-sm border-slate-200 hover:bg-slate-50"
                onClick={handleGuestLogin}
                disabled={guestLoading}
              >
                {guestLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <User className="w-4 h-4 mr-2" />}
                游客登录
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              <span className="text-slate-500">还没有账号？</span>
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium ml-1 inline-flex items-center">
                立即注册 <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>

          {/* 底部提示 */}
          <p className="text-center text-slate-500 text-xs mt-6">
            登录即表示同意我们的服务条款
          </p>
        </div>
      </div>
    </div>
  );
}
