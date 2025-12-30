import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, theme, toggleTheme } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !email) return;

    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Неверный email или пароль');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 z-20 w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
          isDark
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-black/5 hover:bg-black/10 text-slate-700'
        }`}
      >
        <Icon name={isDark ? 'light_mode' : 'dark_mode'} className="text-2xl" />
      </button>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-96 h-96 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2 ${
          isDark ? 'bg-blue-500/20' : 'bg-blue-500/30'
        }`} />
        <div className={`absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[128px] translate-x-1/2 translate-y-1/2 ${
          isDark ? 'bg-cyan-500/15' : 'bg-cyan-500/20'
        }`} />
        <div className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse ${
          isDark ? 'bg-indigo-500/10' : 'bg-indigo-500/15'
        }`} />
      </div>

      {/* Grid Pattern */}
      <div
        className={`absolute inset-0 ${isDark ? 'opacity-[0.02]' : 'opacity-[0.03]'}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${isDark ? '%23ffffff' : '%23000000'}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <img
              src={isDark ? '/logo-dark.png' : '/logo-light.png'}
              alt="Alashed"
              className="h-20 w-auto mb-6 drop-shadow-2xl"
            />
            <h1 className={`text-3xl font-black tracking-tight mb-2 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              Добро пожаловать
            </h1>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Войдите в систему управления бизнесом
            </p>
          </div>

          {/* Login Card */}
          <div className={`backdrop-blur-xl border rounded-3xl p-8 shadow-2xl ${
            isDark
              ? 'bg-white/[0.03] border-white/10'
              : 'bg-white/80 border-slate-200/50 shadow-slate-200/50'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ml-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon name="mail" className={`text-xl ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@alashed.kz"
                    autoComplete="email"
                    className={`w-full h-14 pl-12 pr-4 border rounded-xl transition-all focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ml-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Пароль
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon name="lock" className={`text-xl ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full h-14 pl-12 pr-12 border rounded-xl transition-all focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
                      isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <Icon name="error" className="text-red-400 text-lg" />
                  <span className="text-red-400 text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !password || !email}
                className="w-full h-14 mt-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-blue-500/50 disabled:to-cyan-500/50 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Войти
                    <Icon name="login" className="text-lg" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
              <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                или
              </span>
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            </div>

            {/* Demo Credentials */}
            <div className={`border rounded-xl p-4 ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="info" className="text-blue-500 text-lg" />
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Демо доступ
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Email:</span>
                  <button
                    type="button"
                    onClick={() => setEmail('admin@alashed.kz')}
                    className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
                  >
                    admin@alashed.kz
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Пароль:</span>
                  <button
                    type="button"
                    onClick={() => setPassword('admin123')}
                    className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
                  >
                    admin123
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className={`text-center text-xs mt-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            © 2024 Alashed Business. Все права защищены.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginScreen;
