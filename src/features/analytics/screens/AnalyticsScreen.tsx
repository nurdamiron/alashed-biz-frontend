import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, PullToRefresh } from '@/shared/components';
import { api } from '@/shared/lib/api';
import { useAppContext } from '@/shared/context/AppContext';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

type Period = 'daily' | 'weekly' | 'monthly';
type Tab = 'sales' | 'products' | 'staff' | 'stock';

const COLORS = ['#135bec', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const tabs = [
  { id: 'sales' as Tab, label: 'Продажи', icon: 'trending_up' },
  { id: 'products' as Tab, label: 'Товары', icon: 'inventory_2' },
  { id: 'staff' as Tab, label: 'Команда', icon: 'groups' },
  { id: 'stock' as Tab, label: 'Склад', icon: 'warehouse' },
];

const AnalyticsScreen = () => {
  const navigate = useNavigate();
  const { theme, formatPrice, orders, products, employees } = useAppContext();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<Tab>('sales');
  const [period, setPeriod] = useState<Period>('daily');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toDate = new Date().toISOString().split('T')[0];
  const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [revenue, productsData, categories, employeesData, stock] = await Promise.all([
        api.analytics.getRevenueByPeriod(period, fromDate, toDate),
        api.analytics.getTopProducts(10, fromDate, toDate),
        api.analytics.getSalesByCategory(fromDate, toDate),
        api.analytics.getEmployeePerformance(fromDate, toDate),
        api.analytics.getLowStock(),
      ]);

      setRevenueData(revenue.data || []);
      setTopProducts(productsData.products || []);
      setCategoryData(categories.categories || []);
      setEmployeeData(employeesData.employees || []);
      setLowStock(stock.products || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculated stats
  const totalRevenue = revenueData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalOrders = orders?.length || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completedOrders = orders?.filter(o => o.status === 'Доставлено').length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'Ожидание').length || 0;

  const totalProducts = products?.length || 0;
  const lowStockCount = lowStock.length;
  const totalStockValue = products?.reduce((sum, p) => sum + (p.stock * p.priceBuy), 0) || 0;

  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter(e => e.isActive).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

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
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                Отчеты
              </span>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Аналитика
              </h2>
            </div>
            <button
              onClick={loadData}
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-primary active:scale-90 transition-all"
            >
              <Icon name="refresh" className="text-[20px]" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon name={tab.icon} className="text-[18px]" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <PullToRefresh onRefresh={loadData} className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-40">
        {/* SALES TAB */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            {/* Sales KPIs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] p-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">Выручка</p>
                <p className="text-2xl font-black">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Заказов</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{totalOrders}</p>
              </div>
              <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Средний чек</p>
                <p className="text-xl font-black text-emerald-500">{formatPrice(avgOrderValue)}</p>
              </div>
              <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Доставлено</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{completedOrders}</p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all ${
                    period === p
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {p === 'daily' ? 'Дни' : p === 'weekly' ? 'Недели' : 'Месяцы'}
                </button>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                Динамика выручки
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} opacity={0.5} />
                    <XAxis dataKey="period" tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{
                        background: isDark ? '#1f2937' : '#ffffff',
                        border: 'none',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: number | undefined) => [formatPrice(value || 0), 'Выручка']}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#135bec" strokeWidth={3} dot={{ fill: '#135bec', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Orders by Status */}
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                Статус заказов
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Ожидание</span>
                  </div>
                  <span className="text-lg font-black text-orange-500">{pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">В пути</span>
                  </div>
                  <span className="text-lg font-black text-blue-500">{orders?.filter(o => o.status === 'Отправлено').length || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Доставлено</span>
                  </div>
                  <span className="text-lg font-black text-emerald-500">{completedOrders}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Products KPIs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-[2rem] p-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">Всего товаров</p>
                <p className="text-2xl font-black">{totalProducts}</p>
              </div>
              <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Категорий</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{categoryData.length}</p>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                Топ продаж
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} opacity={0.5} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} width={100} />
                    <Tooltip
                      contentStyle={{
                        background: isDark ? '#1f2937' : '#ffffff',
                        border: 'none',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: number | undefined) => [value || 0, 'Продано']}
                    />
                    <Bar dataKey="soldQuantity" fill="#22c55e" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales by Category */}
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                По категориям
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="revenue"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      label={(entry: any) => `${entry.category}`}
                      labelLine={false}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: isDark ? '#1f2937' : '#ffffff',
                        border: 'none',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: number | undefined) => [formatPrice(value || 0), 'Выручка']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((cat, idx) => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{cat.category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product List */}
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                Все товары по продажам
              </h3>
              <div className="space-y-2">
                {topProducts.slice(0, 10).map((product, idx) => (
                  <div key={product.id || idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-500">{product.soldQuantity} шт</p>
                      <p className="text-[10px] text-gray-400">{formatPrice(product.revenue || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            {/* Staff KPIs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">Всего</p>
                <p className="text-2xl font-black">{totalEmployees}</p>
              </div>
              <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Активных</p>
                <p className="text-2xl font-black text-emerald-500">{activeEmployees}</p>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                Лидеры по выручке
              </h3>
              <div className="space-y-3">
                {employeeData.slice(0, 5).map((emp, idx) => (
                  <div key={emp.id || idx} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${
                      idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-700' : 'bg-primary'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{emp.name}</p>
                      <p className="text-[10px] text-gray-500">{emp.ordersCount || 0} заказов</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-500">{formatPrice(emp.revenue || 0)}</p>
                    </div>
                  </div>
                ))}
                {employeeData.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-4">Нет данных о продажах</p>
                )}
              </div>
            </div>

            {/* Tasks Performance */}
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                Активные задачи по сотрудникам
              </h3>
              <div className="space-y-3">
                {employees?.slice(0, 5).map((emp) => (
                  <div key={emp.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                      <span className="text-white font-black text-sm">
                        {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{emp.name}</p>
                      <p className="text-[10px] text-gray-500">{emp.department || 'Не указан'}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-primary/10">
                      <span className="text-sm font-black text-primary">{emp.activeTasks || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STOCK TAB */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            {/* Stock KPIs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-[2rem] p-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">Стоимость</p>
                <p className="text-xl font-black">{formatPrice(totalStockValue)}</p>
              </div>
              <div className={`rounded-[2rem] p-5 ${lowStockCount > 0 ? 'bg-red-500' : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5'}`}>
                <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${lowStockCount > 0 ? 'text-white/70' : 'text-gray-400'}`}>
                  Дефицит
                </p>
                <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {lowStockCount}
                </p>
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStock.length > 0 && (
              <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-red-200 dark:border-red-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="warning" className="text-[20px] text-red-500" />
                  <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">
                    Требуется пополнение
                  </h3>
                </div>
                <div className="space-y-2">
                  {lowStock.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-500/10">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-500">Мин: {product.minStockLevel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-red-500">{product.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock by Category */}
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                Остатки по категориям
              </h3>
              <div className="space-y-3">
                {['Наборы', 'Контроллеры', 'Датчики', 'Моторы'].map((category) => {
                  const categoryProducts = products?.filter(p => p.category === category) || [];
                  const totalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
                  const lowStockInCategory = categoryProducts.filter(p => p.stock <= p.minStock).length;

                  return (
                    <div key={category} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Icon name="category" className="text-[18px] text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{category}</p>
                          <p className="text-[10px] text-gray-500">{categoryProducts.length} товаров</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900 dark:text-white">{totalStock}</p>
                        {lowStockInCategory > 0 && (
                          <p className="text-[10px] text-red-500">{lowStockInCategory} мало</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All Products Stock */}
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                Остатки товаров
              </h3>
              <div className="space-y-2">
                {products?.slice(0, 10).map((product) => {
                  const isLow = product.stock <= product.minStock;
                  return (
                    <div key={product.id} className={`flex items-center gap-3 p-3 rounded-xl ${isLow ? 'bg-red-50 dark:bg-red-500/10' : 'bg-gray-50 dark:bg-white/5'}`}>
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5">
                        {product.img ? (
                          <img src={product.img} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="inventory_2" className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-500">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black ${isLow ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                          {product.stock}
                        </p>
                        <p className="text-[10px] text-gray-400">мин: {product.minStock}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </PullToRefresh>
    </div>
  );
};

export default AnalyticsScreen;
