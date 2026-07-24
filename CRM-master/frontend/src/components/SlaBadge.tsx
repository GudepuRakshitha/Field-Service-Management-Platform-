import React from 'react';
import { SlaStatus } from '../api/types';

interface SlaBadgeProps {
  status: SlaStatus;
  dueAt?: string;
  className?: string;
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({ status, dueAt, className = '' }) => {
  const getStyles = () => {
    switch (status) {
      case 'ON_TRACK':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'AT_RISK':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
      case 'BREACHED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-extrabold';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const formattedDueDate = dueAt ? new Date(dueAt).toLocaleString() : '';

  return (
    <span
      title={dueAt ? `SLA Due: ${formattedDueDate}` : undefined}
      className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border shrink-0 whitespace-nowrap leading-none ${getStyles()} ${className}`}
    >
      <span>{status === 'BREACHED' ? '🚨 BREACHED' : status === 'AT_RISK' ? '⚠️ AT RISK' : '⏱️ ON TRACK'}</span>
    </span>
  );
};
