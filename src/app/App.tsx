import { Toaster } from 'react-hot-toast';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from '@/shared/context/AppContext';
import { BottomNav } from '@/shared/components';

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
            path="/task/:id/edit"
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
