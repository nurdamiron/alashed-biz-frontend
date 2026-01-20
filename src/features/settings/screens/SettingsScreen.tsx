import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, ThemeToggle, PushNotificationToggle, PullToRefresh } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { logout, appName, businessDomain, setAppConfig, user, refreshData } = useAppContext();

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
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div
          className="px-5 pb-3"
          style={{
            paddingTop: 'max(1.25rem, calc(1.25rem + env(safe-area-inset-top)))'
          }}
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Настройки
          </h1>
        </div>
      </header>

      <PullToRefresh onRefresh={refreshData} className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 space-y-6 pb-40">
        {/* Profile Section */}
        <section className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {user?.name || 'Администратор'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email || 'admin@alashed.kz'}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary">
              {user?.role || 'Admin'}
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <ThemeToggle variant="card" />

        {/* Push Notifications Section */}
        <section className="bg-white dark:bg-surface-dark rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
          <div className="p-5">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              Уведомления
            </h3>
            <PushNotificationToggle />
          </div>
        </section>

        {/* App Config Section */}
        <section className="bg-white dark:bg-surface-dark rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Настройки приложения
              </h3>
              <button
                onClick={() => (isEditingConfig ? saveConfig() : setIsEditingConfig(true))}
                className="text-primary text-xs font-bold"
              >
                {isEditingConfig ? 'Сохранить' : 'Изменить'}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Название
                </label>
                <input
                  disabled={!isEditingConfig}
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Описание бизнеса
                </label>
                <input
                  disabled={!isEditingConfig}
                  value={localDomain}
                  onChange={(e) => setLocalDomain(e.target.value)}
                  placeholder="Например: Магазин электроники"
                  className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Links */}
        <section className="bg-white dark:bg-surface-dark rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
          <div className="p-5">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
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
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all active:scale-[0.98] hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5">
                      <Icon name={item.icon} className="text-lg text-gray-500 dark:text-gray-400" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {item.label}
                    </span>
                  </div>
                  <Icon name="chevron_right" className="text-gray-300 dark:text-gray-600" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Logout Section */}
        <section className="bg-white dark:bg-surface-dark rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-5 transition-all active:scale-[0.98] hover:bg-red-50 dark:hover:bg-red-500/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Icon name="logout" className="text-red-500 text-2xl" />
              </div>
              <div className="text-left">
                <p className="font-bold text-red-500">Выйти</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Завершить сессию
                </p>
              </div>
            </div>
            <Icon name="chevron_right" className="text-red-300" />
          </button>
        </section>

        {/* Version */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-300 dark:text-gray-700">
            Alashed Business v2.5.0
          </p>
        </div>
      </PullToRefresh>
    </div>
  );
};

export default SettingsScreen;
