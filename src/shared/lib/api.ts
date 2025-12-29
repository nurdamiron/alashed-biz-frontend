import type { Order, Task, Product, Employee, AuditLog, DashboardStats, Notification } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('alash_token');

// Generic request helper
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
    login: async (email: string, password: string) => {
      const response = await request<{
        success: boolean;
        data: { accessToken: string; refreshToken: string; user: any };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return response;
    },
    me: () => request<any>('/auth/me'),
    refresh: (refreshToken: string) =>
      request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
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
    search: (query: string) => request<Order[]>(`/orders/search?q=${encodeURIComponent(query)}`),
  },

  inventory: {
    list: () => request<Product[]>('/inventory'),
    getById: (id: string) => request<Product>(`/inventory/${id}`),
    search: async (query: string) => {
      const result = await request<{ success: boolean; data: Product[] }>(
        `/products/search?q=${encodeURIComponent(query)}`
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
    getLogs: (productId: string) => request<AuditLog[]>(`/inventory/${productId}/logs`),
    adjustStock: async (id: string, delta: number, reason: string) => {
      await request(`/inventory/${id}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ delta, reason }),
      });
    },
  },

  tasks: {
    list: () => request<Task[]>('/tasks'),
    getById: (id: string) => request<Task>(`/tasks/${id}`),
    create: async (task: Partial<Task>) => {
      const res = await request<{ success: boolean; data: any }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });
      return res.data;
    },
    update: async (id: string, updates: Partial<Task>) => {
      await request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    updateStatus: async (id: string, status: Task['status']) => {
      await request(`/tasks/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
  },

  staff: {
    list: () => request<Employee[]>('/staff'),
  },

  events: {
    list: () => request<Notification[]>('/events'),
    markAllRead: async () => {
      await request('/events/read', { method: 'PUT' });
    },
  },

  analytics: {
    getDashboardStats: () => request<DashboardStats>('/analytics/dashboard'),
  },

  ai: {
    chat: (message: string, history: Array<{ role: string; content: string }> = []) =>
      request<{ response: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
      }),
  },
};
