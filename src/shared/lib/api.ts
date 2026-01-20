import type { Order, Task, Product, Employee, AuditLog, DashboardStats, Notification, Supplier, FiscalReceipt, Customer } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('alash_token');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('API request failed:', data);
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      const data = await request<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      return { success: true, data };
    },
    me: () => request<any>('/auth/me'),
    refresh: (refreshToken: string) =>
      request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    updatePreferences: async (theme: 'light' | 'dark') =>
      request<{ success: boolean }>('/auth/preferences', {
        method: 'PUT',
        body: JSON.stringify({ theme }),
      }),
  },

  orders: {
    list: () => request<Order[]>('/orders'),
    getById: (id: string) => request<Order>(`/orders/${id}`),
    create: async (order: Partial<Order>) => {
      const res = await request<{ success: boolean; data: any }>('/orders', {
        method: 'POST',
        body: JSON.stringify(order),
      });
      return res.data;
    },
    updateStatus: async (id: string, status: Order['status']) => {
      await request(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
    cancel: async (id: string, reason?: string) => {
      await request(`/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
    search: (query: string) => request<Order[]>(`/orders/search?q=${encodeURIComponent(query)}`),
  },

  inventory: {
    list: () => request<Product[]>('/inventory'),
    getById: (id: string) => request<Product>(`/inventory/${id}`),
    create: async (product: Partial<Product>) => {
      const res = await request<{ success: boolean; data: any }>('/inventory', {
        method: 'POST',
        body: JSON.stringify({
          name: product.name,
          sku: product.sku,
          price: product.priceSell,
          cost: product.priceBuy,
          stock_quantity: product.stock || 0,
          min_stock_level: product.minStock,
          specs: product.specs || {},
          kitComponents: product.kitComponents,
          category: product.category,
          unit: product.unit,
          image_url: product.img,
        }),
      });
      return res.data;
    },
    search: async (query: string) => {
      const result = await request<{ success: boolean; data: Product[] }>(
        `/inventory/search?q=${encodeURIComponent(query)}`
      );
      return result.data;
    },
    update: async (id: string, updates: Partial<Product>) => {
      await request(`/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: updates.name,
          sku: updates.sku,
          price: updates.priceSell,
          cost: updates.priceBuy,
          stock_quantity: updates.stock,
          min_stock_level: updates.minStock,
          specs: updates.specs || {},
          kitComponents: updates.kitComponents,
          category: updates.category,
          unit: updates.unit,
        }),
      });
    },
    delete: async (id: string) => {
      await request(`/inventory/${id}`, { method: 'DELETE' });
    },
    getLogs: (productId: string) => request<AuditLog[]>(`/inventory/${productId}/logs`),
    adjustStock: async (id: string, delta: number, reason: string) => {
      await request(`/inventory/${id}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ delta, reason }),
      });
    },
    receiveGoods: async (productId: string, quantity: number, supplierId: string, documentNumber?: string, notes?: string) => {
      await request('/inventory/receive', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, supplierId, documentNumber, notes }),
      });
    },
  },

  tasks: {
    list: async () => {
      const result = await request<{ tasks: Task[]; total: number }>('/tasks');
      return result.tasks;
    },
    getById: (id: string) => request<Task>(`/tasks/${id}`),
    create: async (task: Partial<Task>) => {
      const res = await request<{ success: boolean; data: any }>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          priority: task.priority,
          assigneeId: task.assigneeId ? Number(task.assigneeId) : undefined,
          deadline: task.deadline,
          checklist: task.checklist || [],
        }),
      });
      return res.data;
    },
    update: async (id: string, updates: Partial<Task>) => {
      await request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          assigneeId: updates.assigneeId ? Number(updates.assigneeId) : undefined,
          deadline: updates.deadline,
          checklist: updates.checklist,
        }),
      });
    },
    updateStatus: async (id: string, status: Task['status']) => {
      await request(`/tasks/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
    delete: async (id: string) => {
      await request(`/tasks/${id}`, { method: 'DELETE' });
    },
    addComment: async (id: string, comment: string) => {
      await request(`/tasks/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      });
    },
  },

  staff: {
    list: () => request<Employee[]>('/staff'),
  },

  employees: {
    list: (includeInactive = false) =>
      request<{ employees: Employee[]; total: number }>(`/employees?includeInactive=${includeInactive}`),
    getById: (id: string) => request<Employee>(`/employees/${id}`),
    create: async (employee: Partial<Employee>) => {
      const res = await request<{ success: boolean; data: Employee }>('/employees', {
        method: 'POST',
        body: JSON.stringify(employee),
      });
      return res.data;
    },
    update: async (id: string, updates: Partial<Employee>) => {
      await request(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    delete: async (id: string) => {
      await request(`/employees/${id}`, { method: 'DELETE' });
    },
  },

  suppliers: {
    list: (isActive?: boolean, search?: string) => {
      const params = new URLSearchParams();
      if (isActive !== undefined) params.append('isActive', String(isActive));
      if (search) params.append('search', search);
      return request<{ suppliers: Supplier[]; total: number }>(`/suppliers?${params.toString()}`);
    },
    getById: (id: string) => request<Supplier>(`/suppliers/${id}`),
    create: async (supplier: Partial<Supplier>) => {
      const res = await request<{ success: boolean; data: Supplier }>('/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplier),
      });
      return res.data;
    },
    update: async (id: string, updates: Partial<Supplier>) => {
      await request(`/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    delete: async (id: string) => {
      await request(`/suppliers/${id}`, { method: 'DELETE' });
    },
  },

  fiscal: {
    createReceipt: async (orderId: string, cashierId?: string) => {
      const res = await request<{ success: boolean; data: FiscalReceipt }>('/fiscal/receipts', {
        method: 'POST',
        body: JSON.stringify({ orderId, cashierId }),
      });
      return res.data;
    },
    getReceiptByOrderId: (orderId: string) => request<FiscalReceipt>(`/fiscal/receipts/${orderId}`),
  },

  events: {
    list: () => request<Notification[]>('/events'),
    markAllRead: async () => {
      await request('/events/read', { method: 'PUT' });
    },
  },

  customers: {
    search: async (query: string): Promise<Customer[]> => {
      try {
        const res = await request<{ success: boolean; data: Customer[] }>(
          `/customers/search?q=${encodeURIComponent(query)}`
        );
        return res.data || [];
      } catch {
        return [];
      }
    },
    getById: (id: string) => request<Customer>(`/customers/${id}`),
    list: () => request<Customer[]>('/customers'),
  },

  warehouse: {
    getLocations: (isActive?: boolean) => {
      const params = new URLSearchParams();
      if (isActive !== undefined) params.append('isActive', String(isActive));
      return request<any[]>(`/warehouse/locations?${params.toString()}`);
    },
    createLocation: (data: { code: string; name?: string; zone?: string; aisle?: string; rack?: string; shelf?: string; capacity?: number; description?: string }) =>
      request<any>('/warehouse/locations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getProductLocations: (productId: string) => request<any[]>(`/inventory/${productId}/locations`),
  },

  analytics: {
    getDashboardStats: () => request<DashboardStats>('/analytics/dashboard'),
    getSalesReport: (fromDate?: string, toDate?: string) => {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      return request<any>(`/analytics/sales-report?${params.toString()}`);
    },
    getTopProducts: (limit = 10, fromDate?: string, toDate?: string) => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      return request<any>(`/analytics/top-products?${params.toString()}`);
    },
    getRevenueByPeriod: (period: 'daily' | 'weekly' | 'monthly', fromDate?: string, toDate?: string) => {
      const params = new URLSearchParams();
      params.append('period', period);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      return request<any>(`/analytics/revenue-by-period?${params.toString()}`);
    },
    getSalesByCategory: (fromDate?: string, toDate?: string) => {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      return request<any>(`/analytics/sales-by-category?${params.toString()}`);
    },
    getEmployeePerformance: (fromDate?: string, toDate?: string, department?: string) => {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (department) params.append('department', department);
      return request<any>(`/analytics/employee-performance?${params.toString()}`);
    },
    getLowStock: () => request<any>('/analytics/low-stock'),
  },

  ai: {
    chat: (message: string, history: Array<{ role: string; content: string }> = []) =>
      request<{ response: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
      }),
  },
};
