import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  theme?: 'indigo' | 'amber' | 'emerald' | 'rose' | 'cyan' | 'purple';
  progress?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  theme = 'indigo',
  progress,
}) => {
  const themeStyles = {
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      value: 'text-white',
      bar: 'bg-indigo-500',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      value: 'text-amber-300',
      bar: 'bg-amber-500',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      value: 'text-emerald-400',
      bar: 'bg-emerald-500',
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      value: 'text-rose-400',
      bar: 'bg-rose-500',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      value: 'text-cyan-300',
      bar: 'bg-cyan-500',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      value: 'text-purple-300',
      bar: 'bg-purple-500',
    },
  };

  const style = themeStyles[theme];

  return (
    <div className="glass-panel glass-panel-hover hover-lift p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[160px] h-[160px] group transition-all duration-300">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
          {title}
        </span>
        <div
          className={`p-2.5 rounded-xl ${style.bg} ${style.text} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-md`}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div
        className={`text-3xl font-extrabold tracking-tight mt-1 group-hover:scale-105 origin-left transition-transform duration-300 ${style.value}`}
      >
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div className="text-xs text-slate-400 font-medium">{subtitle}</div>
      )}

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="w-full bg-slate-800/60 h-2 rounded-full mt-2 overflow-hidden border border-slate-700/40">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${style.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};
