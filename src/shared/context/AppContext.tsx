import { type ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { UIProvider, useUI } from './UIContext';
import { DataProvider, useData } from './DataContext';
import { formatPrice } from '../lib/utils';
import Loading from '../components/Loading';

// Combined provider that wraps all contexts in correct order
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <AuthLoadingWrapper>
        <UIProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </UIProvider>
      </AuthLoadingWrapper>
    </AuthProvider>
  );
};

// Shows loading screen while auth is initializing
const AuthLoadingWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
};

// Backward-compatible hook that combines all contexts
export const useAppContext = () => {
  const auth = useAuth();
  const ui = useUI();
  const data = useData();

  return {
    // Auth
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    isLoading: auth.isLoading,
    login: auth.login,
    logout: auth.logout,

    // UI
    theme: ui.theme,
    toggleTheme: ui.toggleTheme,
    appName: ui.appName,
    businessDomain: ui.businessDomain,
    setAppConfig: ui.setAppConfig,
    currency: ui.currency,
    setCurrency: ui.setCurrency,
    isWsConnected: ui.isWsConnected,

    // Data
    orders: data.orders,
    tasks: data.tasks,
    products: data.products,
    employees: data.employees,
    suppliers: data.suppliers,
    transactions: data.transactions,
    notifications: data.notifications,
    stats: data.stats,
    isDataLoading: data.isDataLoading,

    // Order actions
    addOrder: data.addOrder,
    updateOrderStatus: data.updateOrderStatus,
    cancelOrder: data.cancelOrder,

    // Task actions
    addTask: data.addTask,
    updateTask: data.updateTask,
    updateTaskStatus: data.updateTaskStatus,
    deleteTask: data.deleteTask,
    addTaskComment: data.addTaskComment,

    // Product actions
    addProduct: data.addProduct,
    updateProduct: data.updateProduct,
    deleteProduct: data.deleteProduct,
    updateProductStock: data.updateProductStock,
    getProductLogs: data.getProductLogs,
    receiveGoods: data.receiveGoods,

    // Employee actions
    addEmployee: data.addEmployee,
    updateEmployee: data.updateEmployee,
    deleteEmployee: data.deleteEmployee,

    // Supplier actions
    addSupplier: data.addSupplier,
    updateSupplier: data.updateSupplier,
    deleteSupplier: data.deleteSupplier,

    // Fiscal actions
    createFiscalReceipt: data.createFiscalReceipt,
    getFiscalReceipt: data.getFiscalReceipt,

    // Transaction actions
    addTransaction: data.addTransaction,

    // Notification actions
    clearNotifications: data.clearNotifications,

    // Utils
    formatPrice,
    refreshData: data.refreshData,
  };
};

// Re-export individual hooks for granular usage
export { useAuth } from './AuthContext';
export { useUI } from './UIContext';
export { useData } from './DataContext';
