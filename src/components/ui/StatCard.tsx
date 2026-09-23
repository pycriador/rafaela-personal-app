import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  highlight?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  change,
  highlight = false,
  onClick,
}) => {
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-150 p-4 sm:p-5 ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-white/[0.15] hover:shadow-xs' : ''
      } ${highlight ? 'border-emerald-500/30 bg-emerald-500/[0.02] dark:bg-emerald-950/10' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-dark-muted truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {value}
            </span>
            {change && (
              <span
                className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
                  change.trend === 'up'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                    : change.trend === 'down'
                    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]'
                }`}
              >
                {change.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 truncate">{subtitle}</p>
          )}
        </div>
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-dark-cardElevated text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/[0.06] shrink-0">
          {icon}
        </div>
      </div>
    </Card>
  );
};
