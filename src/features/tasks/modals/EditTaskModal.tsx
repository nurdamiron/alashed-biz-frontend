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
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Pill indicator */}
      <div className="flex-none pt-3 pb-1 flex justify-center">
        <div className="h-1.5 w-14 rounded-full bg-gray-200 dark:bg-white/10"></div>
      </div>

      <header className="flex-none flex items-center justify-between px-6 pb-4 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-gray-400 active:scale-90 transition-all"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
            Редактирование
          </span>
          <h1 className="text-slate-900 dark:text-white text-lg font-black tracking-tight uppercase">
            Задача
          </h1>
        </div>
        <div className="w-10" />
      </header>

      <form className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 pb-48">
        <div className="space-y-6">
          {/* Название */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Название *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Например, Собрать робо-набор..."
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Описание
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[120px]"
              placeholder="Детали задачи..."
            ></textarea>
          </div>

          {/* Приоритет */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Приоритет
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Низкий', 'Средний', 'Высокий'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level as any)}
                  className={`py-3 rounded-xl text-xs font-bold transition-all ${
                    priority === level
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Исполнитель */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Исполнитель
            </label>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {employees.map((emp) => {
                const isSelected = selectedAssignee?.id === emp.id;
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => setSelectedAssignee(emp)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border min-w-[100px] transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5'
                    }`}
                  >
                    <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-white/20'
                        : 'bg-gradient-to-br from-primary to-blue-600'
                    }`}>
                      <span className="text-white font-black text-lg">
                        {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {emp.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Дедлайн */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Дедлайн
            </label>
            <div className="flex gap-3">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="flex-1 h-14 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark px-5 text-base font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-28 h-14 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark px-4 text-base font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Кнопка удаления */}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-red-500/10 text-red-500 font-bold text-sm active:scale-95 transition-all"
          >
            <Icon name="delete" className="text-[20px]" />
            Удалить задачу
          </button>
        </div>
      </form>

      {/* Submit Button */}
      <div className="flex-none p-6 pb-12 z-10">
        <button
          onClick={handleSave}
          disabled={!title}
          className="group relative flex w-full items-center justify-center h-16 rounded-[2rem] bg-primary overflow-hidden shadow-2xl shadow-primary/40 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
        >
          <div className="relative flex items-center gap-3">
            <span className="text-base font-black text-white uppercase tracking-widest">
              Сохранить изменения
            </span>
            <Icon name="save" className="text-[24px] text-white" />
          </div>
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
