// Order Types
export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtOrder: number;
}

export interface Order {
  id: string;
  client: string;
  email?: string;
  phone?: string;
  desc: string;
  amount: number;
  status: 'Ожидание' | 'Отправлено' | 'Доставлено' | 'Отменено';
  date: string;
  source: string;
  img: string;
  hasWhatsapp?: boolean;
  items?: OrderItem[];
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'Высокий' | 'Средний' | 'Низкий';
  status: 'К выполнению' | 'В процессе' | 'Готово';
  assignee?: string;
  deadline?: string;
  time?: string;
  tag?: string;
}

// Product Types
export interface KitComponent {
  productId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  priceBuy: number;
  priceSell: number;
  unit: string;
  img: string;
  specs?: Record<string, string>;
  kitComponents?: KitComponent[];
}

export interface AuditLog {
  id: string;
  productId: string;
  delta: number;
  reason: string;
  timestamp: string;
}

// Employee Types
export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  activeTasks: number;
}

// Transaction Types
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  date: string;
  currency: string;
  icon?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Stats Types
export interface DashboardStats {
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockCount: number;
  activeTasksCount: number;
  chartData?: any[];
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
