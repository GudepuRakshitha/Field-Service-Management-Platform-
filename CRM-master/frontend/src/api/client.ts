import {
  Attachment,
  AuthResponse,
  Customer,
  DashboardSummary,
  NotificationItem,
  PageResponse,
  Part,
  PartUsage,
  Site,
  TimeLog,
  User,
  WorkOrder,
  WorkOrderStatusHistory,
  WorkOrderStatus,
  Priority
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('keystone_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => request<User>('/auth/me'),

  // Customers & Sites
  getCustomers: (params?: { query?: string; page?: number; size?: number }) => {
    const query = new URLSearchParams();
    if (params?.query) query.append('query', params.query);
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());
    return request<PageResponse<Customer>>(`/customers?${query.toString()}`);
  },

  getCustomerById: (id: number) => request<Customer>(`/customers/${id}`),

  createCustomer: (data: { name: string; contactEmail: string }) =>
    request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCustomer: (id: number, data: { name: string; contactEmail: string }) =>
    request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getCustomerSites: (customerId: number) => request<Site[]>(`/customers/${customerId}/sites`),

  createSite: (customerId: number, data: { name: string; address: string }) =>
    request<Site>(`/customers/${customerId}/sites`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Work Orders
  getWorkOrders: (params?: {
    customerId?: number;
    assignedToUserId?: number;
    status?: WorkOrderStatus;
    priority?: Priority;
    query?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.customerId) q.append('customerId', params.customerId.toString());
    if (params?.assignedToUserId) q.append('assignedToUserId', params.assignedToUserId.toString());
    if (params?.status) q.append('status', params.status);
    if (params?.priority) q.append('priority', params.priority);
    if (params?.query) q.append('query', params.query);
    if (params?.page !== undefined) q.append('page', params.page.toString());
    if (params?.size !== undefined) q.append('size', params.size.toString());
    if (params?.sortBy) q.append('sortBy', params.sortBy);
    if (params?.direction) q.append('direction', params.direction);
    return request<PageResponse<WorkOrder>>(`/work-orders?${q.toString()}`);
  },

  getWorkOrderById: (id: number) => request<WorkOrder>(`/work-orders/${id}`),

  createWorkOrder: (data: {
    title: string;
    description?: string;
    priority: Priority;
    customerId: number;
    siteId: number;
  }) =>
    request<WorkOrder>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateWorkOrder: (id: number, data: { title: string; description?: string; priority: Priority }) =>
    request<WorkOrder>(`/work-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  assignWorkOrder: (id: number, data: { technicianId: number; note?: string }) =>
    request<WorkOrder>(`/work-orders/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  changeStatus: (id: number, data: { toStatus: WorkOrderStatus; note?: string }) =>
    request<WorkOrder>(`/work-orders/${id}/status`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStatusHistory: (id: number) => request<WorkOrderStatusHistory[]>(`/work-orders/${id}/history`),

  logPartUsage: (id: number, data: { partId: number; qtyUsed: number }) =>
    request<PartUsage>(`/work-orders/${id}/parts`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logTime: (id: number, data: { minutes: number; note?: string }) =>
    request<TimeLog>(`/work-orders/${id}/time`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Parts
  getParts: (params?: { query?: string; page?: number; size?: number }) => {
    const q = new URLSearchParams();
    if (params?.query) q.append('query', params.query);
    if (params?.page !== undefined) q.append('page', params.page.toString());
    if (params?.size !== undefined) q.append('size', params.size.toString());
    return request<PageResponse<Part>>(`/parts?${q.toString()}`);
  },

  createPart: (data: { name: string; sku: string; unitCost: number; stockQty: number }) =>
    request<Part>('/parts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePart: (id: number, data: { name: string; sku: string; unitCost: number; stockQty: number }) =>
    request<Part>(`/parts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Users & Technicians
  getAllUsers: () => request<User[]>('/users'),
  getTechnicians: () => request<User[]>('/users/technicians'),
  createUser: (data: { name: string; email: string; password: string; role: string; customerId?: number; permissions?: string }) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUserPermissions: (userId: number, permissions: string) =>
    request<User>(`/users/${userId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    }),
  updateUserStatus: (userId: number, active: boolean) =>
    request<User>(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ active }),
    }),

  // Reports
  getSummaryReport: () => request<DashboardSummary>('/reports/summary'),

  // Notifications
  getMyNotifications: () => request<NotificationItem[]>('/notifications'),
  markNotificationAsRead: (id: number) =>
    request<void>(`/notifications/${id}/read`, {
      method: 'POST',
    }),

  // Attachments (Field Photos)
  getWorkOrderAttachments: (workOrderId: number) => request<Attachment[]>(`/work-orders/${workOrderId}/attachments`),
  uploadWorkOrderAttachment: async (workOrderId: number, file: File, attachmentType: string = 'BEFORE'): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('attachmentType', attachmentType);

    const token = localStorage.getItem('keystone_token');
    const response = await fetch(`${API_BASE}/work-orders/${workOrderId}/attachments`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload attachment';
      try {
        const err = await response.json();
        errorMessage = err.message || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    return response.json();
  },
};
