import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, PullToRefresh } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import type { Notification } from '@/shared/types';

// Human-readable type labels in Russian
const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    new_order: 'Новый заказ',
    order_status_changed: 'Статус заказа',
    order_completed: 'Заказ выполнен',
    new_task: 'Новая задача',
    task_assigned: 'Назначена задача',
    task_completed: 'Задача выполнена',
    task_overdue: 'Просрочена',
    low_stock: 'Низкий остаток',
    out_of_stock: 'Нет в наличии',
    alert: 'Важно',
    info: 'Информация',
  };
  return labels[type] || type.replace(/_/g, ' ');
};

// Icon and color mapping for notification types
const getNotificationStyle = (type: string) => {
  switch (type) {
    case 'new_order':
    case 'order_status_changed':
      return { icon: 'shopping_bag', bgColor: 'bg-blue-500/10', textColor: 'text-blue-500', category: 'orders' };
    case 'order_completed':
      return { icon: 'check_circle', bgColor: 'bg-green-500/10', textColor: 'text-green-500', category: 'orders' };
    case 'new_task':
    case 'task_assigned':
      return { icon: 'assignment', bgColor: 'bg-purple-500/10', textColor: 'text-purple-500', category: 'tasks' };
    case 'task_completed':
      return { icon: 'task_alt', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-500', category: 'tasks' };
    case 'task_overdue':
      return { icon: 'schedule', bgColor: 'bg-orange-500/10', textColor: 'text-orange-500', category: 'tasks' };
    case 'low_stock':
      return { icon: 'inventory_2', bgColor: 'bg-amber-500/10', textColor: 'text-amber-500', category: 'stock' };
    case 'out_of_stock':
      return { icon: 'remove_shopping_cart', bgColor: 'bg-red-500/10', textColor: 'text-red-500', category: 'stock' };
    case 'alert':
      return { icon: 'warning', bgColor: 'bg-red-500/10', textColor: 'text-red-500', category: 'other' };
    default:
      return { icon: 'notifications', bgColor: 'bg-primary/10', textColor: 'text-primary', category: 'other' };
  }
};

// Relative time formatting
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн назад`;

  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

// Group notifications by date
const getDateGroup = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  if (date >= today) return 'Сегодня';
  if (date >= yesterday) return 'Вчера';
  if (date >= weekAgo) return 'На этой неделе';
  return 'Ранее';
};

// Get navigation URL from notification
const getNotificationUrl = (notification: Notification): string | null => {
  if (notification.url) return notification.url;

  if (notification.relatedType && notification.relatedId) {
    switch (notification.relatedType) {
      case 'order':
        return `/order/${notification.relatedId}`;
      case 'task':
        return `/task/${notification.relatedId}`;
      case 'product':
      case 'inventory':
        return `/inventory/${notification.relatedId}`;
      default:
        return null;
    }
  }

  switch (notification.type) {
    case 'new_order':
    case 'order_status_changed':
    case 'order_completed':
      return '/orders';
    case 'new_task':
    case 'task_assigned':
    case 'task_overdue':
    case 'task_completed':
      return '/tasks';
    case 'low_stock':
    case 'out_of_stock':
      return '/inventory';
    default:
      return null;
  }
};

type FilterType = 'all' | 'orders' | 'tasks' | 'stock';

const NotificationsScreen = () => {
  const navigate = useNavigate();
  const { notifications, clearNotifications, refreshData } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Filter notifications
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter((n: Notification) => {
      const style = getNotificationStyle(n.type);
      return style.category === activeFilter;
    });
  }, [notifications, activeFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    filtered.forEach((n: Notification) => {
      const group = getDateGroup(n.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    });
    return groups;
  }, [filtered]);

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    const url = getNotificationUrl(notification);
    if (url) {
      navigate(url);
    }
  };

  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: 'Все', icon: 'notifications' },
    { key: 'orders', label: 'Заказы', icon: 'shopping_bag' },
    { key: 'tasks', label: 'Задачи', icon: 'check_circle' },
    { key: 'stock', label: 'Склад', icon: 'inventory_2' },
  ];

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div
          className="px-5 pb-4"
          style={{
            paddingTop: 'max(1rem, calc(1rem + env(safe-area-inset-top)))'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-slate-900 dark:text-white active:scale-90 transition-all"
            >
              <Icon name="arrow_back_ios_new" className="text-[18px]" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Уведомления
              </h2>
              {unreadCount > 0 && (
                <p className="text-xs text-primary font-bold">
                  {unreadCount} новых
                </p>
              )}
            </div>
            <button
              onClick={clearNotifications}
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-primary active:scale-90 transition-all"
              title="Отметить все как прочитанные"
            >
              <Icon name="done_all" className="text-[18px]" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {filters.map((filter) => {
              const count = filter.key === 'all'
                ? notifications.length
                : notifications.filter((n: Notification) => getNotificationStyle(n.type).category === filter.key).length;

              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                    activeFilter === filter.key
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5'
                  }`}
                >
                  <Icon name={filter.icon} className="text-[16px]" />
                  {filter.label}
                  {count > 0 && (
                    <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center ${
                      activeFilter === filter.key
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <PullToRefresh onRefresh={refreshData} className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-32">
        {filtered.length > 0 ? (
          Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-6">
              {/* Date Group Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {group}
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                {items.map((n: Notification) => {
                  const style = getNotificationStyle(n.type);
                  const hasLink = !!getNotificationUrl(n);

                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      disabled={!hasLink}
                      className={`w-full text-left rounded-2xl bg-white dark:bg-surface-dark p-4 shadow-sm border transition-all ${
                        !n.read
                          ? 'border-l-4 border-l-primary border-t-gray-100 border-r-gray-100 border-b-gray-100 dark:border-t-white/5 dark:border-r-white/5 dark:border-b-white/5'
                          : 'border-gray-100 dark:border-white/5'
                      } ${hasLink ? 'active:scale-[0.98] cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className="flex gap-3">
                        {/* Icon with unread dot */}
                        <div className="relative">
                          <div
                            className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${style.bgColor} ${style.textColor}`}
                          >
                            <Icon name={style.icon} filled className="text-[22px]" />
                          </div>
                          {!n.read && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-surface-dark" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${style.textColor}`}>
                              {getTypeLabel(n.type)}
                            </span>
                            <span className="text-[10px] font-medium text-gray-400">
                              {getRelativeTime(n.createdAt)}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 line-clamp-1">
                            {n.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {n.message}
                          </p>
                        </div>

                        {/* Arrow */}
                        {hasLink && (
                          <div className="flex items-center">
                            <Icon name="chevron_right" className="text-gray-300 dark:text-gray-600 text-[20px]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-[2rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6">
              <Icon name="notifications_off" className="text-5xl text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Нет уведомлений
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-[200px]">
              {activeFilter === 'all'
                ? 'Здесь будут появляться ваши уведомления'
                : `Нет уведомлений в категории "${filters.find(f => f.key === activeFilter)?.label}"`
              }
            </p>
          </div>
        )}
      </PullToRefresh>
    </div>
  );
};

export default NotificationsScreen;
