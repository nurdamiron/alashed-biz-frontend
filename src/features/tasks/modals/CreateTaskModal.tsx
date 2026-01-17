import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import type { Employee, ChecklistItem } from '@/shared/types';

const TAG_DEFAULTS: Record<string, string> = {
  Общее: 'Новая задача',
  Сборка: 'Сборка робо-набора',
  Закуп: 'Закупка комплектующих',
  Логистика: 'Передача в курьерскую службу',
  Клиент: 'Уточнение деталей с клиентом',
  Дизайн: 'Разработка 3D модели/схемы',
};

const CHECKLIST_TEMPLATES: Record<string, ChecklistItem[]> = {
  Общее: [],
  Сборка: [
    { id: '1', text: 'Подготовить спецификацию компонентов', done: false },
    { id: '2', text: 'Проверить наличие на складе', done: false },
    { id: '3', text: 'Собрать и упаковать набор', done: false },
    { id: '4', text: 'Провести проверку качества', done: false },
    { id: '5', text: 'Распечатать накладную', done: false },
  ],
  Закуп: [
    { id: '1', text: 'Проверить остатки на складе', done: false },
    { id: '2', text: 'Составить список для закупки', done: false },
    { id: '3', text: 'Согласовать с поставщиком', done: false },
    { id: '4', text: 'Оформить заказ', done: false },
    { id: '5', text: 'Подтвердить оплату', done: false },
  ],
  Логистика: [
    { id: '1', text: 'Упаковать заказ', done: false },
    { id: '2', text: 'Распечатать документы', done: false },
    { id: '3', text: 'Вызвать курьера', done: false },
    { id: '4', text: 'Передать заказ курьеру', done: false },
    { id: '5', text: 'Отправить трек-номер клиенту', done: false },
  ],
  Клиент: [
    { id: '1', text: 'Связаться с клиентом', done: false },
    { id: '2', text: 'Уточнить детали заказа', done: false },
    { id: '3', text: 'Согласовать изменения', done: false },
    { id: '4', text: 'Обновить информацию в системе', done: false },
  ],
  Дизайн: [
    { id: '1', text: 'Изучить требования', done: false },
    { id: '2', text: 'Создать черновой эскиз', done: false },
    { id: '3', text: 'Согласовать с клиентом', done: false },
    { id: '4', text: 'Подготовить финальную версию', done: false },
    { id: '5', text: 'Экспортировать файлы', done: false },
  ],
};

const CreateTaskModal = () => {
  const navigate = useNavigate();
  const { addTask, employees } = useAppContext();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<'Высокий' | 'Средний' | 'Низкий'>('Средний');
  const [selectedTag, setSelectedTag] = useState('Общее');
  const [selectedAssignee, setSelectedAssignee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const handleTagChange = (tag: string) => {
    const prevDefault = TAG_DEFAULTS[selectedTag];
    if (!title || title === prevDefault) {
      setTitle(TAG_DEFAULTS[tag]);
    }
    setSelectedTag(tag);
    // Загружаем шаблон чеклиста для выбранного типа задачи
    const template = CHECKLIST_TEMPLATES[tag] || [];
    setChecklist(template.map(item => ({ ...item, id: Date.now().toString() + Math.random() })));
  };

  const handleCreate = async () => {
    if (!title || isCreating) return;

    setIsCreating(true);
    try {
      // Combine selectedDate and selectedTime into ISO string
      // Создаем дату в локальном времени (GMT+5)
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();

      // Создаем дату с учетом локального часового пояса
      const deadlineDate = new Date(year, month, day, hours, minutes, 0, 0);

      await addTask({
        id: Date.now().toString(),
        title,
        description: desc,
        priority,
        status: 'К выполнению',
        deadline: deadlineDate.toISOString(),
        time: selectedTime,
        assignee: selectedAssignee?.name || 'Админ',
        assigneeId: selectedAssignee?.id,
        tag: selectedTag,
        checklist: checklist.length > 0 ? checklist : undefined,
      });
      navigate(-1);
    } catch (error) {
      console.error('Failed to create task:', error);
      setIsCreating(false);
    }
  };

  const tags = Object.keys(TAG_DEFAULTS);

  const priorityOptions = [
    { id: 'Низкий', label: 'Низкий', color: 'emerald', icon: 'low_priority' },
    { id: 'Средний', label: 'Средний', color: 'orange', icon: 'priority_high' },
    { id: 'Высокий', label: 'Высокий', color: 'red', icon: 'notification_important' },
  ];

  const timeOptions = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden z-50">
      <div className="flex-none pt-3 pb-1 flex justify-center">
        <div className="h-1.5 w-14 rounded-full bg-gray-200 dark:bg-white/10"></div>
      </div>

      <div className="flex-none flex items-center justify-between px-6 pb-4 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-gray-400 active:scale-90 transition-all"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
            Новый процесс
          </span>
          <h2 className="text-slate-900 dark:text-white text-lg font-black tracking-tight uppercase">
            Задача
          </h2>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-8 pb-48">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">
            Тип задачи
          </label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagChange(tag)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${
                  selectedTag === tag
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                    : 'bg-white dark:bg-surface-dark text-gray-400 border-gray-100 dark:border-white/5'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <div className="relative">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-[2.2rem] text-slate-900 dark:text-white focus:outline-0 border-none bg-white dark:bg-surface-dark h-16 px-7 text-lg font-bold transition-all shadow-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-primary/50"
                placeholder="Название задачи..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">
              Исполнитель и нагрузка
            </label>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1">
            {Array.isArray(employees) && employees.map((emp) => {
              const isSelected = selectedAssignee?.id === emp.id;
              const workloadColor =
                emp.activeTasks > 4
                  ? 'bg-red-500'
                  : emp.activeTasks > 2
                  ? 'bg-orange-500'
                  : 'bg-emerald-500';
              return (
                <button
                  key={emp.id}
                  onClick={() => setSelectedAssignee(emp)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-[2.2rem] border min-w-[110px] transition-all duration-300 ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xl shadow-primary/25 scale-105'
                      : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="h-12 w-12 rounded-2xl object-cover border-2 border-white/20"
                    />
                    <span
                      className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-surface-dark text-white ${workloadColor}`}
                    >
                      {emp.activeTasks}
                    </span>
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-[11px] font-black leading-none mb-1 ${
                        isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {emp.name.split(' ')[0]}
                    </p>
                    <p
                      className={`text-[8px] font-bold uppercase tracking-widest opacity-60 ${
                        isSelected ? 'text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      {emp.role}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">
            Дедлайн и время
          </label>
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 space-y-6 transition-all duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Icon name="schedule" className="text-[28px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Icon name="access_time" className="text-[14px] text-primary" />
                    <span className="text-sm font-bold text-primary">
                      {selectedTime}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  showDatePicker
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                }`}
              >
                {showDatePicker ? 'Готово' : 'Изменить'}
              </button>
            </div>

            {showDatePicker && (
              <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <CustomCalendar onSelect={setSelectedDate} selectedDate={selectedDate} />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                      Выберите время
                    </span>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="h-10 px-4 rounded-xl text-sm font-bold bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {timeOptions.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black border transition-all shrink-0 ${
                          selectedTime === t
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-gray-50 dark:bg-white/5 text-gray-400 border-transparent'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">
            Приоритет исполнения
          </label>
          <div className="flex items-center gap-3">
            {priorityOptions.map((opt) => {
              const isSelected = priority === opt.id;
              const colorClasses = {
                emerald: isSelected
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                orange: isSelected
                  ? 'bg-orange-500 text-white shadow-orange-500/30'
                  : 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                red: isSelected
                  ? 'bg-red-500 text-white shadow-red-500/30'
                  : 'bg-red-500/10 text-red-500 border-red-500/20',
              };

              return (
                <button
                  key={opt.id}
                  onClick={() => setPriority(opt.id as any)}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 py-5 rounded-[2.2rem] border transition-all duration-300 active:scale-95 ${
                    isSelected
                      ? `${colorClasses[opt.color as keyof typeof colorClasses]} scale-105 border-transparent`
                      : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5 text-gray-400 grayscale opacity-60'
                  }`}
                >
                  <Icon name={opt.icon} className="text-[26px]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">
            Инструкции и детали
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full resize-none rounded-[2.5rem] text-slate-900 dark:text-white focus:outline-0 border-none bg-white dark:bg-surface-dark min-h-[140px] p-7 text-sm font-medium leading-relaxed transition-all shadow-sm ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-primary/50"
            placeholder="Опишите, что именно нужно сделать..."
          ></textarea>
        </div>

        {/* Чеклист */}
        {checklist.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">
                Рабочие этапы ({checklist.length})
              </label>
              <button
                onClick={() => {
                  const newItem: ChecklistItem = {
                    id: Date.now().toString() + Math.random(),
                    text: '',
                    done: false,
                  };
                  setChecklist([...checklist, newItem]);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                <Icon name="add_circle" className="text-[14px]" />
                Этап
              </button>
            </div>
            <div className="bg-white dark:bg-surface-dark rounded-[2.2rem] p-4 shadow-sm border border-gray-100 dark:border-white/5 space-y-2">
              {checklist.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                  <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 text-[10px] font-black shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const updated = [...checklist];
                      updated[index].text = e.target.value;
                      setChecklist(updated);
                    }}
                    className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white focus:outline-none placeholder-gray-400"
                    placeholder="Описание этапа..."
                  />
                  <button
                    onClick={() => {
                      setChecklist(checklist.filter((_, i) => i !== index));
                    }}
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center h-8 w-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 active:scale-90 transition-all"
                  >
                    <Icon name="delete" className="text-[16px]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-none p-6 pb-12  z-10">
        <button
          onClick={handleCreate}
          disabled={!title || isCreating}
          className="group relative flex w-full items-center justify-center h-16 rounded-[2.2rem] bg-primary overflow-hidden shadow-2xl shadow-primary/40 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
        >
          {isCreating ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-base font-black text-white uppercase tracking-widest">
                Создание...
              </span>
            </div>
          ) : (
            <div className="relative flex items-center gap-3">
              <span className="text-base font-black text-white uppercase tracking-widest">
                Запустить задачу
              </span>
              <Icon name="rocket_launch" className="text-[24px] text-white" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

const CustomCalendar: React.FC<{ onSelect: (date: Date) => void; selectedDate: Date }> = ({
  onSelect,
  selectedDate,
}) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const today = new Date();

  const monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m: number, y: number) => {
    let day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < new Date(today.setHours(0, 0, 0, 0));

    days.push(
      <button
        key={d}
        disabled={isPast}
        onClick={() => onSelect(date)}
        className={`h-10 w-full rounded-xl text-xs font-black transition-all flex items-center justify-center ${
          isSelected
            ? 'bg-primary text-white shadow-lg scale-110 z-10'
            : isToday
            ? 'bg-primary/10 text-primary border border-primary/20'
            : isPast
            ? 'text-gray-200 dark:text-gray-700 pointer-events-none'
            : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
        }`}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => setViewDate(new Date(year, month - 1))}
          className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400"
        >
          <Icon name="chevron_left" />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1))}
          className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400"
        >
          <Icon name="chevron_right" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((wd) => (
          <span key={wd} className="text-[8px] font-black text-gray-400 uppercase pb-2">
            {wd}
          </span>
        ))}
        {days}
      </div>
    </div>
  );
};

export default CreateTaskModal;
