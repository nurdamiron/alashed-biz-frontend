import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Icon from './Icon';
import {
  getPushState,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestPush,
  type PushNotificationState,
} from '../lib/push';
import toast from 'react-hot-toast';

const PushNotificationToggle = () => {
  const { user } = useAppContext();

  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    const pushState = await getPushState();
    setState(pushState);
  };

  const handleToggle = async () => {
    if (!state.isSupported) {
      toast.error('Push-уведомления не поддерживаются');
      return;
    }

    setLoading(true);

    try {
      if (state.isSubscribed) {
        const success = await unsubscribeFromPush();
        if (success) {
          toast.success('Push-уведомления отключены');
          setState((prev) => ({ ...prev, isSubscribed: false }));
        } else {
          toast.error('Не удалось отключить уведомления');
        }
      } else {
        const success = await subscribeToPush();
        if (success) {
          toast.success('Push-уведомления включены');
          setState((prev) => ({ ...prev, isSubscribed: true, permission: 'granted' }));
        } else {
          if (state.permission === 'denied') {
            toast.error('Уведомления заблокированы в настройках браузера');
          } else {
            toast.error('Не удалось включить уведомления');
          }
        }
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPush = async () => {
    if (!state.isSubscribed) {
      toast.error('Сначала включите уведомления');
      return;
    }

    setLoading(true);
    try {
      const success = await sendTestPush();
      if (success) {
        toast.success('Тестовое уведомление отправлено');
      } else {
        toast.error('Не удалось отправить тестовое уведомление');
      }
    } catch (error) {
      toast.error('Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  if (!state.isSupported) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
          <Icon name="notifications_off" className="text-gray-400 text-2xl" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-900 dark:text-white">
            Push-уведомления
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Не поддерживается
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          state.isSubscribed
            ? 'bg-primary/10'
            : 'bg-gray-100 dark:bg-white/5'
        }`}>
          <Icon
            name={state.isSubscribed ? 'notifications_active' : 'notifications'}
            className={`text-2xl ${state.isSubscribed ? 'text-primary' : 'text-gray-400'}`}
          />
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-900 dark:text-white">
            Push-уведомления
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {state.permission === 'denied'
              ? 'Заблокированы в браузере'
              : state.isSubscribed
              ? 'Включены'
              : 'Отключены'}
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={loading || state.permission === 'denied'}
          className={`relative w-14 h-8 rounded-full transition-all active:scale-95 ${
            state.isSubscribed
              ? 'bg-primary'
              : 'bg-gray-200 dark:bg-white/10'
          } ${loading || state.permission === 'denied' ? 'opacity-50' : ''}`}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
              state.isSubscribed ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>

      {state.permission === 'denied' && (
        <p className="text-sm text-amber-500 font-medium">
          Разрешите уведомления в настройках браузера для этого сайта
        </p>
      )}

      {state.isSubscribed && user?.role === 'admin' && (
        <button
          onClick={handleTestPush}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] bg-gray-100 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 ${
            loading ? 'opacity-50' : ''
          }`}
        >
          {loading ? 'Отправка...' : 'Отправить тестовое уведомление'}
        </button>
      )}
    </div>
  );
};

export default PushNotificationToggle;
