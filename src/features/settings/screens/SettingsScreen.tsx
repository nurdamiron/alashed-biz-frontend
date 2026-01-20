import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, ThemeToggle, PushNotificationToggle, PullToRefresh } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { logout, user, refreshData, currency, setCurrency } = useAppContext();

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currencies = [
    { code: 'KZT', symbol: '₸', name: 'Тенге' },
    { code: 'USD', symbol: '$', name: 'Доллар США' },
    { code: 'RUB', symbol: '₽', name: 'Рубль' },
    { code: 'EUR', symbol: '€', name: 'Евро' },
  ];

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div
          className="flex items-center justify-between px-5 pb-3"
          style={{
            paddingTop: 'max(1rem, calc(1rem + env(safe-area-inset-top)))'
          }}
        >
          <div className="w-10" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
              Меню
            </span>
            <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Настройки
            </h1>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-slate-900 dark:text-white active:scale-90 transition-all"
          >
            <Icon name="notifications" className="text-[20px]" />
          </button>
        </div>
      </header>

      <PullToRefresh onRefresh={refreshData} className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 space-y-6 pb-40">
        {/* Profile Section */}
        <section className="bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] p-6 text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Icon name="person" className="text-[80px]" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[1.5rem] bg-white/20 backdrop-blur-xl flex items-center justify-center text-white font-black text-3xl shadow-xl border border-white/20">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-black leading-none mb-1 truncate">
                  {user?.name || 'Администратор'}
                </h3>
                <p className="text-sm text-blue-100 truncate">
                  {user?.email || 'admin@alashed.kz'}
                </p>
                <div className="mt-2 inline-block px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur">
                  {user?.role === 'admin' ? 'Администратор' : user?.role || 'Пользователь'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">
            Внешний Вид
          </h3>
          <ThemeToggle variant="card" />
        </section>

        {/* Notifications Section */}
        <section>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">
            Уведомления
          </h3>
          <div className="bg-white dark:bg-surface-dark rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 p-5">
            <PushNotificationToggle />
          </div>
        </section>

        {/* Regional Settings */}
        <section>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">
            Регион
          </h3>
          <div className="bg-white dark:bg-surface-dark rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
            <button
              onClick={() => setShowCurrencyModal(true)}
              className="w-full flex items-center justify-between p-5 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Icon name="payments" className="text-emerald-500 text-2xl" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 dark:text-white">Валюта</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentCurrency.name} ({currentCurrency.symbol})
                  </p>
                </div>
              </div>
              <Icon name="chevron_right" className="text-gray-300 dark:text-gray-600" />
            </button>
          </div>
        </section>

        {/* Support Section */}
        <section>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">
            Поддержка
          </h3>
          <div className="bg-white dark:bg-surface-dark rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5">
            <button
              onClick={() => window.open('https://wa.me/77001234567', '_blank')}
              className="w-full flex items-center justify-between p-5 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                  <Icon name="chat" className="text-[#25D366] text-2xl" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 dark:text-white">Написать в WhatsApp</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Быстрый ответ</p>
                </div>
              </div>
              <Icon name="open_in_new" className="text-gray-300 dark:text-gray-600" />
            </button>
            <button className="w-full flex items-center justify-between p-5 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon name="help" className="text-primary text-2xl" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 dark:text-white">Справка</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Руководство пользователя</p>
                </div>
              </div>
              <Icon name="chevron_right" className="text-gray-300 dark:text-gray-600" />
            </button>
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
                <p className="font-bold text-red-500">Выйти из аккаунта</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Завершить текущую сессию
                </p>
              </div>
            </div>
            <Icon name="chevron_right" className="text-red-300" />
          </button>
        </section>

        {/* Version */}
        <div className="flex flex-col items-center py-6 space-y-1">
          <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">
            Alashed Business
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-700">
            Версия 2.5.0
          </p>
        </div>
      </PullToRefresh>

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-t-[2rem] p-6 shadow-2xl border-t border-gray-100 dark:border-white/5 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Выберите валюту
              </h3>
              <button
                onClick={() => setShowCurrencyModal(false)}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 active:scale-90 transition-all"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            <div className="space-y-2">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrency?.(curr.code);
                    setShowCurrencyModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] ${
                    currency === curr.code
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-gray-50 dark:bg-white/5 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black ${
                      currency === curr.code
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-white/10 text-slate-900 dark:text-white'
                    }`}>
                      {curr.symbol}
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${
                        currency === curr.code ? 'text-primary' : 'text-slate-900 dark:text-white'
                      }`}>
                        {curr.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{curr.code}</p>
                    </div>
                  </div>
                  {currency === curr.code && (
                    <Icon name="check_circle" className="text-primary text-2xl" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-6 pb-6">
              <button
                onClick={() => setShowCurrencyModal(false)}
                className="w-full h-14 rounded-2xl bg-gray-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold active:scale-95 transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
