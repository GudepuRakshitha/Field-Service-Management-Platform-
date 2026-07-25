import React, { useEffect, useState } from 'react';
import { User, WorkOrder, WorkOrderStatus } from '../api/types';
import { api } from '../api/client';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useAuth } from '../auth/AuthContext';
import { ComicLoadingScreen } from '../components/ComicLoadingScreen';
import { HardHat, Kanban, Search, UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLUMNS: { id: WorkOrderStatus; title: string; color: string }[] = [
  { id: 'NEW', title: 'New Requests', color: 'border-blue-500/40 text-blue-400' },
  { id: 'ASSIGNED', title: 'Assigned', color: 'border-sky-500/40 text-sky-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-amber-500/40 text-amber-400' },
  { id: 'ON_HOLD', title: 'On Hold', color: 'border-purple-500/40 text-purple-400' },
  { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-500/40 text-emerald-400' },
  { id: 'CLOSED', title: 'Closed', color: 'border-slate-500/40 text-slate-400' },
  { id: 'CANCELLED', title: 'Cancelled', color: 'border-rose-500/40 text-rose-400' },
];

export const KanbanBoard: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterText, setFilterText] = useState('');
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'CRITICAL' | 'UNASSIGNED' | 'MY_JOBS'>('ALL');

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

  const filteredWorkOrders = workOrders.filter((wo) => {
    if (filterText.trim()) {
      const term = filterText.toLowerCase();
      const match =
        wo.code?.toLowerCase().includes(term) ||
        wo.title?.toLowerCase().includes(term) ||
        wo.customerName?.toLowerCase().includes(term) ||
        wo.siteName?.toLowerCase().includes(term) ||
        wo.assignedToName?.toLowerCase().includes(term);
      if (!match) return false;
    }
    if (quickFilter === 'CRITICAL' && wo.priority !== 'CRITICAL') return false;
    if (quickFilter === 'UNASSIGNED' && wo.assignedToId) return false;
    if (quickFilter === 'MY_JOBS' && wo.assignedToId !== user?.id) return false;
    return true;
  });

  if (loading) {
    return <ComicLoadingScreen message="LOADING BOARD..." subtitle="Organizing Work Order Pipeline" />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
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

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Live search by code, technician, customer, site..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-sm rounded-xl focus:outline-none"
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
          {[
            { key: 'ALL', label: `All (${workOrders.length})`, active: 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30' },
            { key: 'CRITICAL', label: 'Critical Only', active: 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30' },
            { key: 'UNASSIGNED', label: 'Unassigned', active: 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30' },
          ].map(({ key, label, active }) => (
            <button
              key={key}
              onClick={() => setQuickFilter(key as any)}
              className={`px-3.5 py-2 rounded-xl border transition-all ${
                quickFilter === key
                  ? active
                  : 'glass-panel text-slate-300 border-blue-900/40 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}

          {user?.id && (
            <button
              onClick={() => setQuickFilter('MY_JOBS')}
              className={`px-3.5 py-2 rounded-xl border transition-all ${
                quickFilter === 'MY_JOBS'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                  : 'glass-panel text-slate-300 border-blue-900/40 hover:text-white'
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
              className="w-80 flex-shrink-0 glass-panel rounded-2xl p-3.5 flex flex-col max-h-[calc(100vh-250px)] shadow-xl"
            >
              {/* Column Header */}
              <div className="flex justify-between items-center pb-3 border-b border-blue-900/40 mb-3 px-1">
                <h3 className={`font-bold text-sm ${col.color}`}>{col.title}</h3>
                <span className="text-xs font-bold bg-blue-950/40 text-blue-300 border border-blue-800/40 px-2.5 py-0.5 rounded-full">
                  {colJobs.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colJobs.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-8 italic">
                    No jobs in {col.title}
                  </div>
                ) : (
                  colJobs.map((wo) => (
                    <div
                      key={wo.id}
                      className="glass-panel glass-panel-hover p-3.5 rounded-xl text-left relative border-blue-900/40 min-h-[215px] h-[215px] max-h-[215px] flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top Bar */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-sky-400 font-extrabold">{wo.code}</span>
                        <PriorityBadge priority={wo.priority} />
                      </div>

                      {/* Title */}
                      <Link to={`/work-orders/${wo.id}`} className="block my-1">
                        <h4 className="font-semibold text-xs text-white hover:text-sky-300 transition-colors line-clamp-2 h-9 leading-relaxed">
                          {wo.title}
                        </h4>
                      </Link>

                      {/* Info Box — theme-aware */}
                      <div className="text-[11px] text-slate-300 glass-panel p-2 rounded-xl border border-blue-900/30 h-[62px] flex flex-col justify-center space-y-0.5 overflow-hidden">
                        <div className="truncate font-bold text-white">🏢 {wo.customerName}</div>
                        <div className="truncate text-slate-400">📍 {wo.siteName}</div>
                        {wo.assignedToName ? (
                          <div className="text-amber-300 font-bold truncate flex items-center gap-1">
                            <HardHat className="w-3 h-3 text-amber-400 shrink-0" /> {wo.assignedToName}
                          </div>
                        ) : (
                          <div className="text-slate-500 font-medium italic flex items-center gap-1">
                            <HardHat className="w-3 h-3 text-slate-500 shrink-0" /> Unassigned Tech
                          </div>
                        )}
                      </div>

                      {/* Footer Bar */}
                      <div className="flex items-center justify-between border-t border-blue-900/40 pt-2 shrink-0">
                        <SlaBadge status={wo.slaStatus} dueAt={wo.slaDueAt} />
                        {(isManager || isDispatcher) &&
                          wo.status !== 'CLOSED' &&
                          wo.status !== 'CANCELLED' && (
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
      <Modal isOpen={!!assignWo} onClose={() => setAssignWo(null)} title="Assign Technician">
        {assignWo && (
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            {/* Work order info */}
            <div className="glass-panel p-3 rounded-xl border border-blue-900/40">
              <div className="text-xs text-sky-400 font-mono font-bold">{assignWo.code}</div>
              <div className="font-semibold text-white text-sm">{assignWo.title}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-300 uppercase mb-1">
                Select Field Technician *
              </label>
              <select
                required
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(Number(e.target.value))}
                className="w-full rounded-xl p-2.5 text-sm"
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
              <label className="block text-xs font-bold text-blue-300 uppercase mb-1">
                Optional Dispatch Note
              </label>
              <textarea
                rows={3}
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
                placeholder="Instructions for the technician..."
                className="w-full rounded-xl p-2.5 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setAssignWo(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={assigning} disabled={!selectedTechId}>
                Dispatch & Notify
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
