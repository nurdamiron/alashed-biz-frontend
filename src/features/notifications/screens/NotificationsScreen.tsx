import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, PullToRefresh } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const NotificationsScreen = () => {
  const navigate = useNavigate();
  const { notifications, clearNotifications, refreshData } = useAppContext();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const filtered =
    activeTab === 'unread' ? notifications.filter((n: any) => !n.read) : notifications;

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div
          className="px-5 pb-4"
          style={{
            paddingTop: 'max(1rem, calc(1rem + env(safe-area-inset-top)))'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-slate-900 dark:text-white active:scale-90 transition-all"
            >
              <Icon name="arrow_back_ios_new" className="text-[18px]" />
            </button>
            <div className="text-center">
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                Центр событий
              </p>
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Уведомления
              </h2>
            </div>
            <button
              onClick={clearNotifications}
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-primary active:scale-90 transition-all"
            >
              <Icon name="done_all" className="text-[18px]" />
            </button>
          </div>
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-surface-dark text-primary shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              Все ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'unread'
                  ? 'bg-white dark:bg-surface-dark text-primary shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              Новые ({notifications.filter((n: any) => !n.read).length})
            </button>
          </div>
        </div>
      </header>

      <PullToRefresh onRefresh={refreshData} className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 space-y-4 pb-32">
        {filtered.length > 0 ? (
          filtered.map((n: any) => (
            <div
              key={n.id}
              className={`rounded-[2rem] bg-white dark:bg-surface-dark p-5 shadow-sm border transition-all ${
                !n.read ? 'border-primary/30' : 'border-gray-100 dark:border-white/5'
              }`}
            >
              <div className="flex gap-4">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    n.type === 'alert' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                  }`}
                >
                  <Icon name="notifications" filled className="text-[24px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">{n.type}</span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {n.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <Icon name="notifications_off" className="text-5xl text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-sm font-bold text-gray-400">Нет уведомлений</p>
          </div>
        )}
      </PullToRefresh>
    </div>
  );
};

export default NotificationsScreen;
