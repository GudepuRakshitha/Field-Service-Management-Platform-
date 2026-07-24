import React from 'react';
import { WorkOrderStatus } from '../api/types';

interface StatusBadgeProps {
  status: WorkOrderStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStyles = () => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'ASSIGNED':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'IN_PROGRESS':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
      case 'ON_HOLD':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'CLOSED':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      case 'CANCELLED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border shrink-0 whitespace-nowrap leading-none ${getStyles()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
      <span>{status.replace('_', ' ')}</span>
    </span>
  );
};
