import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Icon from './Icon';
import {
  isPushSupported,
  getPushState,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestPush,
  type PushNotificationState,
} from '../lib/push';
import toast from 'react-hot-toast';

const PushNotificationToggle = () => {
  const { theme, user } = useAppContext();
  const isDark = theme === 'dark';

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
      <div
        className={`p-4 rounded-2xl ${
          isDark ? 'bg-zinc-900' : 'bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDark ? 'bg-zinc-800' : 'bg-slate-200'
            }`}
          >
            <Icon name="notifications_off" className="text-slate-500" />
          </div>
          <div className="flex-1">
            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Push-уведомления
            </p>
            <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
              Не поддерживается на этом устройстве
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-2xl ${
        isDark ? 'bg-zinc-900' : 'bg-slate-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            state.isSubscribed
              ? 'bg-blue-500/20'
              : isDark
              ? 'bg-zinc-800'
              : 'bg-slate-200'
          }`}
        >
          <Icon
            name={state.isSubscribed ? 'notifications_active' : 'notifications'}
            className={state.isSubscribed ? 'text-blue-500' : 'text-slate-500'}
          />
        </div>
        <div className="flex-1">
          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Push-уведомления
          </p>
          <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
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
          className={`relative w-14 h-8 rounded-full transition-colors ${
            state.isSubscribed
              ? 'bg-blue-500'
              : isDark
              ? 'bg-zinc-700'
              : 'bg-slate-300'
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
        <p className="mt-3 text-sm text-amber-500">
          Разрешите уведомления в настройках браузера для этого сайта
        </p>
      )}

      {state.isSubscribed && user?.role === 'admin' && (
        <button
          onClick={handleTestPush}
          disabled={loading}
          className={`mt-3 w-full py-2 rounded-xl text-sm font-medium transition-colors ${
            isDark
              ? 'bg-zinc-800 text-white hover:bg-zinc-700'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          } ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? 'Отправка...' : 'Отправить тестовое уведомление'}
        </button>
      )}
    </div>
  );
};

export default PushNotificationToggle;
