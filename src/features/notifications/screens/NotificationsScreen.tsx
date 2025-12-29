import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const NotificationsScreen = () => {
  const navigate = useNavigate();
  const { notifications, clearNotifications } = useAppContext();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const filtered =
    activeTab === 'unread' ? notifications.filter((n: any) => !n.read) : notifications;

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark transition-colors duration-300 overflow-hidden">
      <header className="flex-none bg-white dark:bg-surface-dark px-6 pt-8 pb-6 border-b border-gray-100 dark:border-white/5 z-20">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="h-11 w-11 rounded-2xl bg-gray-50 dark:bg-background-dark flex items-center justify-center border border-gray-100 dark:border-white/5"
          >
            <Icon name="arrow_back_ios_new" className="text-[18px]" />
          </button>
          <div className="text-center">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-0.5">
              Event Hub
            </p>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">
              Уведомления
            </h2>
          </div>
          <button
            onClick={clearNotifications}
            className="h-11 w-11 rounded-2xl bg-gray-50 dark:bg-background-dark flex items-center justify-center border border-gray-100 dark:border-white/5 text-primary"
          >
            <Icon name="done_all" className="text-[18px]" />
          </button>
        </div>
        <div className="flex bg-gray-100 dark:bg-background-dark p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${
              activeTab === 'all'
                ? 'bg-white dark:bg-surface-dark text-primary shadow-sm'
                : 'text-gray-400'
            }`}
          >
            Все ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${
              activeTab === 'unread'
                ? 'bg-white dark:bg-surface-dark text-primary shadow-sm'
                : 'text-gray-400'
            }`}
          >
            Новые ({notifications.filter((n: any) => !n.read).length})
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-32">
        {filtered.length > 0 ? (
          filtered.map((n: any) => (
            <div
              key={n.id}
              className={`relative rounded-[2.2rem] bg-white dark:bg-surface-dark p-6 shadow-sm border transition-all ${
                !n.read ? 'border-primary/20 bg-primary/5' : 'border-gray-100 dark:border-white/5'
              }`}
            >
              <div className="flex gap-5">
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    n.type === 'alert' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                  }`}
                >
                  <Icon name="notifications" filled className="text-[26px]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[8px] font-black uppercase text-gray-400">{n.type}</span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-text-secondary leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center opacity-30">
            <Icon name="notifications_off" className="text-6xl mb-4" />
            <p className="text-sm font-black uppercase tracking-widest">Нет событий</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsScreen;
