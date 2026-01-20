import { Icon } from '@/shared/components';

interface SessionExpiredModalProps {
  onLogin: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ onLogin }) => {
  const handleLogin = () => {
    // Clear any remaining auth data
    localStorage.removeItem('alash_token');
    localStorage.removeItem('alash_refresh_token');
    localStorage.removeItem('alash_auth');

    onLogin();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
          <Icon name="logout" className="text-3xl text-amber-600 dark:text-amber-400" />
        </div>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
          Сессия истекла
        </h2>

        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-8">
          Ваша сессия завершена. Пожалуйста, войдите снова для продолжения работы.
        </p>

        <button
          onClick={handleLogin}
          className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-500/25"
        >
          Войти снова
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
