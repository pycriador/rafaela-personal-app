import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-dark-card/20 ${className}`}>
      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-dark-cardElevated flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.06] mb-3 shrink-0">
        {icon}
      </div>
      <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
