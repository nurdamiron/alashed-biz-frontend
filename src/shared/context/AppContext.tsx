import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { formatPrice } from '../lib/utils';
import Loading from '../components/Loading';
import type {
  Order,
  Task,
  Product,
  Employee,
  Transaction,
  Notification,
  DashboardStats,
  AuditLog,
  User,
} from '../types';

interface AppContextType {
  // Data
  orders: Order[];
  tasks: Task[];
  products: Product[];
  employees: Employee[];
  transactions: Transaction[];
  notifications: Notification[];
  stats: DashboardStats;

  // State
  isLoading: boolean;
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  user: User | null;

  // Config
  appName: string;
  businessDomain: string;
  setAppConfig: (name: string, domain: string) => void;

  // Auth
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Theme
  toggleTheme: () => void;

  // Orders
  addOrder: (order: Partial<Order>) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;

  // Tasks
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;

  // Products
  addProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  updateProductStock: (id: string, delta: number) => Promise<void>;
  getProductLogs: (id: string) => Promise<AuditLog[]>;

  // Transactions
  addTransaction: (transaction: Transaction) => void;

  // Notifications
  clearNotifications: () => Promise<void>;

  // Utils
  formatPrice: (price: number, currency?: string) => string;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultStats: DashboardStats = {
  revenue: 0,
  totalOrders: 0,
  pendingOrders: 0,
  lowStockCount: 0,
  activeTasksCount: 0,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [appName, setAppName] = useState('ALASHED');
  const [businessDomain, setBusinessDomain] = useState('Склад электроники и робототехники');

  // Refresh all data
  const refreshData = async () => {
    try {
      const [ordersData, tasksData, productsData, employeesData, notificationsData, statsData] =
        await Promise.all([
          api.orders.list(),
          api.tasks.list(),
          api.inventory.list(),
          api.staff.list(),
          api.events.list(),
          api.analytics.getDashboardStats(),
        ]);

      setOrders(ordersData);
      setTasks(tasksData);
      setProducts(productsData);
      setEmployees(employeesData);
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (e) {
      console.error('Data refresh failed', e);
    }
  };

  // Initialize app
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('alash_token');
      const auth = localStorage.getItem('alash_auth');
      const config = localStorage.getItem('alash_config');
      const savedTheme = localStorage.getItem('alash_theme') as 'light' | 'dark' | null;

      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }

      if (token && auth) {
        try {
          const userData = JSON.parse(auth);
          setIsAuthenticated(true);
          setUser(userData);
          await refreshData();
        } catch (e) {
          console.error('Init error:', e);
          localStorage.removeItem('alash_token');
          localStorage.removeItem('alash_auth');
        }
      }

      if (config) {
        try {
          const { name, domain } = JSON.parse(config);
          if (name) setAppName(name);
          if (domain) setBusinessDomain(domain);
        } catch (e) {
          console.error('Config parse error:', e);
        }
      }

      setIsLoading(false);
    };

    init();
  }, []);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('alash_theme', theme);
  }, [theme]);

  const setAppConfig = (name: string, domain: string) => {
    setAppName(name);
    setBusinessDomain(domain);
    localStorage.setItem('alash_config', JSON.stringify({ name, domain }));
    toast.success('Настройки обновлены');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.auth.login(email, password);
      if (response.success && response.data) {
        const { accessToken, user: userData } = response.data;
        localStorage.setItem('alash_token', accessToken);
        localStorage.setItem('alash_auth', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
        await refreshData();
        toast.success(`Добро пожаловать, ${userData.name}!`);
        return true;
      }
      toast.error('Ошибка входа: Неверные данные');
      return false;
    } catch (e) {
      console.error('Login error:', e);
      toast.error('Ошибка входа: Сервер недоступен');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('alash_token');
    localStorage.removeItem('alash_auth');
    setIsAuthenticated(false);
    setUser(null);
    setOrders([]);
    setTasks([]);
    setProducts([]);
    setEmployees([]);
    setNotifications([]);
    setStats(defaultStats);
    toast('Вы вышли из системы', { icon: '👋' });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Action helpers
  const handleAction = async (action: () => Promise<void>, successMessage?: string) => {
    try {
      await action();
      if (successMessage) toast.success(successMessage);
    } catch (e) {
      console.error(e);
      toast.error('Произошла ошибка при выполнении операции');
      throw e;
    }
  };

  const addOrder = async (order: Partial<Order>) => {
    await handleAction(async () => {
      await api.orders.create(order);
      await refreshData();
    }, 'Заказ создан');
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    await handleAction(async () => {
      await api.orders.updateStatus(id, status);
      await refreshData();
    }, 'Статус заказа обновлен');
  };

  const addTask = async (task: Partial<Task>) => {
    await handleAction(async () => {
      await api.tasks.create(task);
      await refreshData();
    }, 'Задача создана');
  };

  const updateTask = async (task: Task) => {
    await handleAction(async () => {
      await api.tasks.update(task.id, task);
      await refreshData();
    }, 'Задача обновлена');
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    await handleAction(async () => {
      await api.tasks.updateStatus(id, status);
      await refreshData();
    }, 'Статус задачи обновлен');
  };

  const addProduct = async (product: Partial<Product>) => {
    await handleAction(async () => {
      await api.inventory.create(product);
      await refreshData();
    }, 'Товар добавлен');
  };

  const updateProduct = async (product: Product) => {
    await handleAction(async () => {
      await api.inventory.update(product.id, product);
      await refreshData();
    }, 'Товар обновлен');
  };

  const updateProductStock = async (id: string, delta: number) => {
    await handleAction(async () => {
      await api.inventory.adjustStock(id, delta, 'Ручная корректировка');
      await refreshData();
    }, 'Остатки обновлены');
  };

  const getProductLogs = async (id: string): Promise<AuditLog[]> => {
    return api.inventory.getLogs(id);
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
    toast.success('Транзакция добавлена');
  };

  const clearNotifications = async () => {
    await api.events.markAllRead();
    await refreshData();
  };

  const value: AppContextType = {
    orders,
    tasks,
    products,
    employees,
    transactions,
    notifications,
    stats,
    isLoading,
    theme,
    isAuthenticated,
    user,
    appName,
    businessDomain,
    setAppConfig,
    login,
    logout,
    toggleTheme,
    addOrder,
    updateOrderStatus,
    addTask,
    updateTask,
    updateTaskStatus,
    addProduct,
    updateProduct,
    updateProductStock,
    getProductLogs,
    addTransaction,
    clearNotifications,
    formatPrice,
    refreshData,
  };

  return (
    <AppContext.Provider value={value}>
      {isLoading ? <Loading /> : children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
