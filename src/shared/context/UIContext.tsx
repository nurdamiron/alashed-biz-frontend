import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface UIContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  appName: string;
  businessDomain: string;
  setAppConfig: (name: string, domain: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  isWsConnected: boolean;
  setIsWsConnected: (connected: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('alash_theme') as 'light' | 'dark' | null;
    return savedTheme || 'light';
  });

  const [appName, setAppName] = useState('ALASHED');
  const [businessDomain, setBusinessDomain] = useState('Склад электроники и робототехники');
  const [currency, setCurrencyState] = useState<string>(() => {
    const savedCurrency = localStorage.getItem('alash_currency');
    return savedCurrency || 'KZT';
  });
  const [isWsConnected, setIsWsConnected] = useState(false);

  // Apply theme to DOM on mount and changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('alash_theme', theme);

    // Update mobile browser theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#fcfcfd');
    }
  }, [theme]);

  // Load config from localStorage
  useEffect(() => {
    const config = localStorage.getItem('alash_config');
    if (config) {
      try {
        const { name, domain } = JSON.parse(config);
        if (name) setAppName(name);
        if (domain) setBusinessDomain(domain);
      } catch (e) {
        console.error('Config parse error:', e);
      }
    }
  }, []);

  // Sync theme with backend after auth
  useEffect(() => {
    if (isAuthenticated) {
      const syncTheme = async () => {
        try {
          const userData = await api.auth.me();
          if (userData?.preferences?.theme) {
            const backendTheme = userData.preferences.theme as 'light' | 'dark';
            if (backendTheme !== theme) {
              setTheme(backendTheme);
            }
          }
        } catch (error) {
          console.log('Could not sync theme from backend');
        }
      };
      syncTheme();
    }
  }, [isAuthenticated]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Save to backend if authenticated (non-blocking)
    if (isAuthenticated) {
      try {
        await api.auth.updatePreferences(newTheme);
      } catch (error) {
        console.error('Failed to update theme preference on backend:', error);
      }
    }
  };

  const setAppConfig = (name: string, domain: string) => {
    setAppName(name);
    setBusinessDomain(domain);
    localStorage.setItem('alash_config', JSON.stringify({ name, domain }));
    toast.success('Настройки обновлены');
  };

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('alash_currency', newCurrency);
    toast.success('Валюта обновлена');
  };

  return (
    <UIContext.Provider value={{
      theme,
      toggleTheme,
      appName,
      businessDomain,
      setAppConfig,
      currency,
      setCurrency,
      isWsConnected,
      setIsWsConnected,
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};
