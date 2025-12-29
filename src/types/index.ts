// DTOs from backend (matching DDD structure)

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';
export type OrderSource = 'kaspi' | 'instagram' | 'whatsapp' | 'website';

export interface OrderItemDto {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  priceAtOrder: number;
}

export interface OrderDto {
  id: number;
  orderNumber: string;
  customerId: number | null;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  totalAmount: number;
  status: OrderStatus;
  source: OrderSource;
  notes: string | null;
  createdAt: string;
  items?: OrderItemDto[];
}

export interface CreateOrderDto {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  source: OrderSource;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'Высокий' | 'Средний' | 'Низкий';

export interface TaskDto {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
  assigneeId: number | null;
  assigneeName: string | null;
  createdAt: string;
  tag?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline?: string;
  assigneeId?: number;
  tag?: string;
}

export interface ProductDto {
  id: number;
  name: string;
  sku: string;
  categoryId: number | null;
  categoryName: string | null;
  currentQuantity: number;
  minStockLevel: number;
  priceBuy: number;
  priceSell: number;
  unit: string;
  imageUrl: string | null;
  specs: Record<string, string> | null;
  kitComponents?: KitComponentDto[];
}

export interface KitComponentDto {
  productId: number;
  quantity: number;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  categoryId?: number;
  minStockLevel: number;
  priceBuy: number;
  priceSell: number;
  unit: string;
  imageUrl?: string;
  specs?: Record<string, string>;
  kitComponents?: KitComponentDto[];
}

export interface StockAdjustmentDto {
  quantity: number;
  reason: string;
  type: 'in' | 'out' | 'adjustment';
}

export interface EmployeeDto {
  id: number;
  fullName: string;
  department: string;
  position: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  activeTasksCount: number;
}

export interface DashboardStatsDto {
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeTasksCount: number;
  completedTasksToday: number;
  totalProducts: number;
  totalCustomers: number;
}

export interface NotificationDto {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface FiscalReceiptDto {
  id: number;
  orderId: number;
  receiptNumber: string;
  amount: number;
  vat: number;
  createdAt: string;
}

export interface CreateFiscalReceiptDto {
  orderId: number;
  operationType: 'sale' | 'return';
  customerEmail?: string;
  includeVat: boolean;
}

// Legacy types for compatibility with old components
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

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtOrder: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'Высокий' | 'Средний' | 'Низкий';
  status: 'К выполнению' | 'В процессе' | 'Готово';
  assignee?: string;
  deadline?: string;
  employee_id?: string | null;
  time?: string;
  tag?: string;
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

export interface KitComponent {
  productId: string;
  quantity: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  activeTasks: number;
}

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
