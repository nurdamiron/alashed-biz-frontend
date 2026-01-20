import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import type { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('alash_token');
      const auth = localStorage.getItem('alash_auth');

      if (token && auth) {
        try {
          const userData = JSON.parse(auth);
          setIsAuthenticated(true);
          setUser(userData);
        } catch (e) {
          console.error('Auth init error:', e);
          localStorage.removeItem('alash_token');
          localStorage.removeItem('alash_auth');
        }
      }
      setIsLoading(false);
    };

    init();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.auth.login(username, password);
      if (response.success && response.data) {
        const { accessToken, refreshToken, user: userData } = response.data;
        localStorage.setItem('alash_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('alash_refresh_token', refreshToken);
        }
        localStorage.setItem('alash_auth', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
        return true;
      }
      toast.error('Ошибка входа: Неверные данные');
      return false;
    } catch (e) {
      console.error('Login error:', e);
      toast.error('Ошибка входа: Сервер недоступен');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('alash_token');
    localStorage.removeItem('alash_refresh_token');
    localStorage.removeItem('alash_auth');
    setIsAuthenticated(false);
    setUser(null);
    toast('Вы вышли из системы', { icon: '👋' });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
