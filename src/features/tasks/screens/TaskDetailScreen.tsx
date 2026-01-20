import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import { getPriorityIconBadge, formatDeadline } from '@/shared/lib/utils';
import type { Task } from '@/shared/types';

// Helper to get assignee display name from task
const getAssigneeName = (task: Task): string => {
  if (task.assignees && task.assignees.length > 0) {
    return task.assignees.map(a => a.name).join(', ');
  }
  return task.assignee || 'Не назначен';
};

// Helper to get assignee initials
const getAssigneeInitials = (task: Task): string => {
  if (task.assignees && task.assignees.length > 0) {
    const name = task.assignees[0].name;
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }
  if (task.assignee) {
    const parts = task.assignee.split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }
  return 'А';
};

const TaskDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tasks, updateTaskStatus, addTaskComment } = useAppContext();

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
    return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 && hrs > 0 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''
      }${secs}`;
  };

  const [checklist, setChecklist] = useState(task?.checklist || []);

  const toggleCheck = (itemId: string) => {
    setChecklist(
      checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item))
    );
  };

  const completedCount = checklist.filter((i) => i.done).length;
  const progressPercentage = Math.round((completedCount / checklist.length) * 100);

  const [newComment, setNewComment] = useState('');

  // Используем комментарии из задачи или пустой массив
  const comments = task?.comments || [];

  const addComment = async () => {
    if (!newComment.trim() || !task) return;

    try {
      await addTaskComment(task.id, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (!task)
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark text-slate-500 font-bold">
        Задача не найдена
      </div>
    );

  const handleStatusChange = async () => {
    const nextStatus =
      task.status === 'К выполнению'
        ? 'В процессе'
        : task.status === 'В процессе'
          ? 'Готово'
          : 'К выполнению';

    await updateTaskStatus(task.id, nextStatus as any);

    if (nextStatus === 'В процессе') {
      setIsTimerRunning(true);
    } else if (nextStatus === 'Готово') {
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(false);
      setTimerSeconds(0);
    }

    // Возвращаемся к списку задач после обновления статуса
    navigate('/tasks');
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div
          className="flex items-center justify-between px-5 pb-3"
          style={{
            paddingTop: 'max(1rem, calc(1rem + env(safe-area-inset-top)))'
          }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-slate-900 dark:text-white active:scale-90 transition-all"
          >
            <Icon name="arrow_back_ios_new" className="text-[18px]" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
              Детали
            </span>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Задача
            </h2>
          </div>
          <button
            onClick={() => navigate(`/tasks/${id}/edit`)}
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-primary active:scale-90 transition-all"
          >
            <Icon name="edit" className="text-[20px]" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 space-y-6 pb-40">

        {/* Main Info Card */}
        <section className="bg-white dark:bg-surface-dark rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-white/5">
          {/* Status & Priority Row */}
          <div className="flex items-center justify-between mb-5">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
              task.status === 'К выполнению'
                ? 'bg-orange-500/10 text-orange-500'
                : task.status === 'В процессе'
                  ? 'bg-blue-500/10 text-blue-500'
                  : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              <div className={`h-2 w-2 rounded-full ${
                task.status === 'К выполнению' ? 'bg-orange-500 animate-pulse'
                  : task.status === 'В процессе' ? 'bg-blue-500 animate-pulse'
                    : 'bg-emerald-500'
              }`} />
              <span className="text-[10px] font-black uppercase tracking-wider">{task.status}</span>
            </div>
            {(() => {
              const priorityStyle = getPriorityIconBadge(task.priority);
              return (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${priorityStyle.color}/10`}>
                  <Icon name={priorityStyle.icon} className={`text-[16px] ${priorityStyle.color.replace('bg-', 'text-')}`} />
                  <span className={`text-[10px] font-black uppercase ${priorityStyle.color.replace('bg-', 'text-')}`}>
                    {priorityStyle.label}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Title */}
          <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-3">
            {task.title}
          </h1>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
              {task.description}
            </p>
          )}

          {/* Deadline */}
          {(() => {
            const isOverdue = task.deadline && task.status !== 'Готово' && new Date(task.deadline) < new Date();
            return task.deadline && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-5 ${
                isOverdue
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400'
              }`}>
                <Icon name="schedule" className="text-[18px]" />
                <span className="text-xs font-bold">
                  {isOverdue ? 'Просрочено: ' : 'Дедлайн: '}
                  {formatDeadline(task.deadline)}
                </span>
              </div>
            );
          })()}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">
                {getAssigneeInitials(task)}
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Исполнитель</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {getAssigneeName(task)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isTimerRunning
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-400'
              }`}>
                <Icon name="timer" className={`text-[20px] ${isTimerRunning ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Таймер</p>
                <p className={`text-sm font-black ${isTimerRunning ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                  {formatTime(timerSeconds)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Checklist */}
        {checklist.length > 0 && (
          <section className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Рабочие этапы
                </h3>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {completedCount} из {checklist.length} выполнено
                </p>
              </div>
              <span className="text-2xl font-black text-primary">{progressPercentage}%</span>
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full mb-4 overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
              {checklist.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer active:scale-[0.98] ${
                    item.done
                      ? 'bg-emerald-500/5'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-black text-gray-400">
                    {index + 1}
                  </span>
                  <div className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                    item.done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    {item.done && <Icon name="check" className="text-[16px]" />}
                  </div>
                  <span className={`text-sm font-medium flex-1 ${
                    item.done
                      ? 'text-gray-400 line-through'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comments */}
        <section className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 shadow-sm border border-gray-100 dark:border-white/5">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            Комментарии ({comments.length})
          </h3>

          <div className="space-y-4 mb-4">
            {comments.length > 0 ? (
              comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black">
                      {(comment.userName || 'П')[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {comment.userName || 'Пользователь'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(comment.createdAt).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Icon name="chat_bubble_outline" className="text-3xl text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-xs text-gray-400">Комментариев пока нет</p>
              </div>
            )}
          </div>

          {/* Comment input */}
          <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-white/5">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
              placeholder="Написать комментарий..."
              className="flex-1 h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-none px-4 text-sm font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={addComment}
              disabled={!newComment.trim()}
              className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-all disabled:opacity-30"
            >
              <Icon name="send" className="text-[20px]" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer Action Button */}
      <div className="flex-none p-5 pb-8 bg-background-light dark:bg-background-dark">
        <button
          onClick={handleStatusChange}
          className={`w-full h-16 rounded-[2rem] font-black text-base flex items-center justify-center gap-3 active:scale-95 transition-all ${
            task.status === 'К выполнению'
              ? 'bg-primary text-white shadow-2xl shadow-primary/40'
              : task.status === 'В процессе'
                ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40'
                : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
          }`}
        >
          {task.status === 'К выполнению' && (
            <>
              <span className="uppercase tracking-widest">Начать работу</span>
              <Icon name="rocket_launch" className="text-[24px]" />
            </>
          )}
          {task.status === 'В процессе' && (
            <>
              <span className="uppercase tracking-widest">Завершить</span>
              <Icon name="check_circle" className="text-[24px]" />
            </>
          )}
          {task.status === 'Готово' && (
            <>
              <span className="uppercase tracking-widest">Вернуть в работу</span>
              <Icon name="refresh" className="text-[24px]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskDetailScreen;
