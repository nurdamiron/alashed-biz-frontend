import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Icon from './Icon';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, theme } = useAppContext();

  if (!isAuthenticated) return null;

  const hideNavRoutes = ['/notifications', '/login'];
  const isHiddenRoute = hideNavRoutes.some(path => location.pathname.startsWith(path));
  const isDetailRoute = /^\/(order|inventory|task|edit-product|edit-task|warehouse|staff|suppliers|analytics)\/.+/.test(location.pathname);
  const isNewRoute = /\/(new|edit)$/.test(location.pathname);

  if (isHiddenRoute || isDetailRoute || isNewRoute) return null;

  const isDark = theme === 'dark';

  const navItems = [
    { name: 'Home', icon: 'home', path: '/' },
    { name: 'Orders', icon: 'shopping_bag', path: '/orders' },
    { name: 'Tasks', icon: 'check_circle', path: '/tasks' },
    { name: 'Stock', icon: 'inventory_2', path: '/inventory' },
    { name: 'Settings', icon: 'settings', path: '/settings' },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-6"
      style={{
        paddingBottom: 'max(2rem, calc(2rem + env(safe-area-inset-bottom)))'
      }}
    >
      <nav className={`w-full max-w-sm backdrop-blur-2xl border rounded-[2rem] shadow-lg flex items-center justify-between p-1.5 transition-colors ${
        isDark
          ? 'bg-slate-900/90 border-white/10'
          : 'bg-white/90 border-slate-200/50 shadow-slate-200/50'
      }`}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center h-12 flex-1 rounded-2xl transition-all ${
                active
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : isDark
                    ? 'text-slate-500 hover:text-white'
                    : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon name={item.icon} filled={active} className="text-[20px]" />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
