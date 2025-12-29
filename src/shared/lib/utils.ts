// Format price with currency
export const formatPrice = (price: number, currency: string = 'KZT'): string => {
  const val = Number(price) || 0;
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₸';
  return `${symbol}${new Intl.NumberFormat('ru-RU').format(val)}`;
};

// Format date
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};

// Format date with time
export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Get status color classes
export const getOrderStatusColor = (status: string): string => {
  switch (status) {
    case 'Ожидание':
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20';
    case 'Отправлено':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20';
    case 'Доставлено':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
    case 'Отменено':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20';
    default:
      return 'text-gray-500 bg-gray-50 border-gray-100';
  }
};

export const getTaskStatusColor = (status: string): string => {
  switch (status) {
    case 'К выполнению':
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-500/10';
    case 'В процессе':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10';
    case 'Готово':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10';
    default:
      return 'text-gray-500 bg-gray-50';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'Высокий':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10';
    case 'Средний':
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10';
    case 'Низкий':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10';
    default:
      return 'text-gray-500 bg-gray-50';
  }
};

// Classnames helper
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
