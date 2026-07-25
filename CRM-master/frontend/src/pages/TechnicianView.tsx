import React, { useEffect, useState } from 'react';
import { WorkOrder, WorkOrderStatus } from '../api/types';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../auth/AuthContext';
import {
  HardHat,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Timer,
  MapPin,
  Wrench,
  Briefcase,
  CalendarCheck,
  CircleDot,
} from 'lucide-react';
import { ComicLoadingScreen } from '../components/ComicLoadingScreen';
import { Link } from 'react-router-dom';

export const TechnicianView: React.FC = () => {
  const [jobs, setJobs] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getWorkOrders({
        assignedToUserId: user?.id,
        size: 50,
      });
      setJobs(data.content);
    } catch (e) {
      console.error('Failed to load technician field jobs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchMyJobs();
  }, [user?.id]);

  const handleQuickStatusChange = async (woId: number, toStatus: WorkOrderStatus) => {
    try {
      await api.changeStatus(woId, { toStatus, note: 'Updated from field view' });
      fetchMyJobs();
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    }
  };

  const assignedCount = jobs.filter((j) => j.status === 'ASSIGNED').length;
  const inProgressCount = jobs.filter((j) => j.status === 'IN_PROGRESS').length;
  const onHoldCount = jobs.filter((j) => j.status === 'ON_HOLD').length;
  const completedCount = jobs.filter((j) => j.status === 'COMPLETED' || j.status === 'CLOSED').length;
  const atRiskCount = jobs.filter((j) => j.slaStatus === 'AT_RISK').length;
  const breachedCount = jobs.filter((j) => j.slaStatus === 'BREACHED').length;

  const activeJobs = jobs.filter(
    (j) => j.status === 'ASSIGNED' || j.status === 'IN_PROGRESS' || j.status === 'ON_HOLD'
  );
  const recentCompleted = jobs.filter((j) => j.status === 'COMPLETED' || j.status === 'CLOSED');

  if (loading) {
    return <ComicLoadingScreen message="LOADING FIELD JOBS..." subtitle="Syncing Technician Dispatch Data" />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-amber-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="text-xs text-amber-300/80 font-medium">Field Service Technician &mdash; {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <Briefcase className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-amber-300">{jobs.length} Total Jobs</span>
        </div>
      </div>

      {/* SLA Alert Banner */}
      {(atRiskCount > 0 || breachedCount > 0) && (
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-200">SLA Attention Required</p>
              <p className="text-xs text-rose-300/70">
                {breachedCount > 0 && `${breachedCount} breached`}
                {breachedCount > 0 && atRiskCount > 0 && ' & '}
                {atRiskCount > 0 && `${atRiskCount} at risk`} work order{atRiskCount + breachedCount !== 1 ? 's' : ''} need your attention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned"
          value={assignedCount}
          subtitle="Ready to start"
          icon={<CircleDot className="w-5 h-5" />}
          theme="cyan"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Currently working"
          icon={<Timer className="w-5 h-5" />}
          theme="amber"
        />
        <StatCard
          title="On Hold"
          value={onHoldCount}
          subtitle="Paused jobs"
          icon={<Pause className="w-5 h-5" />}
          theme="purple"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          subtitle="Finished jobs"
          icon={<CheckCircle className="w-5 h-5" />}
          theme="emerald"
        />
      </div>

      {/* Active Job Queue */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" /> Active Job Queue
          </h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-900/60 px-3 py-1 rounded-full">
            {activeJobs.length} active
          </span>
        </div>

        {activeJobs.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="font-bold text-white">All Caught Up!</div>
            <div className="text-xs text-slate-400">No active work orders assigned to you right now.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-[#081324]/80 border border-blue-900/30 hover:border-blue-700/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[10px] font-extrabold text-indigo-400">{job.code}</span>
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <Link
                      to={`/work-orders/${job.id}`}
                      className="block font-bold text-sm text-white hover:text-amber-300 transition-colors truncate"
                    >
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{job.siteName}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1.5">
                    <StatusBadge status={job.status} />
                    <SlaBadge status={job.slaStatus} dueAt={job.slaDueAt} />
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-3 pt-3 border-t border-blue-900/30 flex flex-wrap gap-2">
                  {job.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleQuickStatusChange(job.id, 'IN_PROGRESS')}
                      className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Job
                    </button>
                  )}
                  {job.status === 'IN_PROGRESS' && (
                    <>
                      <button
                        onClick={() => handleQuickStatusChange(job.id, 'ON_HOLD')}
                        className="flex-1 py-2 bg-purple-600/80 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Pause className="w-3.5 h-3.5" /> Hold
                      </button>
                      <button
                        onClick={() => handleQuickStatusChange(job.id, 'COMPLETED')}
                        className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Complete
                      </button>
                    </>
                  )}
                  {job.status === 'ON_HOLD' && (
                    <button
                      onClick={() => handleQuickStatusChange(job.id, 'IN_PROGRESS')}
                      className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" /> Resume Job
                    </button>
                  )}
                  <Link
                    to={`/work-orders/${job.id}`}
                    className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 font-medium text-xs rounded-xl text-center transition-all"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Completed */}
      {recentCompleted.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-400" /> Recently Completed
            </h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-900/60 px-3 py-1 rounded-full">
              {recentCompleted.length} done
            </span>
          </div>
          <div className="space-y-2">
            {recentCompleted.map((job) => (
              <div
                key={job.id}
                className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-extrabold text-emerald-400">{job.code}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <Link
                    to={`/work-orders/${job.id}`}
                    className="block text-sm font-semibold text-slate-300 hover:text-emerald-300 truncate mt-0.5"
                  >
                    {job.title}
                  </Link>
                </div>
                <div className="text-[10px] text-slate-500 shrink-0 text-right">
                  {job.siteName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
