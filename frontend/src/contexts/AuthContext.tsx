import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  phone: string;
  status: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isGuest: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, nickname?: string) => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api/v1';

async function authRequest(endpoint: string, body?: unknown) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(API_BASE_URL + endpoint, {
    method: body ? 'POST' : 'GET',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => localStorage.getItem('is_guest') === 'true');

  useEffect(() => {
    if (token) {
      authRequest('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await authRequest('/auth/login', { username, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const register = async (username: string, email: string, password: string, nickname?: string) => {
    const res = await authRequest('/auth/register', { username, email, password, nickname });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    setIsGuest(false);
    localStorage.removeItem('is_guest');
  };

  const guestLogin = async () => {
    const res = await authRequest('/auth/guest', {});
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('is_guest', 'true');
    setToken(res.data.token);
    setUser(res.data.user);
    setIsGuest(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('is_guest');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isGuest, login, register, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
