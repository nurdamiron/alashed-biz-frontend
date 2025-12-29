import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const EditTaskModal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tasks, updateTask } = useAppContext();

  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<'Высокий' | 'Средний' | 'Низкий'>('Средний');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDesc(task.description || '');
      setPriority(task.priority);
      setDeadline(task.deadline || '');
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    if (!title) return;

    updateTask({
      ...task,
      title,
      description: desc,
      priority,
      deadline: deadline || task.deadline,
    });
    navigate(-1);
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden z-50">
      <div className="flex-none pt-2 pb-2 bg-background-light dark:bg-background-dark w-full">
        <div className="flex flex-col items-center justify-center">
          <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-[#324467]"></div>
        </div>
      </div>
      <div className="flex-none flex items-center justify-between px-4 pb-4 pt-2 bg-background-light dark:bg-background-dark border-b border-transparent dark:border-[#324467]/30">
        <button onClick={() => navigate(-1)} className="text-primary text-base font-medium active:opacity-70">
          Отмена
        </button>
        <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
          Редактирование
        </h2>
        <button onClick={handleSave} className="text-primary text-base font-bold active:opacity-70">
          Готово
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div className="space-y-2">
          <label className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
            Название
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal transition-colors"
            placeholder="Например, Собрать робо-набор..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
            Описание
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full resize-none rounded-xl text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark min-h-[120px] p-4 text-base font-normal leading-relaxed transition-colors"
            placeholder="Детали задачи..."
          ></textarea>
        </div>

        <div className="space-y-3">
          <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Приоритет</p>
          <div className="flex items-center gap-3">
            {['Низкий', 'Средний', 'Высокий'].map((level) => (
              <label key={level} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  className="peer sr-only"
                  checked={priority === level}
                  onChange={() => setPriority(level as any)}
                />
                <div className="flex items-center justify-center py-2.5 px-3 rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark text-gray-500 dark:text-text-secondary peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary transition-all">
                  <span className="text-sm font-medium">{level}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark divide-y divide-gray-100 dark:divide-border-dark/50">
          <button className="flex w-full items-center justify-between p-4 active:bg-gray-50 dark:active:bg-[#252f44] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary">
                <Icon name="person" className="text-[20px]" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Исполнитель</span>
                <span className="text-xs text-gray-500 dark:text-text-secondary">
                  {task.assignee || 'Не назначен'}
                </span>
              </div>
            </div>
            <Icon
              name="chevron_right"
              className="text-gray-400 dark:text-gray-600 group-hover:text-primary transition-colors"
            />
          </button>
          <button className="flex w-full items-center justify-between p-4 active:bg-gray-50 dark:active:bg-[#252f44] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Icon name="calendar_today" className="text-[20px]" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Срок</span>
                <span className="text-xs text-gray-500 dark:text-text-secondary">
                  {deadline || 'Без срока'}
                </span>
              </div>
            </div>
            <Icon
              name="chevron_right"
              className="text-gray-400 dark:text-gray-600 group-hover:text-purple-500 transition-colors"
            />
          </button>
        </div>
        <div className="h-6"></div>
      </div>

      <div className="flex-none p-4 pb-8 bg-background-light dark:bg-background-dark border-t border-transparent dark:border-[#324467]/30">
        <button
          onClick={handleSave}
          className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};

export default EditTaskModal;
