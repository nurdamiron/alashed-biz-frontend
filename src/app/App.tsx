import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from '@/shared/context/AppContext';
import { BottomNav, NotFoundScreen } from '@/shared/components';
import { PushPrompt } from '@/shared/components/PushPrompt';
import Loading from '@/shared/components/Loading';
import { initializePush } from '@/shared/lib/push';

// Features - Screens
import { LoginScreen } from '@/features/auth';
import { DashboardScreen } from '@/features/dashboard';
import { OrdersScreen, OrderDetailScreen, CreateOrderModal } from '@/features/orders';
import { TasksScreen, TaskDetailScreen, CreateTaskModal, EditTaskModal } from '@/features/tasks';
import { InventoryScreen, InventoryDetailScreen, CreateProductModal, EditProductModal, ReceiveGoodsModal } from '@/features/inventory';
import { StaffScreen, CreateStaffModal, EditStaffModal } from '@/features/staff';
import { SuppliersScreen, CreateSupplierModal, EditSupplierModal } from '@/features/suppliers';
import { AnalyticsScreen } from '@/features/analytics';
import { WarehouseScreen, CreateLocationModal } from '@/features/warehouse';
import { SettingsScreen } from '@/features/settings';
import { NotificationsScreen } from '@/features/notifications';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAppContext();

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize push notifications after authentication
      initializePush().catch(console.error);
    }
  }, [isAuthenticated]);

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { theme, isAuthenticated, isDataLoading } = useAppContext();

  if (isDataLoading) {
    return <Loading />;
  }

  return (
    <div
      className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-zinc-100 font-sans flex flex-col overflow-hidden transition-colors duration-300"
      style={{
        height: '100dvh', // Dynamic viewport height for modern browsers
        backgroundColor: theme === 'dark' ? '#000000' : '#fcfcfd', // Force inline style for debugging
      }}
    >
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
          {/* Orders */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order/:id"
            element={
              <ProtectedRoute>
                <OrderDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/new"
            element={
              <ProtectedRoute>
                <CreateOrderModal />
              </ProtectedRoute>
            }
          />
          {/* Tasks */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task/:id"
            element={
              <ProtectedRoute>
                <TaskDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/new"
            element={
              <ProtectedRoute>
                <CreateTaskModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id/edit"
            element={
              <ProtectedRoute>
                <EditTaskModal />
              </ProtectedRoute>
            }
          />
          {/* Inventory */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/:id"
            element={
              <ProtectedRoute>
                <InventoryDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/new"
            element={
              <ProtectedRoute>
                <CreateProductModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/:id/edit"
            element={
              <ProtectedRoute>
                <EditProductModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/receive"
            element={
              <ProtectedRoute>
                <ReceiveGoodsModal />
              </ProtectedRoute>
            }
          />
          {/* Staff */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <StaffScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/new"
            element={
              <ProtectedRoute>
                <CreateStaffModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/:id/edit"
            element={
              <ProtectedRoute>
                <EditStaffModal />
              </ProtectedRoute>
            }
          />
          {/* Suppliers */}
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <SuppliersScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers/new"
            element={
              <ProtectedRoute>
                <CreateSupplierModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers/:id/edit"
            element={
              <ProtectedRoute>
                <EditSupplierModal />
              </ProtectedRoute>
            }
          />
          {/* Analytics */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsScreen />
              </ProtectedRoute>
            }
          />
          {/* Warehouse */}
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute>
                <WarehouseScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse/new"
            element={
              <ProtectedRoute>
                <CreateLocationModal />
              </ProtectedRoute>
            }
          />
          {/* Settings & Notifications */}
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
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <NotFoundScreen />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {isAuthenticated && <PushPrompt />}
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
