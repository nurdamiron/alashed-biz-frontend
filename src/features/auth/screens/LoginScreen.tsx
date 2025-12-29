import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !email) return;

    setIsLoading(true);
    setError(false);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#000000] text-white relative overflow-hidden font-display selection:bg-primary/30">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[100px] animate-float-delay"></div>
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[80px] animate-pulse"></div>
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[400px] flex flex-col items-center">
          {/* Logo Section */}
          <div className="mb-12 flex flex-col items-center relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <span className="text-4xl font-black tracking-tight text-primary mb-6 relative z-10 animate-breathe drop-shadow-[0_0_15px_rgba(19,91,236,0.5)]">
              ALASHED
            </span>
            <div className="flex flex-col items-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Alashed Business
              </h1>
              <p className="text-[11px] font-bold text-primary/80 uppercase tracking-[0.4em] border border-primary/20 px-3 py-1 rounded-full bg-primary/5 backdrop-blur-sm">
                Авторизация
              </p>
            </div>
          </div>

          {/* Login Form Card */}
          <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-black/50 relative overflow-hidden group">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">
                  Email
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center text-gray-500 group-focus-within/input:text-primary transition-colors">
                    <Icon name="mail" className="text-[20px]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-16 pl-14 pr-6 bg-black/20 border border-white/10 rounded-2xl font-medium text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/5 focus:shadow-[0_0_20px_rgba(19,91,236,0.1)] transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Пароль
                  </label>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center text-gray-500 group-focus-within/input:text-primary transition-colors">
                    <Icon
                      name={error ? 'gpp_bad' : 'lock'}
                      className={`text-[20px] ${error ? 'text-red-500' : ''}`}
                    />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full h-16 pl-14 pr-6 bg-black/20 border rounded-2xl font-medium text-white placeholder-white/20 focus:outline-none transition-all duration-300 ${
                      error
                        ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                        : 'border-white/10 focus:border-primary/50 focus:bg-white/5 focus:shadow-[0_0_20px_rgba(19,91,236,0.1)]'
                    }`}
                  />
                </div>
                {error && (
                  <div className="flex items-center justify-center gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                    <p className="text-red-400 text-[11px] font-medium">
                      Неверный email или пароль
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !password || !email}
                className="group/btn relative w-full h-16 mt-4 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 overflow-hidden shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-2xl"></div>
                <div className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="text-sm font-bold uppercase tracking-widest text-white">
                        Войти
                      </span>
                      <Icon
                        name="arrow_forward"
                        className="text-[18px] group-hover/btn:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>

          <p className="mt-8 text-white/20 text-xs font-medium tracking-wide">
            © 2024 Alashed Business
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginScreen;
