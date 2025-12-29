import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, logout, appName, businessDomain, setAppConfig } = useAppContext();

  const [localName, setLocalName] = useState(appName);
  const [localDomain, setLocalDomain] = useState(businessDomain);
  const [isEditingConfig, setIsEditingConfig] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const saveConfig = () => {
    setAppConfig(localName, localDomain);
    setIsEditingConfig(false);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-500">
      <header className="sticky top-0 z-30 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl px-6 pt-12 pb-4 border-b border-transparent dark:border-white/5">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
          Settings
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10 pb-40">
        {/* Domain & Branding */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              Branding & Domain
            </h3>
            <button
              onClick={() => (isEditingConfig ? saveConfig() : setIsEditingConfig(true))}
              className="text-primary text-[10px] font-bold uppercase tracking-widest"
            >
              {isEditingConfig ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">
                App Name
              </label>
              <input
                disabled={!isEditingConfig}
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                className="w-full h-12 px-5 rounded-2xl bg-gray-50 dark:bg-background-dark border-none text-sm font-bold disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Business Domain
              </label>
              <input
                disabled={!isEditingConfig}
                value={localDomain}
                onChange={(e) => setLocalDomain(e.target.value)}
                placeholder="e.g. Clothing Store, Coffee Shop"
                className="w-full h-12 px-5 rounded-2xl bg-gray-50 dark:bg-background-dark border-none text-sm font-bold disabled:opacity-50"
              />
            </div>
          </div>
        </section>

        {/* Interface */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">
            Interface
          </h3>
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`h-14 w-14 rounded-[1.4rem] flex items-center justify-center transition-all ${
                    theme === 'dark'
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'bg-orange-500/10 text-orange-500'
                  }`}
                >
                  <Icon
                    name={theme === 'dark' ? 'nights_stay' : 'light_mode'}
                    className="text-[28px]"
                  />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {theme === 'dark' ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-16 h-9 rounded-full relative transition-all p-1.5 ${
                  theme === 'dark' ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white shadow-xl transition-all duration-500 ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            <div
              onClick={handleLogout}
              className="flex items-center justify-between group cursor-pointer active:scale-95 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-[1.4rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                  <Icon name="logout" className="text-[26px]" />
                </div>
                <div>
                  <p className="text-sm font-black text-red-500">Logout</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    End Session
                  </p>
                </div>
              </div>
              <Icon name="chevron_right" className="text-gray-300" />
            </div>
          </div>
        </section>

        <div className="text-center py-10 opacity-30">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.4em]">
            SYSTEM CORE
          </p>
          <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mt-2">
            v2.5.0-Stable
          </p>
        </div>
      </main>
    </div>
  );
};

export default SettingsScreen;
