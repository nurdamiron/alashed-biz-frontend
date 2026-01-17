import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { formatPrice } from '../lib/utils';
import { wsClient } from '../lib/websocket';
import type { WebSocketEvent } from '../lib/websocket';
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
  Supplier,
  FiscalReceipt,
} from '../types';

interface AppContextType {
  // Data
  orders: Order[];
  tasks: Task[];
  products: Product[];
  employees: Employee[];
  suppliers: Supplier[];
  transactions: Transaction[];
  notifications: Notification[];
  stats: DashboardStats;

  // State
  isLoading: boolean;
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  user: User | null;
  isWsConnected: boolean;

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
  cancelOrder: (id: string, reason?: string) => Promise<void>;

  // Tasks
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addTaskComment: (taskId: string, comment: string) => Promise<void>;

  // Products
  addProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStock: (id: string, delta: number) => Promise<void>;
  getProductLogs: (id: string) => Promise<AuditLog[]>;
  receiveGoods: (productId: string, quantity: number, supplierId: string, documentNumber?: string, notes?: string) => Promise<void>;

  // Employees
  addEmployee: (employee: Partial<Employee>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  // Suppliers
  addSupplier: (supplier: Partial<Supplier>) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  // Fiscal
  createFiscalReceipt: (orderId: string, cashierId?: string) => Promise<FiscalReceipt>;
  getFiscalReceipt: (orderId: string) => Promise<FiscalReceipt>;

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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);

  const [appName, setAppName] = useState('ALASHED');
  const [businessDomain, setBusinessDomain] = useState('Склад электроники и робототехники');

  const refreshData = async () => {
    try {
      const [ordersData, tasksData, productsData, staffResponse, notificationsData, statsData, suppliersData] =
        await Promise.all([
          api.orders.list(),
          api.tasks.list(),
          api.inventory.list(),
          api.staff.list(),
          api.events.list(),
          api.analytics.getDashboardStats(),
          api.suppliers.list(true).then(res => res.suppliers).catch(() => []),
        ]);

      setOrders(ordersData);

      // Преобразуем задачи из формата бэкенда в формат фронтенда
      const tasksFormatted = tasksData.map((task: any) => ({
        id: String(task.id),
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignee: task.assigneeName,
        assigneeId: task.assigneeId ? String(task.assigneeId) : undefined,
        deadline: task.deadline,
        comments: task.comments || [],
      }));

      setTasks(tasksFormatted);
      setProducts(productsData);

      // Преобразуем ответ от API в формат Employee[]
      const employeesData: Employee[] = Array.isArray(staffResponse)
        ? staffResponse
        : ((staffResponse as any)?.employees || []).map((emp: any) => ({
            id: String(emp.id),
            userId: emp.userId ? String(emp.userId) : undefined,
            name: emp.name,
            role: emp.role || emp.position || 'Сотрудник',
            department: emp.department,
            position: emp.position,
            phone: emp.phone,
            email: emp.email,
            avatar: emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=6366F1&color=fff`,
            activeTasks: emp.activeTasksCount || 0,
            isActive: emp.isActive,
          }));

      setEmployees(employeesData);
      setNotifications(notificationsData);
      setStats(statsData);
      setSuppliers(suppliersData);
    } catch (e) {
      console.error('Data refresh failed', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('alash_token');
      const auth = localStorage.getItem('alash_auth');
      const config = localStorage.getItem('alash_config');
      const savedTheme = localStorage.getItem('alash_theme') as 'light' | 'dark' | null;

      // Приоритет у локального сохранения темы
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        // Если локально не сохранено, используем 'dark' по умолчанию
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }

      if (token && auth) {
        try {
          const userData = JSON.parse(auth);
          setIsAuthenticated(true);
          setUser(userData);

          // Сразу убираем глобальный Loading, показываем UI с локальными скелетонами
          setIsLoading(false);

          // Загружаем данные асинхронно в фоне
          refreshData().catch(console.error);
        } catch (e) {
          console.error('Init error:', e);
          localStorage.removeItem('alash_token');
          localStorage.removeItem('alash_auth');
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
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
    };

    init();
  }, []);

  // WebSocket event handlers
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    switch (event.type) {
      case 'connected':
        setIsWsConnected(true);
        break;
      case 'new_order':
        toast('Новый заказ!', { icon: '📦' });
        refreshData();
        break;
      case 'new_task':
        toast('Новая задача!', { icon: '📋' });
        refreshData();
        break;
      case 'low_stock':
        toast.error(`Низкий остаток: ${event.data?.productName || 'товар'}`);
        refreshData();
        break;
      case 'out_of_stock':
        toast.error(`Товар закончился: ${event.data?.productName || 'товар'}`);
        refreshData();
        break;
      case 'new_notification':
        refreshData();
        break;
      case 'task_overdue':
        toast.error(`Задача просрочена: ${event.data?.title || ''}`);
        refreshData();
        break;
      case 'order_status_changed':
        toast(`Заказ #${event.data?.orderId || ''}: ${event.data?.status || 'обновлен'}`, { icon: '🔄' });
        refreshData();
        break;
    }
  }, []);

  // WebSocket connection management
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('alash_token');
      if (token) {
        wsClient.connect(token);
        const unsubscribe = wsClient.on('*', handleWebSocketEvent);

        // Track connection status
        const checkConnection = setInterval(() => {
          setIsWsConnected(wsClient.isConnected());
        }, 2000);

        return () => {
          unsubscribe();
          clearInterval(checkConnection);
        };
      }
    } else {
      wsClient.disconnect();
      setIsWsConnected(false);
    }
  }, [isAuthenticated, handleWebSocketEvent]);

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

        // Не перезаписываем тему при логине - используем сохраненную локально
        // Тема пользователя уже загружена из localStorage при инициализации

        // Загружаем данные асинхронно в фоне, не ждем завершения
        refreshData().catch(console.error);

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
    wsClient.disconnect();
    localStorage.removeItem('alash_token');
    localStorage.removeItem('alash_auth');
    setIsAuthenticated(false);
    setUser(null);
    setIsWsConnected(false);
    setOrders([]);
    setTasks([]);
    setProducts([]);
    setEmployees([]);
    setSuppliers([]);
    setNotifications([]);
    setStats(defaultStats);
    toast('Вы вышли из системы', { icon: '👋' });
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Save to backend if authenticated
    if (isAuthenticated) {
      try {
        await api.auth.updatePreferences(newTheme);
      } catch (error) {
        console.error('Failed to update theme preference:', error);
      }
    }
  };

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

  // Orders
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

  const cancelOrder = async (id: string, reason?: string) => {
    await handleAction(async () => {
      await api.orders.cancel(id, reason);
      await refreshData();
    }, 'Заказ отменен');
  };

  // Tasks
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

  const deleteTask = async (id: string) => {
    await handleAction(async () => {
      await api.tasks.delete(id);
      await refreshData();
    }, 'Задача удалена');
  };

  const addTaskComment = async (taskId: string, comment: string) => {
    await handleAction(async () => {
      await api.tasks.addComment(taskId, comment);
      await refreshData();
    }, 'Комментарий добавлен');
  };

  // Products
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

  const deleteProduct = async (id: string) => {
    await handleAction(async () => {
      await api.inventory.delete(id);
      await refreshData();
    }, 'Товар удален');
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

  const receiveGoods = async (productId: string, quantity: number, supplierId: string, documentNumber?: string, notes?: string) => {
    await handleAction(async () => {
      await api.inventory.receiveGoods(productId, quantity, supplierId, documentNumber, notes);
      await refreshData();
    }, 'Товар принят на склад');
  };

  // Employees
  const addEmployee = async (employee: Partial<Employee>) => {
    await handleAction(async () => {
      await api.employees.create(employee);
      await refreshData();
    }, 'Сотрудник добавлен');
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    await handleAction(async () => {
      await api.employees.update(id, updates);
      await refreshData();
    }, 'Данные сотрудника обновлены');
  };

  const deleteEmployee = async (id: string) => {
    await handleAction(async () => {
      await api.employees.delete(id);
      await refreshData();
    }, 'Сотрудник деактивирован');
  };

  // Suppliers
  const addSupplier = async (supplier: Partial<Supplier>) => {
    await handleAction(async () => {
      await api.suppliers.create(supplier);
      await refreshData();
    }, 'Поставщик добавлен');
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    await handleAction(async () => {
      await api.suppliers.update(id, updates);
      await refreshData();
    }, 'Данные поставщика обновлены');
  };

  const deleteSupplier = async (id: string) => {
    await handleAction(async () => {
      await api.suppliers.delete(id);
      await refreshData();
    }, 'Поставщик удален');
  };

  // Fiscal
  const createFiscalReceipt = async (orderId: string, cashierId?: string): Promise<FiscalReceipt> => {
    const receipt = await api.fiscal.createReceipt(orderId, cashierId);
    toast.success('Фискальный чек создан');
    return receipt;
  };

  const getFiscalReceipt = async (orderId: string): Promise<FiscalReceipt> => {
    return api.fiscal.getReceiptByOrderId(orderId);
  };

  // Transactions
  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
    toast.success('Транзакция добавлена');
  };

  // Notifications
  const clearNotifications = async () => {
    await api.events.markAllRead();
    await refreshData();
  };

  const value: AppContextType = {
    orders,
    tasks,
    products,
    employees,
    suppliers,
    transactions,
    notifications,
    stats,
    isLoading,
    theme,
    isAuthenticated,
    user,
    isWsConnected,
    appName,
    businessDomain,
    setAppConfig,
    login,
    logout,
    toggleTheme,
    addOrder,
    updateOrderStatus,
    cancelOrder,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    addTaskComment,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    getProductLogs,
    receiveGoods,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    createFiscalReceipt,
    getFiscalReceipt,
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
