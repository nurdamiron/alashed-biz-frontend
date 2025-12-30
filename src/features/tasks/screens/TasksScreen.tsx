import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import type { Task } from '@/shared/types';

const TasksScreen = () => {
  const [view, setView] = useState<'List' | 'Kanban'>('Kanban');
  const navigate = useNavigate();
  const { tasks, updateTaskStatus, employees } = useAppContext();

  const urgentTasks = tasks.filter((t) => t.priority === 'Высокий' && t.status !== 'Готово');
  const inProgressTasks = tasks.filter((t) => t.status === 'В процессе');
  const todoTasks = tasks.filter((t) => t.status === 'К выполнению');
  const completedTasks = tasks.filter((t) => t.status === 'Готово');

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl pt-8 px-6 pb-4 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
              Mission Control
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ЗАДАЧИ
            </h1>
          </div>
          <button className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-slate-900 dark:text-white active:scale-90 transition-all">
            <Icon name="filter_list" className="text-[22px]" />
          </button>
        </div>

        {/* Workload Heatmap */}
        <div className="mb-6 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-4">
            {employees.map((emp) => (
              <div key={emp.id} className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={`relative h-12 w-12 rounded-2xl p-0.5 border-2 ${
                    emp.activeTasks > 4
                      ? 'border-red-500'
                      : emp.activeTasks > 2
                      ? 'border-orange-500'
                      : 'border-emerald-500'
                  }`}
                >
                  <img
                    src={emp.avatar}
                    className="h-full w-full rounded-[0.85rem] object-cover"
                    alt=""
                  />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-slate-900 border-2 border-white dark:border-surface-dark text-[9px] font-black text-white flex items-center justify-center">
                    {emp.activeTasks}
                  </span>
                </div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                  {emp.name.split(' ')[0]}
                </span>
              </div>
            ))}
            <button className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-800 flex items-center justify-center text-gray-400 shrink-0">
              <Icon name="add" />
            </button>
          </div>
        </div>

        {/* View Toggler */}
        <div className="bg-gray-200/50 dark:bg-surface-dark p-1.5 rounded-2xl flex relative border border-white dark:border-white/5 shadow-inner">
          <button
            onClick={() => setView('List')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              view === 'List'
                ? 'bg-white dark:bg-primary shadow-lg text-slate-900 dark:text-white'
                : 'text-gray-500 dark:text-text-secondary'
            }`}
          >
            <Icon name="reorder" className="text-[18px]" /> Список
          </button>
          <button
            onClick={() => setView('Kanban')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              view === 'Kanban'
                ? 'bg-white dark:bg-primary shadow-lg text-slate-900 dark:text-white'
                : 'text-gray-500 dark:text-text-secondary'
            }`}
          >
            <Icon name="dashboard_customize" className="text-[18px]" /> Канбан
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar relative pt-2">
        {view === 'List' ? (
          <ListView
            urgent={urgentTasks}
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
        className="fixed bottom-32 right-6 h-16 w-16 rounded-[2rem] bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 ring-4 ring-white dark:ring-slate-900"
      >
        <Icon name="add_task" className="text-[32px]" />
      </button>
    </div>
  );
};

const TaskCard: React.FC<{ task: Task; navigate: any }> = ({ task, navigate }) => {
  return (
    <div
      onClick={() => navigate(`/task/${task.id}`)}
      className="flex flex-col gap-4 rounded-[2.2rem] bg-white dark:bg-surface-dark p-6 shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all cursor-pointer group hover:shadow-xl"
    >
      <div className="flex justify-between items-start">
        <span
          className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
            task.priority === 'Высокий'
              ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
              : 'bg-gray-100 dark:bg-white/5 text-gray-400 border-transparent'
          }`}
        >
          {task.priority}
        </span>
        <span className="text-[10px] font-bold text-gray-400">{task.deadline}</span>
      </div>

      <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-primary transition-colors">
        {task.title}
      </h3>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center text-[10px] font-black">
            {task.assignee ? task.assignee[0] : 'A'}
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
            {task.assignee}
          </span>
        </div>
        <div className="h-8 w-8 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300">
          <Icon name="arrow_forward" className="text-[18px]" />
        </div>
      </div>
    </div>
  );
};

const ListView = ({ urgent, inProgress, navigate }: any) => (
  <div className="pb-40 px-6 space-y-8">
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
    {inProgress.length > 0 && (
      <section>
        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 px-2">
          В работе
        </h3>
        <div className="space-y-4">
          {inProgress.map((t: Task) => (
            <TaskCard key={t.id} task={t} navigate={navigate} />
          ))}
        </div>
      </section>
    )}
  </div>
);

const KanbanColumn = ({ title, tasks, updateStatus, nextStatus, navigate, color }: any) => (
  <div className="flex flex-col w-[85vw] h-full shrink-0 snap-center first:pl-6 last:pr-6">
    <div className="flex items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-2">
        <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tighter uppercase">
          {title}
        </h3>
        <span className="h-6 px-2 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-lg text-[10px] font-black text-gray-400">
          {tasks.length}
        </span>
      </div>
      <div className={`h-2 w-2 rounded-full ${color}`}></div>
    </div>
    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-40 rounded-[2.5rem] bg-gray-100/50 dark:bg-black/20 p-4 border border-white dark:border-white/5">
      {tasks.map((t: Task) => (
        <div
          key={t.id}
          onClick={() => navigate(`/task/${t.id}`)}
          className="bg-white dark:bg-surface-dark p-5 rounded-[1.8rem] shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all group"
        >
          <div className="flex justify-between items-start mb-3">
            <span
              className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${
                t.priority === 'Высокий'
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-gray-400 bg-gray-100 dark:bg-white/5'
              }`}
            >
              {t.priority}
            </span>
            <Icon name="more_horiz" className="text-gray-300" />
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-primary transition-colors">
            {t.title}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex -space-x-2">
              <div className="h-7 w-7 rounded-lg bg-primary text-white border-2 border-white dark:border-surface-dark flex items-center justify-center text-[9px] font-black">
                {t.assignee ? t.assignee[0] : 'A'}
              </div>
            </div>
            {nextStatus && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(t.id, nextStatus);
                }}
                className="h-8 px-4 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-90"
              >
                Далее
              </button>
            )}
          </div>
        </div>
      ))}
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

export default TasksScreen;
