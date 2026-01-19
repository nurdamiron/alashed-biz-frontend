import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { isPushSupported, getNotificationPermission, subscribeToPush, getCurrentSubscription } from '../lib/push';

const STORAGE_KEY = 'alash_push_prompted';

export function PushPrompt() {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkIfShouldShow();
  }, []);

  const checkIfShouldShow = async () => {
    // Don't show if not supported
    if (!isPushSupported()) return;

    // Don't show if already granted or denied
    const permission = getNotificationPermission();
    if (permission === 'denied') return;

    // Don't show if already subscribed
    const subscription = await getCurrentSubscription();
    if (subscription) return;

    // Don't show if already prompted recently (24 hours)
    const lastPrompted = localStorage.getItem(STORAGE_KEY);
    if (lastPrompted) {
      const lastTime = parseInt(lastPrompted, 10);
      const hoursSince = (Date.now() - lastTime) / (1000 * 60 * 60);
      if (hoursSince < 24) return;
    }

    // Show prompt after a short delay
    setTimeout(() => setShow(true), 2000);
  };

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const success = await subscribeToPush();
      if (success) {
        setShow(false);
      }
    } finally {
      setIsLoading(false);
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-700 p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Включить уведомления?
            </h3>
            <p className="text-slate-600 dark:text-zinc-400 text-xs mt-1">
              Получайте уведомления о новых заказах, задачах и важных событиях
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleEnable}
                disabled={isLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Подключение...' : 'Включить'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
