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
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card/30 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-dark-cardElevated flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
        {icon}
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-dark-muted max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
