import { useState, useEffect } from 'react';
import { Icon, PullToRefresh } from '@/shared/components';
import { api } from '@/shared/lib/api';
import { useAppContext } from '@/shared/context/AppContext';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

type Period = 'daily' | 'weekly' | 'monthly';

const COLORS = ['#135bec', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AnalyticsScreen = () => {
  const { theme } = useAppContext();
  const isDark = theme === 'dark';
  const [period, setPeriod] = useState<Period>('daily');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Date range (last 30 days)
  const toDate = new Date().toISOString().split('T')[0];
  const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [revenue, products, categories, employees, stock] = await Promise.all([
        api.analytics.getRevenueByPeriod(period, fromDate, toDate),
        api.analytics.getTopProducts(5, fromDate, toDate),
        api.analytics.getSalesByCategory(fromDate, toDate),
        api.analytics.getEmployeePerformance(fromDate, toDate),
        api.analytics.getLowStock(),
      ]);

      setRevenueData(revenue.data || []);
      setTopProducts(products.products || []);
      setCategoryData(categories.categories || []);
      setEmployeeData(employees.employees || []);
      setLowStock(stock.products || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

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
            Аналитика
          </h1>
          <button
            onClick={loadData}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm text-slate-900 dark:text-white"
          >
            <Icon name="refresh" />
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 px-5 pb-3">
          {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                period === p
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-400'
              }`}
            >
              {p === 'daily' ? 'По дням' : p === 'weekly' ? 'По неделям' : 'По месяцам'}
            </button>
          ))}
        </div>
      </header>

      <PullToRefresh onRefresh={loadData} className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-40">
        <div className="space-y-6">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="trending_up" className="text-[20px] text-primary" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Выручка</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} opacity={0.5} />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{
                      background: isDark ? '#1f2937' : '#ffffff',
                      border: isDark ? 'none' : '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                    formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Выручка']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#135bec" strokeWidth={3} dot={{ fill: '#135bec' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="star" className="text-[20px] text-amber-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Топ продукты</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} opacity={0.5} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} width={100} />
                  <Tooltip
                    contentStyle={{
                      background: isDark ? '#1f2937' : '#ffffff',
                      border: isDark ? 'none' : '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                    formatter={(value: number | undefined) => [value || 0, 'Продано']}
                  />
                  <Bar dataKey="soldQuantity" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales by Category */}
          <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="pie_chart" className="text-[20px] text-violet-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">По категориям</h3>
            </div>
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
                    label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: isDark ? '#1f2937' : '#ffffff',
                      border: isDark ? 'none' : '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      color: isDark ? '#ffffff' : '#000000'
                    }}
                    formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Выручка']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Employee Performance */}
          <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="groups" className="text-[20px] text-blue-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Эффективность сотрудников</h3>
            </div>
            <div className="space-y-3">
              {employeeData.slice(0, 5).map((emp, idx) => (
                <div key={emp.id || idx} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-black text-primary">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.ordersCount || 0} заказов</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-500">{formatCurrency(emp.revenue || 0)}</p>
                  </div>
                </div>
              ))}
              {employeeData.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">Нет данных</p>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="warning" className="text-[20px] text-red-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Низкий остаток</h3>
              {lowStock.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-[10px] font-bold text-red-500">
                  {lowStock.length}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {lowStock.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-500/10">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{product.name}</p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-red-500">{product.quantity}</p>
                    <p className="text-[10px] text-gray-400">мин: {product.minStockLevel}</p>
                  </div>
                </div>
              ))}
              {lowStock.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">Все товары в наличии</p>
              )}
            </div>
          </div>
        </div>
      </PullToRefresh>
    </div>
  );
};

export default AnalyticsScreen;
