import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Icon from './Icon';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppContext();

  if (!isAuthenticated) return null;

  const hideNavRoutes = ['/notifications', '/login'];
  const isHiddenRoute = hideNavRoutes.some(path => location.pathname.startsWith(path));
  const isDetailRoute = /^\/(order|inventory|task|edit-product|edit-task|warehouse|staff|suppliers|analytics)\/.+/.test(location.pathname);
  const isNewRoute = /\/(new|edit)$/.test(location.pathname);

  if (isHiddenRoute || isDetailRoute || isNewRoute) return null;

  const navItems = [
    { name: 'Home', label: 'Главная', icon: 'home', path: '/' },
    { name: 'Orders', label: 'Заказы', icon: 'shopping_bag', path: '/orders' },
    { name: 'Tasks', label: 'Задачи', icon: 'check_circle', path: '/tasks' },
    { name: 'Stock', label: 'Склад', icon: 'inventory_2', path: '/inventory' },
    { name: 'Settings', label: 'Меню', icon: 'menu', path: '/settings' },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center px-4"
      style={{
        paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))'
      }}
    >
      <nav className="w-full max-w-md bg-white dark:bg-surface-dark backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl shadow-black/10 dark:shadow-black/30 flex items-center justify-between p-2 transition-colors">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className="flex items-center justify-center flex-1 py-2 transition-all active:scale-90"
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                  active
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'
                }`}
              >
                <Icon name={item.icon} filled={active} className="text-[24px]" />
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
