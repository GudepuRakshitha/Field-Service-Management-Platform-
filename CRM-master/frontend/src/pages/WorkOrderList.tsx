import React, { useEffect, useState } from 'react';
import { Customer, PageResponse, Priority, Site, WorkOrder, WorkOrderStatus } from '../api/types';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useAuth } from '../auth/AuthContext';
import { Plus, Search, Wrench, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { exportWorkOrdersToCSV } from '../utils/csvExport';

export const WorkOrderList: React.FC = () => {
  const [data, setData] = useState<PageResponse<WorkOrder> | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<WorkOrderStatus | ''>('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [page, setPage] = useState(0);

  // Modal Create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [selectedSiteId, setSelectedSiteId] = useState<number | ''>('');
  const [creating, setCreating] = useState(false);

  const { isManager, isDispatcher, isCustomer, user } = useAuth();

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await api.getWorkOrders({
        query,
        status: status || undefined,
        priority: priority || undefined,
        page,
        size: 10,
      });
      setData(response);
    } catch (e) {
      console.error('Failed to fetch work orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [query, status, priority, page]);

  // Load customer & sites for modal
  useEffect(() => {
    if (isCreateOpen) {
      if (isCustomer && user?.customerId) {
        setSelectedCustomerId(user.customerId);
        api.getCustomerSites(user.customerId).then(setSites);
      } else {
        api.getCustomers({ size: 100 }).then((res) => setCustomers(res.content));
      }
    }
  }, [isCreateOpen]);

  const handleCustomerChange = async (custId: number) => {
    setSelectedCustomerId(custId);
    setSelectedSiteId('');
    if (custId) {
      const siteList = await api.getCustomerSites(custId);
      setSites(siteList);
    } else {
      setSites([]);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !selectedCustomerId || !selectedSiteId) return;

    setCreating(true);
    try {
      await api.createWorkOrder({
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        customerId: Number(selectedCustomerId),
        siteId: Number(selectedSiteId),
      });

      setIsCreateOpen(false);
      setNewTitle('');
      setNewDesc('');
      fetchWorkOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to create work order');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Component */}
      <PageHeader
        title="Work Orders Directory"
        subtitle="Searchable repository of facility maintenance jobs & dispatch status"
        icon={<Wrench className="w-7 h-7" />}
        actions={
          <>
            {data && data.content.length > 0 && (
              <Button
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                onClick={() => exportWorkOrdersToCSV(data.content)}
              >
                Export CSV
              </Button>
            )}

            {(isManager || isDispatcher || isCustomer) && (
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCreateOpen(true)}
              >
                Create Work Order
              </Button>
            )}
          </>
        }
      />

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by code, title, or details..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as any);
              setPage(0);
            }}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as any);
              setPage(0);
            }}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80">
        {loading ? (
          <div className="p-12 text-center text-indigo-400 font-medium">Loading work orders...</div>
        ) : !data || data.content.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No work orders match the filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-4 text-center">Code</th>
                  <th className="py-3.5 px-4 text-center">Title & Site</th>
                  <th className="py-3.5 px-4 text-center">Customer</th>
                  <th className="py-3.5 px-4 text-center">Priority</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">SLA</th>
                  <th className="py-3.5 px-4 text-center">Assigned Tech</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.content.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 px-4 text-left font-mono font-bold text-indigo-300">
                      <Link to={`/work-orders/${wo.id}`} className="hover:underline">
                        {wo.code}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-left">
                      <Link to={`/work-orders/${wo.id}`} className="font-semibold text-white hover:text-indigo-300 block">
                        {wo.title}
                      </Link>
                      <div className="text-xs text-slate-400">{wo.siteName}</div>
                    </td>
                    <td className="py-4 px-4 text-left text-slate-300 font-medium">{wo.customerName}</td>
                    <td className="py-4 px-4 text-left">
                      <div className="flex justify-start">
                        <PriorityBadge priority={wo.priority} />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-left">
                      <div className="flex justify-start">
                        <StatusBadge status={wo.status} />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-left">
                      <div className="flex justify-start">
                        <SlaBadge status={wo.slaStatus} dueAt={wo.slaDueAt} />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-left text-slate-300">
                      {wo.assignedToName ? (
                        <span className="text-amber-300 font-medium">{wo.assignedToName}</span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>
              Page {data.number + 1} of {data.totalPages} ({data.totalElements} total items)
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={data.first}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Work Order Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Raise Work Order Request"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Title *</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. HVAC Chiller Maintenance"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Detailed symptom report..."
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Priority *</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
              >
                <option value="LOW">Low (5 Days SLA)</option>
                <option value="MEDIUM">Medium (3 Days SLA)</option>
                <option value="HIGH">High (24 Hours SLA)</option>
                <option value="CRITICAL">Critical (4 Hours SLA)</option>
              </select>
            </div>

            {!isCustomer && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Customer *</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Site Location *</label>
            <select
              required
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
            >
              <option value="">-- Choose Site --</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.address})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={creating}
              disabled={!newTitle || !selectedCustomerId || !selectedSiteId}
            >
              Submit Work Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
