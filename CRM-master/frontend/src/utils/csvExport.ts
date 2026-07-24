import { WorkOrder } from '../api/types';

export function exportWorkOrdersToCSV(workOrders: WorkOrder[], filename: string = 'work_orders_export.csv') {
  if (!workOrders || workOrders.length === 0) {
    alert('No work orders available to export.');
    return;
  }

  const headers = [
    'Work Order Code',
    'Title',
    'Customer',
    'Site',
    'Site Address',
    'Priority',
    'Status',
    'SLA Due Date',
    'SLA Status',
    'Assigned Technician',
    'Created Date'
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = workOrders.map(wo => [
    escapeCSV(wo.code),
    escapeCSV(wo.title),
    escapeCSV(wo.customerName),
    escapeCSV(wo.siteName),
    escapeCSV(wo.siteAddress),
    escapeCSV(wo.priority),
    escapeCSV(wo.status),
    escapeCSV(new Date(wo.slaDueAt).toLocaleString()),
    escapeCSV(wo.slaStatus),
    escapeCSV(wo.assignedToName || 'Unassigned'),
    escapeCSV(new Date(wo.createdAt).toLocaleString())
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
