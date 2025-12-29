import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import { getPriorityColor } from '@/shared/lib/utils';

const TaskDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tasks, updateTaskStatus } = useAppContext();

  const task = tasks.find((t) => t.id === id);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 && hrs > 0 ? '0' : ''}${mins}:${
      secs < 10 ? '0' : ''
    }${secs}`;
  };

  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Подготовить спецификацию компонентов', done: true },
    { id: 2, text: 'Проверить наличие на складе', done: false },
    { id: 3, text: 'Собрать и упаковать набор', done: false },
    { id: 4, text: 'Распечатать накладную', done: false },
  ]);

  const toggleCheck = (itemId: number) => {
    setChecklist(
      checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item))
    );
  };

  const completedCount = checklist.filter((i) => i.done).length;
  const progressPercentage = Math.round((completedCount / checklist.length) * 100);

  const [comments, setComments] = useState([
    {
      id: 1,
      user: 'Менеджер С.',
      text: 'Клиент просил добавить дополнительные датчики',
      time: '10:15',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const addComment = () => {
    if (!newComment.trim()) return;
    const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    setComments([...comments, { id: Date.now(), user: 'Вы', text: newComment, time: now }]);
    setNewComment('');
  };

  if (!task)
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark text-slate-500 font-bold">
        Задача не найдена
      </div>
    );

  const handleStatusChange = () => {
    const nextStatus =
      task.status === 'К выполнению'
        ? 'В процессе'
        : task.status === 'В процессе'
        ? 'Готово'
        : 'К выполнению';
    updateTaskStatus(task.id, nextStatus as any);

    if (nextStatus === 'В процессе') {
      setIsTimerRunning(true);
    } else if (nextStatus === 'Готово') {
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(false);
      setTimerSeconds(0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-[140px] transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl px-5 py-4 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-900 dark:text-white flex items-center justify-center w-11 h-11 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm active:scale-90 transition-all"
        >
          <Icon name="arrow_back_ios_new" className="text-[20px]" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">
            ALASH CORE
          </span>
          <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Задача
          </h2>
        </div>
        <button className="text-primary flex items-center justify-center w-11 h-11 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm active:scale-90 transition-all">
          <Icon name="edit_square" className="text-[24px]" />
        </button>
      </header>

      <main className="flex-1 px-5 pt-6 space-y-8">
        <section className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-7 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <span
              className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority} приоритет
            </span>
            <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-xl">
              <Icon name="history" className="text-[16px]" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {task.deadline || '24 Окт'}
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-4 tracking-tight">
            {task.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-text-secondary leading-relaxed mb-8 font-medium">
            {task.description || 'Описание задачи отсутствует.'}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">
                Исполнитель
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-primary/30">
                  АС
                </div>
                <span className="text-sm font-black text-slate-800 dark:text-white truncate">
                  {task.assignee || 'Алексей С.'}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">
                Таймер
              </span>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isTimerRunning
                      ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                  }`}
                >
                  <Icon
                    name="timer"
                    className={`text-[20px] ${isTimerRunning ? 'animate-pulse' : ''}`}
                  />
                </div>
                <span
                  className={`text-base font-black tracking-tight ${
                    isTimerRunning ? 'text-emerald-500' : 'text-slate-800 dark:text-white'
                  }`}
                >
                  {formatTime(timerSeconds)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
              Рабочие Этапы
            </h3>
            <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-xl uppercase tracking-widest">
              {progressPercentage}%
            </span>
          </div>

          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="bg-white dark:bg-surface-dark rounded-[2.2rem] p-3 shadow-sm border border-gray-100 dark:border-gray-800 space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`flex items-center gap-4 p-4 rounded-[1.5rem] transition-all cursor-pointer ${
                  item.done ? 'bg-emerald-500/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                    item.done
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {item.done && <Icon name="check_circle" className="text-[20px] font-bold" />}
                </div>
                <span
                  className={`text-sm font-bold flex-1 transition-all ${
                    item.done
                      ? 'text-gray-400 line-through'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-6">
          <h3 className="font-black text-lg text-slate-900 dark:text-white mb-4 px-1">
            Комментарии
          </h3>
          <div className="space-y-5">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`flex gap-4 ${comment.user === 'Вы' ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/5">
                  <Icon name="account_circle" className="text-[22px] text-gray-400" />
                </div>
                <div
                  className={`flex flex-col max-w-[80%] ${
                    comment.user === 'Вы' ? 'items-end' : ''
                  }`}
                >
                  <div
                    className={`p-4 rounded-[1.5rem] text-sm font-medium shadow-sm ${
                      comment.user === 'Вы'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className="font-black text-[9px] mb-1 uppercase tracking-widest opacity-60">
                      {comment.user}
                    </p>
                    <p className="leading-relaxed">{comment.text}</p>
                  </div>
                  <span className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-tighter opacity-60">
                    {comment.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
              placeholder="Написать сообщение..."
              className="flex-1 h-14 rounded-2xl bg-white dark:bg-surface-dark border-2 border-gray-100 dark:border-white/5 px-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white"
            />
            <button
              onClick={addComment}
              className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 active:scale-90 transition-all"
            >
              <Icon name="send" className="text-[22px]" />
            </button>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-[#111722]/80 backdrop-blur-2xl border-t border-gray-200 dark:border-gray-800 p-6 pb-10 z-40">
        <div className="flex gap-4 max-w-lg mx-auto">
          <button
            onClick={handleStatusChange}
            className={`flex-1 h-16 rounded-[1.5rem] text-white font-black text-base shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
              task.status === 'К выполнению'
                ? 'bg-slate-900 dark:bg-primary shadow-slate-900/30 dark:shadow-primary/40'
                : task.status === 'В процессе'
                ? 'bg-emerald-500 shadow-emerald-500/40'
                : 'bg-gray-200 dark:bg-gray-800 text-slate-500 dark:text-slate-400 border border-transparent dark:border-white/5'
            }`}
          >
            {task.status === 'К выполнению' && (
              <>
                <span>Начать работу</span>
                <Icon name="rocket_launch" className="text-[24px]" />
              </>
            )}
            {task.status === 'В процессе' && (
              <>
                <span>Завершить задачу</span>
                <Icon name="verified" className="text-[24px]" />
              </>
            )}
            {task.status === 'Готово' && (
              <>
                <span>Восстановить задачу</span>
                <Icon name="refresh" className="text-[24px]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailScreen;
