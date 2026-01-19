import { useNavigate } from 'react-router-dom';
import { Icon, PullToRefresh } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { stats, formatPrice, theme, notifications, refreshData } = useAppContext();

  const isDark = theme === 'dark';
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;

  return (
    <PullToRefresh
      onRefresh={refreshData}
      className="flex-1 overflow-y-auto no-scrollbar transition-colors duration-300 bg-background-light dark:bg-background-dark"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-colors">
        <div
          className="flex items-center justify-between px-5 pb-2"
          style={{
            paddingTop: 'max(1.25rem, calc(1.25rem + env(safe-area-inset-top)))'
          }}
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Главная
          </h1>
          <button
            onClick={() => navigate('/notifications')}
            aria-label={`Уведомления${unreadCount > 0 ? `, ${unreadCount} непрочитанных` : ''}`}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm text-slate-900 dark:text-white"
          >
            <Icon name="notifications" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" aria-hidden="true">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="px-5 pt-4 space-y-6 pb-40">
        {/* Main Revenue Card */}
        <section className={`rounded-3xl p-6 ${
          isDark
            ? 'bg-blue-600'
            : 'bg-blue-500'
        }`}>
          <p className="text-sm font-medium text-white/70 mb-1">Общая выручка</p>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {formatPrice(stats.revenue)}
          </h2>
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
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Icon name={action.icon} className="text-white text-lg" />
                </div>
                <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Analytics Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Аналитика
            </h3>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-medium text-blue-500"
            >
              Подробнее
            </button>
          </div>

          <div className="space-y-3">
            {/* Sales Analytics */}
            <div
              onClick={() => navigate('/analytics')}
              className={`rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all ${
                isDark
                  ? 'bg-slate-800/50 border border-white/5'
                  : 'bg-white border border-slate-200/50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-green-500/10' : 'bg-green-50'
                }`}>
                  <Icon name="trending_up" className="text-green-500 text-xl" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Продажи
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Выручка и динамика продаж
                  </p>
                </div>
                <Icon name="chevron_right" className={isDark ? 'text-slate-600' : 'text-slate-300'} />
              </div>
            </div>

            {/* Products Analytics */}
            <div
              onClick={() => navigate('/analytics')}
              className={`rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all ${
                isDark
                  ? 'bg-slate-800/50 border border-white/5'
                  : 'bg-white border border-slate-200/50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-amber-500/10' : 'bg-amber-50'
                }`}>
                  <Icon name="inventory_2" className="text-amber-500 text-xl" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Товары
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Топ продукты и категории
                  </p>
                </div>
                <Icon name="chevron_right" className={isDark ? 'text-slate-600' : 'text-slate-300'} />
              </div>
            </div>

            {/* Staff Analytics */}
            <div
              onClick={() => navigate('/analytics')}
              className={`rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all ${
                isDark
                  ? 'bg-slate-800/50 border border-white/5'
                  : 'bg-white border border-slate-200/50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-blue-500/10' : 'bg-blue-50'
                }`}>
                  <Icon name="groups" className="text-blue-500 text-xl" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Сотрудники
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Эффективность команды
                  </p>
                </div>
                <Icon name="chevron_right" className={isDark ? 'text-slate-600' : 'text-slate-300'} />
              </div>
            </div>

            {/* Stock Analytics */}
            <div
              onClick={() => navigate('/analytics')}
              className={`rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all ${
                isDark
                  ? 'bg-slate-800/50 border border-white/5'
                  : 'bg-white border border-slate-200/50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-red-500/10' : 'bg-red-50'
                }`}>
                  <Icon name="warehouse" className="text-red-500 text-xl" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Склад
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Остатки и дефициты
                  </p>
                </div>
                <Icon name="chevron_right" className={isDark ? 'text-slate-600' : 'text-slate-300'} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </PullToRefresh>
  );
};

export default DashboardScreen;
