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
      className={`relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-emerald-500/50 hover:shadow-md' : ''
      } ${highlight ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {value}
            </span>
            {change && (
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  change.trend === 'up'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : change.trend === 'down'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {change.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-dark-cardElevated text-slate-700 dark:text-emerald-400 shrink-0">
          {icon}
        </div>
      </div>
    </Card>
  );
};
