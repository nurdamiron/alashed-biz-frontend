import { Toaster } from 'react-hot-toast';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from '@/shared/context/AppContext';
import { BottomNav } from '@/shared/components';

// Features
import { LoginScreen } from '@/features/auth';
import { DashboardScreen } from '@/features/dashboard';
import { OrdersScreen } from '@/features/orders';
import { TasksScreen } from '@/features/tasks';
import { InventoryScreen } from '@/features/inventory';
import { SettingsScreen } from '@/features/settings';
import { NotificationsScreen } from '@/features/notifications';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAppContext();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <div className="bg-background-light dark:bg-black min-h-screen text-slate-900 dark:text-zinc-100 font-sans flex flex-col overflow-hidden transition-colors duration-300">
      <div className="flex-1 overflow-hidden relative">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsScreen />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm font-bold',
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '1rem',
            padding: '1rem',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
