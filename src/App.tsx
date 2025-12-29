import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import BottomNav from './components/BottomNav';

// Placeholder screens (will be replaced with real screens)
const PlaceholderScreen = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
    <div className="text-center">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{title}</h1>
      <p className="text-sm text-gray-400">Coming soon...</p>
    </div>
  </div>
);

const LoginScreen = () => <PlaceholderScreen title="Login" />;
const DashboardScreen = () => <PlaceholderScreen title="Dashboard" />;
const OrdersScreen = () => <PlaceholderScreen title="Orders" />;
const TasksScreen = () => <PlaceholderScreen title="Tasks" />;
const InventoryScreen = () => <PlaceholderScreen title="Inventory" />;
const SettingsScreen = () => <PlaceholderScreen title="Settings" />;

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
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
