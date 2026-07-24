export type Role = 'DISPATCHER' | 'TECHNICIAN' | 'MANAGER' | 'CUSTOMER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type WorkOrderStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';
export type SlaStatus = 'ON_TRACK' | 'AT_RISK' | 'BREACHED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  customerId?: number;
  customerName?: string;
  permissions?: string;
  active?: boolean;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
  customerId?: number;
}

export interface Customer {
  id: number;
  name: string;
  contactEmail: string;
  sitesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: number;
  customerId: number;
  customerName: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: number;
  code: string;
  title: string;
  description?: string;
  priority: Priority;
  status: WorkOrderStatus;
  slaDueAt: string;
  slaStatus: SlaStatus;
  customerId: number;
  customerName: string;
  siteId: number;
  siteName: string;
  siteAddress: string;
  assignedToId?: number;
  assignedToName?: string;
  totalPartsCost?: number;
  totalLaborMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderStatusHistory {
  id: number;
  workOrderId: number;
  fromStatus?: WorkOrderStatus;
  toStatus: WorkOrderStatus;
  changedById: number;
  changedByName: string;
  changedAt: string;
  note?: string;
}

export interface Part {
  id: number;
  name: string;
  sku: string;
  unitCost: number;
  stockQty: number;
}

export interface PartUsage {
  id: number;
  workOrderId: number;
  partId: number;
  partName: string;
  partSku: string;
  qtyUsed: number;
  unitCostAtTime: number;
  totalCost: number;
  createdAt: string;
}

export interface TimeLog {
  id: number;
  workOrderId: number;
  technicianId: number;
  technicianName: string;
  minutes: number;
  note?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  recipientId: number;
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

export interface Attachment {
  id: number;
  workOrderId: number;
  filename: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  attachmentType: 'BEFORE' | 'AFTER' | 'INSPECTION' | 'GENERAL';
  uploadedByUserId: number;
  uploadedByName: string;
  createdAt: string;
  url: string;
}

export interface DashboardSummary {
  totalWorkOrders: number;
  newCount: number;
  assignedCount: number;
  inProgressCount: number;
  onHoldCount: number;
  completedCount: number;
  closedCount: number;
  cancelledCount: number;
  overdueCount: number;
  slaCompliancePercent: number;
  technicianBreakdown: Record<string, number>;
  siteBreakdown: Record<string, number>;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  message: string;
  fieldErrors?: Array<{ field: string; message: string }>;
}
