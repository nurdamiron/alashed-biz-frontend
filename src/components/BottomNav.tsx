import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Icon from './Icon';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppContext();

  if (!isAuthenticated) return null;

  const hideNavRoutes = ['/notifications', '/create-task', '/create-order', '/create-product', '/login'];
  const isHiddenRoute = hideNavRoutes.some(path => location.pathname.startsWith(path));
  const isDetailRoute = /^\/(order|inventory|task|edit-product|edit-task)\/.+/.test(location.pathname);

  if (isHiddenRoute || isDetailRoute) return null;

  const navItems = [
    { name: 'Home', icon: 'home', path: '/' },
    { name: 'Orders', icon: 'shopping_bag', path: '/orders' },
    { name: 'Tasks', icon: 'check_circle', path: '/tasks' },
    { name: 'Stock', icon: 'inventory_2', path: '/inventory' },
    { name: 'Settings', icon: 'settings', path: '/settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-8 px-8">
      <nav className="w-full max-w-sm bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-gray-100 dark:border-white/10 rounded-[2rem] shadow-sm flex items-center justify-between p-1.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center h-12 flex-1 rounded-2xl transition-all ${active ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-400'
                }`}
            >
              <Icon name={item.icon} filled={active} className="text-[20px]" />
            </button>
          )
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
