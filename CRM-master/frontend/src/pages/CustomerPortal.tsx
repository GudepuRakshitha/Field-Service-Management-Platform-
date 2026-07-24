import React, { useEffect, useState } from 'react';
import { PageResponse, Priority, Site, WorkOrder } from '../api/types';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { useAuth } from '../auth/AuthContext';
import { Building2, Plus, User, Wrench, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerPortal: React.FC = () => {
  const { user } = useAuth();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  // Request Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [siteId, setSiteId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const custId = user?.customerId;
      if (custId) {
        const woRes = await api.getWorkOrders({ customerId: custId, size: 50 });
        setWorkOrders(woRes?.content || []);

        const siteList = await api.getCustomerSites(custId);
        setSites(siteList || []);
      } else {
        setWorkOrders([]);
        setSites([]);
      }
    } catch (e) {
      console.error('Failed to load customer portal data', e);
      setWorkOrders([]);
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [user?.customerId, user?.id]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !siteId || !user?.customerId) return;

    setSubmitting(true);
    try {
      await api.createWorkOrder({
        title,
        description,
        priority,
        customerId: user.customerId,
        siteId: Number(siteId),
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchCustomerData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit maintenance request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-emerald-400 font-medium">Loading Customer Portal...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
      {/* Customer Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-emerald-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{user?.customerName || user?.name}</h1>
            <p className="text-xs text-emerald-300">Customer Self-Service Portal</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Raise Maintenance Request
        </button>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-emerald-400" /> Your Maintenance Requests
        </h2>

        {!workOrders || workOrders.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400 rounded-2xl">
            No work orders currently raised for your sites. Click 'Raise Maintenance Request' above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {workOrders.map((wo) => (
              <div key={wo.id} className="glass-panel p-5 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-emerald-400">{wo.code}</span>
                    <PriorityBadge priority={wo.priority} />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={wo.status} />
                    <SlaBadge status={wo.slaStatus} dueAt={wo.slaDueAt} />
                  </div>
                </div>

                <Link to={`/work-orders/${wo.id}`} className="block">
                  <h3 className="font-bold text-lg text-white hover:text-emerald-300 transition-colors">
                    {wo.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-300 line-clamp-2">{wo.description || 'No description provided.'}</p>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 pt-2 border-t border-slate-800/60 gap-1">
                  <div>📍 Location: <span className="text-slate-200 font-medium">{wo.siteName}</span></div>
                  <div>Submitted on {new Date(wo.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">New Service Request</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Site *</label>
                <select
                  required
                  value={siteId}
                  onChange={(e) => setSiteId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
                >
                  <option value="">-- Select Your Site --</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Request Summary / Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Water Leak on Floor 2"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Detailed Symptoms</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context for our dispatchers..."
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Urgency Priority *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
                >
                  <option value="LOW">Low (5 Days Response)</option>
                  <option value="MEDIUM">Medium (3 Days Response)</option>
                  <option value="HIGH">High (24 Hours Emergency)</option>
                  <option value="CRITICAL">Critical (4 Hours Immediate Emergency)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title || !siteId}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
