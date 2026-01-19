import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon, ConfirmDialog } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import type { Employee } from '@/shared/types';

const EditTaskModal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tasks, updateTask, employees, deleteTask } = useAppContext();

  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<'Высокий' | 'Средний' | 'Низкий'>('Средний');
  const [selectedAssignee, setSelectedAssignee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDesc(task.description || '');
      setPriority(task.priority);

      if (task.assigneeId) {
        const assignee = employees.find(e => e.id === task.assigneeId);
        if (assignee) setSelectedAssignee(assignee);
      }

      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        setSelectedDate(deadlineDate);
        setSelectedTime(deadlineDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false }));
      }
    }
  }, [task, employees]);

  if (!task) return null;

  const handleSave = async () => {
    if (!title) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    const deadlineDate = new Date(year, month, day, hours, minutes, 0, 0);

    await updateTask({
      ...task,
      title,
      description: desc,
      priority,
      assigneeId: selectedAssignee?.id,
      assignee: selectedAssignee?.name,
      deadline: deadlineDate.toISOString(),
    });
    navigate(-1);
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    navigate('/tasks');
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

        {/* Исполнитель */}
        <div className="space-y-3">
          <label className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Исполнитель</label>
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            {employees.map((emp) => {
              const isSelected = selectedAssignee?.id === emp.id;
              return (
                <button
                  key={emp.id}
                  onClick={() => setSelectedAssignee(emp)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border min-w-[100px] transition-all ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-lg'
                      : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-border-dark'
                  }`}
                >
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {emp.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Дедлайн */}
        <div className="space-y-3">
          <label className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Дедлайн</label>
          <div className="flex gap-3">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="flex-1 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-3 text-sm font-medium text-gray-900 dark:text-white"
            />
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-32 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-3 text-sm font-medium text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Кнопка удаления */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm active:scale-95 transition-all"
        >
          <Icon name="delete" className="text-[20px]" />
          Удалить задачу
        </button>

        <div className="h-6"></div>
      </div>

      <div className="flex-none p-4 pb-8 bg-background-light dark:bg-background-dark border-t border-transparent dark:border-[#324467]/30">
        <button
          onClick={handleSave}
          className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          Сохранить изменения
        </button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Удалить задачу?"
        message="Это действие нельзя отменить. Задача будет удалена навсегда."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />
    </div>
  );
};

export default EditTaskModal;
