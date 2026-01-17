// Format price with currency
export const formatPrice = (price: number, currency: string = 'KZT'): string => {
  const val = Number(price) || 0;
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₸';
  return `${symbol}${new Intl.NumberFormat('ru-RU').format(val)}`;
};

// Часовой пояс GMT+5 (Казахстан)
const TIMEZONE = 'Asia/Almaty'; // GMT+5

// Format date
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: TIMEZONE,
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
    timeZone: TIMEZONE,
  }).format(new Date(date));
};

// Format deadline - показывает дату и время для задач
export const formatDeadline = (date: string | Date | undefined): string => {
  if (!date) return '';

  const deadlineDate = new Date(date);
  const now = new Date();

  // Форматируем дату с учетом часового пояса
  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    timeZone: TIMEZONE,
  });

  const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  });

  const formattedDate = dateFormatter.format(deadlineDate);
  const formattedTime = timeFormatter.format(deadlineDate);

  // Проверяем, сегодня ли deadline
  const isToday = deadlineDate.toDateString() === now.toDateString();

  if (isToday) {
    return `Сегодня, ${formattedTime}`;
  }

  return `${formattedDate}, ${formattedTime}`;
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

// Get priority icon badge style
export const getPriorityIconBadge = (priority: string) => {
  switch (priority) {
    case 'Высокий':
      return { icon: 'error', color: 'bg-red-500', ringColor: 'ring-red-500/20', label: 'Высокий' };
    case 'Средний':
      return { icon: 'warning', color: 'bg-orange-500', ringColor: 'ring-orange-500/20', label: 'Средний' };
    case 'Низкий':
      return { icon: 'info', color: 'bg-emerald-500', ringColor: 'ring-emerald-500/20', label: 'Низкий' };
    default:
      return { icon: 'remove', color: 'bg-gray-400', ringColor: 'ring-gray-400/20', label: 'Неизвестен' };
  }
};

// Classnames helper
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
