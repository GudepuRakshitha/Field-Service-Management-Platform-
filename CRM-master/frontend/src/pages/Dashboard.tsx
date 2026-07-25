import React, { useEffect, useState } from 'react';
import { DashboardSummary } from '../api/types';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/Button';
import { ComicLoadingScreen } from '../components/ComicLoadingScreen';
import { AlertTriangle, CheckCircle2, Clock, HardHat, LayoutDashboard, MapPin, Wrench, Download, Kanban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { exportWorkOrdersToCSV } from '../utils/csvExport';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSummaryReport()
      .then(setSummary)
      .catch((err) => console.error('Failed to load dashboard summary', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ComicLoadingScreen message="LOADING DASHBOARD..." subtitle="Compiling Executive Metrics" />;
  }

  if (!summary) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-slate-400">
        Failed to load dashboard metrics. Please refresh or try again.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in-up">
      {/* Top Banner Header */}
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time SLA compliance, workload dispatch, and operational KPIs"
        icon={<LayoutDashboard className="w-8 h-8" />}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={async () => {
                try {
                  const res = await api.getWorkOrders({ size: 100 });
                  exportWorkOrdersToCSV(res.content, 'keystone_work_orders_report.csv');
                } catch (e) {
                  alert('Failed to fetch work orders for export');
                }
              }}
            >
              Export CSV Report
            </Button>
            <Link to="/board">
              <Button variant="primary" icon={<Kanban className="w-4 h-4" />}>
                Open Kanban Board
              </Button>
            </Link>
          </>
        }
      />

      {/* Reusable Stat Cards KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Work Orders"
          value={summary.totalWorkOrders}
          subtitle="System of Record Total"
          icon={<Wrench className="w-5 h-5" />}
          theme="indigo"
        />
        <StatCard
          title="In Progress"
          value={summary.inProgressCount}
          subtitle={`${summary.assignedCount} queued assigned`}
          icon={<Clock className="w-5 h-5" />}
          theme="amber"
        />
        <StatCard
          title="Overdue / SLA Breach"
          value={summary.overdueCount}
          subtitle="Requires immediate dispatch"
          icon={<AlertTriangle className="w-5 h-5" />}
          theme="rose"
        />
        <StatCard
          title="SLA Compliance Rate"
          value={`${summary.slaCompliancePercent}%`}
          subtitle="On-time resolution target"
          icon={<CheckCircle2 className="w-5 h-5" />}
          theme="emerald"
          progress={summary.slaCompliancePercent}
        />
      </div>

      {/* Work Order Status Pipeline Breakdown */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Status Pipeline Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'NEW', value: summary.newCount, color: 'text-blue-400' },
            { label: 'ASSIGNED', value: summary.assignedCount, color: 'text-sky-400' },
            { label: 'IN PROGRESS', value: summary.inProgressCount, color: 'text-amber-400' },
            { label: 'ON HOLD', value: summary.onHoldCount, color: 'text-purple-400' },
            { label: 'COMPLETED', value: summary.completedCount, color: 'text-emerald-400' },
            { label: 'CLOSED', value: summary.closedCount, color: 'text-slate-400' },
            { label: 'CANCELLED', value: summary.cancelledCount, color: 'text-rose-400' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="glass-panel p-3 rounded-xl text-center min-h-[85px] h-[85px] flex flex-col justify-center items-center border border-blue-900/30"
            >
              <div className={`text-[11px] font-extrabold uppercase tracking-wider ${color}`}>
                {label}
              </div>
              <div className="text-2xl font-black text-white mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown by Technician */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-400" /> Workload by Technician
          </h2>
          <div className="space-y-3">
            {Object.entries(summary.technicianBreakdown).length === 0 ? (
              <div className="text-slate-400 text-sm">No technician workloads recorded yet.</div>
            ) : (
              Object.entries(summary.technicianBreakdown).map(([techName, count]) => (
                <div key={techName} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-200">{techName}</span>
                    <span className="text-amber-400 font-bold">{count} jobs</span>
                  </div>
                  <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden border border-slate-700/30">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (count / summary.totalWorkOrders) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Breakdown by Site */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" /> Activity by Commercial Site
          </h2>
          <div className="space-y-3">
            {Object.entries(summary.siteBreakdown).length === 0 ? (
              <div className="text-slate-400 text-sm">No site activities recorded yet.</div>
            ) : (
              Object.entries(summary.siteBreakdown).map(([siteName, count]) => (
                <div key={siteName} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-200">{siteName}</span>
                    <span className="text-cyan-400 font-bold">{count} jobs</span>
                  </div>
                  <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden border border-slate-700/30">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (count / summary.totalWorkOrders) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
