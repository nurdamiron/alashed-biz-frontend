import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import { AIHubModal } from '@/features/ai';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { stats, formatPrice, appName } = useAppContext();
  const [showAIHub, setShowAIHub] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-32 bg-background-light dark:bg-black transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-background-light/80 dark:bg-black/80 backdrop-blur-md px-8 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
            {appName}
          </h1>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowAIHub(true)}
              className="text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity"
            >
              <Icon name="brand_family" filled />
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="text-zinc-400 dark:text-zinc-500"
            >
              <Icon name="notifications" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-8 pt-4 space-y-10">
        {/* Main Stat */}
        <section>
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest mb-1">
            Revenue
          </p>
          <h2 className="text-4xl font-semibold tracking-tighter">
            {formatPrice(stats.revenue)}
          </h2>
        </section>

        {/* Info Grid */}
        <section className="grid grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <p className="text-2xl font-medium mb-1 tracking-tight">{stats.pendingOrders}</p>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
              Pending
            </p>
          </div>
          <div>
            <p
              className={`text-2xl font-medium mb-1 tracking-tight ${
                stats.lowStockCount > 0 ? 'text-red-500' : ''
              }`}
            >
              {stats.lowStockCount}
            </p>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
              Low Stock
            </p>
          </div>
          <div>
            <p className="text-2xl font-medium mb-1 tracking-tight">{stats.activeTasksCount}</p>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Tasks</p>
          </div>
          <div>
            <p className="text-2xl font-medium mb-1 tracking-tight">{stats.totalOrders || 0}</p>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Total</p>
          </div>
        </section>

        {/* Action Call */}
        <section className="pt-8 border-t border-zinc-100 dark:border-zinc-900">
          <button
            onClick={() => setShowAIHub(true)}
            className="w-full flex items-center justify-between py-6 group"
          >
            <span className="text-sm font-medium tracking-tight">Ask Assistant</span>
            <Icon
              name="arrow_forward"
              className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors"
            />
          </button>
        </section>
      </div>

      {showAIHub && <AIHubModal onClose={() => setShowAIHub(false)} />}
    </div>
  );
};

export default DashboardScreen;
