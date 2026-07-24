import React, { useEffect, useState } from 'react';
import { Site, WorkOrder, Priority } from '../api/types';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Building2, MapPin, Plus, Wrench, Calendar, ChevronRight, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerSites: React.FC = () => {
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  const fetchSitesAndJobs = async () => {
    setLoading(true);
    try {
      const custId = user?.customerId;
      if (custId) {
        const siteList = await api.getCustomerSites(custId);
        setSites(siteList);

        const woRes = await api.getWorkOrders({ customerId: custId, size: 100 });
        setWorkOrders(woRes.content || []);
      }
    } catch (e) {
      console.error('Failed to load customer sites', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSitesAndJobs();
  }, [user?.customerId]);

  const handleOpenRequestModal = (siteId: number) => {
    setSelectedSiteId(siteId);
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedSiteId || !user?.customerId) return;

    setSubmitting(true);
    try {
      await api.createWorkOrder({
        title,
        description,
        priority,
        customerId: user.customerId,
        siteId: Number(selectedSiteId),
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchSitesAndJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to submit maintenance request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-emerald-400 font-medium">Loading your registered sites...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-emerald-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Registered Sites & Facilities</h1>
            <p className="text-xs text-emerald-300">
              {sites.length} Location{sites.length !== 1 ? 's' : ''} under active maintenance agreement for {user?.customerName || user?.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (sites.length > 0) setSelectedSiteId(sites[0].id);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> New Service Request
        </button>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sites.length === 0 ? (
          <div className="col-span-full glass-panel p-8 text-center text-slate-400 rounded-2xl">
            No registered site locations found for your account. Please contact your Keystone account manager.
          </div>
        ) : (
          sites.map((site) => {
            const siteJobs = workOrders.filter((j) => j.siteId === site.id);
            const activeCount = siteJobs.filter((j) => j.status !== 'COMPLETED' && j.status !== 'CLOSED').length;
            const completedCount = siteJobs.filter((j) => j.status === 'COMPLETED' || j.status === 'CLOSED').length;

            return (
              <div
                key={site.id}
                className="glass-panel p-5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                          {site.name}
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-slate-400">SITE ID #{site.id}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      Active SLA
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{site.address}</span>
                  </div>

                  {/* Site Work Order Summary Pills */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-center">
                      <span className="block text-emerald-300 font-bold text-sm">{activeCount}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Jobs</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                      <span className="block text-cyan-300 font-bold text-sm">{completedCount}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Completed</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenRequestModal(site.id)}
                    className="flex-1 py-2 px-3 bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Request Maintenance
                  </button>

                  <Link
                    to={`/customer-portal?siteId=${site.id}`}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl flex items-center gap-1 transition-all"
                  >
                    View History <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Raise Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-lg w-full space-y-4 border-emerald-500/40 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" /> New Service Request
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Facility Site *</label>
                <select
                  required
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(Number(e.target.value))}
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
                  placeholder="e.g. HVAC Unit Failure in Main Lobby"
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
                  disabled={submitting || !title || !selectedSiteId}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50"
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
