import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, ThemeToggle, PushNotificationToggle } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { theme, logout, appName, businessDomain, setAppConfig, user } = useAppContext();

  const [localName, setLocalName] = useState(appName);
  const [localDomain, setLocalDomain] = useState(businessDomain);
  const [isEditingConfig, setIsEditingConfig] = useState(false);

  const isDark = theme === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const saveConfig = () => {
    setAppConfig(localName, localDomain);
    setIsEditingConfig(false);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-30 backdrop-blur-xl px-6 pt-12 pb-4 bg-background-light/80 dark:bg-background-dark/80">
        <h1 className={`text-2xl font-black tracking-tight ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}>
          Настройки
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-40">
        {/* Profile Section */}
        <section className={`rounded-2xl p-5 ${
          isDark
            ? 'bg-surface-dark border border-white/5'
            : 'bg-white border border-slate-200/50 shadow-sm'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {user?.name || 'Администратор'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {user?.email || 'admin@alashed.kz'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              isDark
                ? 'bg-blue-500/10 text-blue-400'
                : 'bg-blue-50 text-blue-600'
            }`}>
              {user?.role || 'Admin'}
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <ThemeToggle variant="card" />

        {/* Push Notifications Section */}
        <section className={`rounded-2xl overflow-hidden ${
          isDark
            ? 'bg-surface-dark border border-white/5'
            : 'bg-white border border-slate-200/50 shadow-sm'
        }`}>
          <div className="p-5">
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Уведомления
            </h3>
            <PushNotificationToggle />
          </div>
        </section>

        {/* App Config Section */}
        <section className={`rounded-2xl overflow-hidden ${
          isDark
            ? 'bg-surface-dark border border-white/5'
            : 'bg-white border border-slate-200/50 shadow-sm'
        }`}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Настройки приложения
              </h3>
              <button
                onClick={() => (isEditingConfig ? saveConfig() : setIsEditingConfig(true))}
                className="text-blue-500 text-xs font-semibold"
              >
                {isEditingConfig ? 'Сохранить' : 'Изменить'}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Название
                </label>
                <input
                  disabled={!isEditingConfig}
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${
                    isDark
                      ? 'bg-surface-dark border border-white/5 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Описание бизнеса
                </label>
                <input
                  disabled={!isEditingConfig}
                  value={localDomain}
                  onChange={(e) => setLocalDomain(e.target.value)}
                  placeholder="Например: Магазин электроники"
                  className={`w-full h-12 px-4 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${
                    isDark
                      ? 'bg-surface-dark border border-white/5 text-white placeholder:text-slate-600'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Links */}
        <section className={`rounded-2xl overflow-hidden ${
          isDark
            ? 'bg-surface-dark border border-white/5'
            : 'bg-white border border-slate-200/50 shadow-sm'
        }`}>
          <div className="p-5">
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Разделы
            </h3>

            <div className="space-y-2">
              {[
                { icon: 'people', label: 'Сотрудники', path: '/staff' },
                { icon: 'local_shipping', label: 'Поставщики', path: '/suppliers' },
                { icon: 'warehouse', label: 'Склад', path: '/warehouse' },
                { icon: 'analytics', label: 'Аналитика', path: '/analytics' },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all active:scale-[0.98] ${
                    isDark
                      ? 'hover:bg-white/5'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDark ? 'bg-white/5' : 'bg-slate-100'
                    }`}>
                      <Icon name={item.icon} className={`text-lg ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`} />
                    </div>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {item.label}
                    </span>
                  </div>
                  <Icon name="chevron_right" className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Logout Section */}
        <section className={`rounded-2xl overflow-hidden ${
          isDark
            ? 'bg-surface-dark border border-white/5'
            : 'bg-white border border-slate-200/50 shadow-sm'
        }`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-between p-5 transition-all active:scale-[0.98] ${
              isDark ? 'hover:bg-red-500/5' : 'hover:bg-red-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Icon name="logout" className="text-red-500 text-2xl" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-red-500">Выйти</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Завершить сессию
                </p>
              </div>
            </div>
            <Icon name="chevron_right" className="text-red-300" />
          </button>
        </section>

        {/* Version */}
        <div className="text-center py-6">
          <p className={`text-xs ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>
            Alashed Business v2.5.0
          </p>
        </div>
      </main>
    </div>
  );
};

export default SettingsScreen;
