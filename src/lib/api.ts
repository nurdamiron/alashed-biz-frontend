import type {
  LoginResponseDto,
  OrderDto,
  CreateOrderDto,
  TaskDto,
  CreateTaskDto,
  ProductDto,
  CreateProductDto,
  StockAdjustmentDto,
  EmployeeDto,
  DashboardStatsDto,
  NotificationDto,
  FiscalReceiptDto,
  CreateFiscalReceiptDto,
  OrderStatus,
  TaskStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let authToken: string | null = localStorage.getItem('alashed_token');
let refreshToken: string | null = localStorage.getItem('alashed_refresh_token');

// Auto-refresh token on 401
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  // Auto-refresh на 401
  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshAuthToken();
    if (refreshed) {
      return apiRequest(endpoint, options); // Retry
    }
    // Если refresh не удался, logout
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Request failed');
  }

  return await response.json();
}

async function refreshAuthToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data: LoginResponseDto = await response.json();
      authToken = data.accessToken;
      refreshToken = data.refreshToken;
      localStorage.setItem('alashed_token', authToken!);
      localStorage.setItem('alashed_refresh_token', refreshToken!);
      return true;
    }
  } catch (e) {
    console.error('Refresh failed', e);
  }

  // Clear tokens
  localStorage.removeItem('alashed_token');
  localStorage.removeItem('alashed_refresh_token');
  authToken = null;
  refreshToken = null;
  return false;
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<{ success: boolean; data?: LoginResponseDto }> => {
      try {
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (data.accessToken) {
          authToken = data.accessToken;
          refreshToken = data.refreshToken;
          localStorage.setItem('alashed_token', authToken);
          localStorage.setItem('alashed_refresh_token', refreshToken);
          return { success: true, data };
        }

        return { success: false };
      } catch (e) {
        console.error('Login error:', e);
        return { success: false };
      }
    },

    register: (data: { email: string; password: string; fullName: string }) =>
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    logout: () => {
      localStorage.removeItem('alashed_token');
      localStorage.removeItem('alashed_refresh_token');
      authToken = null;
      refreshToken = null;
    },
  },

  orders: {
    list: (): Promise<OrderDto[]> => apiRequest('/orders'),
    get: (id: number): Promise<OrderDto> => apiRequest(`/orders/${id}`),
    create: (order: CreateOrderDto): Promise<OrderDto> =>
      apiRequest('/orders', { method: 'POST', body: JSON.stringify(order) }),
    updateStatus: (id: number, status: OrderStatus): Promise<OrderDto> =>
      apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },

  tasks: {
    list: (): Promise<TaskDto[]> => apiRequest('/tasks'),
    create: (task: CreateTaskDto): Promise<TaskDto> =>
      apiRequest('/tasks', { method: 'POST', body: JSON.stringify(task) }),
    update: (id: number, task: Partial<CreateTaskDto>): Promise<TaskDto> =>
      apiRequest(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
    updateStatus: (id: number, status: TaskStatus): Promise<TaskDto> =>
      apiRequest(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },

  inventory: {
    list: (): Promise<ProductDto[]> => apiRequest('/inventory/products'),
    get: (id: number): Promise<ProductDto> => apiRequest(`/inventory/products/${id}`),
    search: (query: string): Promise<ProductDto[]> =>
      apiRequest(`/inventory/products?search=${encodeURIComponent(query)}`),
    findBySku: (sku: string): Promise<ProductDto[]> =>
      apiRequest(`/inventory/products?sku=${encodeURIComponent(sku)}`),
    create: (product: CreateProductDto): Promise<ProductDto> =>
      apiRequest('/inventory/products', { method: 'POST', body: JSON.stringify(product) }),
    update: (id: number, product: Partial<CreateProductDto>): Promise<ProductDto> =>
      apiRequest(`/inventory/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
    adjustStock: (id: number, adjustment: StockAdjustmentDto): Promise<any> =>
      apiRequest(`/inventory/products/${id}/adjust`, { method: 'POST', body: JSON.stringify(adjustment) }),
    getLogs: (id: number) => apiRequest(`/inventory/products/${id}/movements`),
  },

  staff: {
    list: (): Promise<EmployeeDto[]> => apiRequest('/employees'),
  },

  employees: {
    list: (): Promise<EmployeeDto[]> => apiRequest('/employees'),
    create: (employee: Partial<EmployeeDto>): Promise<EmployeeDto> =>
      apiRequest('/employees', { method: 'POST', body: JSON.stringify(employee) }),
  },

  analytics: {
    getDashboardStats: (): Promise<DashboardStatsDto> => apiRequest('/analytics/dashboard-stats'),
    getSalesReport: (from: string, to: string) =>
      apiRequest(`/analytics/sales-report?from=${from}&to=${to}`),
    getTopProducts: (from: string, to: string) =>
      apiRequest(`/analytics/top-products?from=${from}&to=${to}`),
    getEmployeePerformance: (from: string, to: string) =>
      apiRequest(`/analytics/employee-performance?from=${from}&to=${to}`),
  },

  fiscal: {
    createReceipt: (data: CreateFiscalReceiptDto): Promise<FiscalReceiptDto> =>
      apiRequest('/fiscal/receipts', { method: 'POST', body: JSON.stringify(data) }),
    getReceipt: (id: number): Promise<FiscalReceiptDto> => apiRequest(`/fiscal/receipts/${id}`),
  },

  events: {
    list: (): Promise<NotificationDto[]> => apiRequest('/notifications'),
    markAllRead: (): Promise<void> =>
      apiRequest('/notifications/read-all', { method: 'POST' }),
  },

  notifications: {
    list: (): Promise<NotificationDto[]> => apiRequest('/notifications'),
    markAsRead: (id: number): Promise<void> =>
      apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: (): Promise<void> =>
      apiRequest('/notifications/read-all', { method: 'POST' }),
  },

  upload: {
    uploadFile: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    },
  },
};
