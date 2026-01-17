import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import { getOrderStatusColor } from '@/shared/lib/utils';

const OrdersScreen = () => {
  const navigate = useNavigate();
  const { orders, formatPrice } = useAppContext();
  const [activeFilter, setActiveFilter] = useState('Все');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [sourceFilter, setSourceFilter] = useState('Все');

  const filteredOrders = Array.isArray(orders) ? orders.filter((o) => {
    const matchStatus = activeFilter === 'Все' || o.status === activeFilter;
    const matchSource = sourceFilter === 'Все' || o.source === sourceFilter;
    const matchDate =
      (!dateRange.start || o.date >= dateRange.start) &&
      (!dateRange.end || o.date <= dateRange.end);
    return matchStatus && matchSource && matchDate;
  }) : [];

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-colors">
        <div
          className="flex items-center justify-between px-5 pb-2"
          style={{
            paddingTop: 'max(1.25rem, calc(1.25rem + env(safe-area-inset-top)))'
          }}
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Заказы
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className={`flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm text-slate-900 dark:text-white ${
                showFilters ? 'ring-2 ring-primary' : ''
              }`}
            >
              <Icon name="filter_list" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="absolute top-20 right-5 z-50 w-72 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm">Фильтры</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-400">
                <Icon name="close" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block">Источник</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full rounded-xl bg-gray-50 dark:bg-white/5 border-none text-sm p-3"
                >
                  {['Все', 'Kaspi', 'Instagram', 'WhatsApp', 'Сайт', 'Магазин'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block">Дата</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="flex-1 rounded-xl bg-gray-50 dark:bg-white/5 border-none text-xs p-2"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="flex-1 rounded-xl bg-gray-50 dark:bg-white/5 border-none text-xs p-2"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setSourceFilter('Все');
                  setDateRange({ start: '', end: '' });
                }}
                className="w-full py-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl"
              >
                Сбросить
              </button>
            </div>
          </div>
        )}

        <div className="px-5 pb-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 transition-colors group-focus-within:text-primary">
              <Icon name="search" className="text-[20px]" />
            </div>
            <input
              type="text"
              className="block w-full rounded-2xl border-none bg-white dark:bg-surface-dark py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
              placeholder="Поиск заказа..."
            />
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-4 overflow-x-auto no-scrollbar">
          {['Все', 'Ожидание', 'Отправлено', 'Доставлено', 'Отменено'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex h-9 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      <main
        className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 space-y-4"
        style={{
          paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))'
        }}
      >
        {filteredOrders.map((order) => {
          const isCancelled = order.status === 'Отменено';
          return (
            <div
              key={order.id}
              className="group relative flex flex-col rounded-3xl bg-white dark:bg-surface-dark p-1 shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
              onClick={() => navigate(`/order/${order.id}`)}
            >
              <div className="flex gap-4 p-3">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={order.img || 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png'}
                    alt=""
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                      isCancelled ? 'grayscale opacity-70' : ''
                    }`}
                  />
                </div>

                <div
                  className={`flex flex-col flex-1 min-w-0 justify-center ${
                    isCancelled ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate pr-2">
                      {order.client}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                      {order.id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                    {order.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {formatPrice(order.amount)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${getOrderStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Icon name="search_off" className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Ничего не найдено</p>
          </div>
        )}
      </main>

      <button
        onClick={() => navigate('/orders/new')}
        className="fixed right-6 h-16 w-16 rounded-[2rem] bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 ring-4 ring-white dark:ring-slate-900"
        style={{
          bottom: 'calc(8rem + env(safe-area-inset-bottom))'
        }}
      >
        <Icon name="add_shopping_cart" className="text-[32px]" />
      </button>
    </div>
  );
};

export default OrdersScreen;
