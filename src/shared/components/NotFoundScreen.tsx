import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

const NotFoundScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* 404 Icon */}
        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mb-8">
          <Icon name="search_off" className="text-6xl text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-7xl font-black text-slate-900 dark:text-white mb-2">
          404
        </h1>

        {/* Subtitle */}
        <h2 className="text-xl font-bold text-slate-700 dark:text-gray-300 mb-4">
          Страница не найдена
        </h2>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm">
          Запрашиваемая страница не существует или была перемещена
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate('/')}
            className="w-full h-14 rounded-2xl bg-primary text-white font-bold active:scale-95 transition-all shadow-lg shadow-primary/30"
          >
            На главную
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full h-14 rounded-2xl bg-gray-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold active:scale-95 transition-all"
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundScreen;
