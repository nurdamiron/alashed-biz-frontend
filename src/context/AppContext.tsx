import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { websocket } from '../lib/websocket';
import Loading from '../components/Loading';
import type {
  OrderDto,
  TaskDto,
  ProductDto,
  EmployeeDto,
  DashboardStatsDto,
  NotificationDto,
  UserDto,
  CreateOrderDto,
  CreateTaskDto,
  CreateProductDto,
  StockAdjustmentDto,
  OrderStatus,
  TaskStatus,
} from '../types';

interface AppContextType {
  // Data (adapted to new backend)
  orders: OrderDto[];
  tasks: TaskDto[];
  products: ProductDto[];
  employees: EmployeeDto[];
  notifications: NotificationDto[];
  stats: DashboardStatsDto;

  // UI State
  isLoading: boolean;
  theme: 'light' | 'dark';

  // Auth
  isAuthenticated: boolean;
  user: UserDto | null;

  // Config
  appName: string;
  businessDomain: string;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleTheme: () => void;
  setAppConfig: (name: string, domain: string) => void;

  // CRUD Operations
  addOrder: (order: CreateOrderDto) => Promise<void>;
  updateOrderStatus: (id: number, status: OrderStatus) => Promise<void>;

  addTask: (task: CreateTaskDto) => Promise<void>;
  updateTask: (task: TaskDto) => Promise<void>;
  updateTaskStatus: (id: number, status: TaskStatus) => Promise<void>;

  addProduct: (product: CreateProductDto) => Promise<void>;
  updateProduct: (product: ProductDto) => Promise<void>;
  updateProductStock: (id: number, adjustment: StockAdjustmentDto) => Promise<void>;
  getProductLogs: (id: number) => Promise<any>;

  clearNotifications: () => Promise<void>;
  formatPrice: (price: number, currency?: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState({
    orders: [] as OrderDto[],
    tasks: [] as TaskDto[],
    products: [] as ProductDto[],
    employees: [] as EmployeeDto[],
    notifications: [] as NotificationDto[],
    stats: {
      revenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      activeTasksCount: 0,
      completedTasksToday: 0,
      totalProducts: 0,
      totalCustomers: 0,
    } as DashboardStatsDto,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserDto | null>(null);
  const [appName, setAppName] = useState('ALASHED');
  const [businessDomain, setBusinessDomain] = useState('Склад электроники и робототехники');

  const refreshData = async () => {
    try {
      const [orders, tasks, products, employees, notifications, stats] = await Promise.all([
        api.orders.list(),
        api.tasks.list(),
        api.inventory.list(),
        api.staff.list(),
        api.notifications.list(),
        api.analytics.getDashboardStats(),
      ]);

      const newData = { orders, tasks, products, employees, notifications, stats };
      setData(newData);
      saveCacheData(newData);
    } catch (e) {
      console.error('Data refresh failed', e);
    }
  };

  // Cache keys
  const CACHE_KEY = 'alashed_data_cache';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Load cached data for instant UI (stale-while-revalidate)
  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        const isStale = Date.now() - timestamp > CACHE_TTL;
        return { cachedData, isStale };
      }
    } catch (e) {
      console.error('Cache load error:', e);
    }
    return { cachedData: null, isStale: true };
  };

  // Save data to cache
  const saveCacheData = (newData: typeof data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: newData, timestamp: Date.now() }));
    } catch (e) {
      console.error('Cache save error:', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('alashed_token');
      const auth = localStorage.getItem('alashed_auth');
      const config = localStorage.getItem('alashed_config');

      if (token && auth) {
        try {
          const userData = JSON.parse(auth);
          setIsAuthenticated(true);
          setUser(userData);

          // Load cached data immediately for instant UI
          const { cachedData, isStale } = loadCachedData();
          if (cachedData) {
            setData(cachedData);
            setIsLoading(false);
          }

          // Revalidate in background
          if (isStale || !cachedData) {
            await refreshData();
          }

          // Connect WebSocket для real-time updates
          websocket.connect(token);

          // Subscribe to WebSocket events
          websocket.on('order-created', (order: OrderDto) => {
            setData((prev) => ({ ...prev, orders: [order, ...prev.orders] }));
          });

          websocket.on('order-updated', (order: OrderDto) => {
            setData((prev) => ({
              ...prev,
              orders: prev.orders.map((o) => (o.id === order.id ? order : o)),
            }));
          });

          websocket.on('task-created', (task: TaskDto) => {
            setData((prev) => ({ ...prev, tasks: [task, ...prev.tasks] }));
          });

          websocket.on('task-updated', (task: TaskDto) => {
            setData((prev) => ({
              ...prev,
              tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)),
            }));
          });

          websocket.on('product-created', (product: ProductDto) => {
            setData((prev) => ({ ...prev, products: [product, ...prev.products] }));
          });

          websocket.on('product-updated', (product: ProductDto) => {
            setData((prev) => ({
              ...prev,
              products: prev.products.map((p) => (p.id === product.id ? product : p)),
            }));
          });

          websocket.on('inventory-adjusted', () => {
            refreshData();
          });

          websocket.on('dashboard-update', (stats: DashboardStatsDto) => {
            setData((prev) => ({ ...prev, stats }));
          });
        } catch (e) {
          console.error('Init error:', e);
          localStorage.removeItem('alashed_token');
          localStorage.removeItem('alashed_auth');
        }
      }

      if (config) {
        try {
          const { name, domain } = JSON.parse(config);
          if (name) setAppName(name);
          if (domain) setBusinessDomain(domain);
        } catch (e) {
          console.error('Config load error:', e);
        }
      }

      setIsLoading(false);
    };

    init();

    return () => {
      websocket.disconnect();
    };
  }, []);

  const setAppConfig = (name: string, domain: string) => {
    setAppName(name);
    setBusinessDomain(domain);
    localStorage.setItem('alashed_config', JSON.stringify({ name, domain }));
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      if (response.success && response.data) {
        const { user: userData } = response.data;
        localStorage.setItem('alashed_auth', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
        await refreshData();

        // Connect WebSocket after login
        const token = localStorage.getItem('alashed_token');
        if (token) {
          websocket.connect(token);
        }

        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('alashed_token');
    localStorage.removeItem('alashed_refresh_token');
    localStorage.removeItem('alashed_auth');
    localStorage.removeItem(CACHE_KEY);
    setIsAuthenticated(false);
    setUser(null);
    websocket.disconnect();
    api.auth.logout();
  };

  const formatPrice = (price: number, currency: string = 'KZT') => {
    const val = Number(price) || 0;
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₸';
    return `${symbol}${new Intl.NumberFormat('ru-RU').format(val)}`;
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    document.documentElement.classList.toggle('dark');
  };

  return (
    <AppContext.Provider
      value={{
        ...data,
        isLoading,
        theme,
        toggleTheme,
        isAuthenticated,
        user,
        login,
        logout,
        appName,
        businessDomain,
        setAppConfig,

        // CRUD Operations
        addOrder: async (order: CreateOrderDto) => {
          await api.orders.create(order);
          await refreshData();
        },
        updateOrderStatus: async (id: number, status: OrderStatus) => {
          await api.orders.updateStatus(id, status);
          await refreshData();
        },

        addTask: async (task: CreateTaskDto) => {
          await api.tasks.create(task);
          await refreshData();
        },
        updateTask: async (task: TaskDto) => {
          await api.tasks.update(task.id, task);
          await refreshData();
        },
        updateTaskStatus: async (id: number, status: TaskStatus) => {
          await api.tasks.updateStatus(id, status);
          await refreshData();
        },

        addProduct: async (product: CreateProductDto) => {
          await api.inventory.create(product);
          await refreshData();
        },
        updateProduct: async (product: ProductDto) => {
          await api.inventory.update(product.id, product);
          await refreshData();
        },
        updateProductStock: async (id: number, adjustment: StockAdjustmentDto) => {
          await api.inventory.adjustStock(id, adjustment);
          await refreshData();
        },
        getProductLogs: async (id: number) => api.inventory.getLogs(id),

        clearNotifications: async () => {
          await api.notifications.markAllAsRead();
          await refreshData();
        },

        formatPrice,
      }}
    >
      {isLoading ? <Loading /> : children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
