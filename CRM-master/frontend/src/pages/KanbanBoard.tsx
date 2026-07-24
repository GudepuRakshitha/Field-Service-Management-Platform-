import React, { useEffect, useState } from 'react';
import { User, WorkOrder, WorkOrderStatus } from '../api/types';
import { api } from '../api/client';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useAuth } from '../auth/AuthContext';
import { HardHat, Kanban, Search, UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLUMNS: { id: WorkOrderStatus; title: string; color: string }[] = [
  { id: 'NEW', title: 'New Requests', color: 'border-blue-500/40 text-blue-300' },
  { id: 'ASSIGNED', title: 'Assigned', color: 'border-sky-500/40 text-sky-300' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-amber-500/40 text-amber-300' },
  { id: 'ON_HOLD', title: 'On Hold', color: 'border-purple-500/40 text-purple-300' },
  { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-500/40 text-emerald-300' },
  { id: 'CLOSED', title: 'Closed', color: 'border-slate-500/40 text-slate-300' },
  { id: 'CANCELLED', title: 'Cancelled', color: 'border-rose-500/40 text-rose-300' },
];

export const KanbanBoard: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Client-Side Filter State
  const [filterText, setFilterText] = useState('');
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'CRITICAL' | 'UNASSIGNED' | 'MY_JOBS'>('ALL');

  // Assign Modal
  const [assignWo, setAssignWo] = useState<WorkOrder | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<number | ''>('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);

  const { user, isManager, isDispatcher } = useAuth();

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const data = await api.getWorkOrders({ size: 100 });
      setWorkOrders(data.content);

      if (isManager || isDispatcher) {
        const techs = await api.getTechnicians();
        setTechnicians(techs);
      }
    } catch (e) {
      console.error('Failed to load Kanban board', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignWo || !selectedTechId) return;

    setAssigning(true);
    try {
      await api.assignWorkOrder(assignWo.id, {
        technicianId: Number(selectedTechId),
        note: assignNote,
      });
      setAssignWo(null);
      setSelectedTechId('');
      setAssignNote('');
      fetchBoard();
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  // Filter helper logic
  const filteredWorkOrders = workOrders.filter((wo) => {
    // Text search filter
    if (filterText.trim()) {
      const term = filterText.toLowerCase();
      const matchesCode = wo.code?.toLowerCase().includes(term);
      const matchesTitle = wo.title?.toLowerCase().includes(term);
      const matchesCustomer = wo.customerName?.toLowerCase().includes(term);
      const matchesSite = wo.siteName?.toLowerCase().includes(term);
      const matchesTech = wo.assignedToName?.toLowerCase().includes(term);

      if (!matchesCode && !matchesTitle && !matchesCustomer && !matchesSite && !matchesTech) {
        return false;
      }
    }

    // Quick filter chips
    if (quickFilter === 'CRITICAL' && wo.priority !== 'CRITICAL') return false;
    if (quickFilter === 'UNASSIGNED' && wo.assignedToId) return false;
    if (quickFilter === 'MY_JOBS' && wo.assignedToId !== user?.id) return false;

    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-blue-400 font-medium">
        Loading Kanban board...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      {/* Header Component */}
      <PageHeader
        title="Work Order Kanban Board"
        subtitle="Grouped by state machine status with real-time SLA badges"
        icon={<Kanban className="w-7 h-7" />}
        actions={
          <Link to="/work-orders">
            <Button variant="secondary">View List View</Button>
          </Link>
        }
      />

      {/* Live Client-Side Kanban Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-900/40">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-400" />
          <input
            type="text"
            placeholder="Live search by code, technician, customer, site..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-sm bg-[#081324] border border-blue-900/60 rounded-xl text-white placeholder-slate-500"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto text-xs font-semibold">
          <button
            onClick={() => setQuickFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl border transition-all ${
              quickFilter === 'ALL'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-[#081324] text-slate-300 border-blue-950 hover:border-blue-800 hover:text-white'
            }`}
          >
            All ({workOrders.length})
          </button>

          <button
            onClick={() => setQuickFilter('CRITICAL')}
            className={`px-3.5 py-2 rounded-xl border transition-all ${
              quickFilter === 'CRITICAL'
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                : 'bg-[#081324] text-slate-300 border-blue-950 hover:border-blue-800 hover:text-white'
            }`}
          >
            Critical Only
          </button>

          <button
            onClick={() => setQuickFilter('UNASSIGNED')}
            className={`px-3.5 py-2 rounded-xl border transition-all ${
              quickFilter === 'UNASSIGNED'
                ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30'
                : 'bg-[#081324] text-slate-300 border-blue-950 hover:border-blue-800 hover:text-white'
            }`}
          >
            Unassigned
          </button>

          {user?.id && (
            <button
              onClick={() => setQuickFilter('MY_JOBS')}
              className={`px-3.5 py-2 rounded-xl border transition-all ${
                quickFilter === 'MY_JOBS'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                  : 'bg-[#081324] text-slate-300 border-blue-950 hover:border-blue-800 hover:text-white'
              }`}
            >
              My Jobs
            </button>
          )}
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {COLUMNS.map((col) => {
          const colJobs = filteredWorkOrders.filter((wo) => wo.status === col.id);
          return (
            <div
              key={col.id}
              className="w-80 flex-shrink-0 bg-[#081324]/80 border border-blue-900/50 rounded-2xl p-3.5 flex flex-col max-h-[calc(100vh-250px)] shadow-xl"
            >
              {/* Column Header */}
              <div className="flex justify-between items-center pb-3 border-b border-blue-900/50 mb-3 px-1">
                <h3 className={`font-bold text-sm ${col.color}`}>{col.title}</h3>
                <span className="text-xs font-bold bg-blue-950 text-blue-200 border border-blue-800/60 px-2.5 py-0.5 rounded-full">
                  {colJobs.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colJobs.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-8 italic">No jobs in {col.title}</div>
                ) : (
                  colJobs.map((wo) => (
                    <div
                      key={wo.id}
                      className="glass-panel glass-panel-hover p-3.5 rounded-xl text-left relative border-blue-900/40 min-h-[215px] h-[215px] max-h-[215px] flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top Bar: Code & Priority */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-sky-300 font-extrabold">{wo.code}</span>
                        <PriorityBadge priority={wo.priority} />
                      </div>

                      {/* Title (Fixed 2-line height) */}
                      <Link to={`/work-orders/${wo.id}`} className="block my-1">
                        <h4 className="font-semibold text-xs text-white hover:text-sky-300 transition-colors line-clamp-2 h-9 leading-relaxed">
                          {wo.title}
                        </h4>
                      </Link>

                      {/* Fixed height Location & Tech Box */}
                      <div className="text-[11px] text-slate-300 bg-[#060e1a]/80 p-2 rounded-xl border border-blue-900/40 h-[62px] flex flex-col justify-center space-y-0.5 overflow-hidden">
                        <div className="truncate font-bold text-white">🏢 {wo.customerName}</div>
                        <div className="truncate text-slate-400">📍 {wo.siteName}</div>
                        {wo.assignedToName ? (
                          <div className="text-amber-300 font-bold truncate flex items-center gap-1">
                            <HardHat className="w-3 h-3 text-amber-400 shrink-0" /> {wo.assignedToName}
                          </div>
                        ) : (
                          <div className="text-slate-500 font-medium italic flex items-center gap-1">
                            <HardHat className="w-3 h-3 text-slate-600 shrink-0" /> Unassigned Tech
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer Bar */}
                      <div className="flex items-center justify-between border-t border-blue-900/40 pt-2 shrink-0">
                        <SlaBadge status={wo.slaStatus} dueAt={wo.slaDueAt} />

                        {(isManager || isDispatcher) && wo.status !== 'CLOSED' && wo.status !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              setAssignWo(wo);
                              setSelectedTechId(wo.assignedToId || '');
                            }}
                            className="p-1 px-2 text-[11px] text-sky-300 hover:text-white bg-blue-950/60 hover:bg-blue-600/30 border border-blue-800/40 rounded-lg flex items-center gap-1 transition-all"
                            title="Assign / Reassign"
                          >
                            <UserPlus className="w-3 h-3" /> Assign
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={!!assignWo}
        onClose={() => setAssignWo(null)}
        title="Assign Technician"
      >
        {assignWo && (
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div className="bg-[#060e1a] p-3 rounded-xl border border-blue-900/50">
              <div className="text-xs text-sky-300 font-mono font-bold">{assignWo.code}</div>
              <div className="font-semibold text-white text-sm">{assignWo.title}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase mb-1">
                Select Field Technician *
              </label>
              <select
                required
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(Number(e.target.value))}
                className="w-full bg-[#081324] border border-blue-900/60 text-white rounded-xl p-2.5 text-sm"
              >
                <option value="">-- Choose Technician --</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase mb-1">
                Optional Dispatch Note
              </label>
              <textarea
                rows={3}
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
                placeholder="Instructions for the technician..."
                className="w-full bg-[#081324] border border-blue-900/60 text-white rounded-xl p-2.5 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setAssignWo(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={assigning}
                disabled={!selectedTechId}
              >
                Dispatch & Notify
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
