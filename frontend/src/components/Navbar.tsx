import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FileText, Home, User, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  showNav?: boolean;
}

export default function Navbar({ showNav = true }: NavbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/resumes', label: '我的简历', icon: FileText },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-blue-sm">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Kvee
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {showNav && user && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-blue-600 bg-blue-100'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                    {active && (
                      <span className="ml-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">{user.username || user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">退出</span>
                </Button>

                {/* Mobile Menu Button */}
                <button
                  className="md:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                    登录
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-blue-sm btn-animate">
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showNav && user && mobileMenuOpen && (
          <div className="md:hidden border-t border-blue-100 py-3 space-y-2 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-blue-600 bg-blue-100'
                      : 'text-slate-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                  {active && (
                    <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </Link>
              );
            })}
            <div className="flex items-center px-3 py-2 border-t border-blue-50 mt-2 pt-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-slate-600 font-medium">{user.username || user.email}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
