import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import { AIHubModal } from '@/features/ai';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { stats, formatPrice, appName, theme, notifications } = useAppContext();
  const [showAIHub, setShowAIHub] = useState(false);

  const isDark = theme === 'dark';
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`flex-1 overflow-y-auto no-scrollbar pb-32 transition-colors duration-300 ${
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-30 backdrop-blur-xl px-6 pt-12 pb-6 transition-colors ${
        isDark ? 'bg-slate-900/80' : 'bg-slate-50/80'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={isDark ? '/logo-dark.png' : '/logo-light.png'}
              alt="Logo"
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAIHub(true)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-white'
                  : 'bg-black/5 hover:bg-black/10 text-slate-700'
              }`}
            >
              <Icon name="auto_awesome" className="text-xl" />
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-white'
                  : 'bg-black/5 hover:bg-black/10 text-slate-700'
              }`}
            >
              <Icon name="notifications" className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 pt-2 space-y-8">
        {/* Main Revenue Card */}
        <section className={`rounded-3xl p-6 ${
          isDark
            ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
        }`}>
          <p className="text-sm font-medium text-white/70 mb-1">Общая выручка</p>
          <h2 className="text-4xl font-black text-white tracking-tight mb-4">
            {formatPrice(stats.revenue)}
          </h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-semibold text-white">
              +12% за месяц
            </span>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/orders')}
            className={`rounded-2xl p-5 cursor-pointer active:scale-95 transition-all ${
              isDark
                ? 'bg-slate-800/50 border border-white/5'
                : 'bg-white border border-slate-200/50 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-amber-500/10' : 'bg-amber-50'
              }`}>
                <Icon name="pending" className="text-amber-500" />
              </div>
              <Icon name="arrow_forward" className={`text-sm ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            </div>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {stats.pendingOrders}
            </p>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Ожидают
            </p>
          </div>

          <div
            onClick={() => navigate('/inventory')}
            className={`rounded-2xl p-5 cursor-pointer active:scale-95 transition-all ${
              isDark
                ? 'bg-slate-800/50 border border-white/5'
                : 'bg-white border border-slate-200/50 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stats.lowStockCount > 0
                  ? isDark ? 'bg-red-500/10' : 'bg-red-50'
                  : isDark ? 'bg-green-500/10' : 'bg-green-50'
              }`}>
                <Icon
                  name={stats.lowStockCount > 0 ? 'warning' : 'check_circle'}
                  className={stats.lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}
                />
              </div>
              <Icon name="arrow_forward" className={`text-sm ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            </div>
            <p className={`text-2xl font-black ${
              stats.lowStockCount > 0 ? 'text-red-500' : isDark ? 'text-white' : 'text-slate-800'
            }`}>
              {stats.lowStockCount}
            </p>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Мало на складе
            </p>
          </div>

          <div
            onClick={() => navigate('/tasks')}
            className={`rounded-2xl p-5 cursor-pointer active:scale-95 transition-all ${
              isDark
                ? 'bg-slate-800/50 border border-white/5'
                : 'bg-white border border-slate-200/50 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <Icon name="task_alt" className="text-blue-500" />
              </div>
              <Icon name="arrow_forward" className={`text-sm ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            </div>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {stats.activeTasksCount}
            </p>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Активных задач
            </p>
          </div>

          <div
            onClick={() => navigate('/orders')}
            className={`rounded-2xl p-5 cursor-pointer active:scale-95 transition-all ${
              isDark
                ? 'bg-slate-800/50 border border-white/5'
                : 'bg-white border border-slate-200/50 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-purple-500/10' : 'bg-purple-50'
              }`}>
                <Icon name="shopping_bag" className="text-purple-500" />
              </div>
              <Icon name="arrow_forward" className={`text-sm ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            </div>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {stats.totalOrders || 0}
            </p>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Всего заказов
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Быстрые действия
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: 'add_shopping_cart', label: 'Заказ', path: '/orders/new' },
              { icon: 'add_task', label: 'Задача', path: '/tasks/new' },
              { icon: 'inventory_2', label: 'Товар', path: '/inventory/new' },
              { icon: 'warehouse', label: 'Склад', path: '/warehouse' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all active:scale-95 ${
                  isDark
                    ? 'bg-slate-800/50 border border-white/5 hover:bg-slate-800'
                    : 'bg-white border border-slate-200/50 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Icon name={action.icon} className="text-white text-lg" />
                </div>
                <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* AI Assistant */}
        <section
          onClick={() => setShowAIHub(true)}
          className={`rounded-2xl p-5 cursor-pointer active:scale-[0.98] transition-all ${
            isDark
              ? 'bg-gradient-to-r from-slate-800 to-slate-800/50 border border-white/5'
              : 'bg-gradient-to-r from-slate-100 to-white border border-slate-200/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Icon name="auto_awesome" className="text-white text-2xl" />
            </div>
            <div className="flex-1">
              <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                AI Ассистент
              </h4>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Задайте вопрос о бизнесе
              </p>
            </div>
            <Icon name="arrow_forward" className={isDark ? 'text-slate-600' : 'text-slate-300'} />
          </div>
        </section>
      </div>

      {showAIHub && <AIHubModal onClose={() => setShowAIHub(false)} />}
    </div>
  );
};

export default DashboardScreen;
