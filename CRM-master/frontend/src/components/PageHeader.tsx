import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          {icon && <span className="text-indigo-400">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-400 font-medium">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3 items-center">{actions}</div>}
    </div>
  );
};
