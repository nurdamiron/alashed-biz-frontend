import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import { formatDeadline, getPriorityIconBadge } from '@/shared/lib/utils';
import type { Task } from '@/shared/types';

const TasksScreen = () => {
  // Загружаем сохраненный вид из localStorage или используем List по умолчанию
  const [view, setView] = useState<'List' | 'Kanban'>(() => {
    const saved = localStorage.getItem('alash_tasks_view');
    return (saved as 'List' | 'Kanban') || 'List';
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);

  const navigate = useNavigate();
  const { tasks, updateTaskStatus, employees, refreshData } = useAppContext();

  // Сохраняем выбранный вид в localStorage
  const handleViewChange = (newView: 'List' | 'Kanban') => {
    setView(newView);
    localStorage.setItem('alash_tasks_view', newView);
  };

  // Локальное состояние загрузки для этой страницы
  const isLoading = !tasks || tasks.length === 0;

  // Pull to refresh handler
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = e.currentTarget as HTMLElement;
    // Проверяем что мы в самом верху страницы
    if (container.scrollTop <= 10) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === 0 || isRefreshing) return;

    const container = e.currentTarget as HTMLElement;
    if (container.scrollTop > 10) {
      setTouchStart(0);
      setPullDistance(0);
      return;
    }

    const currentTouch = e.touches[0].clientY;
    const distance = currentTouch - touchStart;

    // Только если тянем вниз и находимся вверху страницы
    if (distance > 0 && distance < 200) {
      setPullDistance(distance);
      // Предотвращаем стандартный скролл при pull
      if (distance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (isRefreshing) return;

    if (pullDistance > 80) {
      setIsRefreshing(true);
      setPullDistance(0);

      try {
        await refreshData();
      } catch (error) {
        console.error('Refresh failed:', error);
      }

      // Показываем skeleton минимум 800ms для визуального эффекта
      setTimeout(() => setIsRefreshing(false), 800);
    } else {
      setPullDistance(0);
    }
    setTouchStart(0);
  };

  // Фильтрация задач
  const filteredTasks = Array.isArray(tasks) ? tasks.filter((t) => {
    // Поиск по названию
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Фильтр по приоритету
    if (selectedPriority && t.priority !== selectedPriority) {
      return false;
    }
    // Фильтр по исполнителю
    if (selectedAssignee && t.assigneeId !== selectedAssignee) {
      return false;
    }
    return true;
  }) : [];

  
  const urgentTasks = filteredTasks.filter((t) => t.priority === 'Высокий' && t.status !== 'Готово');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'В процессе');
  const todoTasks = filteredTasks.filter((t) => t.status === 'К выполнению');
  const completedTasks = filteredTasks.filter((t) => t.status === 'Готово');

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header
        className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl px-6 pb-4 transition-colors"
        style={{
          paddingTop: 'max(2rem, calc(2rem + env(safe-area-inset-top)))'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
              Mission Control
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ЗАДАЧИ
            </h1>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl border shadow-sm active:scale-90 transition-all ${showFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5 text-slate-900 dark:text-white'
              }`}
          >
            <Icon name="filter_list" className="text-[22px]" />
          </button>
        </div>

        {/* Поиск */}
        <div className="mb-4">
          <div className="relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск задач..."
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-sm font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <Icon name="close" className="text-[18px] text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Панель фильтров */}
        {showFilters && (
          <div className="mb-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 space-y-4">
            {/* Фильтр по приоритету */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Приоритет</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPriority(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedPriority === null
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                    }`}
                >
                  Все
                </button>
                {['Высокий', 'Средний', 'Низкий'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setSelectedPriority(priority)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedPriority === priority
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                      }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Фильтр по исполнителю */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Исполнитель</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setSelectedAssignee(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedAssignee === null
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                    }`}
                >
                  Все
                </button>
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedAssignee(emp.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedAssignee === emp.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                      }`}
                  >
                    {emp.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Кнопка сброса */}
            {(selectedPriority || selectedAssignee) && (
              <button
                onClick={() => {
                  setSelectedPriority(null);
                  setSelectedAssignee(null);
                }}
                className="w-full py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-xs font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        )}

        {/* Workload Heatmap */}
        <div className="mb-6 overflow-x-auto no-scrollbar py-3">
          <div className="flex items-center gap-3">
            {Array.isArray(employees) && employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedAssignee(selectedAssignee === emp.id ? null : emp.id)}
                className={`flex flex-col items-center gap-2 shrink-0 transition-all ${selectedAssignee === emp.id ? 'scale-110' : ''}`}
              >
                <div
                  className={`relative h-14 w-14 rounded-xl border-2 transition-all flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 ${
                    selectedAssignee === emp.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : emp.activeTasks > 4
                        ? 'border-red-500'
                        : emp.activeTasks > 2
                          ? 'border-orange-500'
                          : 'border-emerald-500'
                  }`}
                >
                  <span className="text-white font-black text-lg">
                    {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                  <span className="absolute -top-2 -right-2 z-10 h-5 w-5 rounded-full bg-slate-900 dark:bg-slate-800 border-2 border-white dark:border-surface-dark text-[9px] font-black text-white flex items-center justify-center shadow-md">
                    {emp.activeTasks}
                  </span>
                </div>
                <span className={`text-[10px] font-bold transition-colors ${selectedAssignee === emp.id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                  {emp.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* View Toggler */}
        <div className="bg-gray-200/50 dark:bg-surface-dark p-1.5 rounded-2xl flex relative border border-white dark:border-white/5 shadow-inner">
          <button
            onClick={() => handleViewChange('List')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'List'
                ? 'bg-white dark:bg-primary shadow-lg text-slate-900 dark:text-white'
                : 'text-gray-500 dark:text-text-secondary'
              }`}
          >
            <Icon name="reorder" className="text-[18px]" /> Список
          </button>
          <button
            onClick={() => handleViewChange('Kanban')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'Kanban'
                ? 'bg-white dark:bg-primary shadow-lg text-slate-900 dark:text-white'
                : 'text-gray-500 dark:text-text-secondary'
              }`}
          >
            <Icon name="dashboard_customize" className="text-[18px]" /> Канбан
          </button>
        </div>
      </header>

      <main
        className="flex-1 overflow-y-auto no-scrollbar relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ paddingTop: pullDistance > 0 ? `${Math.min(pullDistance, 120)}px` : '8px' }}
      >
        {/* Pull to refresh indicator */}
        {pullDistance > 0 && (
          <div
            className="fixed top-16 left-0 right-0 flex items-center justify-center z-50 transition-opacity duration-200"
            style={{
              opacity: Math.min(pullDistance / 80, 1)
            }}
          >
            <div className="flex flex-col items-center gap-2 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10">
              <div className={`h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary transition-transform ${pullDistance > 80 ? 'animate-spin' : ''}`}
                style={{ transform: `rotate(${pullDistance * 3}deg)` }} />
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {pullDistance > 80 ? 'Отпустите для обновления' : 'Тяните вниз для обновления'}
              </span>
            </div>
          </div>
        )}

        {/* Refreshing indicator */}
        {isRefreshing && (
          <div className="fixed top-16 left-0 right-0 flex items-center justify-center z-50">
            <div className="flex items-center gap-3 bg-primary px-6 py-3 rounded-2xl shadow-lg">
              <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span className="text-sm font-black text-white">Обновление...</span>
            </div>
          </div>
        )}

        {isLoading || isRefreshing ? (
          <TasksSkeleton view={view} />
        ) : view === 'List' ? (
          <ListView
            urgent={urgentTasks}
            todo={todoTasks}
            inProgress={inProgressTasks}
            completed={completedTasks}
            navigate={navigate}
          />
        ) : (
          <KanbanView
            todo={todoTasks}
            inProgress={inProgressTasks}
            done={completedTasks}
            updateStatus={updateTaskStatus}
            navigate={navigate}
          />
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => navigate('/tasks/new')}
        className="fixed right-6 h-16 w-16 rounded-[2rem] bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 ring-4 ring-white dark:ring-slate-900"
        style={{
          bottom: 'calc(8rem + env(safe-area-inset-bottom))'
        }}
      >
        <Icon name="add_task" className="text-[32px]" />
      </button>
    </div>
  );
};

const TaskCard: React.FC<{ task: Task; navigate: any }> = ({ task, navigate }) => {
  const priorityStyle = getPriorityIconBadge(task.priority);

  // Проверяем, просрочена ли задача
  const isOverdue = task.deadline && task.status !== 'Готово' && new Date(task.deadline) < new Date();

  // Подсчитываем прогресс чеклиста
  const checklistProgress = task.checklist && task.checklist.length > 0
    ? Math.round((task.checklist.filter((item) => item.done).length / task.checklist.length) * 100)
    : null;

  // Количество комментариев
  const commentsCount = task.comments?.length || 0;

  // Форматируем дату создания
  const createdAt = task.createdAt ? new Date(task.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  }) : null;

  const deadlineText = task.deadline ? formatDeadline(task.deadline) : null;

  return (
    <div
      onClick={() => navigate(`/task/${task.id}`)}
      className={`flex flex-col gap-3 rounded-xl p-4 shadow-md border-2 active:scale-[0.98] transition-all cursor-pointer group hover:shadow-xl ${isOverdue
          ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-500/30'
          : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-white/10'
        }`}
    >
      {/* Заголовок и приоритет */}
      <div className="flex items-start gap-3">
        <div className={`h-8 w-8 rounded-lg ${priorityStyle.color} text-white flex items-center justify-center shadow-md shrink-0`}>
          <Icon name={priorityStyle.icon} className="text-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2">
            {task.title}
          </h3>
          {isOverdue && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500 text-white shadow-sm mt-1.5 w-fit">
              <Icon name="schedule" className="text-[12px]" />
              <span className="text-[9px] font-black uppercase">Просрочено</span>
            </div>
          )}
        </div>
      </div>

      {/* Информационные блоки */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Дедлайн */}
        {deadlineText && !isOverdue && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            <Icon name="schedule" className="text-[12px] text-blue-500" />
            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400">{deadlineText}</span>
          </div>
        )}
        {/* Комментарии */}
        {commentsCount > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <Icon name="chat_bubble" className="text-[12px] text-amber-500" />
            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400">{commentsCount}</span>
          </div>
        )}
        {/* Дата создания */}
        {createdAt && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-white/10">
            <Icon name="today" className="text-[12px] text-gray-400" />
            <span className="text-[9px] font-black text-gray-500 dark:text-gray-400">{createdAt}</span>
          </div>
        )}
      </div>

      {/* Прогресс чеклиста */}
      {checklistProgress !== null && (
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Прогресс</span>
            <span className="text-[9px] font-black text-primary">{checklistProgress}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300"
              style={{ width: `${checklistProgress}%` }}
            />
          </div>
          <span className="text-[8px] font-black text-gray-400 uppercase mt-1 block">
            {task.checklist?.filter((i) => i.done).length}/{task.checklist?.length} задач
          </span>
        </div>
      )}

      {/* Исполнитель */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-blue-500 text-white flex items-center justify-center text-[10px] font-black shadow-md">
            {task.assignee ? task.assignee[0] : 'A'}
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-900 dark:text-white">
              {task.assignee || 'Админ'}
            </span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Исполнитель</span>
          </div>
        </div>
        <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-blue-500 group-hover:text-white transition-all shadow-sm">
          <Icon name="arrow_forward" className="text-[18px]" />
        </div>
      </div>
    </div>
  );
};

const ListView = ({ urgent, todo, inProgress, completed, navigate }: any) => (
  <div className="pb-40 px-6 space-y-8">
    {/* Срочно */}
    {urgent.length > 0 && (
      <section>
        <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4 px-2">
          Срочно
        </h3>
        <div className="space-y-4">
          {urgent.map((t: Task) => (
            <TaskCard key={t.id} task={t} navigate={navigate} />
          ))}
        </div>
      </section>
    )}

    {/* К выполнению */}
    <section>
      <div className="flex items-center gap-2 mb-4 px-2">
        <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        <h3 className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.3em]">
          К выполнению
        </h3>
        <span className="text-[10px] font-black text-orange-600 dark:text-orange-400">({todo.length})</span>
      </div>
      {todo.length > 0 ? (
        <div className="space-y-4">
          {todo.map((t: Task) => (
            <TaskCard key={t.id} task={t} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-[2rem] bg-orange-50 dark:bg-orange-500/5 border-2 border-dashed border-orange-200 dark:border-orange-500/20">
          <Icon name="inbox" className="text-4xl text-orange-300 dark:text-orange-600 mb-2" />
          <p className="text-xs font-bold text-orange-400 dark:text-orange-500">Нет задач в ожидании</p>
        </div>
      )}
    </section>

    {/* В работе */}
    <section>
      <div className="flex items-center gap-2 mb-4 px-2">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
          В работе
        </h3>
        <span className="text-[10px] font-black text-primary">({inProgress.length})</span>
      </div>
      {inProgress.length > 0 ? (
        <div className="space-y-4">
          {inProgress.map((t: Task) => (
            <TaskCard key={t.id} task={t} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-[2rem] bg-blue-50 dark:bg-blue-500/5 border-2 border-dashed border-blue-200 dark:border-blue-500/20">
          <Icon name="inbox" className="text-4xl text-blue-300 dark:text-blue-600 mb-2" />
          <p className="text-xs font-bold text-blue-400 dark:text-blue-500">Нет задач в работе</p>
        </div>
      )}
    </section>

    {/* Завершенные */}
    <section>
      <div className="flex items-center gap-2 mb-4 px-2">
        <Icon name="verified" className="text-[14px] text-emerald-500" />
        <h3 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">
          Завершенные
        </h3>
        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">({completed.length})</span>
      </div>
      {completed.length > 0 ? (
        <div className="space-y-4">
          {completed.map((t: Task) => (
            <TaskCard key={t.id} task={t} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-500/5 border-2 border-dashed border-emerald-200 dark:border-emerald-500/20">
          <Icon name="inbox" className="text-4xl text-emerald-300 dark:text-emerald-600 mb-2" />
          <p className="text-xs font-bold text-emerald-400 dark:text-emerald-500">Нет завершенных задач</p>
        </div>
      )}
    </section>
  </div>
);

const KanbanColumn = ({ title, tasks, updateStatus, nextStatus, navigate, color }: any) => (
  <div className="flex flex-col w-[85vw] h-full shrink-0 snap-center first:pl-6 last:pr-6">
    <div className="flex items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-2">
        <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tighter uppercase">
          {title}
        </h3>
        <span className="h-6 px-2 flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg text-[10px] font-black text-slate-900 dark:text-white shadow-sm">
          {tasks.length}
        </span>
      </div>
      <div className={`h-2 w-2 rounded-full ${color} animate-pulse`}></div>
    </div>
    <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-40 rounded-2xl bg-gray-50 dark:bg-slate-800/50 p-3 border border-gray-200 dark:border-white/10">
      {tasks.map((t: Task) => {
        const priorityStyle = getPriorityIconBadge(t.priority);
        const isOverdue = t.deadline && t.status !== 'Готово' && new Date(t.deadline) < new Date();
        const checklistProgress = t.checklist && t.checklist.length > 0
          ? Math.round((t.checklist.filter((item) => item.done).length / t.checklist.length) * 100)
          : null;
        const commentsCount = t.comments?.length || 0;
        const deadlineText = t.deadline ? formatDeadline(t.deadline) : null;
        const createdAt = t.createdAt ? new Date(t.createdAt).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short'
        }) : null;

        return (
          <div
            key={t.id}
            onClick={() => navigate(`/task/${t.id}`)}
            className={`p-3 rounded-xl shadow-md border-2 active:scale-[0.98] transition-all cursor-pointer group hover:shadow-xl ${isOverdue
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-500/30'
                : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-white/10'
              }`}
          >
            {/* Заголовок и приоритет */}
            <div className="flex items-start gap-2 mb-2">
              <div className={`h-7 w-7 rounded-lg ${priorityStyle.color} text-white flex items-center justify-center shadow-md shrink-0`}>
                <Icon name={priorityStyle.icon} className="text-[16px]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {t.title}
                </p>
                {isOverdue && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-500 text-white shadow-sm mt-1 w-fit">
                    <Icon name="schedule" className="text-[10px]" />
                    <span className="text-[8px] font-black uppercase">Просрочено</span>
                  </div>
                )}
              </div>
            </div>

            {/* Информационные блоки */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {deadlineText && !isOverdue && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                  <Icon name="schedule" className="text-[10px] text-blue-500" />
                  <span className="text-[8px] font-black text-blue-600 dark:text-blue-400">{deadlineText}</span>
                </div>
              )}
              {commentsCount > 0 && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <Icon name="chat_bubble" className="text-[10px] text-amber-500" />
                  <span className="text-[8px] font-black text-amber-600 dark:text-amber-400">{commentsCount}</span>
                </div>
              )}
              {createdAt && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-white/10">
                  <Icon name="today" className="text-[10px] text-gray-400" />
                  <span className="text-[8px] font-black text-gray-500 dark:text-gray-400">{createdAt}</span>
                </div>
              )}
            </div>

            {/* Прогресс чеклиста */}
            {checklistProgress !== null && (
              <div className="mb-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Прогресс</span>
                  <span className="text-[8px] font-black text-primary">{checklistProgress}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
                <span className="text-[8px] font-black text-gray-400 uppercase mt-0.5 block">
                  {t.checklist?.filter((i) => i.done).length}/{t.checklist?.length} задач
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-blue-500 text-white flex items-center justify-center text-[9px] font-black shadow-md">
                  {t.assignee ? t.assignee[0] : 'A'}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white">{t.assignee || 'Админ'}</span>
                  <span className="text-[7px] font-bold text-gray-400 uppercase">Исполнитель</span>
                </div>
              </div>
              {nextStatus && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(t.id, nextStatus);
                  }}
                  className="h-7 px-3 rounded-lg bg-gradient-to-r from-primary to-blue-500 text-white text-[8px] font-black uppercase tracking-wider shadow-md shadow-primary/30 active:scale-90 transition-all"
                >
                  Далее →
                </button>
              )}
            </div>
          </div>
        );
      })}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 opacity-30">
          <Icon name="inbox" className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-sm font-bold text-gray-400">Нет задач</p>
        </div>
      )}
    </div>
  </div>
);

const KanbanView = (props: any) => (
  <div className="flex h-full w-full overflow-x-auto no-scrollbar gap-4 snap-x snap-mandatory pb-4">
    <KanbanColumn
      title="Ожидание"
      color="bg-orange-500"
      tasks={props.todo}
      updateStatus={props.updateStatus}
      nextStatus="В процессе"
      navigate={props.navigate}
    />
    <KanbanColumn
      title="В работе"
      color="bg-primary"
      tasks={props.inProgress}
      updateStatus={props.updateStatus}
      nextStatus="Готово"
      navigate={props.navigate}
    />
    <KanbanColumn
      title="Готово"
      color="bg-emerald-500"
      tasks={props.done}
      updateStatus={props.updateStatus}
      navigate={props.navigate}
    />
  </div>
);

// Skeleton Loading Component
const TasksSkeleton = ({ view }: { view: 'List' | 'Kanban' }) => {
  if (view === 'Kanban') {
    return (
      <div className="flex h-full w-full overflow-x-auto no-scrollbar gap-4 snap-x snap-mandatory pb-4">
        {[1, 2, 3].map((col) => (
          <div key={col} className="flex flex-col w-[85vw] h-full shrink-0 snap-center first:pl-6 last:pr-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-40 rounded-2xl bg-gray-50 dark:bg-slate-800/50 p-3 border border-gray-200 dark:border-white/10">
              {[1, 2, 3].map((card) => (
                <div key={card} className="p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-white/10 space-y-2 animate-pulse">
                  <div className="flex items-start gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-lg bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List view skeleton
  return (
    <div className="pb-40 px-6 space-y-4">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-white/10 space-y-3 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
          <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-3.5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TasksScreen;
